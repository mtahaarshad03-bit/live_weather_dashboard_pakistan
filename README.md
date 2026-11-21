# SkyCast Pakistan — Live Weather Dashboard

A responsive, Pakistan-focused weather dashboard built with separate HTML, CSS and JavaScript files.

## Files
- `index.html` — dashboard structure and UI
- `style.css` — responsive dark weather-dashboard styling
- `script.js` — Fetch API requests, JSON parsing, city search, loading/error states and forecast rendering

## Run
1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. Keep an internet connection active. The dashboard loads Lahore weather automatically.
4. Search for Pakistani cities such as Karachi, Islamabad, Faisalabad, Peshawar, Quetta or Multan.

If your browser blocks requests when opening a local file, run the folder using VS Code Live Server.

## Live data source
This version uses Open-Meteo's Geocoding API and Forecast API. It provides live/current conditions and a five-day forecast without an API key, so the project works immediately after opening. The assignment mentions OpenWeatherMap; Open-Meteo is used here as a no-key alternative to make the live dashboard immediately usable. Open-Meteo requires attribution and its free API is for non-commercial use.

## Included
- Current temperature and weather condition
- Weather icon, humidity, wind speed, feels-like temperature and cloud cover
- Search restricted to Pakistani cities
- Popular Pakistan city quick buttons
- Five-day forecast cards with max/min temperature and rain probability
- Loading spinner, network/API error handling and periodic refresh
- Responsive mobile layout

Weather data: https://open-meteo.com/
