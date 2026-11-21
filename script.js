// SkyCast Pakistan — live weather powered by Open-Meteo (no API key required)
const $ = (id) => document.getElementById(id);
const PAKISTAN_CITIES = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Peshawar", "Quetta", "Multan"];

const weatherDescriptions = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"], 45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"], 57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"], 67: ["Heavy freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "🌨️"], 80: ["Rain showers", "🌦️"], 81: ["Rain showers", "🌧️"],
  82: ["Heavy showers", "⛈️"], 85: ["Snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm with hail", "⛈️"], 99: ["Severe thunderstorm", "⛈️"]
};

function weatherInfo(code) {
  return weatherDescriptions[code] || ["Variable conditions", "🌤️"];
}
function formatDate(dateString, options) {
  return new Intl.DateTimeFormat("en-PK", options).format(new Date(dateString));
}
function setStatus(message, isError = false) {
  const status = $("statusMessage");
  status.className = `status-message${isError ? " error" : ""}`;
  status.innerHTML = isError ? `<span aria-hidden="true">⚠</span> ${message}` : `<span class="spinner"></span> ${message}`;
}
function setActiveCity(city) {
  document.querySelectorAll(".city-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.city.toLowerCase() === city.toLowerCase());
  });
}
function updateClock() {
  const now = new Date();
  $("todayDate").textContent = new Intl.DateTimeFormat("en-PK", {weekday:"long", day:"numeric", month:"long", year:"numeric"}).format(now);
  $("todayDay").textContent = "PAKISTAN · PKT";
}
function displayForecast(daily) {
  const grid = $("forecastGrid");
  grid.innerHTML = "";
  daily.time.slice(0, 5).forEach((date, index) => {
    const code = daily.weather_code[index];
    const [description, icon] = weatherInfo(code);
    const dayName = index === 0 ? "Today" : formatDate(date, {weekday:"short"});
    const dateLabel = formatDate(date, {day:"numeric", month:"short"});
    const max = Math.round(daily.temperature_2m_max[index]);
    const min = Math.round(daily.temperature_2m_min[index]);
    const rain = Math.round(daily.precipitation_probability_max[index] ?? 0);
    const card = document.createElement("article");
    card.className = `forecast-day${index === 0 ? " today" : ""}`;
    card.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-date">${dateLabel}</div>
      <div class="day-icon" role="img" aria-label="${description}">${icon}</div>
      <div class="day-condition" title="${description}">${description}</div>
      <div class="day-temps"><span>${max}°</span><span>${min}°</span></div>
      <div class="rain-chance">💧 ${rain}% rain</div>`;
    grid.appendChild(card);
  });
}
async function findCity(cityName) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({name: cityName, count: "10", language: "en", format: "json", countryCode: "PK"}).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error("City search is temporarily unavailable. Please try again.");
  const data = await response.json();
  if (!data.results?.length) throw new Error(`We couldn't find "${cityName}" in Pakistan. Try Lahore, Karachi, Islamabad or another Pakistani city.`);
  const exact = data.results.find(place => place.name.toLowerCase() === cityName.toLowerCase()) || data.results[0];
  return exact;
}
async function getWeather(place) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "Asia/Karachi",
    forecast_days: "5"
  }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error("Live weather could not be loaded. Please check your internet connection and try again.");
  return response.json();
}
function renderWeather(place, data) {
  const current = data.current;
  const [description, icon] = weatherInfo(current.weather_code);
  const temperature = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);
  const city = place.name;
  $("cityName").textContent = city;
  $("locationDetail").textContent = [place.admin1, "Pakistan"].filter(Boolean).join(", ");
  $("currentIcon").textContent = icon;
  $("currentTemp").innerHTML = `${temperature}<sup>°C</sup>`;
  $("currentCondition").textContent = description;
  $("feelsLike").textContent = `Feels like ${feels}°C`;
  $("humidity").textContent = `${current.relative_humidity_2m}%`;
  $("windSpeed").innerHTML = `${Math.round(current.wind_speed_10m)} <small>km/h</small>`;
  $("feelsMetric").textContent = `${feels}°C`;
  $("cloudCover").textContent = `${current.cloud_cover}%`;
  $("detailCity").textContent = city;
  const now = new Date();
  $("currentTime").textContent = formatDate(now, {hour:"numeric", minute:"2-digit", timeZone:"Asia/Karachi"}) + " PKT";
  $("localTime").textContent = formatDate(now, {hour:"numeric", minute:"2-digit", timeZone:"Asia/Karachi"});
  $("updatedAt").textContent = formatDate(now, {hour:"numeric", minute:"2-digit", timeZone:"Asia/Karachi"});
  displayForecast(data.daily);
  $("weatherContent").hidden = false;
  $("forecastSection").hidden = false;
  $("statusMessage").hidden = true;
  setActiveCity(city);
  document.title = `${city} Weather — SkyCast Pakistan`;
}
let activeRequest = 0;
async function loadWeather(cityName) {
  const requestId = ++activeRequest;
  $("weatherContent").hidden = true;
  $("forecastSection").hidden = true;
  $("statusMessage").hidden = false;
  setStatus(`Fetching live weather for ${cityName}, Pakistan…`);
  $("searchButton").disabled = true;
  $("searchButton").textContent = "Loading…";
  try {
    const place = await findCity(cityName.trim());
    const data = await getWeather(place);
    if (requestId !== activeRequest) return;
    renderWeather(place, data);
    $("cityInput").value = place.name;
  } catch (error) {
    if (requestId !== activeRequest) return;
    setStatus(error.message || "Something went wrong. Please try again.", true);
  } finally {
    if (requestId === activeRequest) {
      $("searchButton").disabled = false;
      $("searchButton").innerHTML = 'Search <span>→</span>';
    }
  }
}

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  const city = $("cityInput").value.trim();
  if (city) loadWeather(city);
});
document.querySelectorAll(".city-chip").forEach(button => {
  button.addEventListener("click", () => {
    $("cityInput").value = button.dataset.city;
    loadWeather(button.dataset.city);
  });
});
updateClock();
loadWeather("Lahore");
// Refresh current conditions periodically so the dashboard stays current.
setInterval(() => {
  if (!$("weatherContent").hidden) loadWeather($("cityInput").value.trim() || "Lahore");
}, 10 * 60 * 1000);
