<?php
/**
 * Plugin Name: SparkleWP Connector
 * Description: Provides enhanced API access for SparkleWP management
 * Version: 1.0.0
 * Author: SparkleWP
 * Text Domain: sparklewp-connector
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main SparkleWP Connector Class
 */
class SparkleWP_Connector {

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
    }

    /**
     * Initialize the plugin
     */
    public function init() {
        // Handle admin actions
        $this->handle_admin_actions();
    }

    /**
     * Handle admin actions
     */
    private function handle_admin_actions() {
        if (!is_admin() || !current_user_can('manage_options')) {
            return;
        }

        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : '';

        if ($action === 'generate_password' && wp_verify_nonce($_GET['_wpnonce'] ?? '', 'sparklewp_generate_password')) {
            $this->generate_application_password();
        } elseif ($action === 'regenerate_password' && wp_verify_nonce($_GET['_wpnonce'] ?? '', 'sparklewp_regenerate_password')) {
            $this->regenerate_application_password();
        }
    }

    /**
     * Generate application password for current user
     */
    private function generate_application_password() {
        $current_user = wp_get_current_user();

        if (!$current_user || !current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        // First, remove any existing SparkleWP application passwords
        $this->remove_existing_sparklewp_passwords($current_user->ID);

        // Load application password functions from multiple possible locations
        $this->load_application_password_functions();

        // Check WordPress version first
        global $wp_version;
        if (version_compare($wp_version, '5.6', '<')) {
            wp_die('Your WordPress version (' . $wp_version . ') does not support Application Passwords. Please upgrade to WordPress 5.6 or higher.');
        }

        // Check if WordPress supports application passwords
        if (!function_exists('wp_create_application_password')) {
            wp_die('Application Password functions are not available. WordPress version: ' . $wp_version . '. Please check if Application Passwords are enabled.');
        }

        // Create application password using WordPress core functionality
        $created = wp_create_application_password($current_user->ID, array(
            'name' => 'SparkleWP Connector',
            'app_id' => 'sparklewp-connector'
        ));

        if (is_wp_error($created)) {
            wp_die('Failed to create application password: ' . $created->get_error_message());
        }

        $password = $created[0]; // The actual password
        $password_uuid = $created[1]; // The password UUID

        // Store both the password and UUID for easy retrieval
        update_user_meta($current_user->ID, 'sparklewp_app_password', $password);
        update_user_meta($current_user->ID, 'sparklewp_app_password_uuid', $password_uuid);

        // Redirect back to settings page with success message
        wp_redirect(admin_url('options-general.php?page=sparklewp-connector&password_generated=1'));
        exit;
    }

    /**
     * Load application password functions from various locations
     */
    private function load_application_password_functions() {
        // For WordPress 6.0+, the functions should be autoloaded
        // but let's ensure they're available by checking core files

        // Standard WordPress file locations
        $files_to_try = [
            ABSPATH . 'wp-includes/user.php',
            ABSPATH . 'wp-includes/class-wp-application-passwords.php',
            ABSPATH . 'wp-includes/application-passwords.php'
        ];

        foreach ($files_to_try as $file) {
            if (file_exists($file)) {
                require_once $file;
            }
        }

        // Alternative approach: Use WordPress's native way to load functions
        if (!function_exists('wp_create_application_password')) {
            // These functions should be in wp-includes/user.php starting from WP 5.6
            // Let's try to load them through WordPress's standard method

            // Ensure we have all the user-related functions loaded
            if (!function_exists('wp_set_password')) {
                require_once ABSPATH . 'wp-includes/pluggable.php';
            }

            // Check if the class exists (WordPress 6.0+ style)
            if (class_exists('WP_Application_Passwords') && !function_exists('wp_create_application_password')) {
                // If the class exists but functions don't, they might be methods
                // Let's create wrapper functions
                $this->create_application_password_wrappers();
            }
        }
    }

    /**
     * Create wrapper functions if only the class exists
     */
    private function create_application_password_wrappers() {
        if (!function_exists('wp_create_application_password') && class_exists('WP_Application_Passwords')) {
            // Create global functions that wrap the class methods
            if (!function_exists('wp_create_application_password')) {
                function wp_create_application_password($user_id, $args = array()) {
                    return WP_Application_Passwords::create_new_application_password($user_id, $args);
                }
            }

            if (!function_exists('wp_get_application_passwords')) {
                function wp_get_application_passwords($user_id) {
                    return WP_Application_Passwords::get_user_application_passwords($user_id);
                }
            }

            if (!function_exists('wp_delete_application_password')) {
                function wp_delete_application_password($user_id, $uuid) {
                    return WP_Application_Passwords::delete_application_password($user_id, $uuid);
                }
            }
        }
    }

    /**
     * Remove existing SparkleWP application passwords
     */
    private function remove_existing_sparklewp_passwords($user_id) {
        // Load application password functions
        $this->load_application_password_functions();

        if (!function_exists('wp_get_application_passwords')) {
            return; // Application passwords not supported
        }

        $passwords = wp_get_application_passwords($user_id);
        foreach ($passwords as $password) {
            if (isset($password['name']) && strpos($password['name'], 'SparkleWP') !== false) {
                wp_delete_application_password($user_id, $password['uuid']);
            }
        }

        // Also clean up our stored meta
        delete_user_meta($user_id, 'sparklewp_app_password');
        delete_user_meta($user_id, 'sparklewp_app_password_uuid');
    }

    /**
     * Regenerate application password
     */
    private function regenerate_application_password() {
        $current_user = wp_get_current_user();

        if (!$current_user || !current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        // Delete existing password
        delete_user_meta($current_user->ID, 'sparklewp_app_password');

        // Generate new one
        $this->generate_application_password();
    }

    /**
     * Auto-generate application password on plugin activation
     */
    public static function on_activation() {
        // Flush rewrite rules to ensure REST API routes are available
        flush_rewrite_rules();

        // We'll generate the application password when the user first visits the settings page
        // This ensures we have proper user context and can handle any errors gracefully
    }

    /**
     * Auto-generate application password for first-time setup
     */
    private function maybe_auto_generate_password() {
        $current_user = wp_get_current_user();

        if (!$current_user || !current_user_can('manage_options')) {
            return;
        }

        // Check if password already exists
        $existing_password = get_user_meta($current_user->ID, 'sparklewp_app_password', true);
        if ($existing_password) {
            return; // Already has password
        }

        // Check if this is first time visiting settings
        $first_time_setup = get_user_meta($current_user->ID, 'sparklewp_first_time_setup', true);
        if ($first_time_setup) {
            return; // Already tried setup
        }

        // Mark that we've attempted first-time setup
        update_user_meta($current_user->ID, 'sparklewp_first_time_setup', '1');

        // Load application password functions
        $this->load_application_password_functions();

        // Check WordPress version and function availability
        global $wp_version;
        if (version_compare($wp_version, '5.6', '<')) {
            error_log('SparkleWP: WordPress version (' . $wp_version . ') does not support Application Passwords');
            return;
        }

        if (!function_exists('wp_create_application_password')) {
            error_log('SparkleWP: Application password functions not available despite WordPress version: ' . $wp_version);
            return;
        }

        // Try to create application password automatically
        $created = wp_create_application_password($current_user->ID, array(
            'name' => 'SparkleWP Connector',
            'app_id' => 'sparklewp-connector'
        ));

        if (is_wp_error($created)) {
            error_log('SparkleWP: Failed to create application password: ' . $created->get_error_message());
            return;
        }

        $password = $created[0]; // The actual password
        $password_uuid = $created[1]; // The password UUID

        // Store both the password and UUID for easy retrieval
        update_user_meta($current_user->ID, 'sparklewp_app_password', $password);
        update_user_meta($current_user->ID, 'sparklewp_app_password_uuid', $password_uuid);

        error_log('SparkleWP: Application password created successfully for user ' . $current_user->user_login);
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'SparkleWP Connector',
            'SparkleWP',
            'manage_options',
            'sparklewp-connector',
            array($this, 'settings_page')
        );
    }

    /**
     * Initialize admin settings
     */
    public function admin_init() {
        register_setting('sparklewp_connector', 'sparklewp_connector_settings');
    }

    /**
     * Settings page content
     */
    public function settings_page() {
        $current_user = wp_get_current_user();

        // Try to auto-generate password for first-time setup
        $this->maybe_auto_generate_password();

        $app_password = get_user_meta($current_user->ID, 'sparklewp_app_password', true);
        $username = $current_user->user_login;

        // Show success messages
        if (isset($_GET['password_generated'])) {
            echo '<div class="notice notice-success is-dismissible"><p>Application password generated successfully!</p></div>';
        }
        ?>
        <div class="wrap">
            <h1>SparkleWP Connector Settings</h1>

            <div class="card">
                <h2>Connection Details</h2>
                <p>Use these credentials to connect your WordPress site to SparkleWP:</p>

                <table class="form-table">
                    <tr>
                        <th scope="row">Site URL</th>
                        <td>
                            <code id="site-url"><?php echo esc_url(home_url()); ?></code>
                            <button type="button" class="button button-small" onclick="copyToClipboard('site-url')">Copy</button>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Username</th>
                        <td>
                            <code id="username"><?php echo esc_html($username); ?></code>
                            <button type="button" class="button button-small" onclick="copyToClipboard('username')">Copy</button>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Application Password</th>
                        <td>
                            <?php if ($app_password): ?>
                                <code id="app-password"><?php echo esc_html($app_password); ?></code>
                                <button type="button" class="button button-small" onclick="copyToClipboard('app-password')">Copy</button>
                                <p class="description">
                                    This password was automatically generated and added to your
                                    <a href="<?php echo admin_url('profile.php#application-passwords-section'); ?>" target="_blank">WordPress profile</a>.
                                </p>
                            <?php else: ?>
                                <button type="button" class="button button-primary" onclick="generateAppPassword()">Generate Application Password</button>
                                <p class="description">
                                    Click to generate a new application password for SparkleWP.
                                    It will be added to your <a href="<?php echo admin_url('profile.php#application-passwords-section'); ?>" target="_blank">WordPress profile</a>.
                                </p>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>

                <?php if ($app_password): ?>
                    <div class="notice notice-success inline">
                        <p><strong>Ready to connect!</strong> Copy the credentials above and paste them into your SparkleWP dashboard.</p>
                    </div>
                <?php endif; ?>
            </div>

            <div class="card">
                <h2>API Endpoints</h2>
                <p>SparkleWP Connector provides the following API endpoints:</p>
                <ul>
                    <li><code><?php echo esc_url(rest_url('sparklewp/v1/test-connection')); ?></code> - Test connection</li>
                    <li><code><?php echo esc_url(rest_url('sparklewp/v1/site-info')); ?></code> - Get detailed site information</li>
                </ul>
            </div>

            <div class="card">
                <h2>Actions</h2>
                <p>
                    <button type="button" class="button" onclick="testConnection()">Test Connection</button>
                    <span id="test-result"></span>
                </p>
                <?php if ($app_password): ?>
                    <p>
                        <button type="button" class="button button-secondary" onclick="regenerateAppPassword()">Regenerate Application Password</button>
                        <span class="description">This will create a new password and invalidate the old one.</span>
                    </p>
                <?php endif; ?>
            </div>

            <div class="card">
                <h2>Debug Information</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">WordPress Version</th>
                        <td><?php echo get_bloginfo('version'); ?></td>
                    </tr>
                    <tr>
                        <th scope="row">Application Password Functions Available</th>
                        <td>
                            <?php
                            // Try to load the functions first
                            $this->load_application_password_functions();

                            $functions = [
                                'wp_create_application_password',
                                'wp_get_application_passwords',
                                'wp_delete_application_password',
                                'wp_is_application_passwords_available'
                            ];
                            foreach ($functions as $func) {
                                $available = function_exists($func) ? '✓' : '✗';
                                echo "<code>{$func}</code>: {$available}<br>";
                            }

                            // Show additional info
                            global $wp_version;
                            echo "<br><strong>WordPress Version:</strong> {$wp_version}<br>";
                            echo "<strong>Version Check:</strong> " . (version_compare($wp_version, '5.6', '>=') ? '✓' : '✗') . "<br>";

                            if (function_exists('wp_is_application_passwords_available')) {
                                echo "<strong>App Passwords Available:</strong> " . (wp_is_application_passwords_available() ? '✓' : '✗') . "<br>";
                            }

                            // Check for class existence
                            echo "<strong>WP_Application_Passwords class:</strong> " . (class_exists('WP_Application_Passwords') ? '✓' : '✗') . "<br>";

                            // Check file existence
                            $files_to_check = [
                                'wp-includes/user.php',
                                'wp-includes/class-wp-application-passwords.php',
                                'wp-includes/application-passwords.php'
                            ];

                            echo "<strong>Core Files:</strong><br>";
                            foreach ($files_to_check as $file) {
                                $exists = file_exists(ABSPATH . $file) ? '✓' : '✗';
                                echo "&nbsp;&nbsp;<code>{$file}</code>: {$exists}<br>";
                            }

                            // Try to show what methods are available on the class
                            if (class_exists('WP_Application_Passwords')) {
                                $methods = get_class_methods('WP_Application_Passwords');
                                echo "<strong>Available Methods:</strong><br>";
                                foreach (['create_new_application_password', 'get_user_application_passwords', 'delete_application_password'] as $method) {
                                    $available = in_array($method, $methods) ? '✓' : '✗';
                                    echo "&nbsp;&nbsp;<code>{$method}</code>: {$available}<br>";
                                }
                            }
                            ?>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Stored Application Passwords</th>
                        <td>
                            <?php
                            if (function_exists('wp_get_application_passwords')) {
                                $user_passwords = wp_get_application_passwords($current_user->ID);
                                if (empty($user_passwords)) {
                                    echo 'No application passwords found';
                                } else {
                                    echo '<ul>';
                                    foreach ($user_passwords as $password) {
                                        echo '<li>' . esc_html($password['name']) . ' (UUID: ' . esc_html($password['uuid']) . ')</li>';
                                    }
                                    echo '</ul>';
                                }
                            } else {
                                echo 'Function not available';
                            }
                            ?>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">User Meta</th>
                        <td>
                            <?php
                            $meta_password = get_user_meta($current_user->ID, 'sparklewp_app_password', true);
                            $meta_uuid = get_user_meta($current_user->ID, 'sparklewp_app_password_uuid', true);
                            $first_time = get_user_meta($current_user->ID, 'sparklewp_first_time_setup', true);

                            echo "sparklewp_app_password: " . ($meta_password ? 'Set' : 'Not set') . "<br>";
                            echo "sparklewp_app_password_uuid: " . ($meta_uuid ? esc_html($meta_uuid) : 'Not set') . "<br>";
                            echo "sparklewp_first_time_setup: " . ($first_time ? 'Yes' : 'No') . "<br>";
                            ?>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <script>
        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            const text = element.textContent;
            navigator.clipboard.writeText(text).then(function() {
                // Show success feedback
                const button = element.nextElementSibling;
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.backgroundColor = '#46b450';
                button.style.color = 'white';

                setTimeout(function() {
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                    button.style.color = '';
                }, 2000);
            });
        }

        function generateAppPassword() {
            if (confirm('Generate a new application password for SparkleWP?')) {
                window.location.href = '<?php echo admin_url('options-general.php?page=sparklewp-connector&action=generate_password&_wpnonce=' . wp_create_nonce('sparklewp_generate_password')); ?>';
            }
        }

        function regenerateAppPassword() {
            if (confirm('This will invalidate your current application password. Continue?')) {
                window.location.href = '<?php echo admin_url('options-general.php?page=sparklewp-connector&action=regenerate_password&_wpnonce=' . wp_create_nonce('sparklewp_regenerate_password')); ?>';
            }
        }

        function testConnection() {
            const resultSpan = document.getElementById('test-result');
            resultSpan.innerHTML = '<span style="color: #666;">Testing...</span>';

            fetch('<?php echo esc_url(rest_url('sparklewp/v1/test-connection')); ?>', {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa('<?php echo esc_js($username); ?>:<?php echo esc_js($app_password); ?>'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resultSpan.innerHTML = '<span style="color: #46b450;">✓ Connection successful!</span>';
                } else {
                    resultSpan.innerHTML = '<span style="color: #dc3232;">✗ Connection failed</span>';
                }
            })
            .catch(error => {
                resultSpan.innerHTML = '<span style="color: #dc3232;">✗ Error: ' + error.message + '</span>';
            });
        }
        </script>

        <style>
        .card {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .card h2 {
            margin-top: 0;
        }
        code {
            background: #f3f4f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: Consolas, Monaco, monospace;
        }
        </style>
        <?php
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('sparklewp/v1', '/site-info', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_site_info'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/test-connection', array(
            'methods' => 'GET',
            'callback' => array($this, 'test_connection'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/plugin/update', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_plugin'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/plugin/activate', array(
            'methods' => 'POST',
            'callback' => array($this, 'activate_plugin'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/plugin/deactivate', array(
            'methods' => 'POST',
            'callback' => array($this, 'deactivate_plugin'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/theme/update', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_theme'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/theme/activate', array(
            'methods' => 'POST',
            'callback' => array($this, 'activate_theme'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/plugin/delete', array(
            'methods' => 'POST',
            'callback' => array($this, 'delete_plugin'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('sparklewp/v1', '/theme/delete', array(
            'methods' => 'POST',
            'callback' => array($this, 'delete_theme'),
            'permission_callback' => array($this, 'check_permissions')
        ));
    }

    /**
     * Check if user has required permissions
     */
    public function check_permissions() {
        // Always allow if user is properly authenticated and has manage_options capability
        return current_user_can('manage_options');
    }

    /**
     * Test connection endpoint
     */
    public function test_connection() {
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'SparkleWP Connector is working!',
            'timestamp' => current_time('mysql'),
            'wp_version' => get_bloginfo('version')
        ), 200);
    }

    /**
     * Get comprehensive site information
     */
    public function get_site_info() {
        // Ensure plugin functions are available
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        // Get all plugins
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins');
        $network_active_plugins = is_multisite() ? get_site_option('active_sitewide_plugins', array()) : array();

        $plugin_data = array();
        foreach($all_plugins as $plugin_file => $plugin_info) {
            $is_active = in_array($plugin_file, $active_plugins) || array_key_exists($plugin_file, $network_active_plugins);

            // Check for updates from WordPress.org repository
            $update_available = false;
            $latest_version = null;

            // Get plugin slug - handle both directory-based and single-file plugins
            $plugin_slug = dirname($plugin_file);

            // For single-file plugins (like hello-dolly.php), use the filename without extension
            if ($plugin_slug === '.' || empty($plugin_slug)) {
                $plugin_slug = basename($plugin_file, '.php');
            }

            if ($plugin_slug && $plugin_slug !== '.') {
                $latest_version = $this->check_plugin_version($plugin_slug);
                if ($latest_version && version_compare($plugin_info['Version'], $latest_version, '<')) {
                    $update_available = true;
                }
            }

            $plugin_data[] = array(
                'name' => $plugin_info['Name'],
                'version' => $plugin_info['Version'],
                'description' => $plugin_info['Description'],
                'author' => $plugin_info['Author'],
                'active' => $is_active,
                'file' => $plugin_file,
                'slug' => $plugin_slug,
                'network_active' => array_key_exists($plugin_file, $network_active_plugins),
                'update_available' => $update_available,
                'latest_version' => $latest_version
            );
        }

        // Get theme info
        $current_theme = wp_get_theme();
        $all_themes = wp_get_themes();

        $theme_data = array();
        foreach($all_themes as $theme_slug => $theme_obj) {
            // Check for theme updates from WordPress.org repository
            $update_available = false;
            $latest_version = null;

            $latest_version = $this->check_theme_version($theme_slug);
            if ($latest_version && version_compare($theme_obj->get('Version'), $latest_version, '<')) {
                $update_available = true;
            }

            $theme_data[] = array(
                'name' => $theme_obj->get('Name'),
                'version' => $theme_obj->get('Version'),
                'description' => $theme_obj->get('Description'),
                'author' => $theme_obj->get('Author'),
                'active' => ($theme_slug === $current_theme->get_stylesheet()),
                'slug' => $theme_slug,
                'parent' => $theme_obj->get('Template'),
                'update_available' => $update_available,
                'latest_version' => $latest_version
            );
        }

        // Get WordPress and server info
        global $wpdb;

        $response_data = array(
            'success' => true,
            'timestamp' => current_time('mysql'),

            // Plugin information
            'plugins' => $plugin_data,
            'plugin_count' => count($plugin_data),
            'active_plugin_count' => count($active_plugins),

            // Theme information
            'themes' => $theme_data,
            'theme_count' => count($theme_data),
            'active_theme' => array(
                'name' => $current_theme->get('Name'),
                'version' => $current_theme->get('Version'),
                'slug' => $current_theme->get_stylesheet()
            ),

            // WordPress information
            'wp_version' => get_bloginfo('version'),
            'wp_debug' => defined('WP_DEBUG') ? WP_DEBUG : false,
            'wp_debug_log' => defined('WP_DEBUG_LOG') ? WP_DEBUG_LOG : false,

            // Site information
            'site_url' => get_site_url(),
            'home_url' => get_home_url(),
            'admin_url' => admin_url(),
            'site_title' => get_bloginfo('name'),
            'site_description' => get_bloginfo('description'),
            'admin_email' => get_option('admin_email'),
            'timezone' => get_option('timezone_string'),
            'date_format' => get_option('date_format'),
            'time_format' => get_option('time_format'),

            // Multisite information
            'is_multisite' => is_multisite(),
            'network_id' => is_multisite() ? get_current_network_id() : null,

            // Server information
            'php_version' => PHP_VERSION,
            'mysql_version' => $wpdb->db_version(),
            'server_software' => isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : 'Unknown',
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),

            // WordPress configuration
            'permalink_structure' => get_option('permalink_structure'),
            'uploads_dir' => wp_upload_dir(),
            'active_users_count' => count_users()['total_users'],

            // Recent posts/pages count
            'posts_count' => wp_count_posts('post')->publish,
            'pages_count' => wp_count_posts('page')->publish,

            // Plugin version for compatibility checking
            'connector_version' => '1.0.0'
        );

        return new WP_REST_Response($response_data, 200);
    }

    /**
     * Check plugin version from WordPress.org repository
     */
    private function check_plugin_version($plugin_slug) {
        if (empty($plugin_slug)) {
            return null;
        }

        // Use WordPress.org API to get plugin information
        $url = "https://api.wordpress.org/plugins/info/1.0/{$plugin_slug}.json";

        // Use wp_remote_get for better WordPress integration
        $response = wp_remote_get($url, array(
            'timeout' => 10,
            'user-agent' => 'SparkleWP Connector/1.0'
        ));

        if (is_wp_error($response)) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        $plugin_info = json_decode($body, true);

        if (!empty($plugin_info['version'])) {
            return $plugin_info['version'];
        }

        return null;
    }

    /**
     * Check theme version from WordPress.org repository
     */
    private function check_theme_version($theme_slug) {
        if (empty($theme_slug)) {
            return null;
        }

        // Use WordPress.org API to get theme information
        $url = "https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]={$theme_slug}";

        // Use wp_remote_get for better WordPress integration
        $response = wp_remote_get($url, array(
            'timeout' => 10,
            'user-agent' => 'SparkleWP Connector/1.0'
        ));

        if (is_wp_error($response)) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        $theme_info = json_decode($body, true);

        if (!empty($theme_info['version'])) {
            return $theme_info['version'];
        }

        return null;
    }

    /**
     * Update plugin endpoint
     */
    public function update_plugin($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin slug is required'
            ), 400);
        }

        // Load required WordPress files
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        if (!function_exists('request_filesystem_credentials')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

        // Find the plugin file
        $all_plugins = get_plugins();
        $plugin_file = null;

        foreach ($all_plugins as $file => $info) {
            $file_slug = dirname($file);

            // Handle single-file plugins
            if ($file_slug === '.' || empty($file_slug)) {
                $file_slug = basename($file, '.php');
            }

            if ($file_slug === $slug) {
                $plugin_file = $file;
                break;
            }
        }

        if (!$plugin_file) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin not found'
            ), 404);
        }

        // Check if update is available
        wp_update_plugins();
        $update_plugins = get_site_transient('update_plugins');

        if (!isset($update_plugins->response[$plugin_file])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No update available for this plugin'
            ), 400);
        }

        // Perform the update
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        $upgrader = new Plugin_Upgrader(new WP_Ajax_Upgrader_Skin());
        $result = $upgrader->upgrade($plugin_file);

        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message()
            ), 500);
        }

        if ($result === false) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin update failed'
            ), 500);
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Plugin updated successfully'
        ), 200);
    }

    /**
     * Activate plugin endpoint
     */
    public function activate_plugin($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin slug is required'
            ), 400);
        }

        // Load required WordPress files
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        // Find the plugin file
        $all_plugins = get_plugins();
        $plugin_file = null;

        foreach ($all_plugins as $file => $info) {
            $file_slug = dirname($file);

            // Handle single-file plugins
            if ($file_slug === '.' || empty($file_slug)) {
                $file_slug = basename($file, '.php');
            }

            if ($file_slug === $slug) {
                $plugin_file = $file;
                break;
            }
        }

        if (!$plugin_file) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin not found'
            ), 404);
        }

        // Activate the plugin
        $result = activate_plugin($plugin_file);

        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message()
            ), 500);
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Plugin activated successfully'
        ), 200);
    }

    /**
     * Deactivate plugin endpoint
     */
    public function deactivate_plugin($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin slug is required'
            ), 400);
        }

        // Load required WordPress files
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        // Find the plugin file
        $all_plugins = get_plugins();
        $plugin_file = null;

        foreach ($all_plugins as $file => $info) {
            $file_slug = dirname($file);

            // Handle single-file plugins
            if ($file_slug === '.' || empty($file_slug)) {
                $file_slug = basename($file, '.php');
            }

            if ($file_slug === $slug) {
                $plugin_file = $file;
                break;
            }
        }

        if (!$plugin_file) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin not found'
            ), 404);
        }

        // Deactivate the plugin
        deactivate_plugins($plugin_file);

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Plugin deactivated successfully'
        ), 200);
    }

    /**
     * Update theme endpoint
     */
    public function update_theme($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme slug is required'
            ), 400);
        }

        // Check if theme exists
        $theme = wp_get_theme($slug);
        if (!$theme->exists()) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme not found'
            ), 404);
        }

        // Load required WordPress files
        if (!function_exists('request_filesystem_credentials')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

        // Check if update is available
        wp_update_themes();
        $update_themes = get_site_transient('update_themes');

        if (!isset($update_themes->response[$slug])) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'No update available for this theme'
            ), 400);
        }

        // Perform the update
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        $upgrader = new Theme_Upgrader(new WP_Ajax_Upgrader_Skin());
        $result = $upgrader->upgrade($slug);

        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message()
            ), 500);
        }

        if ($result === false) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme update failed'
            ), 500);
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Theme updated successfully'
        ), 200);
    }

    /**
     * Activate theme endpoint
     */
    public function activate_theme($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme slug is required'
            ), 400);
        }

        // Check if theme exists
        $theme = wp_get_theme($slug);
        if (!$theme->exists()) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme not found'
            ), 404);
        }

        // Switch to the theme
        switch_theme($slug);

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Theme activated successfully'
        ), 200);
    }

    /**
     * Delete plugin endpoint
     */
    public function delete_plugin($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin slug is required'
            ), 400);
        }

        // Load required WordPress files
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/misc.php';
        if (!class_exists('WP_Upgrader')) {
            require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        }

        // Find the plugin file
        $all_plugins = get_plugins();
        $plugin_file = null;

        foreach ($all_plugins as $file => $info) {
            $file_slug = dirname($file);

            // Handle single-file plugins
            if ($file_slug === '.' || empty($file_slug)) {
                $file_slug = basename($file, '.php');
            }

            if ($file_slug === $slug) {
                $plugin_file = $file;
                break;
            }
        }

        if (!$plugin_file) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Plugin not found'
            ), 404);
        }

        // Check if plugin is active - cannot delete active plugins
        if (is_plugin_active($plugin_file)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Cannot delete an active plugin. Please deactivate it first.'
            ), 400);
        }

        // Delete the plugin
        $result = delete_plugins(array($plugin_file));

        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message()
            ), 500);
        }

        if ($result === false) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to delete plugin'
            ), 500);
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Plugin deleted successfully'
        ), 200);
    }

    /**
     * Delete theme endpoint
     */
    public function delete_theme($request) {
        $slug = $request->get_param('slug');

        if (empty($slug)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme slug is required'
            ), 400);
        }

        // Check if theme exists
        $theme = wp_get_theme($slug);
        if (!$theme->exists()) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Theme not found'
            ), 404);
        }

        // Check if theme is currently active - cannot delete active theme
        $current_theme = wp_get_theme();
        if ($current_theme->get_stylesheet() === $slug) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Cannot delete the active theme. Please activate a different theme first.'
            ), 400);
        }

        // Load required WordPress files
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/misc.php';
        if (!function_exists('delete_theme')) {
            require_once ABSPATH . 'wp-admin/includes/theme.php';
        }

        // Delete the theme
        $result = delete_theme($slug);

        if (is_wp_error($result)) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $result->get_error_message()
            ), 500);
        }

        if ($result === false) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Failed to delete theme'
            ), 500);
        }

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Theme deleted successfully'
        ), 200);
    }
}

// Initialize the plugin
new SparkleWP_Connector();

// Add activation hook
register_activation_hook(__FILE__, array('SparkleWP_Connector', 'on_activation'));

// Add deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Clean up if needed
    flush_rewrite_rules();
});