document.addEventListener("DOMContentLoaded", function () {
    // Select all necessary elements
    const postButtons = document.querySelectorAll(".post");

    postButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const formBox = button.closest(".form-box"); // Get the closest form box
            
            // Select the input fields dynamically
            const type = formBox.querySelector("select").value;
            const description = formBox.querySelector("textarea").value;
            const price = formBox.querySelector("input[type='number']").value;
            const location = formBox.querySelector("input[type='text']").value;
            const fileInput = formBox.querySelector("input[type='file']");
            const image = fileInput.files[0];

            if (!type || !price || !location || !image) {
                alert("Please fill all required fields and select an image.");
                return;
            }

            // Create a new listing item
            const listingContainer = document.querySelector(".listing-container");
            const listingItem = document.createElement("div");
            listingItem.classList.add("listing-item");

            // Create image preview
            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            const imgElement = document.createElement("img");
            imgElement.style.width = "100%";
            imgElement.style.height = "auto";
            imgElement.style.borderRadius = "5px";

            // Convert image to a readable format
            const reader = new FileReader();
            reader.onload = function (e) {
                imgElement.src = e.target.result;
            };
            reader.readAsDataURL(image);

            imageContainer.appendChild(imgElement);

            // Add details to the listing
            listingItem.innerHTML = `
                <p>Type: ${type}</p>
                <p>Price: $${price} per hour</p>
                <p>Location: ${location}</p>
                <p>Description: ${description ? description : "No description provided."}</p>
            `;

            // Append image container and listing details
            listingItem.prepend(imageContainer);
            listingContainer.appendChild(listingItem);

            // Reset form fields after posting
            formBox.querySelector("textarea").value = "";
            formBox.querySelector("input[type='number']").value = "";
            formBox.querySelector("input[type='text']").value = "";
            fileInput.value = "";
        });
    });
});