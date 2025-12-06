// API Configuration - Automatically detects port
// This file is loaded first to set up API_BASE_URL for all other scripts

(function() {
    // Determine API base URL
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    
    if (isLocalhost) {
        // Local development: use current port from window.location
        // If port is empty, it means default port (80 for http, 443 for https)
        if (port) {
            window.API_BASE_URL = `${protocol}//${hostname}:${port}/api`;
        } else {
            // Default port case
            const defaultPort = protocol === 'https:' ? '443' : '80';
            window.API_BASE_URL = `${protocol}//${hostname}:${defaultPort}/api`;
        }
    } else {
        // Production/deployment: use relative path (same domain)
        window.API_BASE_URL = '/api';
    }
    
    console.log('API Base URL:', window.API_BASE_URL);
})();

