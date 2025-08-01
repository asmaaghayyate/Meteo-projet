


function updateCurrentTime() {
  const now = new Date();

  // Format options pour heure:minutes:secondes + date FR
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  // Formatage date/heure en français
  const timeString = now.toLocaleString('fr-FR', options);

  document.getElementById('current-time').textContent = timeString;
}

// Appel initial + mise à jour chaque seconde
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
    // GÉOLOCALISATION MÉTÉO

function getWeatherByLocation(lat, lon) {
  const apiKey = '8b1d28c75b6ef032c4f2d3ea65b3fd1f';
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      document.getElementById('city-name').textContent = data.name;
      document.getElementById('temp').textContent = `${Math.round(data.main.temp)} °C`;
      document.getElementById('descrption').textContent = data.weather[0].description;
      document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

      // ✅ Ajout des lignes manquantes :
      document.getElementById('humidity').textContent = `${data.main.humidity} %`;
      document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;
      document.getElementById('wind-dir').textContent = `${data.wind.deg}°`;
      checkWeatherAlerts(data);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des données météo:', error);
    });
}


function getWeatherByCity(city) {
  const apiKey = '8b1d28c75b6ef032c4f2d3ea65b3fd1f';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Ville introuvable");
      return res.json();
    })
    .then(data => {
      // Mise à jour météo actuelle
      document.getElementById('city-name').textContent = data.name;
      document.getElementById('temp').textContent = `${Math.round(data.main.temp)} °C`;
      document.getElementById('descrption').textContent = data.weather[0].description;
      document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
      document.getElementById('humidity').textContent = `${data.main.humidity} %`;
      document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;
      document.getElementById('wind-dir').textContent = `${data.wind.deg}°`;

      // Recentrer la carte sur la ville avec zoom
      initMap(data.coord.lat, data.coord.lon);

      // Charger les prévisions
      loadForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => {
      alert(err.message);
    });
}



function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByLocation(lat, lon);
        loadForecast(lat, lon);
        initMap(lat, lon);
     },
      error => {
        console.error('Erreur de géolocalisation :', error.message);
        alert("Impossible de récupérer votre position. Activez la géolocalisation.");
      }
    );
  } else {
    alert("Votre navigateur ne supporte pas la géolocalisation.");
  }
}

// THÈME SOMBRE / CLAIR
const toggleBtn = document.getElementById("toggleTheme");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("dark-mode")) {
    toggleBtn.textContent = "☀️ Mode clair";
    toggleBtn.classList.remove("btn-outline-dark");
    toggleBtn.classList.add("btn-outline-light");
  } else {
    toggleBtn.textContent = "🌙 Mode sombre";
    toggleBtn.classList.remove("btn-outline-light");
    toggleBtn.classList.add("btn-outline-dark");
  }
});

// CHARGEMENT INITIAL
window.onload = function () {
  document.body.classList.add("light-mode");
  getLocation(); // ← très important
  setInterval(() => {
    getLocation();
  }, 15 * 60 * 1000);
};

    
    
    const apiKey = '8b1d28c75b6ef032c4f2d3ea65b3fd1f'; // Remplace si tu changes d'API Key

    // 📍 Initialisation de la carte centrée sur Casablanca
  let map; // déclaration globale tout en haut de ton script

async function initMap(lat, lon) { 
  if (!map) {
    // Si la carte n'existe pas, on la crée
    map = L.map('map').setView([lat, lon], 10);
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const overlays = {
      "🌬️ Vent": L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 }),
      "🌡️ Température": L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 }),
      "🌧️ Précipitations": L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 }),
      "☁️ Nuages": L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 })
    };

    L.control.layers(null, overlays, { collapsed: false }).addTo(map);
    overlays["🌡️ Température"].addTo(map);
  } else {
    // Si la carte existe déjà, on la recadre seulement
    map.setView([lat, lon], 10);
  }
}





async function getWeatherByCity(city) {
  const apiKey = '8b1d28c75b6ef032c4f2d3ea65b3fd1f';
  
  // URL météo actuelle
  const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;
  
  const resCurrent = await fetch(urlCurrent);
  if (!resCurrent.ok) {
    alert("Ville introuvable !");
    return;
  }
  const data = await resCurrent.json();

  // Afficher météo actuelle
  document.getElementById('city-name').textContent = data.name;
  document.getElementById('temp').textContent = `${Math.round(data.main.temp)} °C`;
  document.getElementById('descrption').textContent = data.weather[0].description;
  document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
  document.getElementById('humidity').textContent = `${data.main.humidity} %`;
  document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;
  document.getElementById('wind-dir').textContent = `${data.wind.deg}°`;
checkWeatherAlerts(data);
  // Charger prévisions avec les coordonnées récupérées
  const lat = data.coord.lat;
  const lon = data.coord.lon;
  loadForecast(lat, lon);
  initMap(lat, lon);
}

document.getElementById('search-btn').addEventListener('click', () => {
  const city = document.getElementById('search-city').value.trim();
  if (city !== '') {
    getWeatherByCity(city); // On appellera cette fonction pour afficher la météo de la ville saisie
  } else {
    alert("Veuillez entrer une ville");
  }
});


async function loadForecast(lat, lon) {
  const apiKey = '8b1d28c75b6ef032c4f2d3ea65b3fd1f';
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API météo');
  const data = await res.json();

  // Filtrer uniquement les créneaux après l'heure actuelle
  const now = Date.now();
  const prochainesHeures = data.list.filter(item => (item.dt * 1000) > now);

  // Prendre seulement les 4 ou 6 prochaines tranches
  const nextSlots = prochainesHeures.slice(0, 6);

  renderForecast(nextSlots);
}

function renderForecast(hours) {
  const container = document.getElementById('forecast-3h-list');
  container.innerHTML = '';

  hours.forEach(hour => {
    const date = new Date(hour.dt * 1000);
    const time = date.getHours().toString().padStart(2, '0') + 'h';
    const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;
    const temp = Math.round(hour.main.temp);

    container.innerHTML += `
      <div class="col-12 col-md-2 mb-3">
        <div class="card text-center p-3 transition-all ">
          <h5>${time}</h5>
          <img src="${icon}" width="90" alt="">
          <p>${temp}°C</p>
        </div>
      </div>
    `;
  });
}


async function loadForecast(lat, lon) {
  const apiKey = '8b1d28c75b6ef032c4f2d3ea65b3fd1f';
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API météo');
  const data = await res.json();

  // Affichage prévisions 3h
  const next4 = data.list.slice(0, 6);
  renderForecast(next4);

  // Affichage prévisions journalières calculées à partir de forecast
  renderDailyForecastFromForecastApi(data.list);
}





function renderDailyForecastFromForecastApi(list) {
  const container = document.getElementById('forecast-6days');
  container.innerHTML = '';

  // Regroupe par date (yyyy-mm-dd)
  const days = {};

  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0]; // format YYYY-MM-DD

    if (!days[dayKey]) {
      days[dayKey] = {
        tempsMin: item.main.temp_min,
        tempsMax: item.main.temp_max,
        desc: item.weather[0].description,
        icon: item.weather[0].icon,
        count: 1
      };
    } else {
      days[dayKey].tempsMin = Math.min(days[dayKey].tempsMin, item.main.temp_min);
      days[dayKey].tempsMax = Math.max(days[dayKey].tempsMax, item.main.temp_max);
      days[dayKey].count++;
      // Optionnel : prendre la description/icône la plus fréquente ou la première
    }
  });

  // Prendre les premiers 5 jours (exclure aujourd'hui si tu veux)
  const keys = Object.keys(days).slice(0, 6);

  keys.forEach(dayKey => {
    const day = days[dayKey];
    const dateObj = new Date(dayKey);
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    const dayName = dateObj.toLocaleDateString('fr-FR', options);

    container.innerHTML += `
   <div class="col-12 col-md-2 mb-3">
  <div class="card text-center p-3 transition-all" 
       style="height: 290px; display: flex; flex-direction: column; justify-content: space-between;">
       
    <div>
      <h5>${dayName}</h5>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" 
           alt="${day.desc}" width="90" />
      <p>${day.desc}</p>
    </div>

    <div>
      <p style="font-weight: bold; margin: 0;">
        Min: ${Math.round(day.tempsMin)}°C  Max: ${Math.round(day.tempsMax)}°C
      </p>
    </div>

  </div>
</div>
    `;
  });
}


function checkWeatherAlerts(data) {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = ""; // Efface ancienne alerte

  let alerts = [];

  // ⚠️ Vent fort
  if (data.wind.speed > 40) {
    alerts.push(`💨 Vent fort prévu (${data.wind.speed} km/h)`);
  }

  // 🌧️ Pluie prévue
  if (data.weather[0].main.toLowerCase().includes("rain")) {
    alerts.push("🌧️ Risque de pluie");
  }

  // ❄️ Températures basses
  if (data.main.temp < 5) {
    alerts.push(`❄️ Températures basses (${data.main.temp}°C)`);
  }

  // ✅ Afficher les alertes si il y en a
  if (alerts.length > 0) {
    alerts.forEach(alertText => {
      const alertDiv = document.createElement("div");
      alertDiv.className = "alert alert-warning transition-all mb-2";
      alertDiv.role = "alert";
      alertDiv.textContent = alertText;
      alertContainer.appendChild(alertDiv);
    });
  } else {
    // Pas d'alerte
    const noAlert = document.createElement("div");
    noAlert.className = "alert alert-success";
    noAlert.textContent = "✅ Aucune alerte météo.";
    alertContainer.appendChild(noAlert);
  }
}




