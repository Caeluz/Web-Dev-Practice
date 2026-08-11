const locateButton = document.getElementById("locate-button");
const buttonLabel = document.getElementById("button-label");
const placeholder = document.getElementById("map-placeholder");
const locationStatus = document.getElementById("location-status");
const mapError = document.getElementById("map-error");
const errorMessage = document.getElementById("error-message");
const latitudeOutput = document.getElementById("latitude");
const longitudeOutput = document.getElementById("longitude");
const accuracyOutput = document.getElementById("accuracy");

let map;
let marker;
let accuracyCircle;

function setLoading(isLoading) {
  locateButton.disabled = isLoading;
  buttonLabel.textContent = isLoading ? "Locating…" : "Locate me";
  if (isLoading) {
    locationStatus.textContent = "Finding your current location…";
    mapError.hidden = true;
  }
}

function initializeMap(latitude, longitude, accuracy) {
  if (typeof L === "undefined") {
    showError("The map could not load. Check your internet connection and try again.");
    return;
  }

  const position = [latitude, longitude];

  if (!map) {
    map = L.map("map", { zoomControl: false }).setView(position, 16);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const locationIcon = L.divIcon({
      className: "",
      html: '<span class="location-marker" aria-hidden="true"></span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    marker = L.marker(position, { icon: locationIcon, title: "Your location" }).addTo(map);
    accuracyCircle = L.circle(position, {
      radius: accuracy,
      color: "#9ab743",
      fillColor: "#d7f171",
      fillOpacity: 0.14,
      weight: 2
    }).addTo(map);
  } else {
    marker.setLatLng(position);
    accuracyCircle.setLatLng(position).setRadius(accuracy);
    map.flyTo(position, Math.max(map.getZoom(), 16), { duration: 1.1 });
  }

  placeholder.classList.add("is-hidden");
  setTimeout(() => map.invalidateSize(), 0);
}

function showPosition(position) {
  const { latitude, longitude, accuracy } = position.coords;

  latitudeOutput.textContent = latitude.toFixed(6);
  longitudeOutput.textContent = longitude.toFixed(6);
  accuracyOutput.textContent = `${Math.round(accuracy)} m`;
  initializeMap(latitude, longitude, accuracy);
  setLoading(false);
}

function getErrorMessage(error) {
  if (!error) return "An unknown error occurred. Please try again.";

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access is blocked. Allow it in your browser settings, then try again.";
    case error.POSITION_UNAVAILABLE:
      return "Your location is currently unavailable. Check your connection and try again.";
    case error.TIMEOUT:
      return "Finding your location took too long. Please try again.";
    default:
      return "An unknown error occurred. Please try again.";
  }
}

function showError(message) {
  errorMessage.textContent = message;
  mapError.hidden = false;
  locationStatus.textContent = "Location unavailable";
  setLoading(false);
}

function locateUser() {
  if (!("geolocation" in navigator)) {
    showError("Geolocation is not supported by this browser.");
    return;
  }

  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    showPosition,
    (error) => showError(getErrorMessage(error)),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

locateButton.addEventListener("click", locateUser);
locateUser();
