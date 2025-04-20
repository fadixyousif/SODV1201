$(document).ready(async function () {
    const defaultFilters = {
        address: null,
        address2: null,
        province: null,
        city: null,
        country: null,
        postal: null,
        neighbourhood: null,
        min_sqft: null,
        max_sqft: null,
        garage: null,
        transport: null,
        workspace: {
            capacity: null,
            term: null,
            min_price: null,
            max_price: null,
            min_rating: null,
            max_rating: null,
            smoking: null,
            avalability: null
        }
    };

    // Show popup
    $('#filter-toggle').on('click', function () {
        $('#filter-popup').addClass('show');
        $('#popup-overlay').addClass('show');
    });

    // Close popup
    function closePopup() {
        $('#filter-popup').removeClass('show');
        $('#popup-overlay').removeClass('show');
    }

    $('#close-popup-btn, #popup-overlay, #cancel-filters-btn').on('click', closePopup);

    // Reset filters to default values
    function resetFilters() {
        // Clear all input fields
        $('.inputt').val('').removeClass('active');
        $('#min-sqft, #max-sqft, #min-price, #max-price, #minRating, #maxRating, #startDate, #endDate').val('');

        // Remove active classes from province and city options
        $('.province-option, .city-option').removeClass('active');

        // Clear dynamically populated city grid
        $('#city-grid').empty();

        // Reset multi-choice options
        $('.option-grid .option').removeClass('active');

        // Reset workspace type options
        $('.property-grid .property-type').removeClass('active');
    }

    // Close popup and reset filters when "Cancel" button is clicked
    $('#cancel-filters-btn').on('click', function () {
        resetFilters();
        closePopup();
    });

    // Apply filters
    $('#apply-filters-btn, #search-btn').on('click', function () {
        const filters = collectFilters();
        sendFiltersToAPI(filters);
        closePopup();
    });

    // Add event listeners to province buttons (single-choice)
    $('.province-option').on('click', function () {
        const $this = $(this);

        // Remove 'active' class from all province options
        $('.province-option').removeClass('active');

        // Add 'active' class to the clicked button
        $this.addClass('active');
    });

    // Cities for each province/territory
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

    // Add event listener to province options
    $('.province-option').on('click', function () {
        const selectedProvince = $(this).data('province');
        const $cityGrid = $('#city-grid');

        // Remove 'active' class from all province options
        $('.province-option').removeClass('active');

        // Add 'active' class to the clicked button
        $(this).addClass('active');

        // Populate cities based on the selected province/territory
        $cityGrid.empty();
        if (provinceCities[selectedProvince]) {
            provinceCities[selectedProvince].forEach(city => {
                $cityGrid.append(`<div class="city-option" data-city="${city}">${city}</div>`);
            });
        }

        // Add event listener to city buttons
        $('.city-option').on('click', function () {
            // Remove 'active' class from all city options
            $('.city-option').removeClass('active');

            // Add 'active' class to the clicked button
            $(this).addClass('active');
        });
    });

    // Add event listeners to option buttons (multi-choice for Garage, Smoking, etc.)
    $('.option-grid .option').on('click', function () {
        const $this = $(this);

        // Toggle 'active' class on the clicked button
        if ($this.hasClass('active')) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    });

    // Add event listeners to option buttons (single-choice for Garage, Smoking, etc.)
    $('.option-grid').each(function () {
        const $options = $(this).find('.option');

        $options.on('click', function () {
            const $this = $(this);

            // Remove 'active' class from all options in the same group
            $options.removeClass('active');

            // Add 'active' class to the clicked button
            $this.addClass('active');
        });
    });

    // Add event listeners to "Type of Workspace" buttons (single-choice)
    $('.property-grid .property-type').on('click', function () {
        const $this = $(this);

        // Remove 'active' class from all workspace type options
        $('.property-grid .property-type').removeClass('active');

        // Add 'active' class to the clicked button
        $this.addClass('active');
    });

    // Add event listeners to input fields
    $('.inputt, #min-price, #max-price, #minRating, #maxRating, #startDate, #endDate').on('change', function () {
        const $this = $(this);
        if ($this.val().trim() !== '') {
            $this.addClass('active');
        } else {
            $this.removeClass('active');
        }
    });

    // Generate workspaces on page load
    sendFiltersToAPI(defaultFilters);

    // Collect filter values
    function collectFilters() {
        const filters = {
            address: sanitizeInput($('#address').val()),
            address2: sanitizeInput($('#address2').val()),
            province: getActiveOptionValue('.province-grid .province-option'),
            city: getActiveOptionValue('#city-grid .city-option'),
            country: sanitizeInput($('#country').val()),
            postal: sanitizeInput($('#Postal').val()),
            neighbourhood: sanitizeInput($('#Neighbourhood').val()),
            min_sqft: sanitizeInput($('#min-sqft').val(), true),
            max_sqft: sanitizeInput($('#max-sqft').val(), true),
            garage: getActiveOptionValue('.filter-section:nth-of-type(12) .option'),
            transport: getActiveOptionValue('.filter-section:nth-of-type(13) .option'),
            workspace: {
                workspaceName: sanitizeInput($('.search-box').val()),
                type: getActiveOptionValue('.property-grid .property-type'),
                capacity: getActiveOptionValue('.filter-section:nth-of-type(11) .option'),
                term: getActiveOptionValue('.filter-section:nth-of-type(18) .option'),
                min_price: sanitizeInput($('#min-price').val(), true),
                max_price: sanitizeInput($('#max-price').val(), true),
                min_rating: sanitizeInput($('#minRating').val(), true),
                max_rating: sanitizeInput($('#maxRating').val(), true),
                smoking: getActiveOptionValue('.filter-section:nth-of-type(14) .option'),
                avalability: sanitizeInput($('#startDate').val())
            },
            sort: $('#sort-options').val() // Add sorting option
        };
        return filters;
    }

    // Helper function to sanitize input
    function sanitizeInput(value, isNumber = false) {
        if (value === undefined || value === null || value.trim() === '') {
            return null;
        }
        return isNumber ? parseFloat(value) || null : value.trim();
    }

    // Get the value of the active option
    function getActiveOptionValue(selector) {
        const $activeOption = $(`${selector}.active`);
        return $activeOption.length ? $activeOption.text().trim() : null;
    }

    // Send filters to API
    function sendFiltersToAPI(filters) {
        const $itemGrid = $('.item-grid');

        // Show "Please wait" message
        $itemGrid.html('<p class="loading-message">Please wait, loading workspaces...</p>');

        fetch(`${api_url}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('auth-token')
            },
            body: JSON.stringify(filters)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data.results);
        })
        .catch(error => {
            console.error('Error fetching filtered data:', error);
            $itemGrid.html('<p class="error-message">An error occurred while loading workspaces. Please try again later.</p>');
        });
    }

    // Sort results based on selected option
    function sortResults(results, sortOption) {
        switch (sortOption) {
            case 'price-asc':
                return results.sort((a, b) => {
                    const priceA = a.workspaces[0]?.price || Infinity;
                    const priceB = b.workspaces[0]?.price || Infinity;
                    return priceA - priceB;
                });
            case 'price-desc':
                return results.sort((a, b) => {
                    const priceA = a.workspaces[0]?.price || -Infinity;
                    const priceB = b.workspaces[0]?.price || -Infinity;
                    return priceB - priceA;
                });
            case 'rating-desc':
                return results.sort((a, b) => {
                    const ratingA = parseFloat(a.workspaces[0]?.rating || 0);
                    const ratingB = parseFloat(b.workspaces[0]?.rating || 0);
                    return ratingB - ratingA;
                });
            case 'availability-asc':
                return results.sort((a, b) => {
                    const dateA = new Date(a.workspaces[0]?.availability_date || Infinity);
                    const dateB = new Date(b.workspaces[0]?.availability_date || Infinity);
                    return dateA - dateB;
                });
            default:
                return results;
        }
    }

    function convertToBase64(data) {
        const CHUNK_SIZE = 10000; // Process 10,000 bytes at a time
        let base64String = "";
    
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE); // Get a chunk of the data
            base64String += String.fromCharCode.apply(null, chunk); // Convert the chunk to base64
        }
    
        return base64String;
    }

    // Display results
    function displayResults(results) {
        const $itemGrid = $('.item-grid');
        $itemGrid.empty(); // Clear existing items

        const sortOption = $('#sort-options').val();
        const sortedResults = sortResults(results, sortOption);

        if (sortedResults && sortedResults.length > 0) {
            sortedResults.forEach(property => {
                property.workspaces.forEach(workspace => {
                    const itemHTML = `
                        <div class="item">
                            <div class="item-picture">
                                <img src="${convertToBase64(workspace.image.data)}" alt="${workspace.name}">
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
                                    <span class="detail-value">${property.address}, ${property.city}, ${property.province}, ${property.country}</span>
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
                    `;
                    $itemGrid.append(itemHTML);
                });

            });
        } else {
            $itemGrid.html('<p class="error-message">No results found.</p>');
        }
    }
});