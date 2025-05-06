var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

function toggleDescription(card) {
// FERMER LES DESCRIPTIONS ET TITRES
    document.querySelectorAll('.description').forEach(desc => {
        if (desc !== card.querySelector('.description')) {
            desc.classList.add('hidden');
            const otherTitle = desc.parentElement.querySelector('h2');
            if (otherTitle) otherTitle.classList.add('hidden');
        }
    });
// OUVRE LA DESCRIPTION DE LA CARTE CLIQUÉE
    const desc = card.querySelector('.description');
    const title = card.querySelector('h2');
    if (desc && title) {
        const isHidden = desc.classList.contains('hidden');
        desc.classList.toggle('hidden');
        title.classList.toggle('hidden');
    }
}
