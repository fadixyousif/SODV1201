// Universal notification function
function showNotification(status, title, text) {
    new Notify({
        status: status, // 'success', 'error', 'warning', etc.
        title: title,
        text: text,
        effect: 'fade',
        speed: 300,
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 3000,
        position: 'right top'
    });
}

// Function to register a new user
async function registerUser(userData) {
    try {
        const response = await fetch(`${api_url}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('success', 'Success', result.message);
            $('#signup-form').hide();
            $('#login-form').show();
        } else {
            showNotification('error', 'Registration Failed', result.message || 'An error occurred.');
        }
    } catch (error) {
        showNotification('error', 'Error', `An error occurred: ${error.message}`);
    }
}

// Function to log in a user
async function loginUser(userData) {
    try {
        const response = await fetch(`${api_url}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('success', 'Login Successful', result.message || 'Welcome!');
            
            // Store the token in localStorage for future authenticated requests
            localStorage.setItem('auth-token', result.token);

            // Redirect to the dashboard or another page
            if (result.role === 'owner') {
                window.location.href = 'management.html';
            }
            else if (result.role === 'coworker') {
                window.location.href = 'listing.html';
            } else {
                showNotification('error', 'Error', 'Invalid role. Please contact support.');
            }
        } else {
            showNotification('error', 'Login Failed', result.message || 'Invalid username or password.');
        }
    } catch (error) {
        showNotification('error', 'Error', `An error occurred: ${error.message}`);
    }
}

// Validation function for signup form
function validateSignupForm(user) {
    const { fullname, username, password, email, phone, role } = user;

    // Full name validation
    if (fullname.length < 4 || fullname.length > 100) {
        return { success: false, message: 'Full name must be between 4 and 20 characters.' };
    }
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullname)) {
        return { success: false, message: 'Full name must contain only letters and spaces.' };
    }

    // Username validation
    if (username.length < 4 || username.length > 20) {
        return { success: false, message: 'Username must be between 4 and 20 characters.' };
    }

    // Password validation
    if (password.length < 8 || password.length > 20) {
        return { success: false, message: 'Password must be between 8 and 20 characters.' };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format.' };
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/; // Example: Validates a 10-digit phone number
    if (!phoneRegex.test(phone)) {
        return { success: false, message: 'Phone number must be a valid 10-digit number.' };
    }

    // Role validation
    if (role !== 'coworker' && role !== 'owner') {
        return { success: false, message: 'Role must be either "coworker" or "owner".' };
    }

    return { success: true };
}

$(document).ready(async function () {
        // Fetch user details
        const response = await fetch('http://localhost:3300/api/users/login/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth-token')
            }
        });
    
        const user = await response.json();
    
        if (user.success) {
            const { role } = user;
    
            if (role === 'owner') {
                window.location.href = 'management.html';
            } else if (role === 'coworker') {
                window.location.href = 'listing.html';
            } else {
                showNotification('error', 'Error', 'Invalid role. Please contact support.');
            }
        }

    // Toggle between login and signup forms
    $('.toggle').on('click', function () {
        const loginForm = $('#login-form');
        const signupForm = $('#signup-form');

        if (loginForm.is(':visible')) {
            loginForm.hide();
            signupForm.show();
        } else {
            loginForm.show();
            signupForm.hide();
        }
    });

    // Validate login form
    $('#login-form').on('submit', function (e) {
        e.preventDefault(); // Prevent form submission
        const userData = {
            username: $('#login-username').val().trim(),
            password: $('#login-password').val().trim()
        };

        if (!userData.username || !userData.password) {
            return showNotification('warning', 'Missing Information', 'Please enter both username and password.');
        }

        // Call the loginUser function
        loginUser(userData);
    });

    // Validate signup form
    $('#signup-form').on('submit', function (e) {
        e.preventDefault(); // Prevent form submission
        const userData = {
            fullname: $('#signup-fullname').val().trim(),
            username: $('#signup-username').val().trim(),
            password: $('#signup-password').val().trim(),
            email: $('#signup-email').val().trim(),
            phone: $('#signup-phone').val().trim(),
            role: $('#signup-role').val()
        };

        // Call the validation function
        const validationResult = validateSignupForm(userData);

        if (!validationResult.success) {
            // Show validation error notification
            return showNotification('warning', 'Validation Error', validationResult.message);
        }

        // If validation passes, call the registerUser function
        registerUser(userData);
    });
});