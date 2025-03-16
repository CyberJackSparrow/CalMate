document.addEventListener("DOMContentLoaded", function () {
    const foodInput = document.getElementById("foodInput");
    const calorieInput = document.getElementById("calorieInput");
    const quantityInput = document.getElementById("quantity");
    const addFoodButton = document.getElementById("addFood");
    const calorieSummary = document.getElementById("calorieSummary");
    const calorieLog = document.getElementById("logFood");
    
    // Create suggestion box
    const suggestionBox = document.createElement("div");
    suggestionBox.setAttribute("id", "suggestionBox");
    suggestionBox.style.position = "absolute";
    suggestionBox.style.display = "none";
    suggestionBox.style.background = "white";
    suggestionBox.style.border = "1px solid #ccc";
    suggestionBox.style.zIndex = "1000";
    suggestionBox.style.width = foodInput.offsetWidth + "px";
    document.body.appendChild(suggestionBox);

    let totalCalories = 0;
    let selectedFoodItem = "";

    // Edamam API Credentials
    const appId = "d7cdc8be";
    const appKey = "8733798f5e506c421ab1c41d416e4424";
    const apiURL = "https://api.edamam.com/api/food-database/v2/parser";

    // Position dropdown correctly
    function positionSuggestionBox() {
        const rect = foodInput.getBoundingClientRect();
        suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionBox.style.left = `${rect.left + window.scrollX}px`;
        suggestionBox.style.width = `${rect.width}px`;
    }

    // Fetch food suggestions from Edamam API
    async function fetchFoodSuggestions(query) {
        try {
            const response = await fetch(`${apiURL}?ingr=${query}&app_id=${appId}&app_key=${appKey}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch data from API");
            }

            const data = await response.json();
            return data.hints.map(item => ({
                name: item.food.label,
                calories: item.food.nutrients.ENERC_KCAL || 0
            }));
        } catch (error) {
            console.error("API Fetch Error:", error);
            return [];
        }
    }

    // Show suggestions in dropdown
    async function showSuggestions() {
        const query = foodInput.value.trim();
        if (query.length < 2) {
            suggestionBox.innerHTML = "";
            suggestionBox.style.display = "none";
            return;
        }

        positionSuggestionBox();
        const suggestions = await fetchFoodSuggestions(query);
        suggestionBox.innerHTML = "";
        suggestionBox.style.display = "block";

        if (suggestions.length === 0) {
            suggestionBox.innerHTML = "<div class='no-results'>No suggestions found.</div>";
            return;
        }

        suggestions.forEach(suggestion => {
            const item = document.createElement("div");
            item.textContent = `${suggestion.name} (${suggestion.calories} kcal)`;
            item.classList.add("suggestion-item");
            item.style.padding = "8px";
            item.style.cursor = "pointer";
            item.style.borderBottom = "1px solid #ddd";

            item.addEventListener("click", function () {
                foodInput.value = suggestion.name;
                calorieInput.value = suggestion.calories;
                selectedFoodItem = suggestion.name;
                suggestionBox.style.display = "none";
            });

            suggestionBox.appendChild(item);
        });
    }

    function addFoodItem() {
        const foodName = selectedFoodItem || foodInput.value.trim();
        const caloriesPerItem = parseInt(calorieInput.value);
        const quantity = parseInt(quantityInput.value);

        if (foodName && !isNaN(caloriesPerItem) && !isNaN(quantity) && caloriesPerItem > 0 && quantity > 0) {
            const totalItemCalories = caloriesPerItem * quantity;
            totalCalories += totalItemCalories;
            calorieSummary.innerHTML = `Total Calories: ${totalCalories} kcal ▼`;

            const listItem = document.createElement("li");
            listItem.textContent = `${quantity}x ${foodName}: ${totalItemCalories} kcal`;
            calorieLog.appendChild(listItem);

            // Clear inputs
            foodInput.value = "";
            calorieInput.value = "";
            quantityInput.value = "";
            selectedFoodItem = "";
        }
    }

    // Meal suggestions with animations
    const mealSuggestionText = document.querySelector("#recipe-suggestion p");
    const recipeContainer = document.createElement("div");
    recipeContainer.setAttribute("id", "recipeContainer");
    recipeContainer.classList.add("hidden");
    document.querySelector("#recipe-suggestion").appendChild(recipeContainer);

    const mealSuggestions = [
        { name: "Grilled Chicken with Quinoa", recipe: "1. Grill chicken with olive oil and spices.\n2. Serve with cooked quinoa and roasted veggies." },
        { name: "Salmon with Brown Rice", recipe: "1. Bake salmon with garlic and lemon.\n2. Serve with steamed brown rice and broccoli." },
        { name: "Oatmeal with Banana & Honey", recipe: "1. Cook oats in almond milk.\n2. Add sliced banana and a drizzle of honey." },
        { name: "Greek Yogurt & Mixed Nuts", recipe: "1. Take a cup of Greek yogurt.\n2. Add almonds, walnuts, and honey for sweetness." }
    ];

    function updateMealSuggestion() {
        const randomMeal = mealSuggestions[Math.floor(Math.random() * mealSuggestions.length)];

        mealSuggestionText.innerHTML = `Try Eating <span id="mealSuggestion" class="clickable">${randomMeal.name}</span><br><small>(Click to see recipe)</small>`;

        const mealElement = document.getElementById("mealSuggestion");
        mealElement.addEventListener("click", function () {
            if (recipeContainer.classList.contains("visible")) {
                recipeContainer.classList.remove("visible");
                recipeContainer.classList.add("hidden");
            } else {
                recipeContainer.textContent = `Recipe:\n${randomMeal.recipe}`;
                recipeContainer.classList.remove("hidden");
                recipeContainer.classList.add("visible");
            }
        });
    }

    // Event Listeners
    foodInput.addEventListener("input", showSuggestions);
    addFoodButton.addEventListener("click", addFoodItem);

    // Allow Enter key to add item
    foodInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addFoodItem();
        }
    });

    quantityInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addFoodItem();
        }
    });

    calorieSummary.addEventListener("click", function () {
        calorieLog.classList.toggle("show");
    });

    // Adjust position when scrolling
    window.addEventListener("scroll", function () {
        if (suggestionBox.style.display === "block") {
            positionSuggestionBox();
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!foodInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.style.display = "none";
        }
    });

    // Update meal suggestion daily
    updateMealSuggestion();
});
