const busStopIdInput = document.getElementById("bus-stop-id");
const busArrivalInfo = document.getElementById("bus-arrival-info");
const busStopNumber = document.getElementById("bus-stop-number");
const busNumberDropdown = document.getElementById("bus-number-dropdown");
const busNotFound = document.getElementById("bus-not-found");

let busStopId;
let filteredBusNo;
let currentFocus;
let intervalId = null;

// Fetch bus arrival data from API based on user's input
async function getArrivalData(busStopId) {
  const response = await fetch(`https://arrivelah2.busrouter.sg/?id=${busStopId}`);
  const data = await response.json();

  return data;
}

// Format buses info into a readable format
function formatArrivalData(arrivalData, busNo) {
  let buses = arrivalData.services;
  const formattedData = [];

  if (busNo) {
    buses = buses.filter(bus => bus.no === busNo);
  }

  for (const bus of buses) {
    const nextBus = bus.next;
    const next2Bus = bus.next2;
    const next3Bus = bus.next3;

    formattedData.push(`
      <div class="row">
        <div class="col text-light py-1 bg-secondary border border-light">${bus.no}</div>
        <div class="col text-light py-1 bg-secondary border border-light">${(nextBus) ? formatTime(nextBus.duration_ms) : "N/A"}</div>
        <div class="col text-light py-1 bg-secondary border border-light">${(next2Bus) ? formatTime(next2Bus.duration_ms) : "N/A"}</div>
        <div class="col text-light py-1 bg-secondary border border-light">${(next3Bus) ? formatTime(next3Bus.duration_ms) : "N/A"}</div>
      </div>
    `);
  }

  return formattedData.join("");
}

// Format bus no. dropdown options
function formatBusNumberDropdown(arrivalData) {
  const buses = arrivalData.services;
  const busNumber = [];

  for (const bus of buses) {
    busNumber.push(`
      <li><button class="dropdown-item" onclick="filterBusNo('${bus.no}')">Bus No. ${bus.no}</button></li>
    `);
  }

  return busNumber.join("");
}

// Display bus arrival data on the webpage
function displayArrivalData(busStopId) {
  // Clear previous interval
  if (intervalId) {
    clearInterval(intervalId);
  }

  // Fetch data immediately for first time
  getArrivalData(busStopId)
  .then(arrivalData => {
    let formattedArrivalData;
    const formattedBusNumber = formatBusNumberDropdown(arrivalData);

    // Check if bus number is selected to filter
    if (filteredBusNo) {
      formattedArrivalData = formatArrivalData(arrivalData, filteredBusNo);
    }
    else {
      formattedArrivalData = formatArrivalData(arrivalData);
    }

    // Display bus arrival data if bus arrival data is found
    if (formattedArrivalData) {
      busArrivalInfo.innerHTML = formattedArrivalData;
      busStopNumber.innerHTML = `Bus Stop No.: <strong>${busStopId}</strong>`;
      busNumberDropdown.innerHTML = formattedBusNumber;
      document.querySelectorAll(".btn-disabled").forEach(btn => btn.disabled = false);
    }
    // Display bus not found message if bus arrival data is not found
    else {
      busNotFound.innerHTML = `No buses found for this bus stop ID: ${busStopId}.`;
      busArrivalInfo.innerHTML = "";
      busStopNumber.innerHTML = "";
      document.getElementById("bus-stop-id").value = "";
    }
  })
  .catch(error => {
    busNotFound.innerHTML = `Error fetching bus arrival data`;
  });

  // Update bus arrival data every 15seconds
  intervalId = setInterval(() => {
    getArrivalData(busStopId)
    .then(arrivalData => {
      let formattedArrivalData;
      const formattedBusNumber = formatBusNumberDropdown(arrivalData);

      // Check if bus number is selected to filter
      if (filteredBusNo) {
        formattedArrivalData = formatArrivalData(arrivalData, filteredBusNo);
      }
      else {
        formattedArrivalData = formatArrivalData(arrivalData);
      }

      // Display bus arrival data if bus arrival data is found
      if (formattedArrivalData) {
        busArrivalInfo.innerHTML = formattedArrivalData;
        busStopNumber.innerHTML = `Bus Stop No.: <strong>${busStopId}</strong>`;
        busNumberDropdown.innerHTML = formattedBusNumber;
        document.querySelectorAll(".btn-disabled").forEach(btn => btn.disabled = false);
      }
      // Display bus not found message if bus arrival data is not found
      else {
        busNotFound.innerHTML = `No buses found for this bus stop ID: ${busStopId}.`;
        busArrivalInfo.innerHTML = "";
        busStopNumber.innerHTML = "";
        document.getElementById("bus-stop-id").value = "";
      }
    })
    .catch(error => {
      busNotFound.innerHTML = `Error fetching bus arrival data`;
    });
  }, 15000);
}

// Search bus info based on user's input
function searchBusInfo() {
  busStopId = busStopIdInput.value;

  if (!busStopId) {
    busNotFound.innerHTML = "Please enter a bus stop ID.";
    return;
  }

  busNotFound.innerHTML = "";
  busStopIdInput.value = "";
  filteredBusNo = null;
  displayArrivalData(busStopId);
}

// Format time in milliseconds to minutes
function formatTime(time) {
  time = Math.ceil(time / 60000);

  if (time > 1) {
    return `${time} mins`;
  }
  else if (time === 1) {
    return `${time} min`;
  }
  else {
    return "Arriving soon...";
  }
}

// Filter bus no. based on user's selection
function filterBusNo(busNo) {
  filteredBusNo = busNo;
  displayArrivalData(busStopId);
}

// Reset bus no. filter
function clearFilter() {
  filteredBusNo = null;
  displayArrivalData(busStopId);
}

// Get bus stop IDs from the API
async function getBusStopData() {
  const response = await fetch("https://data.busrouter.sg/v1/stops.min.json");
  const data = await response.json();

  return data;
}

// Store bus stop IDs in an array
function storeBusStopIds(busStopData) {
  const busStopIds = Object.keys(busStopData);

  return busStopIds;
}

// Set bus stop ID to input value
function setBusStopId(id) {
  busStopIdInput.value = id;
}

function showAutocomplete(idAutocomplete, idCounter, busStopIds, value) {
  // Hide autocomplete dropdown if input is empty
  if (!value) {
    idAutocomplete.style.display = "none";
    return;
  }

  // Add autocomplete dropdown item if input matches valid bus stop ID
  for (const id of busStopIds) {
    // Limit dropdown item to first 10 bus stop ID
    if (id.substr(0, value.length) === value && idCounter < 10) {
      idAutocomplete.innerHTML += `<li><button class="autocomplete-btn" onclick="setBusStopId('${id}')">${id}</button></li>`;
      idCounter++;
    }
  }

  // Show autocomplete dropdown if dropdown item existed
  if (idAutocomplete.hasChildNodes()) {
    idAutocomplete.style.display = "block";
  }
}

// Autocomplete bus stop ID
function autocomplete() {
  const idAutocomplete = document.getElementById("id-autocomplete");
  let idCounter;
  let busStopIds = [];

  // Get bus stop IDs from API and store in array
  getBusStopData()
  .then(busStopData => {
    busStopIds = storeBusStopIds(busStopData);
  })
  .catch(error => {
    console.error(error);
  });

  // Handle focus event for bus stop ID
  busStopIdInput.addEventListener("focus", (e) => {
    let value = e.target.value;

    showAutocomplete(idAutocomplete, idCounter, busStopIds, value);
    addActive(idAutocomplete);
  });

  // Handle input event for bus stop ID
  busStopIdInput.addEventListener("input", (e) => {
    let value = e.target.value;

    // Set initial value
    idAutocomplete.innerHTML = "";
    idCounter = 0;
    currentFocus = -1;

    showAutocomplete(idAutocomplete, idCounter, busStopIds, value);
  });

  // Handle keydown event for autocomplete dropdown
  busStopIdInput.addEventListener("keydown", (e) => {
    // Move active item upward if up arrow key is pressed
    if (e.key === "ArrowUp") {
      currentFocus--;

      busStopIdInput.value = addActive(idAutocomplete);
    }
    // Move active item downward if down arrow key is pressed
    else if (e.key === "ArrowDown") {
      currentFocus++;

      busStopIdInput.value = addActive(idAutocomplete);
    }
    // Select active item if enter key is pressed and search for bus arrival time
    else if (e.key === "Enter") {
      e.preventDefault;

      // Check if user selected a bus stop ID from autocomplete dropdown
      if (currentFocus >= 0) {
        idAutocomplete.children[currentFocus].children[0].click();
      }
      idAutocomplete.style.display = "none";
      searchBusInfo();
    }
  });

  // Hide autocomplete dropdown when user clicks outside of it
  document.addEventListener("click", (e) => {
    if (e.target !== busStopIdInput) {
      idAutocomplete.style.display = "none";
      removeActive(idAutocomplete);
    }
  });
}

// Add background color to active dropdown item
function addActive(idAutocomplete) {
  removeActive(idAutocomplete);

  if (currentFocus >= idAutocomplete.childElementCount) {
    currentFocus = 0;
  }

  if (currentFocus < 0) {
    currentFocus = idAutocomplete.childElementCount - 1;
  }

  // Add active class to selected dropdown item
  idAutocomplete.children[currentFocus].children[0].classList.add("active");

  return idAutocomplete.children[currentFocus].children[0].textContent;
}

// Remove background color from dropdown item
function removeActive(idAutocomplete) {
  for (const child of idAutocomplete.children) {
    child.children[0].classList.remove("active");
  }
}

// Display current time
function currentTime() {
  const currentTime = document.getElementById("current-time");
  setInterval(() => {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;

    currentTime.innerHTML = `Current time: ${hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}${ampm}`;
    
  }, 1000);
}

autocomplete();
currentTime();
