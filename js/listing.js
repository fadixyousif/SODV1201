const filterTypes = ['price', 'distance', 'rating'];

filterTypes.forEach(filterType => {
  const $rangeInputs = $(`.range-input input[data-filter="${filterType}"]`);
  const $progress = $(`.${filterType}-slider .progress`);
  const $minValueEl = $(`#min-${filterType}`);
  const $maxValueEl = $(`#max-${filterType}`);
  
  let minVal = parseFloat($rangeInputs.eq(0).val());
  let maxVal = parseFloat($rangeInputs.eq(1).val());
  
  // Set initial progress bar position
  $progress.css('left', ((minVal - $rangeInputs.eq(0).attr('min')) / ($rangeInputs.eq(0).attr('max') - $rangeInputs.eq(0).attr('min'))) * 100 + "%");
  $progress.css('right', 100 - ((maxVal - $rangeInputs.eq(1).attr('min')) / ($rangeInputs.eq(1).attr('max') - $rangeInputs.eq(1).attr('min'))) * 100 + "%");
  
  $rangeInputs.on("input", function(e) {
    minVal = parseFloat($rangeInputs.eq(0).val());
    maxVal = parseFloat($rangeInputs.eq(1).val());
    
    if (maxVal - minVal < 0) {
      if ($(e.target).hasClass("range-min")) {
        $rangeInputs.eq(0).val(maxVal);
        minVal = maxVal;
      } else {
        $rangeInputs.eq(1).val(minVal);
        maxVal = minVal;
      }
    }
    
    // Update display values based on filter type
    if (filterType === 'price') {
      $minValueEl.text("$" + minVal);
      $maxValueEl.text("$" + maxVal);
    } else if (filterType === 'distance') {
      $minValueEl.text(minVal);
      $maxValueEl.text(maxVal);
    } else if (filterType === 'rating') {
      $minValueEl.text(minVal);
      $maxValueEl.text(maxVal);
      updateStars(minVal);
    }
    
    // Update progress bar
    $progress.css('left', ((minVal - $rangeInputs.eq(0).attr('min')) / ($rangeInputs.eq(0).attr('max') - $rangeInputs.eq(0).attr('min'))) * 100 + "%");
    $progress.css('right', 100 - ((maxVal - $rangeInputs.eq(1).attr('min')) / ($rangeInputs.eq(1).attr('max') - $rangeInputs.eq(1).attr('min'))) * 100 + "%");
  });
});

// Star rating functionality
function updateStars(rating) {
  const $stars = $('.star');
  const ratingValue = Math.floor(rating);
  
  $stars.each(function(index) {
    if (index < ratingValue) {
      $(this).addClass('active');
    } else {
      $(this).removeClass('active');
    }
  });
}

const $stars = $('.star');
$stars.each(function(index) {
  $(this).on('click', function() {
    const $ratingInputs = $('.range-input input[data-filter="rating"]');
    const newRating = index + 1;
    $ratingInputs.eq(0).val(newRating);
    
    // Trigger input event to update UI
    $ratingInputs.eq(0).trigger('input');
  });
});

// Apply button
$('.apply-btn').on('click', function() {
  const filters = {};
  
  filterTypes.forEach(filterType => {
    const $rangeInputs = $(`.range-input input[data-filter="${filterType}"]`);
    filters[filterType] = {
      min: parseFloat($rangeInputs.eq(0).val()),
      max: parseFloat($rangeInputs.eq(1).val())
    };
  });
  
  console.log('Applied filters:', filters);
  alert('Filters applied: ' + JSON.stringify(filters, null, 2));
});

// Initialize stars
updateStars($('.range-input input[data-filter="rating"]').val());

$(document).ready(function () {
  const $itemGrid = $(".item-grid");

  // Clear existing items
  $itemGrid.empty();

  // Generate items from JSON data
  itemsData.forEach(item => {
    const stars = "★".repeat(Math.floor(item.rating)) + (item.rating % 1 ? "☆" : "");
    const itemHTML = `
      <div class="item">
        <div class="item-picture">
          <img src="${item.image}" alt="${item.alt}">
        </div>
        <div class="item-details">
          <div class="detail-row">
            <span class="detail-label">Location: ${item.location}</span>
            <span class="detail-rating">Rating: ${stars}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Distance: ${item.distance}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date: ${item.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Price: ${item.price} / day</span>
          </div>
        </div>
      </div>
    `;

    $itemGrid.append(itemHTML);
  });
});