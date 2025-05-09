// Gestion cards, blur, accessibilité
function toggleDescription(card) {
    document.querySelectorAll('.card.active').forEach(c => {
        if (c !== card) {
            c.setAttribute('aria-expanded', 'false');
            c.classList.remove('active');
            c.querySelector('.description').classList.add('hidden');
            c.querySelector('h2, h3').classList.add('hidden');
            let mapCont = c.querySelector('.map-container');
            if (mapCont) mapCont.classList.add('hidden');
        }
    });
    const desc = card.querySelector('.description');
    const title = card.querySelector('h2, h3');
    const open = desc.classList.toggle('hidden') === false;
    card.setAttribute('aria-expanded', open);
    title.classList.toggle('hidden', !open);
    card.classList.toggle('active', open);
    card.closest('.cards').classList.toggle('grayscale-on', open);
}

// Ferme tout si clic hors card
document.addEventListener('click', e => {
    if (!e.target.closest('.card')) {
        document.querySelectorAll('.card.active').forEach(c => {
            c.setAttribute('aria-expanded', 'false');
            c.classList.remove('active');
            c.querySelector('.description').classList.add('hidden');
            c.querySelector('h2, h3').classList.add('hidden');
            let mapCont = c.querySelector('.map-container');
            if (mapCont) mapCont.classList.add('hidden');
        });
        document.querySelectorAll('.cards').forEach(cards => cards.classList.remove('grayscale-on'));
    }
});

// Leaflet cartes & itinéraire
const monumentCoords = {
    eiffel: [48.8584, 2.2945], michel: [48.6361, -1.5115], dame: [48.853, 2.3499],
    triomphe: [48.8738, 2.295], basilique: [48.8867, 2.3431], pantheon: [48.8462, 2.3458],
    versailles: [48.8049, 2.1204], chambord: [47.6161, 1.5165], chenonceau: [47.3247, 1.0706], chantilly: [49.1931, 2.4856]
};
const maps = {};
function showMap(e, monument, btn) {
    e.stopPropagation();
    const desc = btn.closest('.description');
    const mapCont = desc.querySelector('.map-container');
    const mapId = `map-${monument}`;
    document.querySelectorAll('.map-container').forEach(mc => { if (mc !== mapCont) mc.classList.add('hidden'); });
    mapCont.classList.toggle('hidden');
    if (!mapCont.classList.contains('hidden')) {
        setTimeout(() => {
            if (!maps[mapId]) {
                maps[mapId] = L.map(mapId).setView(monumentCoords[monument], 6);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(maps[mapId]);
                L.marker(monumentCoords[monument]).addTo(maps[mapId]);
            } else {
                maps[mapId].invalidateSize();
                maps[mapId].setView(monumentCoords[monument], 6);
            }
        }, 100);
    }
}

// Empêche la fermeture quand on clique sur la map
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.map-container, #map').forEach(el => {
        el.addEventListener('mousedown', e => e.stopPropagation());
        el.addEventListener('click', e => e.stopPropagation());
    });
});

// Itinéraire
function showItinerary(monument, evt) {
    evt.stopPropagation();
    if (!navigator.geolocation) return alert("La géolocalisation n'est pas supportée par votre navigateur.");
    navigator.geolocation.getCurrentPosition(pos => {
        const user = [pos.coords.latitude, pos.coords.longitude], dest = monumentCoords[monument], mapId = `map-${monument}`;
        // récupérer "C'est où ?" dans la même card
        const card = evt.target.closest('.card');
        const btnMap = card.querySelector('button[onclick*="showMap"]');
        showMap({stopPropagation:()=>{}}, monument, btnMap);
        fetch(`https://router.project-osrm.org/route/v1/driving/${user[1]},${user[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`)
            .then(res => res.json()).then(data => {
                if (data.routes && data.routes.length) {
                    const route = data.routes[0].geometry;
                    if (maps[mapId].routeLayer) maps[mapId].removeLayer(maps[mapId].routeLayer);
                    maps[mapId].routeLayer = L.geoJSON(route, {color: 'blue', weight: 5}).addTo(maps[mapId]);
                    if (maps[mapId].userMarker) maps[mapId].removeLayer(maps[mapId].userMarker);
                    maps[mapId].userMarker = L.marker(user, {title: "Vous"}).addTo(maps[mapId]);
                    maps[mapId].fitBounds(L.geoJSON(route).getBounds(), {padding: [30, 30]});
                } else alert("Itinéraire non trouvé.");
            });
    }, () => alert("Impossible d'obtenir votre position."));
}