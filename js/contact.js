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
    $(".submit-btn").on("click", function (event) {
        event.preventDefault(); // Prevent form submission

        // Get form field values
        const name = $("input[placeholder='Name']").val().trim();
        const email = $("input[placeholder='Email']").val().trim();
        const phone = $("input[placeholder='Phone']").val().trim();
        const subject = $(".subject-field").val().trim();
        const message = $(".message-field").val().trim();

        // Validation
        let errors = [];
        if (!name) {
            errors.push("Name is required.");
        }
        if (!email || !validateEmail(email)) {
            errors.push("A valid email is required.");
        }
        if (!phone || !validatePhone(phone)) {
            errors.push("A valid phone number is required.");
        }
        if (!subject) {
            errors.push("Subject is required.");
        }
        if (!message) {
            errors.push("Message is required.");
        }

        if (errors.length > 0) {
            showNotification('error', 'Validation Error', "Please fix the following errors:<br>" + errors.join("<br>"));
        } else {
            showNotification('success', 'Message Sent', 
                `Message sent successfully!\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Phone: ${phone}\n` +
                `Subject: ${subject}\n` +
                `Message: ${message}`);
            
            // Clear form fields
            $(".contact-form")[0].reset();
        }
    });

    // Helper functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        const phoneRegex = /^\d{10}$/; // Example: 10-digit phone number
        return phoneRegex.test(phone);
    }
});