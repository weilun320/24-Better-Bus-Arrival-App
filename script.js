const busArrivalInfo = document.getElementById("bus-arrival-info");
const busStopNumber = document.getElementById("bus-stop-number");

// Fetch bus arrival data from API based on user's input
async function getArrivalData(busStopId) {
  const response = await fetch(`https://arrivelah2.busrouter.sg/?id=${busStopId}`);
  const data = await response.json();

  return data;
}

// Format buses info into a readable format
function formatArrivalData(arrivalData) {
  const buses = arrivalData.services;
  const formattedData = [];

  for (const bus of buses) {
    const nextBus = bus.next;
    formattedData.push(`
      <div class="row">
        <div class="col border">${bus.no}</div>
        <div class="col border">${formatTime(nextBus.duration_ms)}</div>
      </div>
    `);
  }

  return formattedData.join("");
}

// Display bus arrival data on the webpage
function displayArrivalData(busStopId) {
  getArrivalData(busStopId)
  .then(arrivalData => {
    const formattedArrivalData = formatArrivalData(arrivalData);

    busArrivalInfo.innerHTML = formattedArrivalData;
  })
  .catch(error => {
    busArrivalInfoContainer.innerHTML = `Error fetching bus arrival data: ${error}`;
  });
}

// Search bus info based on user's input
function searchBusInfo() {
  const busStopIdInput = document.getElementById("bus-stop-id");
  const busStopId = busStopIdInput.value;

  busStopNumber.innerHTML = `Bus Stop Number: ${busStopId}`;
  displayArrivalData(busStopId);
  busStopIdInput.value = "";
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