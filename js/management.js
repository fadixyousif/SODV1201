$(document).ready(function () {
    // Select all necessary elements
    $(".post").on("click", function () {
        const $formBox = $(this).closest(".form-box"); // Get the closest form box

        // Select the input fields dynamically
        const type = $formBox.find("select#type").val();
        const description = $formBox.find("textarea#description").val();
        const price = $formBox.find("input#price").val();
        const location = $formBox.find("input#location").val();
        const rating = parseFloat($formBox.find("select#rating").val()); // Get the rating value
        const $fileInput = $formBox.find("input[type='file']");
        const image = $fileInput[0].files[0];

        if (!type || !price || !location || !image || !rating) {
            alert("Please fill all required fields and select an image.");
            return;
        }

        // Create a new listing item
        const $listingContainer = $(".listing-container");
        const $listingItem = $("<div>").addClass("listing-item");

        // Create the content container div
        const $contentContainer = $("<div>").addClass("content-container");
        
        // Create image preview
        const $imageContainer = $("<div>").addClass("image-container");
        const $imgElement = $("<img>").css({
            width: "100%",
            height: "100%",
            objectFit: "cover"
        });

        // Convert image to a readable format
        const reader = new FileReader();
        reader.onload = function (e) {
            $imgElement.attr("src", e.target.result);
        };
        reader.readAsDataURL(image);

        $imageContainer.append($imgElement);

        // Add details to the listing
        const $details = $("<div>").addClass("details");
        
        // Create detail rows with aligned layout
        $details.append(`
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span>${type}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span>$${price} per day</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span>${location}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span>${description || "No description provided."}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Rating:</span>
                <span>${'★'.repeat(Math.floor(rating))} (${rating})</span>
            </div>
        `);
        
        // Add dropdown toggle icon
        const $dropdownToggle = $("<span>").addClass("dropdown-toggle").html("▼");
        
        // Append elements to content container
        $contentContainer.append($imageContainer, $details, $dropdownToggle);
        
        // Create dropdown content (edit panel)
        const $dropdownContent = $(`
            <div class="dropdown-content">
                <form>
                    <div class="edit-field">
                        <label>Category:</label>
                        <select>
                            <optgroup label="Spaces">
                                <option ${type === "Office Room" ? "selected" : ""}>Office Room</option>
                                <option ${type === "Kitchen Space" ? "selected" : ""}>Kitchen Space</option>
                                <option ${type === "Training Room" ? "selected" : ""}>Training Room</option>
                            </optgroup>
                            <optgroup label="Equipment">
                                <option ${type === "Printers" ? "selected" : ""}>Printers</option>
                                <option ${type === "Copiers" ? "selected" : ""}>Copiers</option>
                                <option ${type === "Stationeries" ? "selected" : ""}>Stationeries</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="edit-field">
                        <label>Description:</label>
                        <textarea>${description}</textarea>
                    </div>
                    <div class="edit-field">
                        <label>Price:</label>
                        <input type="number" value="${price}">
                    </div>
                    <div class="edit-field">
                        <label>Location:</label>
                        <input type="text" value="${location}">
                    </div>
                    <div class="edit-field">
                        <label>Rating:</label>
                        <select>
                            <option value="1" ${rating === 1 ? "selected" : ""}>1 ★</option>
                            <option value="1.5" ${rating === 1.5 ? "selected" : ""}>1.5 ★</option>
                            <option value="2" ${rating === 2 ? "selected" : ""}>2 ★★</option>
                            <option value="2.5" ${rating === 2.5 ? "selected" : ""}>2.5 ★★</option>
                            <option value="3" ${rating === 3 ? "selected" : ""}>3 ★★★</option>
                            <option value="3.5" ${rating === 3.5 ? "selected" : ""}>3.5 ★★★</option>
                            <option value="4" ${rating === 4 ? "selected" : ""}>4 ★★★★</option>
                            <option value="4.5" ${rating === 4.5 ? "selected" : ""}>4.5 ★★★★</option>
                            <option value="5" ${rating === 5 ? "selected" : ""}>5 ★★★★★</option>
                        </select>
                    </div>
                    <div class="edit-buttons">
                        <button type="button" class="btn save">Save</button>
                        <button type="button" class="btn cancel">Cancel</button>
                        <button type="button" class="btn delete">Delete</button>
                    </div>
                </form>
            </div>
        `);

        // Append content container and dropdown content to the listing item
        $listingItem.append($contentContainer, $dropdownContent);
        $listingContainer.append($listingItem);

        // Reset form fields after posting
        $formBox.find("textarea").val("");
        $formBox.find("input[type='number']").val("");
        $formBox.find("input[type='text']").val("");
        $fileInput.val("");
        $formBox.find(".image-upload img").hide();
        $formBox.find(".image-upload p").show();

        // Handle content container click (toggle dropdown)
        $contentContainer.on("click", function() {
            const $toggle = $(this).find(".dropdown-toggle");
            const $content = $(this).siblings(".dropdown-content");
            
            $toggle.toggleClass("active");
            
            if ($content.is(":visible")) {
                $content.slideUp(300);
            } else {
                $content.slideDown(300);
            }
        });

        // Handle save button click
        $dropdownContent.find(".save").on("click", function (e) {
            e.stopPropagation();
            const $form = $(this).closest("form");
            const newType = $form.find("select").eq(0).val(); // First select for category
            const newDescription = $form.find("textarea").val();
            const newPrice = $form.find("input[type='number']").val();
            const newLocation = $form.find("input[type='text']").val();
            const newRating = parseFloat($form.find("select").eq(1).val()); // Second select for rating
        
            // Validate fields
            if (!newType) {
                alert("Please select a type.");
                return;
            }
            if (!newDescription) {
                alert("Please enter a description.");
                return;
            }
            if (isNaN(newPrice) || newPrice <= 0) {
                alert("Please enter a valid number for the price.");
                return;
            }
            if (!newLocation) {
                alert("Please enter a location.");
                return;
            }
        
            // Update detail rows
            const $detailRows = $details.find(".detail-row");
            $detailRows.eq(0).find("span:last-child").text(newType);
            $detailRows.eq(1).find("span:last-child").text(`$${newPrice} per day`);
            $detailRows.eq(2).find("span:last-child").text(newLocation);
            $detailRows.eq(3).find("span:last-child").text(newDescription || "No description provided.");
            $detailRows.eq(4).find("span:last-child").html(`
                ${'★'.repeat(Math.floor(newRating))} (${newRating})
            `);
        
            // Hide dropdown
            $dropdownContent.slideUp(300);
            $dropdownToggle.removeClass("active");
        });

        // Handle cancel button click
        $dropdownContent.find(".cancel").on("click", function(e) {
            e.stopPropagation();
            $dropdownContent.slideUp(300);
            $dropdownToggle.removeClass("active");
        });

        // Handle delete button click
        $dropdownContent.find(".delete").on("click", function(e) {
            e.stopPropagation();
            $listingItem.remove();
        });

        $dropdownContent.find(".rating-stars .star").on("click", function () {
            const $stars = $(this).parent().find(".star");
            const rating = $(this).data("value");

            $stars.each(function () {
                $(this).toggleClass("active", $(this).data("value") <= rating);
            });

            $(this).closest("form").data("rating", rating);
        });
    });
    
    // Add event listeners for file inputs to show image previews
    $("input[type='file']").on("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            const $preview = $(this).closest(".image-upload").find("img");
            const $dropText = $(this).closest(".image-upload").find("p");
            
            reader.onload = function(e) {
                $preview.attr("src", e.target.result).show();
                $dropText.hide();
            };
            reader.readAsDataURL(file);
        }
    });

    // Function to create a listing from an item
    function createListingFromItem(item) {
        const $listingContainer = $(".listing-container");
        const $listingItem = $("<div>").addClass("listing-item");

        // Create the content container div
        const $contentContainer = $("<div>").addClass("content-container");

        // Create image preview
        const $imageContainer = $("<div>").addClass("image-container");
        const $imgElement = $("<img>").attr("src", item.image).attr("alt", item.alt).css({
            width: "100%",
            height: "100%",
            objectFit: "cover"
        });

        $imageContainer.append($imgElement);

        // Add details to the listing
        const $details = $("<div>").addClass("details");

        // Create detail rows with aligned layout
        $details.append(`
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span>${item.category}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span>$${item.price} per day</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span>${item.location}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span>${item.description || "No description provided."}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Rating:</span>
                <span>${'★'.repeat(Math.floor(item.rating))} (${item.rating})</span>
            </div>
        `);

        // Add dropdown toggle icon
        const $dropdownToggle = $("<span>").addClass("dropdown-toggle").html("▼");

        // Append elements to content container
        $contentContainer.append($imageContainer, $details, $dropdownToggle);

        // Create dropdown content (edit panel)
        const $dropdownContent = $(`
            <div class="dropdown-content" style="display: none;">
                <form>
                    <div class="edit-field">
                        <label>Category:</label>
                        <select>
                            <optgroup label="Spaces">
                                <option ${item.category === "Office Room" ? "selected" : ""}>Office Room</option>
                                <option ${item.category === "Kitchen Space" ? "selected" : ""}>Kitchen Space</option>
                                <option ${item.category === "Training Room" ? "selected" : ""}>Training Room</option>
                            </optgroup>
                            <optgroup label="Equipment">
                                <option ${item.category === "Printers" ? "selected" : ""}>Printers</option>
                                <option ${item.category === "Copiers" ? "selected" : ""}>Copiers</option>
                                <option ${item.category === "Stationeries" ? "selected" : ""}>Stationeries</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="edit-field">
                        <label>Description:</label>
                        <textarea>${item.description || "No description provided."}</textarea>
                    </div>
                    <div class="edit-field">
                        <label>Price:</label>
                        <input type="number" value="${item.price}">
                    </div>
                    <div class="edit-field">
                        <label>Location:</label>
                        <input type="text" value="${item.location}">
                    </div>
                    <div class="edit-field">
                        <label>Rating:</label>
                        <select>
                            <option value="1" ${item.rating === 1 ? "selected" : ""}>1 ★</option>
                            <option value="1.5" ${item.rating === 1.5 ? "selected" : ""}>1.5 ★</option>
                            <option value="2" ${item.rating === 2 ? "selected" : ""}>2 ★★</option>
                            <option value="2.5" ${item.rating === 2.5 ? "selected" : ""}>2.5 ★★</option>
                            <option value="3" ${item.rating === 3 ? "selected" : ""}>3 ★★★</option>
                            <option value="3.5" ${item.rating === 3.5 ? "selected" : ""}>3.5 ★★★</option>
                            <option value="4" ${item.rating === 4 ? "selected" : ""}>4 ★★★★</option>
                            <option value="4.5" ${item.rating === 4.5 ? "selected" : ""}>4.5 ★★★★</option>
                            <option value="5" ${item.rating === 5 ? "selected" : ""}>5 ★★★★★</option>
                        </select>
                    </div>
                    <div class="edit-buttons">
                        <button type="button" class="btn save">Save</button>
                        <button type="button" class="btn cancel">Cancel</button>
                        <button type="button" class="btn delete">Delete</button>
                    </div>
                </form>
            </div>
        `);

        // Append content container and dropdown content to the listing item
        $listingItem.append($contentContainer, $dropdownContent);
        $listingContainer.append($listingItem);

        // Handle listing item click (toggle dropdown)
        $contentContainer.on("click", function() {
            const $toggle = $(this).find(".dropdown-toggle");
            const $content = $(this).siblings(".dropdown-content");
            
            $toggle.toggleClass("active");
            
            if ($content.is(":visible")) {
                $content.slideUp(300);
            } else {
                $content.slideDown(300);
            }
        });


        // Handle save, cancel, and delete button clicks
        $dropdownContent.find(".save").on("click", function(e) {
            e.stopPropagation();
            const $form = $(this).closest("form");
            const newType = $form.find("select").eq(0).val(); // First select for category
            const newDescription = $form.find("textarea").val();
            const newPrice = $form.find("input[type='number']").val();
            const newLocation = $form.find("input[type='text']").val();
            const newRating = parseFloat($form.find("select").eq(1).val()); // Second select for rating
        
            // Validate fields
            if (!newType) {
                alert("Please select a type.");
                return;
            }
            if (!newDescription) {
                alert("Please enter a description.");
                return;
            }
            if (isNaN(newPrice) || newPrice <= 0) {
                alert("Please enter a valid number for the price.");
                return;
            }
            if (!newLocation) {
                alert("Please enter a location.");
                return;
            }
        
            // Update detail rows
            const $detailRows = $details.find(".detail-row");
            $detailRows.eq(0).find("span:last-child").text(newType);
            $detailRows.eq(1).find("span:last-child").text(`$${newPrice} per day`);
            $detailRows.eq(2).find("span:last-child").text(newLocation);
            $detailRows.eq(3).find("span:last-child").text(newDescription || "No description provided.");
            $detailRows.eq(4).find("span:last-child").html(`
                ${'★'.repeat(Math.floor(newRating))} (${newRating})
            `);
        
            // Hide dropdown
            $dropdownContent.slideUp(300);
            $dropdownToggle.removeClass("active");
        });

        // Handle cancel button click
        $dropdownContent.find(".cancel").on("click", function(e) {
            e.stopPropagation();
            $dropdownContent.slideUp(300);
            $dropdownToggle.removeClass("active");
        });

        // Handle delete button click
        $dropdownContent.find(".delete").on("click", function(e) {
            e.stopPropagation();
            $listingItem.remove();
        });

        $dropdownContent.find(".rating-stars .star").on("click", function () {
            const $stars = $(this).parent().find(".star");
            const rating = $(this).data("value");

            $stars.each(function () {
                $(this).toggleClass("active", $(this).data("value") <= rating);
            });

            $(this).closest("form").data("rating", rating);
        });
    }

    // Create listings from itemsData
    itemsData.forEach(createListingFromItem);
});