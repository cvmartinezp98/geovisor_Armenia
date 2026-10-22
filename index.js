// 1. Inicialización del Mapa
const map = L.map('map').setView([4.53389, -75.68111], 13);

// Capa Base
const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
});

// Variables globales para almacenar las capas reales
let layerPerimetro, layerRedHidrica, layerBuffer, layerConflictos, layerIOT;

// 2. Cargar tus capas REALES de ArcGIS Pro (archivos .geojson)

// Capa 1: Perímetro Urbano
fetch('perimetro.geojson')
    .then(res => res.json())
    .then(data => {
        layerPerimetro = L.geoJSON(data, {
            style: { color: "#1b4332", weight: 2, dashArray: "5, 5", fillOpacity: 0.05 }
        }).addTo(map);
    });

// Capa 2: Red Hídrica Real
fetch('red_hidrica.geojson')
    .then(res => res.json())
    .then(data => {
        layerRedHidrica = L.geoJSON(data, {
            style: { color: "#0077b6", weight: 2 },
            onEachFeature: (feature, layer) => {
                // 'NOMBRE' o 'TIPO' deben ser los nombres de las columnas en tu tabla de atributos de ArcGIS Pro
                const nombre = feature.properties.NOMBRE || feature.properties.nombre || "Cauce Hídrico";
                layer.bindPopup(`<div class="popup-title">${nombre}</div>`);
            }
        }).addTo(map);
    });

// Capa 3: Franja Analítica de 30m
fetch('franja_30m.geojson')
    .then(res => res.json())
    .then(data => {
        layerBuffer = L.geoJSON(data, {
            style: { color: "#ffb703", weight: 1, fillColor: "#ffb703", fillOpacity: 0.4 }
        }).addTo(map);
    });

// Capa 4: Huellas de Construcción en Conflicto
fetch('construcciones_conflicto.geojson')
    .then(res => res.json())
    .then(data => {
        layerConflictos = L.geoJSON(data, {
            style: { color: "#d62828", weight: 1, fillColor: "#d62828", fillOpacity: 0.8 },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`<div class="popup-title">Edificación en Franja (Conflicto)</div>
                                <div class="popup-info">Área de ocupación identificada en ArcGIS Pro</div>`);
            }
        }).addTo(map);
    });

// Capa 5: Índice de Oportunidad Territorial (IOT)
fetch('iot_armenia.geojson')
    .then(res => res.json())
    .then(data => {
        layerIOT = L.geoJSON(data, {
            style: (feature) => {
                // Simbología según el valor del atributo IOT que calculaste en el análisis multicriterio
                const val = feature.properties.IOT || feature.properties.gridcode;
                if (val > 3.75) return { color: "#2a9d8f", fillColor: "#2a9d8f", fillOpacity: 0.5, weight: 0.5 };
                if (val <= 2.50) return { color: "#e76f51", fillColor: "#e76f51", fillOpacity: 0.5, weight: 0.5 };
                return { color: "#e9c46a", fillColor: "#e9c46a", fillOpacity: 0.4, weight: 0.5 };
            }
        }).addTo(map);
    });

// 3. Controles de Encendido/Apagado en los Checkboxes del Panel
document.getElementById('chkPerimetro').addEventListener('change', (e) => e.target.checked ? map.addLayer(layerPerimetro) : map.removeLayer(layerPerimetro));
document.getElementById('chkRedHidrica').addEventListener('change', (e) => e.target.checked ? map.addLayer(layerRedHidrica) : map.removeLayer(layerRedHidrica));
document.getElementById('chkBuffer').addEventListener('change', (e) => e.target.checked ? map.addLayer(layerBuffer) : map.removeLayer(layerBuffer));
document.getElementById('chkConflictos').addEventListener('change', (e) => e.target.checked ? map.addLayer(layerConflictos) : map.removeLayer(layerConflictos));
document.getElementById('chkIOTAlta').addEventListener('change', (e) => e.target.checked ? map.addLayer(layerIOT) : map.removeLayer(layerIOT));