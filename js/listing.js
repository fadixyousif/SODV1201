const filterTypes = ['price', 'distance', 'rating'];

filterTypes.forEach(filterType => {
  const rangeInputs = document.querySelectorAll(`.range-input input[data-filter="${filterType}"]`);
  const progress = document.querySelector(`.${filterType}-slider .progress`);
  const minValueEl = document.querySelector(`#min-${filterType}`);
  const maxValueEl = document.querySelector(`#max-${filterType}`);
  
  let minVal = parseFloat(rangeInputs[0].value);
  let maxVal = parseFloat(rangeInputs[1].value);
  
  // Set initial progress bar position
  progress.style.left = ((minVal - rangeInputs[0].min) / (rangeInputs[0].max - rangeInputs[0].min)) * 100 + "%";
  progress.style.right = 100 - ((maxVal - rangeInputs[1].min) / (rangeInputs[1].max - rangeInputs[1].min)) * 100 + "%";
  
  rangeInputs.forEach(input => {
    input.addEventListener("input", e => {
      minVal = parseFloat(rangeInputs[0].value);
      maxVal = parseFloat(rangeInputs[1].value);
      
      if (maxVal - minVal < 0) {
        if (e.target.classList.contains("range-min")) {
          rangeInputs[0].value = maxVal;
          minVal = maxVal;
        } else {
          rangeInputs[1].value = minVal;
          maxVal = minVal;
        }
      }
      
      // Update display values based on filter type
      if (filterType === 'price') {
        minValueEl.textContent = "$" + minVal;
        maxValueEl.textContent = "$" + maxVal;
      } else if (filterType === 'distance') {
        minValueEl.textContent = minVal;
        maxValueEl.textContent = maxVal;
      } else if (filterType === 'rating') {
        minValueEl.textContent = minVal;
        maxValueEl.textContent = maxVal;
        updateStars(minVal);
      }
      
      // Update progress bar
      progress.style.left = ((minVal - rangeInputs[0].min) / (rangeInputs[0].max - rangeInputs[0].min)) * 100 + "%";
      progress.style.right = 100 - ((maxVal - rangeInputs[1].min) / (rangeInputs[1].max - rangeInputs[1].min)) * 100 + "%";
    });
  });
});

// Star rating functionality
function updateStars(rating) {
  const stars = document.querySelectorAll('.star');
  const ratingValue = Math.floor(rating);
  
  stars.forEach((star, index) => {
    if (index < ratingValue) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

const stars = document.querySelectorAll('.star');
stars.forEach((star, index) => {
  star.addEventListener('click', () => {
    const ratingInputs = document.querySelectorAll('.range-input input[data-filter="rating"]');
    const newRating = index + 1;
    ratingInputs[0].value = newRating;
    
    // Trigger input event to update UI
    const event = new Event('input');
    ratingInputs[0].dispatchEvent(event);
  });
});

// Apply button
document.querySelector('.apply-btn').addEventListener('click', () => {
  const filters = {};
  
  filterTypes.forEach(filterType => {
    const rangeInputs = document.querySelectorAll(`.range-input input[data-filter="${filterType}"]`);
    filters[filterType] = {
      min: parseFloat(rangeInputs[0].value),
      max: parseFloat(rangeInputs[1].value)
    };
  });
  
  console.log('Applied filters:', filters);
  alert('Filters applied: ' + JSON.stringify(filters, null, 2));
});

// Initialize stars
updateStars(document.querySelector('.range-input input[data-filter="rating"]').value);