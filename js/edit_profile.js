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

$(document).ready(function () {
    $('#update-profile-form').on('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Collect form data
        const profileData = {
            fullname: $('#fullname').val(),
            username: $('#username').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            oldPassword: $('#oldPassword').val(),
            newPassword: $('#newPassword').val(),
            newConfirmedPassword: $('#newConfirmedPassword').val(),
        };

        try {
            // Send PUT request to the API using fetch
            const response = await fetch(`${api_url}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('auth-token'),
                },
                body: JSON.stringify(profileData),
            });

            // Handle the response
            const responseData = await response.json();

            if (response.ok) {
                showNotification('success', 'Success', responseData.message || 'Profile updated successfully!');
                if (responseData.token !== null) {
                    localStorage.setItem('auth-token', responseData.token); // Update token if provided
                }
            } else {
                throw new Error(responseData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error.message);
            showNotification('error', 'Error', 'Error updating profile: ' + error.message);
        }
    });
});