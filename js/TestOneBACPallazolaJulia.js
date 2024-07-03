// Default unit is pounds
let currentUnit = 'lbs';
let mRatio, fRatio;

// Set the unit based on the selected radio button
function setUnit(radio) {
    if (radio.checked) {
        currentUnit = radio.value;
        console.log("Unit set to: " + currentUnit);
    }
}

// Convert kilograms to pounds
function kgToLbs(weightInKg) {
	if (currentUnit == 'kg') {
		if (weightInKg == 0) {
		return 0;
		}
		else {
			const conversionFactor = 2.2;
			return weightInKg * conversionFactor;
		}
	}
	else if (currentUnit == 'lbs') {
		return weightInKg;
	}
}

// Calculate weight from pounds to grams
function calculateWeightInGrams(weightInPounds) {
    let weight;
    if (currentUnit === 'kg') {
        const weightInKg = parseFloat(document.getElementById("weightInput").value);
		if (weightInput <= 0) {
			weightInput = 0;
		}
		else {
			weight = kgToLbs(weightInKg);
		}
    } else {
		if (weightInPounds <= 0) {
			weight = 0;
		}
		else {
			weight = weightInPounds;
		}
    }
    return weight * 453.592; // Convert weight to grams
}

function calculateRatio() {
    const weightInPounds = parseFloat(document.getElementById("weightInput").value);
    const weightInGrams = calculateWeightInGrams(weightInPounds);

    if (document.getElementById("maleRadio").checked) {
        mRatio = weightInGrams * 0.68;
    } else if (document.getElementById("femaleRadio").checked) {
        fRatio = weightInGrams * 0.55;
        console.log("Female Ratio: " + fRatio);
    }
}

// Determine drinking category based on gender and number of drinks
function determineDrinkingCategory(numDrinks) {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    let L;
    if (gender === 'female') {
        if (numDrinks <= 1) {
            L = 0.012;
            return "Light Drinker";
        } else if (numDrinks <= 3) {
            L = 0.017;
            return "Moderate Drinker";
        } else {
            L = 0.002;
            return "Heavy Drinker";
        }
    } else if (gender === 'male') {
        if (numDrinks <= 2) {
            L = 0.012;
            return "Light Drinker";
        } else if (numDrinks <= 4) {
            L = 0.017;
            return "Moderate Drinker";
        } else {
            L = 0.02;
            return "Heavy Drinker";
        }
    } else {
        return "Unknown Gender";
    }
}
function getTimeSinceLastDrink() {
    let hours = parseFloat(document.getElementById("hoursInput").value);
    let minutes = parseFloat(document.getElementById("minutesInput").value);

    // Set default values for hours and minutes if no input is provided
    hours = isNaN(hours) ? 0 : hours;
    minutes = isNaN(minutes) ? 0 : minutes;

    // Calculate total time since last drink in hours
    return hours + (minutes / 60);
}

function alcoholDigested(numDrinks, timeSinceLastDrink) {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    let L;

    // Determine L based on gender and number of drinks
    if (gender === 'female') {
        if (numDrinks <= 1) {
            L = 0.012;
        } else if (numDrinks <= 3) {
            L = 0.017;
        } else {
            L = 0.02
        }
    } else if (gender === 'male') {
        if (numDrinks <= 2) {
            L = 0.012;
        } else if (numDrinks <= 4) {
            L = 0.017;
        } else {
            L = 0.02;
        }
    }

    // Calculate alcohol digested based on L and time since last drink
    let Q = timeSinceLastDrink * L;
    return Q;
}

// Calculate BAC based on weight, number of drinks, gender, and time since last drink
function calculateBAC() { 
    // Get input values
    const weightInput = parseFloat(document.getElementById("weightInput").value);
    const numDrinks = parseFloat(document.getElementById("numDrinksInput").value);
    const gender = document.querySelector('input[name="gender"]:checked').value;

    // Get time since last drink
    const timeSinceLastDrink = getTimeSinceLastDrink();
	
    // Convert weight to pounds if unit is kilograms
    let weight = kgToLbs(weightInput);

    // Calculate body weight in grams
    const weightInGrams = calculateWeightInGrams(weight);

    // Determine gender ratio
    let genderRatio;
    if (gender === 'male') {
		mRatio = 0.68;
        genderRatio = mRatio;
    } else {
		fRatio = 0.55;
        genderRatio = fRatio;
    }

    // Calculate BAC without considering alcohol digestion
    const BAC = ((numDrinks * 14) / (weightInGrams * genderRatio)) * 100;

    // Calculate alcohol digested (Q)
    const Q = alcoholDigested(numDrinks, timeSinceLastDrink);

    // Adjust BAC for alcohol digested
    const adjustedBAC = BAC - Q;
	if (adjustedBAC < 0) {
		return 0.00;
	}
	else {
		return adjustedBAC;
	}
}

function drinkingLevel(drinkingCategory) {
	if (drinkingCategory == 'Light Drinker') {
		return "Safe";
	}
	else if (drinkingCategory == 'Moderate Drinker') {
		return "Low-risk";
	}
	else {
		return "Binge";
	}
}

function getBACColor(drinkingCategory) {
    switch (drinkingCategory) {
        case "Light Drinker":
            return "lightgreen";
        case "Moderate Drinker":
            return "khaki";
        case "Heavy Drinker":
            return "indianred";
        default:
            return "white"; // Default color if category is unknown
    }
}

function displayBAC() {
    const calculatedBAC = calculateBAC();
    const drinkingCategory = determineDrinkingCategory(parseFloat(document.getElementById("numDrinksInput").value));

    // Display BAC and drinking category
    const finalBACElement = document.getElementById("bac-output");
	finalBACElement.innerHTML = `
		<div>
			<h2 style="text-align: center; margin-bottom: 20px;">Calculated BAC Information</h2>
			<p><strong>Current BAC:</strong> ${calculatedBAC.toFixed(4)}</p>
			<p><strong>Drinking Category:</strong> ${drinkingCategory}</p>
			<p><strong>Drinking Level:</strong> ${drinkingLevel(drinkingCategory)}</p>
		</div>
	`;  
	finalBACElement.style.backgroundColor = getBACColor(drinkingCategory);

    // Display drink images based on selected quantities
    displayDrinkImages();
    BACOutput(calculatedBAC);
}

function BACOutput(finalBAC) {
    let bacLevelDescription = "";
    let bacLevelEffect = "";

    if (finalBAC >= 0.02 && finalBAC < 0.05) {
        bacLevelDescription = "This is the lowest level of intoxication with some measurable impact on the brain and body.";
        bacLevelEffect = "You will feel relaxed, experience altered mood, feel a little warmer, and may make poor judgments";
    } else if (finalBAC >= 0.05 && finalBAC < 0.08) {
        bacLevelDescription = "At this level of BAC, your behavior will may become exaggerated.";
        bacLevelEffect = "You may speak louder and gesture more. You may also begin to lose control of small muscles, like the ability to focus your eyes, so vision will become blurry.";
    } else if (finalBAC >= 0.08 && finalBAC < 0.10) {
        bacLevelDescription = "This is the current legal limit in the U.S., other than Utah, and at this level it is considered illegal and unsafe to drive.";
        bacLevelEffect = "You will lose more coordination, so your balance, speech, reaction times, and even hearing will get worse.";
    } else if (finalBAC >= 0.10 && finalBAC < 0.15) {
        bacLevelDescription = "At this BAC, reaction time and control will be reduced.";
        bacLevelEffect = "Speech will be slurred, thinking and reasoning are slower, and the ability to coordinate your arms and legs is poor";
    } else if (finalBAC >= 0.15 && finalBAC < 0.20) {
        bacLevelDescription = "This BAC is very high. You will have much less control over your balance and voluntary muscles.";
        bacLevelEffect = "Walking and talking are difficult. You may fall and hurt yourself.";
    } else if (finalBAC >= 0.20 && finalBAC < 0.30) {
        bacLevelDescription = "Confusion, feeling dazed, and disorientation are common.";
        bacLevelEffect = "Sensations of pain will change, so if you fall and seriously hurt yourself, you may not notice, and you are less likely to do anything about it. Nausea and vomiting are likely to occur, and the gag reflex will be impaired, which could cause choking or aspirating on vomit. Blackouts begin at this BAC, so you may participate in events that you don’t remember.";
    } else if (finalBAC >= .30 && finalBAC < 0.40) {
        bacLevelDescription = "At this point, you may be unconscious and your potential for death increases.";
        bacLevelEffect = "Along with a loss of understanding, at this BAC you’ll also experience severe increases in your heart rate, irregular breathing and may have a loss of bladder control.";
    } else if (finalBAC >= 0.40) {
        bacLevelDescription = "This level of BAC may put you in a coma or cause sudden death because your heart or breathing will suddenly stop.";
        bacLevelEffect = "This is what is known as a lethal blood alcohol level";
    } else {
		bacLevelDescription = "BAC too low to affect you";
		bacLevelEffect = "None";
	}

    const bacDescriptionElement = document.getElementById("bacDescription");
    const bacEffectElement = document.getElementById("bacEffect");

	bacDescriptionElement.innerHTML = "<strong>BAC Level Description:</strong> " + bacLevelDescription;
	bacEffectElement.innerHTML = "<strong>BAC Level Effect:</strong> " + bacLevelEffect;
}
// Get the button element by its ID
const calculateBACButton = document.getElementById("calculateBAC");

// Add an event listener to the button
calculateBACButton.addEventListener("click", displayBAC);

// Function to update the total ounces display
function updateTotalOunces() {
    const totalOunces = calculateTotalOunces();
    document.getElementById("total-ounces").textContent = "Total Ounces: " + totalOunces;
}

// Function to calculate the total ounces
function calculateTotalOunces() {
    const drinkQuantities = {
        "regular-beer": 12,
        "malt-beverage": 8,
        "table-wine": 5,
        "distilled-spirit": 1.5
        // Add more quantities for additional drink types as needed
    };

    let totalOunces = 0;

    // Loop through each drink type and add the total ounces drank
    document.querySelectorAll('.drink-choice select').forEach(select => {
        const drinkType = select.id;
        const count = parseInt(select.value);
        totalOunces += drinkQuantities[drinkType] * count;
    });

    return totalOunces;
}

// Function to display drink images based on selected quantities
function displayDrinkImages() {
    const drinkChoices = document.querySelectorAll('.drink-choice');
    
    // Clear previous images from all drink containers
    drinkChoices.forEach(choice => {
        const drinkImagesContainer = choice.querySelector('.drink-images');
        drinkImagesContainer.innerHTML = "";
    });

    // Path to drink images
    const drinkImagePaths = {
        "regular-beer": "images/beer-icon.png",
        "malt-beverage": "images/glass-icon.png",
        "table-wine": "images/wine-icon.png",
        "distilled-spirit": "images/shot-icon.png"
        // Add more paths for additional drink types as needed
    };

    // Get selected quantities for each drink type and display images
    document.querySelectorAll('.drink-choice select').forEach(select => {
        const drinkType = select.id;
        const count = parseInt(select.value);

        // Display images for each selected drink type
        const drinkImagesContainer = document.getElementById(drinkType + "-images");
        for (let i = 0; i < count; i++) {
            if (drinkImagePaths.hasOwnProperty(drinkType)) {
                const drinkImage = document.createElement("img");
                drinkImage.src = drinkImagePaths[drinkType];
                drinkImagesContainer.appendChild(drinkImage);
            }
        }
    });
}

// Function to handle the click event on the calculate button
function handleCalculateClick() {
    // Update total ounces and display drink images when the button is clicked
    updateTotalOunces();
    displayDrinkImages();
}

// Listen for click events on the calculate button
document.getElementById("calculate-button").addEventListener('click', handleCalculateClick);
// Call the function initially to display the total ounces
updateTotalOunces();




document.addEventListener("DOMContentLoaded", function() {
    const calculateBACButton = document.getElementById("BACCalculator");
    const leftBox = document.getElementById("leftBox");
    const rightBox = document.getElementById("rightBox");

    calculateBACButton.addEventListener("click", function() {
        leftBox.style.transform = "translateX(-100%)"; // Move left box to the left
        rightBox.style.display = "block"; // Show right box
        rightBox.style.left = "0"; // Position right box to the right of the left box
    });
});



