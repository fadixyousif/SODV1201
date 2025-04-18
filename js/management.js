$(document).ready(function () {
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
