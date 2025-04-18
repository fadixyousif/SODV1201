$(document).ready(function () {
<<<<<<< HEAD
    const provinceCities = {
        "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Medicine Hat"],
        "British Columbia": ["Vancouver", "Victoria", "Kelowna", "Surrey", "Richmond"],
        "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London"],
        "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke"]
    };

    const $provinceSelect = $(".location select").eq(0);
    const $citySelect = $(".location select").eq(1);
    const $workspaceAddressSelect = $("#workspaceAddress");
    const $listingContainer = $(".listing-container");

    // Populate province dropdown
    $provinceSelect.empty().append('<option selected>Select a province</option>');
    Object.keys(provinceCities).forEach(province => {
        $provinceSelect.append(`<option>${province}</option>`);
    });

    $citySelect.empty().append('<option selected>Select a province first</option>');

    function updateCityDropdown(province) {
        $citySelect.empty();
        if (provinceCities[province]) {
            provinceCities[province].forEach(city => {
                $citySelect.append(`<option>${city}</option>`);
            });
        } else {
            $citySelect.append('<option selected>Select a valid province</option>');
        }
    }

    $provinceSelect.on("change", function () {
        const selectedProvince = $(this).val();
        updateCityDropdown(selectedProvince);
    });

    // Save Property Draft
    $(".property-draft").on("click", function () {
        const $formBox = $(this).closest(".form-box");
        const propertyData = {
            name: $formBox.find("input[type='text']").eq(0).val().trim(),
            address: $formBox.find("input[type='text']").eq(1).val().trim(),
            description: $formBox.find("textarea").val().trim(),
            province: $provinceSelect.val(),
            city: $citySelect.val(),
            postalCode: $formBox.find("#Post").val().trim(),
            neighbourhood: $formBox.find("input[type='text']").eq(2).val().trim(),
            sqft: $formBox.find("input[type='number']").val().trim()
        };

        if (!propertyData.name || !propertyData.address || propertyData.province === "Select a province" || propertyData.city === "Select a province first") {
            alert("Please provide property name and location.");
            return;
        }

        let savedProperties = JSON.parse(localStorage.getItem("savedProperties")) || [];
        savedProperties.push(propertyData);
        localStorage.setItem("savedProperties", JSON.stringify(savedProperties));
        alert("Property draft saved!");

        updateWorkspaceAddressDropdown();
    });

    // Save Workspace Draft
    $(".workspace-draft").on("click", function () {
        const workspaceData = {
            description: $("#workspaceDescription").val()?.trim(),
            address: $("#workspaceAddress").val(),
            price: $("#price").val()?.trim(),
            capacity: $("#capacity").val()?.trim()
        };

        if (!workspaceData.address || !workspaceData.description || !workspaceData.price || !workspaceData.capacity) {
            alert("Please fill in all workspace fields before saving.");
            return;
        }

        let savedWorkspaces = JSON.parse(localStorage.getItem("savedWorkspaces")) || [];
        savedWorkspaces.push(workspaceData);
        localStorage.setItem("savedWorkspaces", JSON.stringify(savedWorkspaces));
        alert("Workspace draft saved!");
    });

    function updateWorkspaceAddressDropdown() {
        const savedProperties = JSON.parse(localStorage.getItem("savedProperties")) || [];

        if ($workspaceAddressSelect.length === 0) return;

        $workspaceAddressSelect.empty().append('<option selected>Select a property address</option>');
        savedProperties.forEach(property => {
            $workspaceAddressSelect.append(
                `<option value="${property.address}, ${property.city}, ${property.province}">${property.address}, ${property.city}, ${property.province}</option>`
            );
        });
    }

    // Create Listing button
    $(".post").on("click", function () {
        updateWorkspaceAddressDropdown();
        alert("Listing created! You can now select a saved property in the workspace.");
    });

    // Populate workspace form on address select
    $workspaceAddressSelect.on("change", function () {
        const selectedAddress = $(this).val();
        const savedProperties = JSON.parse(localStorage.getItem("savedProperties")) || [];

        const selectedProperty = savedProperties.find(property =>
            `${property.address}, ${property.city}, ${property.province}` === selectedAddress
        );

        if (selectedProperty) {
            $(".workspace textarea").val(selectedProperty.description);
            $(".workspace input[type='number']").val(selectedProperty.sqft);
            $(".workspace input[type='text']").eq(1).val(selectedProperty.neighbourhood);
            $(".workspace input[type='text']").eq(2).val(selectedProperty.postalCode);
        }
    });

    // Post Workspace Listing
    $(".post-listing").on("click", function () {
        const selectedAddress = $workspaceAddressSelect.val();
        const imageFile = $("#fileinput")[0]?.files[0];
        const price = $("#price").val()?.trim();
        const capacity = $("#capacity").val()?.trim();
        const description = $("#workspaceDescription").val()?.trim();

        if (!selectedAddress || !imageFile || !price || !capacity || !description) {
            alert("Please fill in all workspace details before posting.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const $listingItem = $("<div>").addClass("listing-item");

            const $imageContainer = $("<div>").addClass("image-container");
            const $imgElement = $("<img>").attr("src", e.target.result);
            $imageContainer.append($imgElement);

            const $details = $("<div>").addClass("details").append(`
                <div class="detail-row"><span class="detail-label">Address:</span><span>${selectedAddress}</span></div>
                <div class="detail-row"><span class="detail-label">Price:</span><span>$${price} per day</span></div>
                <div class="detail-row"><span class="detail-label">Capacity:</span><span>${capacity}</span></div>
                <div class="detail-row"><span class="detail-label">Description:</span><span>${description}</span></div>
            `);

            $listingItem.append($imageContainer, $details);
            $listingContainer.append($listingItem);

            alert("Listing posted successfully!");
        };

        reader.readAsDataURL(imageFile);
    });

    // Initialize dropdown on page load
    updateWorkspaceAddressDropdown();
});
=======
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
>>>>>>> ab2684eb95b3f170c77a6d807bc81c38a17072f4
