const meals = ["Midi", "Soir"];
let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

// Get Monday of current week
function getMondayOfWeek(date) {
    let day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    let difference = date.getDate() - day + (day == 0 ? -6 : 1); // If today is Sunday, we go back 6 days to get Monday.
    date.setDate(difference);
    date.setHours(0, 0, 0, 0); // Reset the time to keep only the date
    return date;
}

// Format a date in the format "dd/mm/yyyy"
function formatDate(date) {
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Calculate the current week from a given date
function calculateWeek(date) {
    let mondayOfWeek = getMondayOfWeek(new Date(date));
    let daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
        let currentDay = new Date(mondayOfWeek);
        currentDay.setDate(mondayOfWeek.getDate() + i);
        daysOfWeek.push(formatDate(currentDay));
    }
    return daysOfWeek;
}

// Load schedule from localStorage
let planning = JSON.parse(localStorage.getItem("mealPlanning")) || {};
let currentWeekStartDate = new Date();

// Show week at top of page
function displayWeek(weekDays) {
    let weekDisplay = document.getElementById("week-display");
    weekDisplay.innerHTML = `Semaine du ${weekDays[0]} au ${weekDays[6]}`;
}

// Show the schedule
const renderPlanning = (weekDays) => {
    const container = document.getElementById("planning-container");
    container.innerHTML = ""; // Reset display

    weekDays.forEach((date, index) => {
        const day = new Date(currentWeekStartDate);
        day.setDate(currentWeekStartDate.getDate() + index);
        const dayName = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][index];

        const card = document.createElement("div");
        card.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "border", "border-gray-200");

        const dayTitle = document.createElement("h3");
        dayTitle.classList.add("text-xl", "font-semibold", "text-center");
        dayTitle.textContent = `${dayName} (${formatDate(day)})`;
        card.appendChild(dayTitle);

        meals.forEach((meal) => {
            const mealSelect = document.createElement("select");
            mealSelect.setAttribute("data-day", date);
            mealSelect.setAttribute("data-meal", meal);
            mealSelect.classList.add("mt-4", "p-2", "w-full", "border", "rounded-md", "border-gray-300", "bg-gray-50", "text-gray-400");

            // Add options for favorite recipes
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = `Sélectionner une recette pour le ${meal}`;
            mealSelect.appendChild(defaultOption);

            favorites.forEach((recipe) => {
                const option = document.createElement("option");
                option.value = recipe.nom;
                option.textContent = recipe.nom;
                mealSelect.appendChild(option);
            });

            // Pre-select the recipe if it is already in the schedule
            if (planning[date] && planning[date][meal]) {
                mealSelect.value = planning[date][meal];
            }

            // Manage recipe selection
            mealSelect.addEventListener("change", (e) => {
                const selectedRecipe = e.target.value;
                if (!planning[date]) {
                    planning[date] = {};
                }
                planning[date][meal] = selectedRecipe;
                localStorage.setItem("mealPlanning", JSON.stringify(planning));
                renderPlanning(weekDays); // Re-render after modification
            });

            card.appendChild(mealSelect);

            // Show selected recipe
            if (planning[date] && planning[date][meal]) {
                mealSelect.classList.add("text-gray-800");
            }
        });

        container.appendChild(card);
    });
};

// Reset the visible week schedule
document.getElementById("reset-planning-btn").addEventListener("click", () => {
    const weekDays = calculateWeek(currentWeekStartDate); // Get the days of the current week
    weekDays.forEach((date) => {
        // Delete meals for each day of the week visible
        if (planning[date]) {
            delete planning[date]; // Delete only this week's meals
        }
    });
    localStorage.setItem("mealPlanning", JSON.stringify(planning)); // Save changes to localStorage
    renderPlanning(weekDays); // Re-render after reset
});

// Navigation between weeks
document.getElementById("previous-week-btn").addEventListener("click", () => {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7); // Go back one week
    const weekDays = calculateWeek(currentWeekStartDate);
    displayWeek(weekDays);
    renderPlanning(weekDays);
});

document.getElementById("next-week-btn").addEventListener("click", () => {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7); // Move forward one week
    const weekDays = calculateWeek(currentWeekStartDate);
    displayWeek(weekDays);
    renderPlanning(weekDays);
});

// Initialize the display
const weekDays = calculateWeek(currentWeekStartDate);
displayWeek(weekDays);
renderPlanning(weekDays);

function generatePDF(weekDays, planning) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(18);
    doc.text("Planning des repas de la semaine", 10, 10);
    doc.setFontSize(12);

    const startX = 10;
    const startY = 20;
    const cellWidth = 50;
    const cellHeight = 15;

    // En-tête du tableau
    doc.setFont(undefined, "bold");
    doc.rect(startX, startY, cellWidth, cellHeight); // Case vide en haut à gauche
    doc.text("Jour", startX + 15, startY + 10);
    doc.rect(startX + cellWidth, startY, cellWidth, cellHeight);
    doc.text("Midi", startX + cellWidth + 15, startY + 10);
    doc.rect(startX + cellWidth * 2, startY, cellWidth, cellHeight);
    doc.text("Soir", startX + cellWidth * 2 + 15, startY + 10);

    let yPosition = startY + cellHeight;
    doc.setFont(undefined, "normal");

    weekDays.forEach((date, index) => {
        const dayName = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][index];
        
        doc.rect(startX, yPosition, cellWidth, cellHeight);
        doc.text(`${dayName} (${date})`, startX + 5, yPosition + 10);
        
        doc.rect(startX + cellWidth, yPosition, cellWidth, cellHeight);
        doc.text(planning[date]?.["Midi"] || "-", startX + cellWidth + 5, yPosition + 10);
        
        doc.rect(startX + cellWidth * 2, yPosition, cellWidth, cellHeight);
        doc.text(planning[date]?.["Soir"] || "-", startX + cellWidth * 2 + 5, yPosition + 10);
        
        yPosition += cellHeight;
    });

    doc.save("Planning_Repas.pdf");
}