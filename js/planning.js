let favoriteRecipes = localStorage.getItem("favoriteRecipes");

if (favoriteRecipes) {
    favoriteRecipes = JSON.parse(favoriteRecipes);

    favoriteRecipes.forEach((recipe, index) => {
        let containerFavoriteRecipes = document.querySelector(".containerFavoriteRecipes");
        let recipeCard = document.createElement("article");
        recipeCard.className = "favorites bg-white rounded-lg shadow-md overflow-hidden w-full min-h-[400px] flex flex-col";
        containerFavoriteRecipes.appendChild(recipeCard);

        let div = document.createElement("div");
        div.className = "p-4 flex-grow flex flex-col";

        let h2 = document.createElement("h2");
        h2.className = "font-bold text-lg mb-2 pb-4 line-clamp-2";
        h2.innerHTML = recipe.nom;

        let img = document.createElement("img");
        img.className = "h-60 object-cover rounded";
        img.src = recipe.image;
        img.alt = recipe.nom;

        let categorie = document.createElement("p");
        categorie.className = "text-gray-600 mb-1";
        categorie.innerHTML = recipe.categorie;

        let time = document.createElement("p");
        time.className = "text-gray-500 text-sm";
        time.innerHTML = `⏱ + ${recipe.temps_preparation}`;

        let divBtn = document.createElement("div");
        divBtn.className = "mt-auto flex justify-between items-center";
        let btnView = document.createElement("button");
        btnView.className = "viewRecipeButton";
        btnView.innerHTML = "Voir la recette";
        btnView.onclick = () => viewRecipe(index);
        let btnFavorite = document.createElement("button");
        btnFavorite.innerHTML = '<i class="fa-solid fa-heart"></i>';
        btnFavorite.onclick = () => toggleFavorite(index);
        divBtn.appendChild(btnView);
        divBtn.appendChild(btnFavorite);

        div.appendChild(h2);
        div.appendChild(img);
        div.appendChild(categorie);
        div.appendChild(time);
        div.appendChild(divBtn);
        recipeCard.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    let recipes = document.querySelectorAll(".favorites");
    let containerFavoriteRecipes = document.querySelector(".containerFavoriteRecipes");
    let planningContainer = document.querySelector(".menu");

    function enableDragAndDrop() {
        recipes.forEach(recipe => {
            recipe.draggable = true;
            recipe.addEventListener("dragstart", handleDragStart);

            // Vérifie si la recette est dans le planning ou dans les favoris
            if (planningContainer.contains(recipe)) {
                recipe.classList.add("favoritesMenu"); // Applique la taille réduite dans le planning
                recipe.classList.remove("favoritesScroll"); // Enlève la taille normale des favoris
            } else if (containerFavoriteRecipes.contains(recipe)) {
                recipe.classList.add("favoritesScroll"); // Applique la taille normale des favoris
                recipe.classList.remove("favoritesMenu"); // Enlève la taille réduite du planning
            }
        });

        document.querySelectorAll(".day").forEach(day => {
            let lunch = day.querySelector(".lunch");
            let diner = day.querySelector(".diner");

            lunch.addEventListener("dragover", handleDragOver);
            lunch.addEventListener("drop", handleDrop);

            diner.addEventListener("dragover", handleDragOver);
            diner.addEventListener("drop", handleDrop);
        });

        containerFavoriteRecipes.addEventListener("dragover", handleDragOver);
        containerFavoriteRecipes.addEventListener("drop", handleDrop);
    }

    let draggedRecipe = null;

    function handleDragStart(event) {
        draggedRecipe = event.target;
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();

        if (draggedRecipe) {
            if (event.target.classList.contains("lunch") || event.target.classList.contains("diner")) {
                event.target.appendChild(draggedRecipe);
            } else if (event.target === containerFavoriteRecipes) {
                containerFavoriteRecipes.appendChild(draggedRecipe);
            }
            draggedRecipe = null;
        }
    }

    enableDragAndDrop();
});