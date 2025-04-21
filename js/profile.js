$(document).ready(async function () {
    // Use api_url from config.js
    if (typeof api_url === "undefined") {
        console.error("API URL is not defined in config.js.");
        return;
    }

    // Extract profileID from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const profileID = urlParams.get("id");

    if (!profileID) {
        console.error("Profile ID is missing in the URL.");
        $(".profile-container").html(`
            <div class="error-message">
                <h1>Error</h1>
                <p>Profile ID is missing. Please check the URL and try again.</p>
            </div>
        `);
        return;
    }

    try {
        // Fetch profile data from the API
        const response = await fetch(`${api_url}/api/user/profile/${profileID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("auth-token"),
            },
        });

        if (response.status === 404) {
            const errorData = await response.json();
            if (errorData.message === "Profile not found" && !errorData.success) {
                console.error("Error: Profile not found.");
                $(".profile-container").html(`
                    <div class="error-message">
                        <h1>Profile Not Found</h1>
                        <p>The profile you are looking for does not exist. Please check the profile ID and try again.</p>
                    </div>
                `);
                return;
            }
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch profile data: ${response.status}`);
        }

        const profileData = await response.json();

        if (!profileData.success) {
            throw new Error("Failed to fetch profile data: API response unsuccessful");
        }

        $("title").text(`${profileData.fullname}'s Profile`);


        // Check if there are no owned properties or workspaces
        const hasProperties = profileData.properties.length > 0;
        const hasWorkspaces = profileData.properties.some(property => property.workspaces.length > 0);

        // Dynamically generate profile details
        let profileHTML = `
            <h1 class="profile-name">${profileData.fullname}</h1>
            <div class="contact-info">
                <p><i class="fas fa-envelope"></i> <a href="mailto:${profileData.email}">${profileData.email}</a></p>
                <p><i class="fas fa-phone"></i> <a href="tel:${profileData.phone}">${profileData.phone}</a></p>
            </div>
            <hr class="section-divider">
            <h2>Owned Workspaces</h2>
        `;

        if (!hasProperties || !hasWorkspaces) {
            profileHTML += `
                <p class="no-workspaces-message">There are no owned workspaces.</p>
            `;
        } else {
            profileHTML += `
                <div class="property-list">
                    ${profileData.properties.map(property => {
                        return property.workspaces.map(workspace => `
                            <div class="item">
                                <div class="item-picture">
                                    <img src="./img/landing/offices.png" alt="${workspace.name}">
                                </div>
                                <div class="item-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Name:</span>
                                        <span class="detail-value">${workspace.name}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Type:</span>
                                        <span class="detail-value">${workspace.type}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Address:</span>
                                        <span class="detail-value">${property.address}, ${property.city}, ${property.province}, ${property.country}, ${property.postal}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Neighborhood:</span>
                                        <span class="detail-value">${property.neighbourhood}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Price:</span>
                                        <span class="detail-value">$${workspace.price} / ${workspace.term}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Seat Capacity:</span>
                                        <span class="detail-value">${workspace.capacity}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Smoking Allowed:</span>
                                        <span class="detail-value">${workspace.smoking_allowed ? "Yes" : "No"}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Garage Available:</span>
                                        <span class="detail-value">${property.garage ? "Yes" : "No"}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Transportation Available:</span>
                                        <span class="detail-value">${property.transport ? "Yes" : "No"}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Availability:</span>
                                        <span class="detail-value">${new Date(workspace.availability_date).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row detail-rating">
                                        <span class="stars">${"★".repeat(Math.floor(workspace.rating))}${workspace.rating % 1 ? "☆" : ""}</span>
                                        <span class="rating-value">(${workspace.rating})</span>
                                    </div>
                                </div>
                                <div class="item-footer">
                                    <a href="/workspace.html?id=${workspace.workspaceID}" class="redirect-link">View Workspace</a>
                                </div>
                            </div>
                        `).join('');
                    }).join('')}
                </div>
            `;
        }

        $(".profile-container").html(profileHTML);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        $(".profile-container").html(`
            <div class="error-message">
                <h1>Error</h1>
                <p>There was an error fetching the profile data. Please try again later.</p>
            </div>
        `);
    }
});