/**
* @name: Assignement1
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Fadi Wail Yousif
*/

// jquery onready alternative because the previous method is deprecated
$(function() {

    const currentDate = new Date().getFullYear();
    $('.current-date').html(currentDate);

    // Checks if we are in the index page
    if($('.main-index').length) {
        // Get the profile image alt text after 10 seconds
        setTimeout(() => {
            // get the profile image element
            const profileElement = $('.profile > .profile-content > .profile-image');
            // get the profile image alt text
            const profileImage = $('img', profileElement).attr('alt');
            // prepend the alt text to the profile image element
            profileElement.prepend(`<p>${profileImage}</p>`);
        }, 10000);
    }

    // Checks if we are in the mark to grade page
    if ($('.main-mtg').length) {

        function convertGrade(gradeValue, gradeResultElement) {
             // convert the mark to a grade
             let convertedGrade;

             // check the mark value and assign a grade
             if (gradeValue >= 90) {
                 convertedGrade = "A";
             } else if (gradeValue >= 80) {
                 convertedGrade = "B";
             } else if (gradeValue >= 70) {
                 convertedGrade = "C";
             } else if (gradeValue >= 50) {
                 convertedGrade = "D";
             } else {
                 convertedGrade = "F";
             }

             gradeResultElement.html(`<p>Your Grade is: ${convertedGrade}</p>`);
        }

        // Convert Mark to Grade on click event
        $('.mtg > .mtg-content > .mtg-info > .convert-grade').on('click', function() {
            // get the grade result element
            const gradeResultElement = $('.mtg > .mtg-content > .mtg-info > .grade-result');

            try {
                // get the mark value
                const mark = $('.mtg > .mtg-content > .mtg-info > .mark').val();
                // convert the mark to an integer
                const gradeValue = parseInt(mark);

                // check if the mark is empty, not a number, or not between 0 and 100
                // else convert the mark to a grade
                if (!mark) {
                    gradeResultElement.html('<p class=\'error-message\'>Please enter a mark.</p>');
                } else if (isNaN(gradeValue)) {
                    gradeResultElement.html('<p class=\'error-message\'>Please enter a valid mark.</p>');
                } else if (gradeValue < 0 || gradeValue > 100) {
                    gradeResultElement.html('<p class=\'error-message\'>The mark must be between 0 and 100.</p>');
                } else {
                    convertGrade(gradeValue, gradeResultElement);
                }
            } catch (error) {
                // log the error and display an error message
                gradeResultElement.html('<p class=\'error-message\'>There was an error converting the mark to a grade.</p>');
                console.error('Error processing mark:', error);
            }
        })
    }
    
    // Checks if we are in the staff page
    if ($('.main-staff').length) {
        
        // function to get the staff data
        function getStaffData () {
            return [
                { name: "Brielle Williamson", position: "Integration Specialist", city: "New York", id: "4804", startingDate: "2012/12/02", salary: "$372,000" },
                { name: "Herrod Chandler", position: "Sales Assistant", city: "San Francisco", id: "9608", startingDate: "2012/08/06", salary: "$137,500" },
                { name: "Rhona Davidson", position: "Integration Specialist", city: "Tokyo", id: "6200", startingDate: "2010/10/14", salary: "$327,900" },
                { name: "Colleen Hurst", position: "Javascript Developer", city: "San Francisco", id: "2360", startingDate: "2009/09/15", salary: "$205,500" },
                { name: "Sonya Frost", position: "Software Engineer", city: "Edinburgh", id: "1667", startingDate: "2008/12/13", salary: "$103,600" },
                { name: "Jena Gaines", position: "Office Manager", city: "London", id: "3814", startingDate: "2008/12/19", salary: "$90,560" },
                { name: "Quinn Flynn", position: "Support Lead", city: "Edinburgh", id: "9497", startingDate: "2013/03/03", salary: "$342,000" },
                { name: "Tiger Nixon", position: "System Architect", city: "Edinburgh", id: "5421", startingDate: "2011/04/25", salary: "$320,800" },
                { name: "Garrett Winters", position: "Accountant", city: "Tokyo", id: "8422", startingDate: "2011/07/25", salary: "$170,750" },
                { name: "Ashton Cox", position: "Junior Technical Author", city: "San Francisco", id: "1562", startingDate: "2009/01/12", salary: "$86,000" },
                { name: "Cedric Kelly", position: "Senior Javascript Developer", city: "Edinburgh", id: "6224", startingDate: "2012/03/29", salary: "$433,060" },
                { name: "Airi Satou", position: "Accountant", city: "Tokyo", id: "5407", startingDate: "2008/11/28", salary: "$162,700" },
                { name: "Charde Marshall", position: "Regional Director", city: "San Francisco", id: "6741", startingDate: "2008/10/16", salary: "$470,600" },
                { name: "Haley Kennedy", position: "Senior Marketing Designer", city: "London", id: "3597", startingDate: "2012/12/18", salary: "$313,500" },
                { name: "Tatyana Fitzpatrick", position: "Regional Director", city: "London", id: "1965", startingDate: "2010/03/17", salary: "$385,750" },
                { name: "Michael Silva", position: "Marketing Designer", city: "London", id: "1581", startingDate: "2012/11/27", salary: "$198,500" },
                { name: "Paul Byrd", position: "Chief Financial Officer (CFO)", city: "New York", id: "3059", startingDate: "2010/06/09", salary: "$725,000" },
                { name: "Gloria Little", position: "Systems Administrator", city: "New York", id: "1721", startingDate: "2009/04/10", salary: "$237,500" },
                { name: "Bradley Greer", position: "Software Engineer", city: "London", id: "2558", startingDate: "2012/10/13", salary: "$132,000" },
                { name: "Dai Rios", position: "Personnel Lead", city: "Edinburgh", id: "2290", startingDate: "2012/09/26", salary: "$217,500" },
                { name: "Jenette Caldwell", position: "Development Lead", city: "New York", id: "1937", startingDate: "2011/09/03", salary: "$345,000" },
                { name: "Yuri Berry", position: "Chief Marketing Officer (CMO)", city: "New York", id: "6154", startingDate: "2009/06/25", salary: "$675,000" },
                { name: "Caesar Vance", position: "Pre-Sales Support", city: "New York", id: "8330", startingDate: "2011/12/12", salary: "$106,450" },
                { name: "Doris Wilder", position: "Sales Assistant", city: "Sidney", id: "3023", startingDate: "2010/09/20", salary: "$85,600" },
                { name: "Angelica Ramos", position: "Chief Executive Officer (CEO)", city: "London", id: "5797", startingDate: "2009/10/09", salary: "$1,200,000" },
                { name: "Gavin Joyce", position: "Developer", city: "Edinburgh", id: "8822", startingDate: "2010/12/22", salary: "$92,575" },
                { name: "Jennifer Chang", position: "Regional Director", city: "Singapore", id: "9239", startingDate: "2010/11/14", salary: "$357,650" },
                { name: "Brenden Wagner", position: "Software Engineer", city: "San Francisco", id: "1314", startingDate: "2011/06/07", salary: "$206,850" },
                { name: "Fiona Green", position: "Chief Operating Officer (COO)", city: "San Francisco", id: "2947", startingDate: "2010/03/11", salary: "$850,000" },
                { name: "Shou Itou", position: "Regional Marketing", city: "Tokyo", id: "8899", startingDate: "2011/08/14", salary: "$163,000" },
                { name: "Michelle House", position: "Integration Specialist", city: "Sidney", id: "2769", startingDate: "2011/06/02", salary: "$95,400" },
                { name: "Suki Burks", position: "Developer", city: "London", id: "6832", startingDate: "2009/10/22", salary: "$114,500" },
                { name: "Prescott Bartlett", position: "Technical Author", city: "London", id: "3606", startingDate: "2011/05/07", salary: "$145,000" },
                { name: "Gavin Cortez", position: "Team Leader", city: "San Francisco", id: "2860", startingDate: "2008/10/26", salary: "$235,500" },
                { name: "Martena Mccray", position: "Post-Sales support", city: "Edinburgh", id: "8240", startingDate: "2011/03/09", salary: "$324,050" },
                { name: "Unity Butler", position: "Marketing Designer", city: "San Francisco", id: "5384", startingDate: "2009/12/09", salary: "$85,675" }
            ]
        }

        // Create the staff list to display on the page
        function createStaffList(staffList) {
            for (const staff of staffList) {
                $('.staff > .staff-content').append(`
                <div class="staff-information">
                    <p class="staff-name">Name: <span>${staff.name}</span></p>
                    <p class="staff-position">Position: <span>${staff.position}</span></p>
                    <p class="staff-id">Staff ID: <span>${staff.id}</span></p>
                    <p class="staff-salary">Salary: <span>${staff.salary}</span></p>
                    <p class="staff-hire">Start Date: <span>${staff.startingDate}</span></p>
                    <p class="staff-city">City: <span>${staff.city}</span></p>
                </div>
                `)
            }
        }

        // Call the function to create the staff list
        createStaffList(getStaffData());

        // Sort By Name
        $('.sortings > .sortByName').on('click', function() {
            // get the staff list
            const staffList = getStaffData();
            // sort the staff list by name
            staffList.sort((a, b) => a.name.localeCompare(b.name));
            // clear the staff list
            $('.staff > .staff-content').empty();
            // create the staff list
            createStaffList(staffList);
        });

        // Sort By Salary
        $('.sortings > .sortBySalary').on('click', function() {
            // get the staff list
            const staffList = getStaffData();
            // sort the staff list by salary in descending order by converting the salary to a number and subtracting $ and splitting the commas then joining them
            staffList.sort((a, b) => Number(b.salary.substring(1).split(',').join('')) - Number(a.salary.substring(1).split(',').join('')));
            // clear the staff list
            $('.staff > .staff-content').empty();
            // create the staff list
            createStaffList(staffList);
        });
    }

    // Checks if we are in the weather page
    if ($('.main-weather').length) {
        
        // function to convert the temperature from Fahrenheit to Celsius
        const fahrenheitToCelsius = (fahrenheit) => {
            return (fahrenheit - 32) * 5 / 9;
        }
       
        // function to convert the temperature from Celsius to Kelvin
        const celsiusToKelvin = (celsius) => {   
        return celsius + 273.15;
       }

       // function to convert the temperature from Fahrenheit to Celsius from to Kelvin
       const convertTemperature = () => {
        // get the temperature in Fahrenheit from the input
        const temperatureInFahrenheit =$('.weather > .weather-content > .weather-info > .temperature').val();
        
        // check if the temperature is empty or not a number
        if (!temperatureInFahrenheit || isNaN(temperatureInFahrenheit)) {
            $('.weather-results').html("<p class='error-message'>Please enter a valid number!</p>");
            return;
        }

        
        // convert the Fahrenheit to Celsius function
        const temperatureInCelsius = fahrenheitToCelsius(temperatureInFahrenheit);
        // convert the Celsius to Kelvin function
        const temperatureInKelvin = celsiusToKelvin(temperatureInCelsius);

        // display the temperature in Celsius and Kelvin
        $('.weather > .weather-content > .weather-info > .weather-results').html(`
            
            <p>The temperature in Celsius is: ${temperatureInCelsius.toFixed(2)}°C</p>
            <p>The temperature in Kelvin is: ${temperatureInKelvin.toFixed(2)}K</p>
            `);
        }
       
        // Convert Temperature on click event
       $('.weather > .weather-content > .weather-info > .convert-temperature').on('click', convertTemperature)
    }
});