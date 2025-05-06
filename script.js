function toggleDescription(card) {
    document.querySelectorAll('.description').forEach(desc => {
        const title = desc.parentElement.querySelector('h2');
        if (desc !== card.querySelector('.description')) {
            desc.classList.add('hidden');
            if (title) title.classList.add('hidden');
            // Cache aussi la map si ouverte
            const mapCont = desc.querySelector('.map-container');
            if (mapCont) mapCont.classList.add('hidden');
        }
    });
    const desc = card.querySelector('.description');
    const title = card.querySelector('h2');
    if (desc && title) {
        desc.classList.toggle('hidden');
        title.classList.toggle('hidden');
    }
}

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
    // Trouve la bonne map-container
    const desc = btn.closest('.description');
    const mapCont = desc.querySelector('.map-container');
    const mapId = `map-${monument}`;
    // Cache toutes les autres maps
    document.querySelectorAll('.map-container').forEach(mc => {
        if (mc !== mapCont) mc.classList.add('hidden');
    });
    // Toggle la map de cette card
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