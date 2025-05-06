// Gestion description et accessibilité
function toggleDescription(card) {
    // Si on clique sur un bouton ou un lien, ne rien faire
    if (event.target.closest('button') || event.target.closest('a')) return;

    document.querySelectorAll('.card').forEach(c => {
        if (c !== card) {
            c.setAttribute('aria-expanded', 'false');
            c.querySelector('.description').classList.add('hidden');
            c.querySelector('h2, h3').classList.add('hidden');
            const mapCont = c.querySelector('.map-container');
            if (mapCont) mapCont.classList.add('hidden');
        }
    });
    const desc = card.querySelector('.description');
    const title = card.querySelector('h2, h3');
    const expanded = desc.classList.toggle('hidden') ? 'false' : 'true';
    card.setAttribute('aria-expanded', expanded);
    title.classList.toggle('hidden');
}

// Bouton fermer dans la description
function closeDescription(event, btn) {
    event.stopPropagation();
    const desc = btn.closest('.description');
    const card = btn.closest('.card');
    desc.classList.add('hidden');
    card.querySelector('h2').classList.add('hidden');
    const mapCont = desc.querySelector('.map-container');
    if (mapCont) mapCont.classList.add('hidden');
    card.setAttribute('aria-expanded', 'false');
}

// Click-outside pour fermer toute description ouverte
document.addEventListener('click', function(e) {
    if (!e.target.closest('.card')) {
        document.querySelectorAll('.description').forEach(desc => desc.classList.add('hidden'));
        document.querySelectorAll('.card h2').forEach(h2 => h2.classList.add('hidden'));
        document.querySelectorAll('.map-container').forEach(mc => mc.classList.add('hidden'));
        document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-expanded', 'false'));
    }
});

// Map Leaflet
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

// Bouton retour en haut
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backToTop.classList.remove('hidden');
    else backToTop.classList.add('hidden');
});

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