// Gestion description et accessibilité + fermeture globale
function toggleDescription(card) {
    // Ferme toutes les autres cards d'abord
    document.querySelectorAll('.card.active').forEach(c => {
        if (c !== card) {
            c.setAttribute('aria-expanded', 'false');
            c.querySelector('.description').classList.add('hidden');
            c.querySelector('h2, h3').classList.add('hidden');
            c.classList.remove('active');
            const mapCont = c.querySelector('.map-container');
            if (mapCont) mapCont.classList.add('hidden');
        }
    });

    const desc = card.querySelector('.description');
    const title = card.querySelector('h2, h3');
    const expanded = desc.classList.toggle('hidden') ? 'false' : 'true';
    card.setAttribute('aria-expanded', expanded);
    title.classList.toggle('hidden');

    const cards = card.closest('.cards');
    if (!desc.classList.contains('hidden')) {
        cards.classList.add('grayscale-on');
        card.classList.add('active');
    } else {
        cards.classList.remove('grayscale-on');
        card.classList.remove('active');
    }
}

// Ferme tout si clic hors carte
document.addEventListener('click', e => {
    if (!e.target.closest('.card')) {
        document.querySelectorAll('.card').forEach(c => {
            c.setAttribute('aria-expanded', 'false');
            c.querySelector('.description').classList.add('hidden');
            c.querySelector('h2, h3').classList.add('hidden');
            c.classList.remove('active');
            const mapCont = c.querySelector('.map-container');
            if (mapCont) mapCont.classList.add('hidden');
        });
        document.querySelectorAll('.cards').forEach(cards => cards.classList.remove('grayscale-on'));
    }
});

// MAP LEAFLET
const monumentCoords = {
    eiffel: [48.8584, 2.2945],
    michel: [48.6361, -1.5115],
    dame: [48.853, 2.3499],
    triomphe: [48.8738, 2.295],
    basilique: [48.8867, 2.3431],
    pantheon: [48.8462, 2.3458],
    versailles: [48.8049, 2.1204],
    chambord: [47.6161, 1.5165],
    chenonceau: [47.3247, 1.0706],
    chantilly: [49.1931, 2.4856]
};
const maps = {};
function showMap(event, monument, btn) {
    event.stopPropagation();
    const desc = btn.closest('.description');
    const mapCont = desc.querySelector('.map-container');
    const mapId = `map-${monument}`;
    document.querySelectorAll('.map-container').forEach(mc => {
        if (mc !== mapCont) mc.classList.add('hidden');
    });
    mapCont.classList.toggle('hidden');
    if (!mapCont.classList.contains('hidden')) {
        setTimeout(() => {
            if (!maps[mapId]) {
                maps[mapId] = L.map(mapId).setView(monumentCoords[monument], 6);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(maps[mapId]);
                L.marker(monumentCoords[monument]).addTo(maps[mapId]);
            } else {
                maps[mapId].invalidateSize();
                maps[mapId].setView(monumentCoords[monument], 6);
            }
        }, 100);
    }
}

// GESTION MODALES
document.addEventListener('DOMContentLoaded', function () {
    // Empêche la fermeture quand on clique sur la map dans la modale
    const mapModal = document.getElementById('map-modal');
    if (mapModal) {
        const mapDiv = mapModal.querySelector('#map');
        mapDiv.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        mapDiv.addEventListener('click', function(e) { e.stopPropagation(); });
    }
    // Empêche la fermeture quand on clique sur la map dans une card
    document.querySelectorAll('.map-container').forEach(function(container) {
        container.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        container.addEventListener('click', function(e) { e.stopPropagation(); });
    });
});

function showItinerary(monument, evt) {
    evt.stopPropagation(); // évite de fermer la card
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
    }
    navigator.geolocation.getCurrentPosition(function(position) {
        const userLatLng = [position.coords.latitude, position.coords.longitude];
        const destLatLng = monumentCoords[monument];
        const mapId = `map-${monument}`;
        // Affiche la carte si besoin
        showMap({stopPropagation:()=>{}}, monument);
        // Utilise OSRM pour obtenir l'itinéraire
        fetch(`https://router.project-osrm.org/route/v1/driving/${userLatLng[1]},${userLatLng[0]};${destLatLng[1]},${destLatLng[0]}?overview=full&geometries=geojson`)
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length) {
                    const route = data.routes[0].geometry;
                    // Supprime l'ancien tracé si présent
                    if (maps[mapId].routeLayer) {
                        maps[mapId].removeLayer(maps[mapId].routeLayer);
                    }
                    maps[mapId].routeLayer = L.geoJSON(route, {color: 'blue', weight: 5}).addTo(maps[mapId]);
                    // Marqueur utilisateur
                    if (maps[mapId].userMarker) {
                        maps[mapId].removeLayer(maps[mapId].userMarker);
                    }
                    maps[mapId].userMarker = L.marker(userLatLng, {title: "Vous"}).addTo(maps[mapId]);
                    maps[mapId].fitBounds(L.geoJSON(route).getBounds(), {padding: [30, 30]});
                } else {
                    alert("Itinéraire non trouvé.");
                }
            });
    }, function() {
        alert("Impossible d'obtenir votre position.");
    });
}
