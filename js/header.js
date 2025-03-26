// HEARDER LOADER
document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
        .then(response => response.ok ? response.text() : Promise.reject('Header non chargé'))
        .then(data => {
            document.querySelector('header').outerHTML = data;
            initSearchSystem();
        })
        .catch(error => {
            console.error('Erreur:', error);
            initSearchSystem();
        });
});


function initSearchSystem() {
    const searchInput = document.querySelector(".search-input");
    const searchContainer = document.querySelector(".search-container");
    
    if (!searchInput || !searchContainer) return;

    const resultsContainer = document.createElement("div");
    resultsContainer.className = "search-results";
    document.body.insertBefore(resultsContainer, document.body.firstChild);

    let recipesData = [];
    let searchTimer;

    //RECIPES LOADER
    fetch("data/recipes.json")
        .then(response => response.ok ? response.json() : Promise.reject('Fichier JSON non trouvé'))
        .then(data => {
            recipesData = data.recettes;
            console.log(`${recipesData.length} recettes chargées`);
        })
        .catch(error => {
            console.error("Erreur:", error);
            showErrorMessage("Impossible de charger les recettes");
        });

        const normalizeText = (text) => text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';

    const showErrorMessage = (message) => {
        resultsContainer.innerHTML = `<div class="search-error">${message}</div>`;
        resultsContainer.style.display = "block";
    };

    const performSearch = () => {
    const searchTerm = normalizeText(searchInput.value.trim());
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "none";

    if (searchTerm.length < 2) return;

    if (!recipesData || !Array.isArray(recipesData)) {
        showErrorMessage("Données de recettes non disponibles");
        return;
    }

    const results = recipesData.filter(recipe => {
        if (!recipe || typeof recipe !== 'object') return false;

        const nom = normalizeText(recipe.nom);
        if (nom.includes(searchTerm)) return true;

        return recipe.ingredients?.some(ingredient => normalizeText(ingredient.nom).includes(searchTerm));
    });

    displayResults(results);
};

    const displayResults = (results) => {
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    Aucune recette trouvée pour "${searchInput.value}"
                </div>
            `;
        } else {
            resultsContainer.innerHTML = results.map(recipe => `
                <div class="recipe-result">
                    <h3>${recipe.nom}</h3>
                    <div class="recipe-meta">
                        <span class="category">${recipe.categorie}</span>
                        <span class="time">${recipe.temps_preparation}</span>
                    </div>
                    <div class="ingredients-list">
                        ${recipe.ingredients.map(ing => ing.nom).join(', ')}
                    </div>
                </div>
            `).join('');
        }
        resultsContainer.style.display = "block";
    };


    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(performSearch, 300);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter") {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 1) {
                window.location.href = `search_results.html?query=${encodeURIComponent(searchTerm)}`;
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !resultsContainer.contains(e.target)) {
            searchContainer.classList.remove('expanded');
            searchInput.value = "";
            resultsContainer.style.display = "none";
        }
    });
}