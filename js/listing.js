document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const filterToggle = document.getElementById('filter-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('close-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const applyBtn = document.getElementById('apply-btn');
  
  // Active filters counter
  let activeFilters = 1; // Start with 1 active filter as shown in the design

  // Toggle filter dropdown
  filterToggle.addEventListener('click', function() {
      filterDropdown.classList.toggle('show');
      overlay.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  overlay.addEventListener('click', function() {
      filterDropdown.classList.remove('show');
      overlay.classList.remove('show');
  });

  // Close dropdown with cancel button
  cancelBtn.addEventListener('click', function() {
      filterDropdown.classList.remove('show');
      overlay.classList.remove('show');
  });

  // Apply filters and close dropdown
  applyBtn.addEventListener('click', function() {
      filterDropdown.classList.remove('show');
      overlay.classList.remove('show');
      // Here you would typically update your search results based on filters
  });

  // Close button for the entire filter panel
  closeBtn.addEventListener('click', function() {
      // This would typically close the entire filter UI
      alert('Filter panel closed');
  });

  // Property type selection
  const propertyTypes = document.querySelectorAll('.property-type');

  propertyTypes.forEach(type => {
      type.addEventListener('click', function() {
          if (this.classList.contains('active')) {
              this.classList.remove('active');
              activeFilters--;
          } else {
              this.classList.add('active');
              activeFilters++;
          }
          updateFilterBadge();
      });
  });

  // Bedroom and bathroom selection
  const bedroomOptions = document.querySelectorAll('.bedroom-option');
  const bathroomOptions = document.querySelectorAll('.bathroom-option');

  bedroomOptions.forEach(option => {
      option.addEventListener('click', function() {
          if (this.classList.contains('active')) {
              this.classList.remove('active');
              activeFilters--;
          } else {
              this.classList.add('active');
              activeFilters++;
          }
          updateFilterBadge();
      });
  });

  bathroomOptions.forEach(option => {
      option.addEventListener('click', function() {
          if (this.classList.contains('active')) {
              this.classList.remove('active');
              activeFilters--;
          } else {
              this.classList.add('active');
              activeFilters++;
          }
          updateFilterBadge();
      });
  });

  // Price range slider
  const minSlider = document.getElementById('min-slider');
  const maxSlider = document.getElementById('max-slider');
  const minPrice = document.getElementById('min-price');
  const maxPrice = document.getElementById('max-price');
  const sliderTrack = document.querySelector('.slider-track');

  function updateSliderTrack() {
      const min = parseInt(minSlider.value);
      const max = parseInt(maxSlider.value);
      const percent1 = (min / parseInt(minSlider.max)) * 100;
      const percent2 = (max / parseInt(maxSlider.max)) * 100;
      sliderTrack.style.left = percent1 + '%';
      sliderTrack.style.width = (percent2 - percent1) + '%';
  }

  function updateMinPrice() {
      minPrice.value = minSlider.value;
      updateSliderTrack();
  }

  function updateMaxPrice() {
      maxPrice.value = maxSlider.value === maxSlider.max ? 'Max' : maxSlider.value;
      updateSliderTrack();
  }

  minSlider.addEventListener('input', updateMinPrice);
  maxSlider.addEventListener('input', updateMaxPrice);

  minPrice.addEventListener('change', function() {
      minSlider.value = this.value || 0;
      updateSliderTrack();
  });

  maxPrice.addEventListener('change', function() {
      maxSlider.value = this.value === 'Max' ? maxSlider.max : (this.value || maxSlider.max);
      updateSliderTrack();
  });

  updateSliderTrack();

  // Update filter badge count
  function updateFilterBadge() {
      const badge = document.querySelector('.btn-primary .badge');
      badge.textContent = activeFilters;
      badge.style.display = activeFilters > 0 ? 'flex' : 'none';
  }

  // Save search action
  const saveButton = document.querySelector('.btn:nth-child(2)');
  saveButton.addEventListener('click', function() {
      alert('Search saved!');
  });
});

function searchLocation() {
    const address = document.getElementById('address').value;
    const country = document.getElementById('country').value;
    const result = document.getElementById('result');
    
    if (address && country) {
      result.style.display = 'block';
      result.innerHTML = `Searching for: ${address}, ${country}`;
    } else {
      alert('Please enter both address and country');
    }
  }

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').min = today;
  document.getElementById('endDate').min = today;

  function updateAvailability() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const availabilityDiv = document.getElementById('availability');
    
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        availabilityDiv.style.display = 'block';
        availabilityDiv.innerHTML = 'Error: End date must be after start date';
        availabilityDiv.style.color = 'red';
        return;
      }
      
      const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      
      availabilityDiv.style.display = 'block';
      availabilityDiv.innerHTML = `Available from ${formattedStartDate} to ${formattedEndDate}`;
      availabilityDiv.style.color = 'green';
    } else if (startDate) {
      availabilityDiv.style.display = 'block';
      availabilityDiv.innerHTML = 'Please select an end date';
      availabilityDiv.style.color = 'blue';
    } else if (endDate) {
      availabilityDiv.style.display = 'block';
      availabilityDiv.innerHTML = 'Please select a start date';
      availabilityDiv.style.color = 'blue';
    } else {
      availabilityDiv.style.display = 'none';
    }
  }