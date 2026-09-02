const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherCard = document.getElementById("weatherCard");

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") searchWeather();
});

async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    await getWeather(city);
}

async function getWeather(city) {
    showLoading();

    try {
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to connect to location service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city name.");
        }

        const location = geoData.results[0];

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather information.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        document.getElementById("cityName").textContent = location.name;
        document.getElementById("countryName").textContent = location.country;

        document.getElementById("temperature").textContent =
            current.temperature_2m;
        document.getElementById("tempDetail").textContent =
            current.temperature_2m;

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m;
        document.getElementById("humidityDetail").textContent =
            current.relative_humidity_2m;

        document.getElementById("windSpeed").textContent =
            current.wind_speed_10m;
        document.getElementById("windDetail").textContent =
            current.wind_speed_10m;

        document.getElementById("weatherDescription").textContent =
            getWeatherDescription(current.weather_code);

        document.getElementById("updatedTime").textContent =
            formatDateTime(current.time);

        weatherCard.style.display = "block";
        error.style.display = "none";

    } catch (err) {
        console.error(err);
        showError(err.message || "Something went wrong. Please try again.");
    } finally {
        loading.style.display = "none";
    }
}

function showLoading() {
    loading.style.display = "block";
    error.style.display = "none";
    weatherCard.style.display = "none";
}

function showError(message) {
    loading.style.display = "none";
    error.textContent = message;
    error.style.display = "block";
    weatherCard.style.display = "none";
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherCodes[code] || "Unknown weather";
}

function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
}
