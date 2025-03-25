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
}

// Display shopping list
function parseQuantity(quantityString) {
    let match = quantityString.match(/^([\d.]+)(\D*)$/);
    if (match) {
        return {
            value: parseFloat(match[1]),
            unit: match[2].trim()
        };
    }
    return { value: 0, unit: "" };
}

let shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
let listContainer = document.querySelector(".ingredients");

if (shoppingList && shoppingList.length > 0) {
    shoppingList.forEach(item => {
        
        let li = document.createElement("li");
        li.classList.add("ingredient");

        let pName = document.createElement("p");
        pName.classList.add("name");
        pName.innerHTML = item.ingredient;

        let articleQuantity = document.createElement("article");
        articleQuantity.classList.add("quantity");

        let quantityRemove = document.createElement("span");
        quantityRemove.classList.add("quantity-change");
        quantityRemove.id = "remove";
        quantityRemove.innerHTML = '<i class="fa-solid fa-minus"></i>';

        let quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.step = 1;
        quantityInput.min = 1;
        let parsedQuantity = parseQuantity(item.quantity);
        quantityInput.value = parsedQuantity.value;

        let quantityAdd = document.createElement("span");
        quantityAdd.classList.add("quantity-change");
        quantityAdd.id = "add";
        quantityAdd.innerHTML = '<i class="fa-solid fa-plus"></i>';

        articleQuantity.appendChild(quantityRemove);
        articleQuantity.appendChild(quantityInput);
        articleQuantity.appendChild(quantityAdd);

        let btnDelete = document.createElement("button");
        btnDelete.classList.add("delete");
        btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btnDelete.addEventListener("click", deleteItem);

        li.appendChild(pName);
        li.appendChild(articleQuantity);
        let unit;
        if (parsedQuantity.unit) {
            unit = document.createElement("p");
            unit.classList.add("unit");
            unit.innerHTML = `(en ${parsedQuantity.unit})`;
            li.appendChild(unit);
        }
        li.appendChild(btnDelete);

        listContainer.appendChild(li);
    });
}

// Increase or decrease number of ingredients on shopping list
let ingredients = document.querySelectorAll(".ingredient");

ingredients.forEach(ingredient => {
    let quantityAdd = ingredient.querySelector(".quantity-change#add");
    let quantityRemove = ingredient.querySelector(".quantity-change#remove");
    let quantity = ingredient.querySelector("input[type='number']");
    let ingredientName = ingredient.querySelector(".name").textContent;

    function updateQuantityInLocalStorage() {
        let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

        let ingredientToUpdate = shoppingList.find(item => item.name === ingredientName);
        if (ingredientToUpdate) {
            ingredientToUpdate.quantity = Number(quantity.value);
            localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
        }
    }

    quantityAdd.addEventListener("click", function() {
        quantity.value = Number(quantity.value) + 1;
        updateQuantityInLocalStorage();
    });

    quantityRemove.addEventListener("click", function() {
        if (quantity.value > 1) {
            quantity.value = Number(quantity.value) - 1;
            updateQuantityInLocalStorage();
        }
    });
});

// Delete item
function deleteItem() {
    const ingredientName = this.closest(".ingredient").querySelector(".name").textContent;
    let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

    shoppingList = shoppingList.filter(item => item.name !== ingredientName);
    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));

    this.closest(".ingredient").remove();
}

// Delete list
function deleteList() {
    localStorage.removeItem("shoppingList");
    window.location.reload();
}

// Generate PDF
function generatePDF() {
    let pdf = document.createElement("div");
    pdf.classList.add("list");
    pdf.classList.add("generatePDF");

    let ingredients = document.querySelectorAll(".ingredient");

    ingredients.forEach(ingredient => {
        let name = ingredient.querySelector(".name").innerText;
        let quantity = ingredient.querySelector(".quantity input").value;
        let unitElement = ingredient.querySelector(".unit");
        let unit = unitElement ? unitElement.innerText : ""; 

        let item = document.createElement("p");
        item.innerHTML = unit ? `${quantity} ${unit} - ${name}` : `${quantity} - ${name}`;
        pdf.appendChild(item);
    });

    html2pdf().from(pdf).save("liste_courses.pdf").then(() => {
        pdf.remove();
    });
}