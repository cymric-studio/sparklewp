# Security Policy

## Supported Versions

We actively support the following versions of SparkleWP with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in SparkleWP, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email security details to:
**adrian@cymricstudio.com**

### What to Include

Please include the following information in your report:

1. **Vulnerability Description**: Clear description of the security issue
2. **Steps to Reproduce**: Detailed steps to reproduce the vulnerability
3. **Impact Assessment**: Potential impact and severity of the issue
4. **Affected Components**: Which parts of the application are affected
5. **Suggested Fix**: If you have ideas for how to fix the issue
6. **Proof of Concept**: Code, screenshots, or other evidence (if applicable)

### Response Timeline

- **Initial Response**: Within 24 hours of receipt
- **Vulnerability Assessment**: Within 72 hours
- **Fix Development**: Varies based on complexity and severity
- **Public Disclosure**: After fix is released and users have time to update

### Security Measures

SparkleWP implements several security measures:

#### Authentication & Authorization
- **JWT Token Security**: Signed tokens with expiration
- **Rate Limiting**: Protection against brute force attacks
- **Role-Based Access**: Granular permission system
- **Session Management**: Secure session handling

#### Data Protection
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Prevention**: Input sanitization and output encoding

#### WordPress Integration
- **Application Passwords**: Secure WordPress authentication
- **API Validation**: Proper WordPress REST API integration
- **Credential Encryption**: Secure storage of WordPress credentials
- **Connection Security**: Encrypted communication with WordPress sites

#### Infrastructure Security
- **HTTPS Enforcement**: Secure communication channels
- **Environment Variables**: Sensitive data in environment configuration
- **Error Handling**: Secure error messages without information disclosure
- **Dependencies**: Regular updates of security-critical dependencies

### Security Best Practices for Users

#### For Administrators
1. **Use Strong Passwords**: Complex passwords for all accounts
2. **Regular Updates**: Keep SparkleWP updated to latest version
3. **Secure Hosting**: Use reputable hosting with security features
4. **Regular Backups**: Maintain secure backups of data
5. **Monitor Access**: Review user access and permissions regularly

#### For WordPress Integration
1. **Application Passwords**: Use application passwords instead of main credentials
2. **Limited Permissions**: Grant minimum necessary permissions
3. **Regular Rotation**: Rotate application passwords periodically
4. **Secure WordPress**: Keep WordPress sites updated and secure
5. **Plugin Security**: Only install trusted WordPress plugins

### Security Considerations for Developers

#### Code Security
- **Input Validation**: Validate all user inputs
- **Output Encoding**: Properly encode all outputs
- **Error Handling**: Handle errors securely without information leakage
- **Dependencies**: Keep dependencies updated and audit regularly

#### WordPress Plugin Security
- **WordPress Standards**: Follow WordPress security guidelines
- **Sanitization**: Properly sanitize all WordPress data
- **Capabilities Check**: Verify user capabilities before actions
- **Nonce Verification**: Use WordPress nonces for form security

### Vulnerability Disclosure Policy

#### Coordinated Disclosure
We follow responsible disclosure practices:

1. **Private Reporting**: Vulnerabilities reported privately first
2. **Fix Development**: Work with reporter to develop and test fix
3. **Public Disclosure**: Announce vulnerability after fix is available
4. **Credit**: Security researchers receive appropriate credit

#### Public Disclosure Timeline
- **Critical Vulnerabilities**: Fixed within 48-72 hours
- **High Severity**: Fixed within 1 week
- **Medium Severity**: Fixed within 2 weeks
- **Low Severity**: Fixed in next regular release

### Security Updates

Security updates are released as:
- **Patch Releases**: For critical and high severity issues
- **Minor Releases**: For medium severity issues
- **Regular Releases**: For low severity issues and improvements

Users are notified of security updates through:
- GitHub release notes
- Email notifications (if subscribed)
- In-application notifications (for critical updates)

### Contact Information

For security-related questions or concerns:
- **Email**: adrian@cymricstudio.com
- **Response Time**: Within 24 hours
- **PGP Key**: Available upon request

---

Thank you for helping keep SparkleWP secure! 🔒