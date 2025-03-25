// Add to shopping list
function addToShoppingList(ingredient, quantity = "1") {
    let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

    let existingItem = shoppingList.find(item => item.ingredient === ingredient);

    if (existingItem) {
        let existingQuantity = parseFloat(existingItem.quantity);
        let quantityNumber = parseFloat(quantity);
        let unit = existingItem.quantity.replace(existingQuantity, "").trim();

        existingItem.quantity = (existingQuantity + quantityNumber) + unit;

    } else {
        shoppingList.push({ ingredient: ingredient, quantity: quantity });
    }

    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
    console.log(JSON.parse(localStorage.getItem("shoppingList")));
}

// Number of ingredients on shopping list
let ingredients = document.querySelectorAll(".ingredient");

ingredients.forEach(ingredient => {
    let quantityAdd = ingredient.querySelector(".quantity-change#add");
    let quantityRemove = ingredient.querySelector(".quantity-change#remove");
    let quantity = ingredient.querySelector("input[type='number']");

    quantityAdd.addEventListener("click", function() {
        quantity.value = Number(quantity.value) + 1;
    });

    quantityRemove.addEventListener("click", function() {
        if (quantity.value > 1) {
            quantity.value = Number(quantity.value) - 1;
        }
    });

    let btnDelete = ingredient.querySelector(".delete");
    btnDelete.addEventListener("click", function() {
        ingredient.style.display = "none";
    });
});


// Generate PDF
function generatePDF() {
    let pdf = document.createElement("div");
    pdf.classList.add("list");
    pdf.classList.add("generatePDF");

    let ingredients = document.querySelectorAll(".ingredient");

    ingredients.forEach(ingredient => {
        if (ingredient.style.display !== "none") {
            let name = ingredient.querySelector(".name").innerText;
            let quantity = ingredient.querySelector(".quantity input").value;

            let item = document.createElement("p");
            item.textContent = `${quantity} - ${name}`;
            pdf.appendChild(item);
        }
    });

    html2pdf().from(pdf).save("liste_courses.pdf").then(() => {
        pdf.remove();
    });
}

// Delete list
function deleteList() {

}