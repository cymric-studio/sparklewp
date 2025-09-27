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

          // Clean the application password (remove spaces and normalize)
          const cleanPassword = password.replace(/\s+/g, '').trim();
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
          if (!apiKey) {
            throw new Error('JWT token is required');
          }
          authHeaders = {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
          };
          break;

        case 'oauth':
          if (!apiKey) {
            throw new Error('OAuth token is required');
          }
          authHeaders = {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
          };
          break;

        case 'cookie_auth':
          // Cookie authentication with nonce (for same-origin requests)
          if (!apiKey) {
            throw new Error('WordPress nonce is required for cookie authentication');
          }
          authHeaders = {
            'X-WP-Nonce': apiKey,
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
          };
          break;

        case 'api_key':
          if (!apiKey) {
            throw new Error('API key is required');
          }
          authHeaders = {
            'X-API-Key': apiKey,
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
          };
          break;

        case 'custom_token':
          // Custom authentication token (often used by WordPress plugins)
          if (!apiKey) {
            throw new Error('Custom token is required');
          }
          authHeaders = {
            'X-WP-SparkleWP-Token': apiKey,
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
          };
          break;

        case 'session_auth':
          // WordPress session-based authentication
          if (!apiKey) {
            throw new Error('WordPress session token is required');
          }
          authHeaders = {
            'Cookie': `wordpress_logged_in_${apiKey.split(':')[0]}=${apiKey}`,
            'X-WP-Nonce': apiKey.split(':')[1] || '',
            'User-Agent': 'SparkleWP/1.0',
            'Accept': 'application/json'
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
          'User-Agent': 'SparkleWP/1.0',
          'Accept': 'application/json'
        },
        timeout: this.timeout,
        validateStatus: (status) => status < 500
      });

      const siteInfo = siteInfoResponse.data;
      console.log('Site info response status:', siteInfoResponse.status);
      console.log('Site info response type:', typeof siteInfo);

      // Extract WordPress version with comprehensive detection methods
      let wpVersion = 'Unknown';

      console.log('Starting WordPress version detection...');
      console.log('Site info type:', typeof siteInfo);
      console.log('Site info sample:', typeof siteInfo === 'string' ? siteInfo.substring(0, 500) + '...' : siteInfo);

      // Method 1: Check if we got JSON response
      if (typeof siteInfo === 'object' && siteInfo !== null && !Array.isArray(siteInfo)) {
        console.log('Method 1: Checking JSON response for version fields...');
        if (siteInfo.wp_version) {
          wpVersion = siteInfo.wp_version;
          console.log(`Found wp_version: ${wpVersion}`);
        } else if (siteInfo.version) {
          wpVersion = siteInfo.version;
          console.log(`Found version: ${wpVersion}`);
        } else if (siteInfo.api_version) {
          wpVersion = `API v${siteInfo.api_version}`;
          console.log(`Found api_version: ${wpVersion}`);
        }
      }

      // Method 2: If we still don't have version, try alternative API endpoints
      if (wpVersion === 'Unknown') {
        console.log('Method 2: Trying alternative version detection endpoints...');

        try {
          // Try the WordPress version endpoint specifically
          const versionResponse = await axios.get(`${this.siteUrl}/wp-json`, {
            headers: {
              'User-Agent': 'SparkleWP/1.0',
              'Accept': 'application/json'
            },
            timeout: this.timeout,
            validateStatus: (status) => status < 500
          });

          console.log(`Version endpoint response status: ${versionResponse.status}`);

          if (versionResponse.status === 200 && versionResponse.data) {
            const versionData = versionResponse.data;
            console.log('Version endpoint data:', JSON.stringify(versionData, null, 2));

            if (versionData.gmt_offset !== undefined || versionData.timezone_string !== undefined) {
              // This looks like a proper WordPress API response
              if (versionData.wp_version) {
                wpVersion = versionData.wp_version;
                console.log(`Found wp_version from version endpoint: ${wpVersion}`);
              }
            }
          }
        } catch (versionError) {
          console.log('Version endpoint failed:', versionError.message);
        }
      }

      // Method 3: Parse HTML response for version (enhanced patterns)
      if (wpVersion === 'Unknown') {
        console.log('Method 3: Attempting HTML parsing for WordPress version...');

        try {
          // Get the homepage content if we don't have it already
          let htmlContent = '';
          if (typeof siteInfo === 'string') {
            htmlContent = siteInfo;
          } else {
            console.log('Fetching homepage for version detection...');
            const homePageResponse = await axios.get(this.siteUrl, {
              headers: {
                'User-Agent': 'SparkleWP/1.0'
              },
              timeout: this.timeout
            });
            htmlContent = homePageResponse.data;
          }

          console.log('Parsing HTML content for version...');
          console.log('HTML content length:', htmlContent.length);

          // Multiple patterns to detect WordPress version
          const versionPatterns = [
            // Pattern 1: wp-emoji-release.min.js?ver=6.8.2
            /wp-emoji-release\.min\.js\?ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/,
            // Pattern 2: Any WordPress core JS file with version
            /wp-(?:includes|admin|content)\/js\/[^\/]+\.js\?ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/,
            // Pattern 3: WordPress CSS files with version
            /wp-(?:includes|admin|content)\/css\/[^\/]+\.css\?ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/,
            // Pattern 4: General version parameter
            /['"\/]wp-[^'"\/]*\.(?:js|css)\?ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/,
            // Pattern 5: WordPress core files in wp-includes
            /wp-includes\/[^'"]*\?ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/,
            // Pattern 6: Meta generator tag
            /<meta name="generator" content="WordPress ([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i,
            // Pattern 7: WordPress version in comments
            /WordPress ([0-9]+\.[0-9]+(?:\.[0-9]+)?)/
          ];

          for (let i = 0; i < versionPatterns.length; i++) {
            const pattern = versionPatterns[i];
            const match = htmlContent.match(pattern);
            if (match && match[1]) {
              wpVersion = match[1];
              console.log(`Found WordPress version using pattern ${i + 1}: ${wpVersion}`);
              break;
            }
          }

          // If still no version found, try one more comprehensive search
          if (wpVersion === 'Unknown') {
            console.log('Trying comprehensive version pattern search...');
            const allMatches = htmlContent.match(/\?ver=([0-9]+\.[0-9]+(?:\.[0-9]+)?)/g);
            if (allMatches && allMatches.length > 0) {
              // Get the most common version number
              const versionCounts = {};
              allMatches.forEach(match => {
                const version = match.replace('?ver=', '');
                versionCounts[version] = (versionCounts[version] || 0) + 1;
              });

              const mostCommonVersion = Object.keys(versionCounts).reduce((a, b) =>
                versionCounts[a] > versionCounts[b] ? a : b
              );

              if (mostCommonVersion && mostCommonVersion.match(/^[0-9]+\.[0-9]+/)) {
                wpVersion = mostCommonVersion;
                console.log(`Found most common version: ${wpVersion} (appeared ${versionCounts[mostCommonVersion]} times)`);
              }
            }
          }

        } catch (htmlError) {
          console.log('HTML parsing for version failed:', htmlError.message);
        }
      }

      console.log(`Final detected WordPress version: ${wpVersion}`);

      return {
        success: true,
        siteInfo: {
          name: siteInfo.name || 'Unknown',
          description: siteInfo.description || '',
          wpVersion: wpVersion,
          siteUrl: siteInfo.home || siteInfo.url || this.siteUrl,
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
      const cleanPassword = password.replace(/\s+/g, '').trim();
      const credentials = Buffer.from(`${username}:${cleanPassword}`).toString('base64');
      const authHeaders = {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'SparkleWP/1.0',
        'Accept': 'application/json'
      };

      console.log(`Fetching site stats for ${this.siteUrl}...`);

      // First, try the SparkleWP Connector plugin endpoint
      try {
        console.log('Trying SparkleWP Connector plugin endpoint...');
        const connectorResponse = await axios.get(`${this.siteUrl}/wp-json/sparklewp/v1/site-info`, {
          headers: authHeaders,
          timeout: this.timeout,
          validateStatus: (status) => status < 500
        });

        console.log(`SparkleWP Connector response status: ${connectorResponse.status}`);

        if (connectorResponse.status === 200 && connectorResponse.data && connectorResponse.data.success) {
          const data = connectorResponse.data;
          console.log('SparkleWP Connector data received successfully!');
          console.log(`Plugins: ${data.plugin_count}, Themes: ${data.theme_count}, Posts: ${data.posts_count || 0}`);

          return {
            plugins: data.plugin_count || 0,
            themes: data.theme_count || 0,
            posts: data.posts_count || 0,
            connector_used: true,
            wp_version: data.wp_version,
            php_version: data.php_version,
            detailed_plugins: data.plugins || [],
            detailed_themes: data.themes || []
          };
        }
      } catch (connectorError) {
        console.log('SparkleWP Connector plugin not available:', connectorError.message);
        console.log('Falling back to standard WordPress API methods...');
      }

      // Fallback to standard WordPress API methods
      console.log('Using standard WordPress API detection methods...');

      // Get posts count first (most reliable)
      let postsCount = 0;
      try {
        const postsResponse = await axios.head(`${this.siteUrl}/wp-json/wp/v2/posts`, {
          headers: authHeaders,
          timeout: this.timeout
        });
        postsCount = parseInt(postsResponse.headers['x-wp-total'] || '0');
        console.log(`Posts count: ${postsCount}`);
      } catch (e) {
        console.log('Could not fetch posts count:', e.message);
        postsCount = 0;
      }

      // Try to get plugins count using WordPress REST API
      let pluginsCount = 0;
      try {
        console.log('Trying multiple plugin detection methods...');

        // Method 1: Try the standard wp/v2/plugins endpoint with proper context
        try {
          console.log('Method 1: Trying /wp-json/wp/v2/plugins with edit context...');

          // Try with edit context first (requires authentication but gives full info)
          let pluginsUrl = `${this.siteUrl}/wp-json/wp/v2/plugins?context=edit`;
          let pluginsResponse = await axios.get(pluginsUrl, {
            headers: {
              ...authHeaders,
              'Accept': 'application/json'
            },
            timeout: this.timeout,
            validateStatus: (status) => status < 500
          });

          console.log(`Plugins endpoint (edit context) response status: ${pluginsResponse.status}`);

          // If edit context fails, try view context (may work without auth)
          if (pluginsResponse.status !== 200) {
            console.log('Edit context failed, trying view context...');
            pluginsUrl = `${this.siteUrl}/wp-json/wp/v2/plugins?context=view`;
            pluginsResponse = await axios.get(pluginsUrl, {
              headers: {
                'User-Agent': 'SparkleWP/1.0',
                'Accept': 'application/json'
              },
              timeout: this.timeout,
              validateStatus: (status) => status < 500
            });
            console.log(`Plugins endpoint (view context) response status: ${pluginsResponse.status}`);
          }

          // If still failing, try without context parameter
          if (pluginsResponse.status !== 200) {
            console.log('View context failed, trying without context...');
            pluginsUrl = `${this.siteUrl}/wp-json/wp/v2/plugins`;
            pluginsResponse = await axios.get(pluginsUrl, {
              headers: {
                ...authHeaders,
                'Accept': 'application/json'
              },
              timeout: this.timeout,
              validateStatus: (status) => status < 500
            });
            console.log(`Plugins endpoint (no context) response status: ${pluginsResponse.status}`);
          }

          console.log('Plugins response data:', JSON.stringify(pluginsResponse.data, null, 2));

          if (pluginsResponse.status === 200) {
            if (Array.isArray(pluginsResponse.data)) {
              // Filter out inactive plugins if we want only active ones
              const activePlugins = pluginsResponse.data.filter(plugin =>
                plugin.status === 'active' || plugin.status === undefined
              );
              pluginsCount = pluginsResponse.data.length; // Total plugins
              console.log(`Total plugins: ${pluginsCount}`);
              console.log(`Active plugins: ${activePlugins.length}`);
              console.log('Plugin details:', pluginsResponse.data.map(p => ({
                name: p.name,
                status: p.status,
                version: p.version
              })));
            } else if (typeof pluginsResponse.data === 'object' && pluginsResponse.data !== null) {
              pluginsCount = Object.keys(pluginsResponse.data).length;
              console.log(`Plugins count (object format): ${pluginsCount}`);
            }
          } else if (pluginsResponse.status === 401) {
            console.log('Plugins endpoint requires authentication - current user lacks permissions');
          } else if (pluginsResponse.status === 403) {
            console.log('Plugins endpoint access forbidden - user needs manage_plugins capability');
          } else if (pluginsResponse.status === 404) {
            console.log('Plugins endpoint not found - may be disabled or custom implementation');
          }
        } catch (pluginError) {
          console.log('Standard plugins endpoint failed:', pluginError.message);
          if (pluginError.response) {
            console.log('Error response status:', pluginError.response.status);
            console.log('Error response data:', pluginError.response.data);
          }
        }

        // Method 2: Check user capabilities and try alternative endpoints
        if (pluginsCount === 0) {
          console.log('Method 2: Checking user capabilities and trying alternative endpoints...');

          // Check if current user has manage_plugins capability
          try {
            console.log('Checking user capabilities...');
            const userResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/users/me?context=edit`, {
              headers: authHeaders,
              timeout: this.timeout,
              validateStatus: (status) => status < 500
            });

            console.log(`User capabilities response status: ${userResponse.status}`);
            if (userResponse.status === 200 && userResponse.data) {
              console.log('User capabilities:', JSON.stringify(userResponse.data.capabilities || {}, null, 2));
              const capabilities = userResponse.data.capabilities || {};

              if (capabilities.manage_plugins || capabilities.administrator) {
                console.log('User has plugin management capabilities');
              } else {
                console.log('User lacks plugin management capabilities - this may explain plugin access issues');
              }
            }
          } catch (capError) {
            console.log('User capabilities check failed:', capError.message);
          }

          // Try alternative REST API endpoints for plugin info
          try {
            console.log('Trying wp/v2/plugin-types endpoint...');
            const pluginTypesResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/plugin-types`, {
              headers: authHeaders,
              timeout: this.timeout,
              validateStatus: (status) => status < 500
            });

            console.log(`Plugin types response status: ${pluginTypesResponse.status}`);
            if (pluginTypesResponse.status === 200) {
              console.log('Plugin types data:', JSON.stringify(pluginTypesResponse.data, null, 2));
            }
          } catch (pluginTypesError) {
            console.log('Plugin types endpoint failed:', pluginTypesError.message);
          }

          // Try admin-ajax.php for plugin information (common WordPress approach)
          try {
            console.log('Trying admin-ajax.php for plugin data...');
            const ajaxResponse = await axios.post(`${this.siteUrl}/wp-admin/admin-ajax.php`,
              'action=sparklewp_get_plugins',
              {
                headers: {
                  ...authHeaders,
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: this.timeout,
                validateStatus: (status) => status < 500
              }
            );

            console.log(`Admin-ajax response status: ${ajaxResponse.status}`);
            if (ajaxResponse.status === 200 && ajaxResponse.data !== '0') {
              console.log('Admin-ajax data:', JSON.stringify(ajaxResponse.data, null, 2));
              // If we get valid plugin data from admin-ajax, use it
              if (typeof ajaxResponse.data === 'object' && ajaxResponse.data.plugins) {
                pluginsCount = ajaxResponse.data.plugins.length;
                console.log(`Found ${pluginsCount} plugins via admin-ajax`);
              }
            }
          } catch (ajaxError) {
            console.log('Admin-ajax endpoint failed:', ajaxError.message);
          }

          // Try WooCommerce System Status API (if WooCommerce is installed)
          try {
            console.log('Trying WooCommerce system status endpoint...');
            const wooResponse = await axios.get(`${this.siteUrl}/wp-json/wc/v3/system_status`, {
              headers: authHeaders,
              timeout: this.timeout,
              validateStatus: (status) => status < 500
            });

            console.log(`WooCommerce system status response status: ${wooResponse.status}`);
            if (wooResponse.status === 200 && wooResponse.data && wooResponse.data.active_plugins) {
              pluginsCount = wooResponse.data.active_plugins.length;
              console.log(`Found ${pluginsCount} plugins via WooCommerce system status`);
            }
          } catch (wooError) {
            console.log('WooCommerce system status failed:', wooError.message);
          }

          // Try the site health endpoint which sometimes includes plugin info
          try {
            console.log('Trying site-health endpoint...');
            const healthResponse = await axios.get(`${this.siteUrl}/wp-json/wp-site-health/v1/directory-sizes`, {
              headers: authHeaders,
              timeout: this.timeout,
              validateStatus: (status) => status < 500
            });

            console.log(`Site health response status: ${healthResponse.status}`);
            if (healthResponse.status === 200) {
              console.log('Site health data:', JSON.stringify(healthResponse.data, null, 2));
            }
          } catch (healthError) {
            console.log('Site health endpoint failed:', healthError.message);
          }
        }

        // Method 3: Parse HTML for plugin information as fallback
        if (pluginsCount === 0) {
          console.log('Method 3: Attempting HTML parsing for plugin detection...');
          try {
            const homePageResponse = await axios.get(this.siteUrl, {
              headers: {
                'User-Agent': 'SparkleWP/1.0'
              },
              timeout: this.timeout
            });

            const content = homePageResponse.data.toLowerCase();
            console.log('HTML content length:', content.length);

            // Look for plugin directory references
            const pluginMatches = content.match(/wp-content\/plugins\/([^\/'"?]+)/g);
            if (pluginMatches) {
              // Extract unique plugin directory names
              const uniquePlugins = [...new Set(pluginMatches.map(match => {
                const pluginName = match.replace('wp-content/plugins/', '').split('/')[0];
                return pluginName;
              }))];

              // Filter out common false positives
              const filteredPlugins = uniquePlugins.filter(plugin =>
                plugin !== 'index.php' &&
                plugin !== '' &&
                !plugin.includes('?') &&
                plugin.length > 1
              );

              pluginsCount = filteredPlugins.length;
              console.log(`Found ${pluginsCount} plugins from HTML parsing:`, filteredPlugins);
            }
          } catch (htmlError) {
            console.log('HTML parsing for plugins failed:', htmlError.message);
          }
        }

      } catch (e) {
        console.log('All plugin detection methods failed:', e.message);
        pluginsCount = 0;
      }

      // Try to get themes count
      let themesCount = 0;
      try {
        console.log('Trying themes endpoint...');
        const themesResponse = await axios.get(`${this.siteUrl}/wp-json/wp/v2/themes`, {
          headers: {
            ...authHeaders,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: this.timeout,
          validateStatus: (status) => status < 500
        });

        console.log(`Themes endpoint response status: ${themesResponse.status}`);
        console.log('Themes response data:', JSON.stringify(themesResponse.data, null, 2));

        if (themesResponse.status === 200) {
          if (Array.isArray(themesResponse.data)) {
            themesCount = themesResponse.data.length;
            console.log(`Themes count (array format): ${themesCount}`);
          } else if (typeof themesResponse.data === 'object' && themesResponse.data !== null) {
            // Sometimes themes are returned as an object
            themesCount = Object.keys(themesResponse.data).length;
            console.log(`Themes count (object format): ${themesCount}`);
          } else {
            console.log('Themes data is not in expected format:', typeof themesResponse.data);
          }
        } else if (themesResponse.status === 401) {
          console.log('Themes endpoint requires authentication - insufficient permissions');
          themesCount = 0;
        } else if (themesResponse.status === 403) {
          console.log('Themes endpoint access forbidden - user lacks permissions');
          themesCount = 0;
        } else {
          console.log(`Themes endpoint returned status: ${themesResponse.status}`);
          themesCount = 0;
        }
      } catch (e) {
        console.log('Themes REST API failed:', e.message);

        // Check if it's a permission issue
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
          console.log('Themes endpoint requires admin permissions');
          themesCount = 0;
        } else {
          console.log('Could not fetch themes count - endpoint may not be available');
          themesCount = 0;
        }
      }

      const stats = {
        plugins: pluginsCount,
        themes: themesCount,
        posts: postsCount
      };

      console.log('Final site stats:', stats);
      return stats;

    } catch (error) {
      console.error('Failed to fetch site statistics:', error.message);
      // Return default values instead of throwing
      return {
        plugins: 0,
        themes: 0,
        posts: 0
      };
    }
  }
}

module.exports = WordPressApiClient;