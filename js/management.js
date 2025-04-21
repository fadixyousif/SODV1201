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

let propertiesData = []; // Variable to store API data

// Province-to-city mapping
const provinceCities = {
    "Alberta": ["Calgary", "Edmonton", "Red Deer"],
    "British Columbia": ["Vancouver", "Victoria", "Kelowna"],
    "Manitoba": ["Winnipeg", "Brandon", "Steinbach"],
    "New Brunswick": ["Moncton", "Saint John", "Fredericton"],
    "Nova Scotia": ["Halifax", "Sydney", "Truro"],
    "Ontario": ["Toronto", "Ottawa", "Hamilton"],
    "Prince Edward Island": ["Charlottetown", "Summerside"],
    "Quebec": ["Montreal", "Quebec City", "Laval"],
    "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert"],
    "Northwest Territories": ["Yellowknife", "Hay River", "Inuvik"],
    "Nunavut": ["Iqaluit", "Rankin Inlet", "Cambridge Bay"],
    "Yukon": ["Whitehorse", "Dawson City", "Watson Lake"]
};

// Populate cities based on selected province
$(document).on("change", "#province-select", function () {
    const selectedProvince = $(this).val();
    const $citySelect = $("#city-select");

    // Clear existing city options
    $citySelect.empty();

    // Add default "Select City" option
    $citySelect.append('<option selected="selected">Select City</option>');

    // Populate cities for the selected province
    if (provinceCities[selectedProvince]) {
        provinceCities[selectedProvince].forEach((city) => {
            $citySelect.append(`<option value="${city}">${city}</option>`);
        });
    }
});

// Function to fetch data from the API and render properties and workspaces
async function fetchAndRenderListings() {
    try {
        // Fetch data from the API
        const response = await fetch(`${api_url}/api/management/owned/properties-workspaces`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + localStorage.getItem('auth-token')
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Check if the API response is successful
        if (data.success) {
            propertiesData = data.properties; // Store the API data in the variable
            renderListings(propertiesData);
        } else {
            console.error("Failed to fetch properties and workspaces.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to render properties and their workspaces using jQuery
function renderListings(properties) {
    const $listingContainer = $(".listing-container");
    $listingContainer.empty(); // Clear existing content

    const $workspaceAddressSelect = $('.form > .workspace > #workspaceAddress');
    $workspaceAddressSelect.empty(); // Clear existing options

    properties.forEach((property) => {
        // Add property address and ID to the workspaceAddress select
        const address = `${property.address || "No Address Provided"}, ${property.address2 ? `${property.address2},` : ""}  ${property.city || "No City"}, ${property.province || "No Province"}, ${property.postal || "No Postal Code"}`;
        $workspaceAddressSelect.append(`<option value="${property.propertyID}">${address}</option>`);

        // Create property box
        const $propertyBox = $(`
            <div class="property-box" data-property-id="${property.propertyID}">
                <h3>${property.name || "No Name Provided"}</h3>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Country:</strong> ${property.country || "No Country Provided"}</p>
                <p><strong>Neighbourhood:</strong> ${property.neighbourhood || "No Neighbourhood"}</p>
                <p><strong>Garage:</strong> ${property.garage ? "Yes" : "No"}</p>
                <p><strong>Sqft:</strong> ${property.sqft || "N/A"}</p>
                <p><strong>Transport:</strong> ${property.transport ? "Yes" : "No"}</p>
                <p><strong>Delisted:</strong> ${property.delisted ? "Yes" : "No"}</p>
                <div class="property-buttons">
                    <button class="edit-property" data-property-id="${property.propertyID}">Edit</button>
                    <button class="delist-property" data-property-id="${property.propertyID}">${property.delisted ? "Relist" : "Delist"}</button>
                    <button class="delete-property" data-property-id="${property.propertyID}">Delete</button>
                </div>
                <h4>Available Workspaces:</h4>
            </div>
        `);

        // Render workspaces for the property
        if (property.workspaces && property.workspaces.length > 0) {
            const $workspaceList = $("<ul></ul>");
            property.workspaces.forEach((workspace) => {
                const imageUrl = workspace.image && workspace.image.data && workspace.image.data.length > 0
                    ? convertToBase64(workspace.image.data)
                    : ""; // Placeholder image if no image is provided

                const $workspaceItem = $(`
                    <li data-property-id="${workspace.propertyID}" data-workspace-id="${workspace.workspaceID}">
                        <img src="${imageUrl}" alt="${workspace.name || "Workspace Image"}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">
                        <p><strong>Name:</strong> ${workspace.name || "No Name Provided"}</p>
                        <p><strong>Type:</strong> ${workspace.type || "No Type Provided"}</p>
                        <p><strong>Term:</strong> ${workspace.term || "No Term Provided"}</p>
                        <p><strong>Capacity:</strong> ${workspace.capacity || "N/A"} people</p>
                        <p><strong>Price:</strong> $${workspace.price || "N/A"}</p>
                        <p><strong>Rating:</strong> ${workspace.rating || "N/A"} / 5</p>
                        <p><strong>Smoking Allowed:</strong> ${workspace.smoking_allowed ? "Yes" : "No"}</p>
                        <p><strong>Availability Date:</strong> ${workspace.availability_date ? new Date(workspace.availability_date).toLocaleDateString() : "No Date Provided"}</p>
                        <p><strong>Delisted:</strong> ${workspace.delisted ? "Yes" : "No"}</p>
                        <div class="workspace-buttons">
                            <button class="edit-workspace" data-property-id="${workspace.propertyID}" data-workspace-id="${workspace.workspaceID}">Edit</button>
                            <button class="delist-workspace" data-workspace-id="${workspace.workspaceID}">${workspace.delisted ? "Relist" : "Delist"}</button>
                            <button class="delete-workspace" data-workspace-id="${workspace.workspaceID}">Delete</button>
                        </div>
                    </li>
                `);
                $workspaceList.append($workspaceItem);
            });
            $propertyBox.append($workspaceList);
        } else {
            $propertyBox.append("<p class='no-workspace'>No available workspaces for this property.</p>");
        }

        $listingContainer.append($propertyBox);
    });
}

// Helper function to convert large binary data to base64 in chunks
function convertToBase64(data) {
    const CHUNK_SIZE = 10000; // Process 10,000 bytes at a time
    let base64String = "";

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE); // Get a chunk of the data
        base64String += String.fromCharCode.apply(null, chunk); // Convert the chunk to base64
    }

    return base64String;
}

// Helper function to convert base64 to binary buffer
async function convertBase64ToBinary(base64String) {
    const binaryString = base64String // Decode base64
    const binaryData = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        binaryData[i] = binaryString.charCodeAt(i);
    }
    return {
        type: "Buffer",
        data: Array.from(binaryData), // Convert Uint8Array to a regular array
    };
}

// Function to read file as base64
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result); // Includes the MIME type
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file); // Automatically includes the MIME type
    });
};

// Open the modal when the "Edit Property" button is clicked
$(document).on("click", ".edit-property", function () {
    const propertyId = $(this).data("property-id");

    // Find the property data from the stored API data
    const property = propertiesData.find((p) => p.propertyID === propertyId);

    if (property) {
        // Populate the modal fields with property data
        $("#edit-property-name").val(property.name || "").data("property-id", propertyId); // Store property ID in a data attribute
        $("#edit-property-address").val(property.address || "");
        $("#edit-property-address2").val(property.address2 || "");
        $("#edit-property-city").val(property.city || "");
        $("#edit-property-province").val(property.province || "");
        $("#edit-property-country").val(property.country || "");
        $("#edit-property-postal").val(property.postal || "");
        $("#edit-property-sqft").val(property.sqft || "");
        $("#edit-property-neighbourhood").val(property.neighbourhood || "");

        // Set checkbox states
        $("#edit-property-garage").prop("checked", !!property.garage); // Convert to boolean
        $("#edit-property-transport").prop("checked", !!property.transport); // Convert to boolean
        $("#edit-property-delisted").prop("checked", !!property.delisted); // Convert to boolean

        // Show the modal
        $("#property-edit-modal").fadeIn();
    }
});

// Close the modal when the "X" button is clicked
$(document).on("click", ".close-modal", function () {
    $("#property-edit-modal").fadeOut();
});

// Save changes when the "Save Changes" button is clicked
$(document).on("click", "#save-property-changes", async function () {
    const propertyId = $("#edit-property-name").data("property-id"); // Assuming property ID is stored in a data attribute
    const originalProperty = propertiesData.find((p) => p.propertyID === propertyId);

    // Check if the original property exists
    if (!originalProperty) {
        showNotification("error", "Error", "Original property data not found.");
        return; // Exit the function
    }

    const updatedProperty = {
        propertyID: propertyId, // Include property ID in the request
        name: $("#edit-property-name").val().trim(),
        address: $("#edit-property-address").val().trim(),
        address2: $("#edit-property-address2").val().trim(),
        city: $("#edit-property-city").val().trim(),
        province: $("#edit-property-province").val().trim(),
        country: $("#edit-property-country").val().trim(),
        postal: $("#edit-property-postal").val().trim(), // Add postal code field
        neighbourhood: $("#edit-property-neighbourhood").val().trim(),
        garage: $("#edit-property-garage").is(":checked"), // Boolean value
        sqft: Number($("#edit-property-sqft").val().trim()) || 0, // Ensure numeric comparison
        transport: $("#edit-property-transport").is(":checked"), // Boolean value
        delisted: $("#edit-property-delisted").is(":checked"), // Boolean value
    };

    // Normalize original property data for comparison
    const normalizedOriginalProperty = {
        propertyID: originalProperty.propertyID,
        name: originalProperty.name?.trim() || "",
        address: originalProperty.address?.trim() || "",
        address2: originalProperty.address2?.trim() || "",
        city: originalProperty.city?.trim() || "",
        province: originalProperty.province?.trim() || "",
        country: originalProperty.country?.trim() || "",
        postal: originalProperty.postal?.trim() || "",
        neighbourhood: originalProperty.neighbourhood?.trim() || "",
        garage: !!originalProperty.garage, // Convert to boolean
        sqft: Number(originalProperty.sqft) || 0, // Ensure numeric comparison
        transport: !!originalProperty.transport, // Convert to boolean
        delisted: !!originalProperty.delisted, // Convert to boolean
    };

    // Check if any field has changed
    const hasChanges = Object.keys(updatedProperty).some(
        (key) => updatedProperty[key] !== normalizedOriginalProperty[key]
    );

    if (!hasChanges) {
        // Notify the user that no changes were made
        showNotification("warning", "No Changes", "No changes were made to the property.");
        return; // Exit the function
    }

    try {
        // Send updated property data to the server
        const response = await fetch(`${api_url}/api/management/properties/property`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
            body: JSON.stringify(updatedProperty),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Notify the user of success
            showNotification("success", "Property Updated", result.message);

            // Update the local propertiesData with the new data
            const propertyIndex = propertiesData.findIndex((p) => p.propertyID === propertyId);
            if (propertyIndex !== -1) {
                propertiesData[propertyIndex] = { ...propertiesData[propertyIndex], ...updatedProperty };
            }

            // Re-render the listings
            renderListings(propertiesData);

            // Close the modal
            $("#property-edit-modal").fadeOut();
        } else {
            // Notify the user of an error
            showNotification("error", "Update Failed", result.message || "Failed to update the property.");
        }
    } catch (error) {
        console.error("Error updating property:", error);
        showNotification("error", "Update Failed", "An error occurred while updating the property.");
    }
});

// Open the modal when the "Edit Workspace" button is clicked
$(document).on("click", ".edit-workspace", function () {
    const workspaceId = $(this).data("workspace-id");
    const propertyId = $(this).data("property-id");

    // Find the workspace data from the stored API data
    const property = propertiesData.find((p) => p.propertyID === propertyId);
    const workspace = property?.workspaces?.find((w) => w.workspaceID === workspaceId);

    if (workspace) {
        // Populate the modal fields with workspace data
        $("#edit-workspace-name").val(workspace.name || "").data("property-id", propertyId);
        $("#edit-workspace-name").val(workspace.name || "").data("workspace-id", workspaceId);

        // Set the current type in the dropdown
        $("#edit-workspace-type").val(workspace.type || "");

        // Set the current term in the dropdown
        $("#edit-workspace-term").val(workspace.term || "");

        $("#edit-workspace-capacity").val(workspace.capacity || "");
        $("#edit-workspace-price").val(workspace.price || "");
        $("#edit-workspace-rating").val(workspace.rating || "");
        $("#edit-workspace-availability-date").val(
            workspace.availability_date
                ? new Date(workspace.availability_date).toISOString().split("T")[0]
                : ""
        );
        $("#edit-workspace-smoking").prop("checked", workspace.smoking_allowed);
        $("#edit-workspace-delisted").prop("checked", workspace.delisted);

        // Show the modal
        $("#workspace-edit-modal").fadeIn();
    }
});

// Close the modal when the "X" button is clicked
$(document).on("click", ".close-workspace-modal", function () {
    $("#workspace-edit-modal").fadeOut();
});

// Save changes when the "Save Workspace Changes" button is clicked
$(document).on("click", "#save-workspace-changes", async function () {
    const workspaceId = $("#edit-workspace-name").data("workspace-id");
    const propertyId = $("#edit-workspace-name").data("property-id");

    const originalProperty = propertiesData.find((p) => p.propertyID === propertyId);
    const originalWorkspace = originalProperty?.workspaces?.find((w) => w.workspaceID === workspaceId);

    if (!originalWorkspace) {
        showNotification("error", "Error", "Original workspace data not found.");
        return;
    }

    const fileInput = $("#edit-workspace-image")[0];
    const file = fileInput.files && fileInput.files[0];

    let base64Image = "";
    if (file) {
        try {
            base64Image = await readFileAsBase64(file);
        } catch (err) {
            showNotification("error", "Image Error", "Could not read image file.");
            return;
        }
    }

    const imageToUpdate = base64Image || (originalWorkspace.image?.data ? convertToBase64(originalWorkspace.image.data) : "./img/not-available.png");

    // Create the updatedWorkspace object with proper type conversions
    const updatedWorkspace = {
        workspaceID: Number(workspaceId),
        name: String($("#edit-workspace-name").val().trim()),
        type: String($("#edit-workspace-type").val().trim()),
        term: String($("#edit-workspace-term").val().trim()),
        capacity: parseInt($("#edit-workspace-capacity").val().trim()) || 0,
        price: parseFloat($("#edit-workspace-price").val().trim()) || 0,
        propertyID: Number(propertyId),
        rating: parseFloat($("#edit-workspace-rating").val().trim()) || 0,
        smoking_allowed: Boolean($("#edit-workspace-smoking").is(":checked")),
        avalability_date: String($("#edit-workspace-availability-date").val().trim()),
        delisted: Boolean($("#edit-workspace-delisted").is(":checked")),
        image: String(imageToUpdate || ""),
    };

    // Validate required fields
    const requiredFields = [
        "name",
        "type",
        "term",
        "capacity",
        "price",
        "avalability_date",
        "propertyID",
        "rating",
    ];
    const missingFields = requiredFields.filter((field) => !updatedWorkspace[field]);

    if (missingFields.length > 0) {
        showNotification("error", "Missing Fields", `Please fill in the following fields: ${missingFields.join(", ")}`);
        return;
    }

    // Validate data types
    if (
        typeof updatedWorkspace.name !== "string" ||
        typeof updatedWorkspace.type !== "string" ||
        typeof updatedWorkspace.term !== "string" ||
        typeof updatedWorkspace.capacity !== "number" ||
        typeof updatedWorkspace.price !== "number" ||
        typeof updatedWorkspace.propertyID !== "number" ||
        typeof updatedWorkspace.rating !== "number" ||
        typeof updatedWorkspace.smoking_allowed !== "boolean" ||
        typeof updatedWorkspace.avalability_date !== "string" ||
        typeof updatedWorkspace.delisted !== "boolean"
    ) {
        showNotification("error", "Invalid Data", "One or more fields have invalid data types.");
        return;
    }

    // Check for changes
    const hasChanges = Object.keys(updatedWorkspace).some((key) => {
        if (key === "image") {
            // Compare base64 strings only if both exist
            const originalImage = originalWorkspace.image?.data
                ? convertToBase64(originalWorkspace.image.data)
                : "";
            return updatedWorkspace[key] !== originalImage;
        }
        return updatedWorkspace[key] !== originalWorkspace[key];
    });

    if (!hasChanges) {
        showNotification("warning", "No Changes", "No changes were made to the workspace.");
        return;
    }

    try {
        const response = await fetch(`${api_url}/api/management/workspaces/workspace`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
            body: JSON.stringify(updatedWorkspace),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification("success", "Workspace Updated", result.message);

            const propertyIndex = propertiesData.findIndex((p) => p.propertyID === propertyId);
            const workspaceIndex = propertiesData[propertyIndex]?.workspaces?.findIndex(
                (w) => w.workspaceID === workspaceId
            );

            if (propertyIndex !== -1 && workspaceIndex !== -1) {
                propertiesData[propertyIndex].workspaces[workspaceIndex] = {
                    ...propertiesData[propertyIndex].workspaces[workspaceIndex],
                    ...updatedWorkspace,
                };
            }

            // Locate the specific workspace in the DOM
            const $workspaceItem = $(`li[data-workspace-id="${workspaceId}"]`);

            if ($workspaceItem.length > 0) {
                $workspaceItem.find("img").attr("src", updatedWorkspace.image || "./img/not-available.png");
                $workspaceItem.find("p:contains('Name:')").html(`<strong>Name:</strong> ${updatedWorkspace.name}`);
                $workspaceItem.find("p:contains('Type:')").html(`<strong>Type:</strong> ${updatedWorkspace.type}`);
                $workspaceItem.find("p:contains('Term:')").html(`<strong>Term:</strong> ${updatedWorkspace.term}`);
                $workspaceItem.find("p:contains('Capacity:')").html(`<strong>Capacity:</strong> ${updatedWorkspace.capacity} people`);
                $workspaceItem.find("p:contains('Price:')").html(`<strong>Price:</strong> $${updatedWorkspace.price}`);
                $workspaceItem.find("p:contains('Rating:')").html(`<strong>Rating:</strong> ${updatedWorkspace.rating} / 5`);
                $workspaceItem.find("p:contains('Smoking Allowed:')").html(`<strong>Smoking Allowed:</strong> ${updatedWorkspace.smoking_allowed ? "Yes" : "No"}`);
                $workspaceItem.find("p:contains('Availability Date:')").html(`<strong>Availability Date:</strong> ${updatedWorkspace.avalability_date}`);
                $workspaceItem.find("p:contains('Delisted:')").html(`<strong>Delisted:</strong> ${updatedWorkspace.delisted ? "Yes" : "No"}`);
            }

            $("#workspace-edit-modal").fadeOut();
        } else {
            showNotification("error", "Update Failed", result.message || "Failed to update the workspace.");
        }
    } catch (error) {
        console.error("Error updating workspace:", error);
        showNotification("error", "Update Failed", "An error occurred while updating the workspace.");
    }
});

// Function to create a new property
async function createProperty() {
    const propertyData = {
        name: String($("#propertyName").val().trim()),
        address: String($("#propertyAddress").val().trim()),
        address2: String($("#propertyAddress2").val().trim()),
        province: String($("#province-select").val()),
        city: String($("#city-select").val()),
        country: String($("#propertyCountry").val()),
        postal: String($("#Post").val().trim()),
        neighbourhood: String($("#neighbourhood").val().trim()),
        garage: Boolean($("#garage").is(":checked")),
        sqft: Number($("#propertySqft").val().trim()) || 0,
        transport: Boolean($("#public-transport").is(":checked")),
        delisted: Boolean($("#property-delisted").is(":checked")),
    };

    try {
        const response = await fetch(`${api_url}/api/management/properties/property/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
            body: JSON.stringify(propertyData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification("success", "Property Created", result.message);

            // Add the new property to the local data and re-render the listings
            propertiesData.push({ ...propertyData, propertyID: result.propertyID, workspaces: [] });
            renderListings(propertiesData);

            // Clear the form fields
            $(".form-box.property input, .form-box.property select, .form-box.property textarea").val("");
            $("#garage, #public-transport").prop("checked", false);
        } else {
            showNotification("error", "Creation Failed", result.message || "Failed to create the property.");
        }
    } catch (error) {
        console.error("Error creating property:", error);
        showNotification("error", "Creation Failed", "An error occurred while creating the property.");
    }
}

// Function to create a new workspace
async function createWorkspace() {
    const fileInput = $("#fileinput")[0];
    const file = fileInput.files && fileInput.files[0];

    let base64Image = "";
    if (file) {
        try {
            base64Image = await readFileAsBase64(file);
        } catch (err) {
            showNotification("error", "Image Error", "Could not read image file.");
            return;
        }
    }

    const workspaceData = {
        name: String($("#workspaceName").val().trim()),
        type: String($("#type").val().trim()),
        term: String($("#leaseTerm").val().trim()),
        capacity: Number($("#capacity").val().trim()) || 0,
        price: Number($("#price").val().trim()) || 0,
        propertyID: Number($("#workspaceAddress").val().trim()),
        rating: parseFloat($("#workspaceRating").val().trim()) || 0,
        smoking_allowed: Boolean($("#workspace-smoking").is(":checked")),
        avalability_date: String($("#workspaceAvailability").val().trim()),
        image: base64Image,
        delisted: Boolean($("#workspace-delisted").is(":checked")),
    };

    // Validate required fields
    const requiredFields = [
        "name",
        "type",
        "term",
        "capacity",
        "price",
        "propertyID",
        "rating",
        "smoking_allowed",
        "avalability_date",
        "image",
        "delisted",
    ];
    const missingFields = requiredFields.filter((field) => workspaceData[field] === undefined || workspaceData[field] === null || workspaceData[field] === "");

    if (missingFields.length > 0) {
        showNotification("error", "Missing Fields", `Please fill in the following fields: ${missingFields.join(", ")}`);
        return;
    }

    try {
        const response = await fetch(`${api_url}/api/management/workspaces/workspace`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
            body: JSON.stringify(workspaceData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification("success", "Workspace Created", result.message);

            // Convert the image to binary format
            const binaryImage = await convertBase64ToBinary(base64Image);

            // Add the new workspace to the local data and re-render the listings
            const propertyIndex = propertiesData.findIndex((p) => p.propertyID === workspaceData.propertyID);
            if (propertyIndex !== -1) {
                workspaceData.image = binaryImage; // Update the image to binary format
                propertiesData[propertyIndex].workspaces.push({
                    ...workspaceData,
                    workspaceID: result.workspaceID,
                });
                renderListings(propertiesData);
            }

            // Clear the form fields
            $("#workspaceDescription, #price, #capacity, #fileinput").val("");
            $("#type, #workspaceAddress, .seat-availability select").val("Select");
            $(".checkbox input[type='checkbox']").prop("checked", false);
            $("#preview").hide().attr("src", "");
        } else {
            showNotification("error", "Creation Failed", result.message || "Failed to create the workspace.");
        }
    } catch (error) {
        console.error("Error creating workspace:", error);
        showNotification("error", "Creation Failed", "An error occurred while creating the workspace.");
    }
}

// Function to delete a property
async function deleteProperty(propertyId) {
    try {
        const response = await fetch(`${api_url}/api/management/properties/property`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
            body: JSON.stringify({ propertyID: propertyId }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification("success", "Property Deleted", result.message);

            // Remove the property from the local data and re-render the listings
            propertiesData = propertiesData.filter((property) => property.propertyID !== propertyId);
            renderListings(propertiesData);
        } else {
            showNotification("error", "Deletion Failed", result.message || "Failed to delete the property.");
        }
    } catch (error) {
        console.error("Error deleting property:", error);
        showNotification("error", "Deletion Failed", "An error occurred while deleting the property.");
    }
}

// Function to delete a workspace
async function deleteWorkspace(workspaceId) {
    try {
        const response = await fetch(`${api_url}/api/management/workspaces/workspace`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
            body: JSON.stringify({ workspaceID: workspaceId }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification("success", "Workspace Deleted", result.message);

            // Remove the workspace from the local data and re-render the listings
            propertiesData.forEach((property) => {
                property.workspaces = property.workspaces.filter((workspace) => workspace.workspaceID !== workspaceId);
            });
            renderListings(propertiesData);
        } else {
            showNotification("error", "Deletion Failed", result.message || "Failed to delete the workspace.");
        }
    } catch (error) {
        console.error("Error deleting workspace:", error);
        showNotification("error", "Deletion Failed", "An error occurred while deleting the workspace.");
    }
}

// Bind the delete function to the "Delete" button
$(document).on("click", ".delete-property", function () {
    const propertyId = $(this).data("property-id");

    // Confirm deletion
    if (confirm("Are you sure you want to delete this property?")) {
        deleteProperty(propertyId);
    }
});

// Bind the delete function to the "Delete Workspace" button
$(document).on("click", ".delete-workspace", function () {
    const workspaceId = $(this).data("workspace-id");

    // Confirm deletion
    if (confirm("Are you sure you want to delete this workspace?")) {
        deleteWorkspace(workspaceId);
    }
});

// Bind the function to the "Post Listing" button
$(document).on("click", ".post-property", createProperty);

// Bind the function to the "Post Workspace" button
$(document).on("click", ".post-workspace", createWorkspace);

// Call the function to fetch and render listings on page load
$(document).ready(fetchAndRenderListings);