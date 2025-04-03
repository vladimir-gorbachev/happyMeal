document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('header.html');
        if (!response.ok) throw new Error('Header non chargé');

        const data = await response.text();
        document.querySelector('header').outerHTML = data;
    } catch (error) {
        console.error('Erreur:', error);
    }

    initSearchSystem();
});

async function initSearchSystem() {
    const searchInput = document.querySelector(".search-input");
    const searchContainer = document.querySelector(".search-container");
    const resultsContainer = document.querySelector(".search-results");

    if (!searchInput || !searchContainer || !resultsContainer) return;

    let recipesData = [];
    let normalizedRecipes = [];
    let searchTimer;
    const searchCache = {};

    async function loadRecipes() {
        try {
            const response = await fetch("data/recipes.json");
            if (!response.ok) throw new Error("Fichier JSON non trouvé");

            const data = await response.json();
            console.log(`${data.recettes.length} recettes chargées`);
            return data.recettes;
        } catch (error) {
            console.error("Erreur:", error);
            return [];
        }
    }

    const normalizeText = (text) => text?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';

    recipesData = await loadRecipes();
    normalizedRecipes = recipesData.map(recipe => ({
        original: recipe,
        nom: normalizeText(recipe.nom),
        ingredients: recipe.ingredients.map(ing => normalizeText(ing.nom))
    }));

    function performSearch() {
        const searchTerm = normalizeText(searchInput.value.trim());
        if (searchTerm.length < 2) {
            resultsContainer.style.display = "none";
            return;
        }

        if (searchCache[searchTerm]) {
            displayResults(searchCache[searchTerm]);
            return;
        }

        const results = normalizedRecipes
            .filter(recipe =>
                recipe.nom.includes(searchTerm) ||
                recipe.ingredients.some(ing => ing.includes(searchTerm))
            )
            .map(r => r.original);

        searchCache[searchTerm] = results;
        displayResults(results);
    }

    function displayResults(results) {
        resultsContainer.innerHTML = results.length === 0
            ? `<div class="no-results">Aucune recette trouvée pour "${searchInput.value}"</div>`
            : results.map(recipe => `
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

        resultsContainer.style.display = "block";

        document.querySelectorAll(".recipe-result").forEach(item => {
            item.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                const selectedRecipe = results[index];
    
                if (selectedRecipe) {
                    const recipeIndex = recipesData.findIndex(r => r.nom === selectedRecipe.nom);
                    viewRecipe(recipeIndex); // Ouvre la modale avec la recette correspondante
                }
            });
        });
    }

    function viewRecipe(index) {
        const recipe = allRecipes[index];
        if (!recipe) return;
    
        const modalContent = createModalContent(recipe, index);
        const modal = document.getElementById('recipeDetails');
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        openModal();
    }
    

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(performSearch, 300);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter" && searchInput.value.trim().length > 1) {
            window.location.href = `search_results.html?query=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = "none";
            searchInput.value = "";
        }
    });
}
