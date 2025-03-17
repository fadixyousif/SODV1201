$(document).ready(function () {
    // User list stored in memory (JSON format)
    const users = [];

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
        const username = $('#login-username').val();
        const password = $('#login-password').val();

        if (username && password) {
            // Check if user exists and password matches
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                alert('Login successful!');
                window.location.href = 'management.html'; // Redirect to dashboard
            } else {
                alert('Invalid username or password.');
            }
        } else {
            alert('Please enter both username and password.');
        }
    });

    // Validate signup form
    $('#signup-form').on('submit', function (e) {
        e.preventDefault(); // Prevent form submission
        const username = $('#signup-username').val();
        const email = $('#signup-email').val();
        const password = $('#signup-password').val();

        // Email regex for validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (username.length < 4) {
            alert('Username must be at least 4 characters long.');
        } else if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
        } else if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
        } else {
            // Check if username or email already exists
            const userExists = users.some(u => u.username === username || u.email === email);
            if (userExists) {
                alert('Username or email already exists.');
            } else {
                // Add new user to the user list
                users.push({ username, email, password });
                alert('Signup successful! You can now log in.');
                console.log('Current Users:', JSON.stringify(users, null, 2)); // Log user list for debugging

                // Toggle back to the login form
                $('#signup-form').hide();
                $('#login-form').show();
            }
        }
    });
});