// 

const username = document.querySelector('.user-name')
const userImg = document.querySelector('.user-img-ctn')
const categories = document.querySelectorAll('.category')
const filterBtn = document.querySelector('.filter-ctn')
const stateDropdown = document.querySelector('#state')
const cityDropdown = document.querySelector('#city')
const ridesCtn = document.querySelector('.rides-ctn')


// Function to get User data from the API, returns the user info
async function getUser() {
    try {
        let response = await fetch('https://assessment.api.vweb.app/user')
        let userData = await response.json()
            // console.log(userData)
        return userData;
    } catch (error) {
        console.log(error)
    }
}

// Function to get Rides data from the API, returns the array of rides object
async function getRides() {
    try {
        let response = await fetch('https://assessment.api.vweb.app/rides')
        let ridesData = await response.json()
            // console.log(ridesData)
        return ridesData;
    } catch (error) {
        console.log(error)
    }
}

// On window loading
window.addEventListener('DOMContentLoaded', (event) => {
    console.log("dom loaded")
    showData()
})

// Event listener to filter btn
filterBtn.addEventListener('click', function() {
    const filterDropdown = document.querySelector('.filter-dropdown-ctn')
    filterDropdown.classList.toggle('active-filter-btn')
})

// Function to show the data on the page.
async function showData() {

    // Getting the user and rides data from the APIs
    const userData = await getUser()
    const ridesData = await getRides()

    console.log(userData)
    console.log(ridesData)

    username.textContent = userData.name;
    userImg.style.backgroundImage = `url(${userData.url})`;




    /* ************** Setting states and cities in the filter dropdown menu *********** */

    function getStates() {
        return ridesData.map(ride => {
            return ride.state;
        })
    }

    function addStates() {
        const selectState = document.querySelector('#state');
        const states = getStates()
        selectState.innerHTML = addOptions(states).join("")
    }
    addStates()

    function getCities() {
        return ridesData.map(ride => {
            return ride.city;
        })
    }

    function addCities() {
        const selectCity = document.querySelector('#city');
        const cities = getCities()
        selectCity.innerHTML = addOptions(cities).join("")
    }
    addCities()

    function addOptions(arr) {
        const array = arr.map(item => {
            return `<option value=${item}>${item}</option>`;
        })
        return array;
    }


    function filterRidesByState() {

        stateDropdown.addEventListener('change', function(event) {
            const selectedState = stateDropdown.options[stateDropdown.selectedIndex].value;

            // const selectedCity = cityDropdown.options[cityDropdown.selectedIndex].value;
            // console.log(selectedCity)

            const filteredArray = ridesData.filter(ride => {
                return ride.state.includes(selectedState)
            })
            showRides(filteredArray)
        })

    }
    filterRidesByState()

    function filterRidesByCity() {

        cityDropdown.addEventListener('change', function(event) {
            const selectedCity = cityDropdown.options[cityDropdown.selectedIndex].value;
            console.log(selectedCity)

            const filteredArray = ridesData.filter(ride => {
                return ride.city.includes(selectedCity)
            })
            showRides(filteredArray)
        })

    }
    filterRidesByCity()





    // Function to show the Nearest Rides.
    function showNearestRides() {
        const ridesArray = ridesData.map(ride => {

            // Code for finding the least distance
            const userStCode = userData.station_code
            const distance = ride.station_path.reduce((minimum, stationCode) => {
                let dist = Math.abs(stationCode - userStCode);

                if (dist <= minimum) {
                    minimum = dist;
                }
                return minimum;

            }, ride.station_path[ride.station_path.length - 1]);
            ride.distance = distance;
            return ride;

        })

        // Sorting the rides based on least Distance
        ridesArray.sort((a, b) => {
            return parseInt(a.distance) - parseInt(b.distance)
        })

        showRides(ridesArray)
    }
    showNearestRides();



    // Function that shows all the rides on the page according to the filtered rides array passed
    function showRides(arr) {
        const rides = arr.map(ride => {
            return `
                <div class="ride-ctn">
                    <div class="ride-map">
                        <img src=${ride.map_url} alt="Ride map">
                    </div>
                    <div class="ride-info-ctn">
                        <p>
                            <span class="property">Ride Id : </span>
                            <span class="value">${ride.id}</span>
                        </p>
                        <p>
                            <span class="property">Origin Status : </span>
                            <span class="value">${ride.origin_station_code}</span>
                        </p>
                        <p>
                            <span class="property">Station Path : </span>
                            <span class="value">${ride.station_path}</span>
                        </p>
                        <p>
                            <span class="property">Date : </span>
                            <span class="value">${ride.date}</span>
                        </p>
                        <p>
                            <span class="property">Distance : </span>
                            <span class="value">${ride.distance}</span>
                        </p>
                    </div>
                    <div class="tags-ctn">
                        <span class="tag">${ride.city}</span>
                        <span class="tag">${ride.state}</span>
                    </div>
                </div>
            `;
        })

        // Showing all the rides on the page.
        ridesCtn.innerHTML = rides.join("");
    }




    // ************* Event listener for Diffrent categories ***************

    categories.forEach(category => {
        category.addEventListener('click', function(event) {
            console.log(event.target.classList)

            if (Array.from(event.target.classList).includes('newest')) {
                showNearestRides();
                categories.forEach(category => {
                    category.classList.remove('active-category')
                })
                category.classList.add('active-category')

            } else if (Array.from(event.target.classList).includes('upcoming')) {
                showUpcomingRides();
                categories.forEach(category => {
                    category.classList.remove('active-category')
                })
                category.classList.add('active-category')
            } else if (Array.from(event.target.classList).includes('past')) {
                showPastRides();
                categories.forEach(category => {
                    category.classList.remove('active-category')
                })
                category.classList.add('active-category')
            }
        })
    })




    // ************* Finding Upcoming and past rides **********
    const now = new Date;
    const currentDate = now.getTime()

    // Get the upcoming rides array and update its count
    function getUpcomingRides() {
        const upcomingRidesArray = ridesData.filter(ride => {
            const rideDate = new Date(ride.date).getTime();
            return currentDate < rideDate;
        })

        const upcomingRidesCount = document.querySelector('.upcomingRidesCount')
        upcomingRidesCount.textContent = `(${upcomingRidesArray.length})`;

        return upcomingRidesArray;
    }
    getUpcomingRides()

    // Show the upcoming rides
    function showUpcomingRides() {
        const rides = getUpcomingRides()
        if (rides.length === 0) {
            ridesCtn.innerHTML = 'Sorry, No Upcoming Rides available';
        } else {
            showRides(rides)
        }
    }

    // Get the past Rides and update its count
    function getPastRides() {
        const pastRidesArray = ridesData.filter(ride => {
            const rideDate = new Date(ride.date).getTime();
            return currentDate > rideDate;
        })

        const pastRidesCount = document.querySelector('.pastRidesCount')
        pastRidesCount.textContent = `(${pastRidesArray.length})`;

        return pastRidesArray;
    }
    getPastRides()

    // Show the past rides
    function showPastRides() {
        const rides = getPastRides()
        if (rides.length === 0) {
            ridesCtn.innerHTML = 'Sorry, No Past Rides available';
        } else {
            showRides(rides)
        }
    }


};