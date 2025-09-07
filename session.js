// Function to check if a cookie exists and is not expired
function checkCookie(name) {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(name + '='));
    return cookie != null;
}

// Function to check session and redirect if needed
function checkSession() {
    const accessToken = checkCookie('access_token');
    const refreshToken = checkCookie('refresh_token');
    
    // Get current path
    const currentPath = window.location.pathname;
    
    // Define login page path (adjust this based on your project structure)
    const loginPath = '/login/login.html';
    
    // Check if we're not on the login page
    if (!currentPath.includes(loginPath)) {
        if (!accessToken || !refreshToken) {
            console.log('No valid session found. Redirecting to login...');
            // Get the root URL
            const rootUrl = window.location.origin;
            // Redirect to login page
            window.location.href = rootUrl + loginPath;
        } else {
            console.log('Valid session found');
        }
    } else {
        // If we're on the login page and have valid tokens, redirect to dashboard
        if (accessToken && refreshToken) {
            console.log('Active session found. Redirecting to dashboard...');
            const rootPath = window.location.origin;
            window.location.href = `${rootPath}`;
        }
    }
}

// Run session check when page loads
// document.addEventListener('DOMContentLoaded', checkTokensAndRedirect);

// Optional: Periodically check session
// setInterval(checkSession, 60000); // Check every minute

// Add this at the beginning of your file, after baseURL declaration
function checkTokensAndRedirect() {
    // Check if current page is login page
    if (window.location.pathname.includes('/login/login.html')) {
        return; // Skip redirect if already on login page
    }

    const accessToken = getCookie('access_token');
    const refreshToken = getCookie('refresh_token');

    if (!accessToken || !refreshToken) {
        const rootPath = window.location.origin;
        window.location.href = `${rootPath}/login/login.html`;
    }
}

// Call this function immediately
// checkTokensAndRedirect();