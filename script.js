const busArrivalInfo = document.getElementById("bus-arrival-info");
const busStopNumber = document.getElementById("bus-stop-number");
const busNumberDropdown = document.getElementById("bus-number-dropdown");
const busNotFound = document.getElementById("bus-not-found");
let busStopId;
let filteredBusNo;

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
        <div class="col border">${bus.no}</div>
        <div class="col border">${(nextBus) ? formatTime(nextBus.duration_ms) : "N/A"}</div>
        <div class="col border">${(next2Bus) ? formatTime(next2Bus.duration_ms) : "N/A"}</div>
        <div class="col border">${(next3Bus) ? formatTime(next3Bus.duration_ms) : "N/A"}</div>
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
  getArrivalData(busStopId)
    .then(arrivalData => {
      let formattedArrivalData;
      const formattedBusNumber = formatBusNumberDropdown(arrivalData);
      
      if (filteredBusNo) {
        formattedArrivalData = formatArrivalData(arrivalData, filteredBusNo);
      }
      else {
        formattedArrivalData = formatArrivalData(arrivalData);
      }

      if (formattedArrivalData) {
        busArrivalInfo.innerHTML = formattedArrivalData;
        busStopNumber.innerHTML = `Bus Stop No.: ${busStopId}`;
      }
      else {
        busNotFound.innerHTML = `No buses found for this bus stop ID: ${busStopId}.`;
        document.getElementById("bus-stop-id").value = "";
      }

      busNumberDropdown.innerHTML = formattedBusNumber;
    })
    .catch(error => {
      busNotFound.innerHTML = `Error fetching bus arrival data`;
    });
}

// Search bus info based on user's input
function searchBusInfo() {
  const busStopIdInput = document.getElementById("bus-stop-id");
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
function resetFilter() {
  filteredBusNo = null;
  displayArrivalData(busStopId);
}