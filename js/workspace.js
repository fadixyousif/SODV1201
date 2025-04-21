$(document).ready(async () => {
    // Extract the workspace ID from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const workspaceID = urlParams.get("id"); // Get the 'id' parameter from the URL

    if (!workspaceID) {
        console.error("Workspace ID is missing in the URL.");
        return;
    }

    const apiUrl = `${api_url}/api/workspaces/workspace/${workspaceID}`;

    try {
        // Fetch workspace details using fetch
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
            }
        });

        if (response.status === 404) {
            // Handle 404 error
            $(".workspace-container").html("<p>Workspace does not exist.</p>");
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log(data);
            const workspace = data.workspace;

            console.log(workspace.ownerID);
            // Update the HTML dynamically using jQuery
            $(".workspace-header h2").text(workspace.name);
            $(".workspace-type").text(`${workspace.type} - ${workspace.term}`);
            $(".workspace-info").html(`
                <p><strong>Owner:</strong> <a href="profile.html?id=${workspace.ownerID}">${workspace.owner_name}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${workspace.owner_phone}">${formatPhoneNumber(workspace.owner_phone)}</a></p>
                <p><strong>Capacity:</strong> ${workspace.capacity} people</p>
                <p><strong>Price:</strong> $${workspace.price}/${workspace.term.toLowerCase()}</p>
                <p><strong>Rating:</strong> ${workspace.rating} ⭐</p>
                <p><strong>Smoking Allowed:</strong> ${workspace.smoking_allowed ? "Yes" : "No"}</p>
                <p><strong>Available From:</strong> ${formatDate(workspace.availability_date)}</p>
            `);
            $(".workspace-address").html(`
                <h3>${workspace.property_name}</h3>
                <p>${workspace.address}</p>
                <p>${workspace.neighbourhood}, ${workspace.city}, ${workspace.province}</p>
                <p>${workspace.country} - ${workspace.postal}</p>
                <p><strong>Square Footage:</strong> ${workspace.sqft} sqft</p>
                <p><strong>Garage:</strong> ${workspace.garage ? "Yes" : "No"}</p>
                <p><strong>Public Transport Nearby:</strong> ${workspace.transport ? "Yes" : "No"}</p>
            `);

            // Update the workspace image dynamically
            if (workspace.image && workspace.image.data.length > 0) {
                const imageUrl = convertToBase64(workspace.image.data);
                $(".workspace-image").append(`<img src="${imageUrl}" alt="${workspace.name}" />`);
            }
        } else {
            console.error("Failed to fetch workspace details.");
        }
    } catch (error) {
        console.error("Error fetching workspace details:", error);
        $(".workspace-container").html("<p>An error occurred while fetching the workspace details.</p>");
    }
});

// Helper function to format phone numbers
function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to convert ArrayBuffer to Base64
function convertToBase64(data) {
    const CHUNK_SIZE = 10000; // Process 10,000 bytes at a time
    let base64String = "";

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE); // Get a chunk of the data
        base64String += String.fromCharCode.apply(null, chunk); // Convert the chunk to base64
    }

    return base64String;
}