const axios = require('axios');

class WordPressApiClient {
  constructor(siteUrl, connectionData = {}) {
    this.siteUrl = this.sanitizeUrl(siteUrl);
    this.connectionData = connectionData;
    this.timeout = 10000; // 10 seconds timeout
  }

  sanitizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url.replace(/\/$/, ''); // Remove trailing slash
  }

  async checkWordPressSite() {
    try {
      // First, try to check if the site has WordPress REST API
      const restApiUrl = `${this.siteUrl}/wp-json/wp/v2/`;

      const response = await axios.get(restApiUrl, {
        timeout: this.timeout,
        validateStatus: (status) => status < 500, // Accept any status code < 500
        headers: {
          'User-Agent': 'SparkleWP/1.0'
        }
      });

      // If we get a 404 or 403, it might not be a WordPress site
      if (response.status === 404) {
        throw new Error('WordPress REST API not found. This may not be a WordPress site.');
      }

      return {
        isWordPress: true,
        restApiAvailable: response.status === 200,
        siteUrl: this.siteUrl,
        status: response.status
      };

    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Website not found or not accessible. Please check the URL.');
      }

      if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timeout. The website may be slow or unreachable.');
      }

      // Check if it's a WordPress site by looking for common WordPress indicators
      try {
        const homePageResponse = await axios.get(this.siteUrl, {
          timeout: this.timeout,
          headers: {
            'User-Agent': 'SparkleWP/1.0'
          }
        });

        const content = homePageResponse.data.toLowerCase();
        const hasWpIndicators = content.includes('wp-content') ||
                               content.includes('wordpress') ||
                               content.includes('wp-includes');

        if (!hasWpIndicators) {
          throw new Error('This does not appear to be a WordPress site.');
        }

        return {
          isWordPress: true,
          restApiAvailable: false,
          siteUrl: this.siteUrl,
          message: 'WordPress detected but REST API may be disabled'
        };

      } catch (homePageError) {
        throw new Error('Website not accessible or not a WordPress site.');
      }
    }
  }

  async testConnection() {
    // First check if it's a WordPress site
    const siteCheck = await this.checkWordPressSite();

    if (!siteCheck.isWordPress) {
      throw new Error('Not a WordPress site');
    }

    const { method, username, password, apiKey } = this.connectionData;

    console.log(`Testing ${method} authentication for user: ${username} on ${this.siteUrl}`);

    try {
      let authHeaders = {};
      let testUrl = `${this.siteUrl}/wp-json/wp/v2/users/me`;

      switch (method) {
        case 'application_password':
          if (!username || !password) {
            throw new Error('Username and application password are required');
          }

          // Clean the application password (remove spaces)
          const cleanPassword = password.replace(/\s+/g, '');
          const credentials = Buffer.from(`${username}:${cleanPassword}`).toString('base64');
          authHeaders = {
            'Authorization': `Basic ${credentials}`,
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
          };

          console.log(`Attempting authentication with username: ${username}`);
          console.log(`Password length: ${cleanPassword.length} characters`);
          break;

        case 'jwt_token':
          // For JWT, we would first need to get a token
          throw new Error('JWT authentication not yet implemented');

        case 'api_key':
          if (!apiKey) {
            throw new Error('API key is required');
          }
          authHeaders = {
            'X-API-Key': apiKey,
            'User-Agent': 'SparkleWP/1.0'
          };
          break;

        default:
          throw new Error('Unsupported authentication method');
      }

      console.log(`Making request to: ${testUrl}`);

      const response = await axios.get(testUrl, {
        headers: authHeaders,
        timeout: this.timeout,
        validateStatus: (status) => status < 500
      });

      console.log(`Response status: ${response.status}`);

      if (response.status === 401) {
        // Try alternative endpoints to give better error messages
        try {
          const baseApiResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/`, {
            timeout: this.timeout
          });

          if (baseApiResponse.status === 200) {
            throw new Error('Authentication failed. Please verify:\n1. Username is correct\n2. Application password is valid and active\n3. User has sufficient permissions');
          }
        } catch (e) {
          // If base endpoint fails, the issue might be different
        }

        throw new Error('Authentication failed. Please check your username and application password.');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden. The user account may be disabled or lack sufficient permissions.');
      }

      if (response.status === 404) {
        throw new Error('WordPress REST API endpoint not found. The API may be disabled or blocked.');
      }

      if (response.status !== 200) {
        throw new Error(`Connection test failed with HTTP status: ${response.status}. Response: ${response.data}`);
      }

      // Get site information
      console.log('Authentication successful, fetching site info...');
      const siteInfoResponse = await axios.get(`${this.siteUrl}/wp-json/`, {
        headers: {
          'User-Agent': 'SparkleWP/1.0'
        },
        timeout: this.timeout
      });

      const siteInfo = siteInfoResponse.data;

      return {
        success: true,
        siteInfo: {
          name: siteInfo.name || 'Unknown',
          description: siteInfo.description || '',
          wpVersion: siteInfo.wp_version || 'Unknown',
          siteUrl: siteInfo.home || this.siteUrl,
          gmtOffset: siteInfo.gmt_offset || 0
        },
        userInfo: response.data
      };

    } catch (error) {
      console.log('Connection error:', error.message);

      if (error.response) {
        console.log(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
        console.log('Response data:', error.response.data);

        if (error.response.status === 401) {
          // Check if it's an application password issue
          if (error.response.data && typeof error.response.data === 'object') {
            const errorData = error.response.data;
            if (errorData.code === 'incorrect_password' || errorData.code === 'invalid_username') {
              throw new Error('Invalid username or application password. Please check your credentials.');
            }
          }
          throw new Error('Authentication failed. Please verify your username and application password are correct.');
        }

        if (error.response.status === 403) {
          throw new Error('Access forbidden. Please check that the user has sufficient permissions.');
        }

        if (error.response.status === 404) {
          throw new Error('WordPress REST API endpoint not found. The REST API may be disabled.');
        }

        if (error.response.status >= 500) {
          throw new Error('WordPress site server error. Please try again later.');
        }
      }

      // Network errors
      if (error.code === 'ENOTFOUND') {
        throw new Error('Website not found. Please check the URL is correct.');
      }

      if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timeout. The website may be slow or unreachable.');
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error('Connection refused. The website may be down or blocking connections.');
      }

      throw error;
    }
  }

  async getSiteStats() {
    const { method, username, password } = this.connectionData;

    if (!username || !password) {
      throw new Error('Authentication required');
    }

    try {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      const authHeaders = {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'SparkleWP/1.0'
      };

      // Get plugins count (if user has permission)
      let pluginsCount = 0;
      try {
        const pluginsResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/plugins`, {
          headers: authHeaders,
          timeout: this.timeout
        });
        pluginsCount = Array.isArray(pluginsResponse.data) ? pluginsResponse.data.length : 0;
      } catch (e) {
        // Plugins endpoint might not be accessible
        pluginsCount = 0;
      }

      // Get themes count (if user has permission)
      let themesCount = 0;
      try {
        const themesResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/themes`, {
          headers: authHeaders,
          timeout: this.timeout
        });
        themesCount = Array.isArray(themesResponse.data) ? themesResponse.data.length : 0;
      } catch (e) {
        // Themes endpoint might not be accessible
        themesCount = 0;
      }

      // Get posts count
      let postsCount = 0;
      try {
        const postsResponse = await axios.head(`${this.siteUrl}/wp-json/wp/v2/posts`, {
          headers: authHeaders,
          timeout: this.timeout
        });
        postsCount = parseInt(postsResponse.headers['x-wp-total'] || '0');
      } catch (e) {
        postsCount = 0;
      }

      return {
        plugins: pluginsCount,
        themes: themesCount,
        posts: postsCount
      };

    } catch (error) {
      throw new Error('Failed to fetch site statistics: ' + error.message);
    }
  }
}

module.exports = WordPressApiClient;