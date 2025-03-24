document.addEventListener('DOMContentLoaded', function () {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('header').outerHTML = data;
            loadSearchScript();
        })
        .catch(error => console.error('Erreur lors du chargement du header:', error));
});

function loadSearchScript() {
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    const searchContainer = document.querySelector('.search-container');

    searchIcon.addEventListener('click', function(event) {
        searchInput.classList.toggle('active');
        if (searchInput.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.value = "";
        }
        event.stopPropagation();
    });

    document.addEventListener('click', function(event) {
        if (!searchContainer.contains(event.target)) {
            searchInput.classList.remove('active');
            searchInput.value = "";
        }
    });
}

