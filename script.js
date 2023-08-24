        // Configuration from Firebase Console
    const firebaseConfig = {
        apiKey: "AIzaSyA63cEw6eNLIrgM-85otGF2lzzOgbT6Po0",
        authDomain: "vaeleth-5a9d4.firebaseapp.com",
        databaseURL: "https://vaeleth-5a9d4-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "vaeleth-5a9d4",
        storageBucket: "vaeleth-5a9d4.appspot.com",
        messagingSenderId: "177032092540",
        appId: "1:177032092540:web:e59d76832057f3e09fe2f9"
    };    
// Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    const database = firebase.database();
    const auth = firebase.auth();


async function submitRaceToDB(name, characteristics) {
    try {
        const response = await fetch('http://localhost:3000/api/race', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                characteristics: characteristics
            })
        });

        if (response.ok) {
            alert('Race saved successfully!');
        } else {
            alert('Failed to save race.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save race.');
    }
}

function openTab(tabName) {
    let x = document.getElementsByClassName("tab-content");
    for (let i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('User signed out');
        alert('You have been logged out.');
        // Redirect or hide/show relevant content if needed
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Race Creator Logic
    const raceCreationForm = document.getElementById('raceCreationForm');
    const characteristicDropdown = document.getElementById('characteristicDropdown');
    const addCharacteristicBtn = document.getElementById('addCharacteristicBtn');
    const selectedCharacteristicsList = document.getElementById('selectedCharacteristicsList');
    const characteristicDescription = document.getElementById('characteristicDescription');
    const pointsDisplay = document.getElementById('points');
    const raceNameInput = document.getElementById('raceName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerBtn = document.getElementById('registerBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const raceCreatorTab = document.getElementById('raceCreatorTab');
    const weeklyActionsTab = document.getElementById('weeklyActionsTab');
    const raceCreatorSection = document.getElementById('raceCreator'); // Assuming this is the ID of the div
    const weeklyActionsSection = document.getElementById('weeklyActions'); // Assuming this is the ID of the div
    const deityCreationTab = document.getElementById('deityCreationTab');

    // Assuming user is logged in
const user = auth.currentUser;
if (user) {
    const deityData = {
        name: deityName,  // Assuming you have some input for this
        domain: deityDomain  // And this
        // ... Add any other relevant details
    };

    const userDeityRef = database.ref('deities/' + user.uid);
    userDeityRef.set(deityData);
}

    

function hideDeityCreationTab() {
    deityCreationTab.style.display = 'none';
}

function showDeityCreationTab() {
    deityCreationTab.style.display = 'block';
}
    
    raceCreatorTab.style.display = 'none';
    weeklyActionsTab.style.display = 'none';
    raceCreatorSection.style.display = 'none';
    weeklyActionsSection.style.display = 'none';
    
// Firebase Authentication State Change Listener
auth.onAuthStateChanged((user) => {
    const logoutButton = document.getElementById('logoutBtn');
    
    if (user) {
        // User is signed in.
        logoutButton.style.display = 'block'; // Show logout button
        deityCreationTab.style.display = 'block'; // Show deity creator tab

        const deityRef = database.ref('deities/' + user.uid);
        deityRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                // Deity exists for this user
                hideDeityCreationTab();
            } else {
                // No deity for this user
                showDeityCreationTab();
            }
        });
        
        raceCreatorTab.style.display = 'block';
        weeklyActionsTab.style.display = 'block';
    } else {
        // No user is signed in.
        logoutButton.style.display = 'none'; // Hide logout button
        deityCreationTab.style.display = 'none'; // Hide deity creator tab
        
        raceCreatorTab.style.display = 'none';
        weeklyActionsTab.style.display = 'none';
        raceCreatorSection.style.display = 'none';
        weeklyActionsSection.style.display = 'none';
    }
});



    let remainingPoints = 100;
    let selectedCharacteristics = [];

    characteristicDropdown.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const description = selectedOption.getAttribute('data-description');
        characteristicDescription.textContent = description ? description : "Select a characteristic to see its description.";
    });

    addCharacteristicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedOption = characteristicDropdown.options[characteristicDropdown.selectedIndex];
        const characteristicValue = selectedOption.value;
        const cost = parseInt(selectedOption.getAttribute('data-cost'));

        if (remainingPoints - cost >= 0 && !selectedCharacteristics.includes(characteristicValue)) {
            remainingPoints -= cost;
            selectedCharacteristics.push(characteristicValue);
            
            const listItem = document.createElement('li');
            listItem.textContent = selectedOption.textContent;

            // Removal logic similar to Weekly Actions
            const removeBtn = document.createElement('span');
            removeBtn.innerHTML = ' X';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.color = 'red';
            removeBtn.style.marginLeft = '10px';
            removeBtn.addEventListener('click', function() {
                remainingPoints += cost;
                selectedCharacteristics = selectedCharacteristics.filter(item => item !== characteristicValue);
                pointsDisplay.textContent = remainingPoints;
                listItem.remove();
            });

            listItem.appendChild(removeBtn);
            selectedCharacteristicsList.appendChild(listItem);
        } else if (selectedCharacteristics.includes(characteristicValue)) {
            alert("This characteristic has already been selected.");
        } else {
            alert("Not enough points for this characteristic.");
        }
        pointsDisplay.textContent = remainingPoints;
    });


    raceCreationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const raceName = raceNameInput.value.trim();  // Get the value and trim any white spaces
        if (!raceName) {
        alert("Please provide a race name!");
        return;
        }
        if (selectedCharacteristics.length === 0) {
            alert("You haven't selected any characteristics!");
            return;
        }
                // Saving data to Firebase Realtime Database
        const userID = auth.currentUser.uid;
        const userRaceRef = database.ref('races/' + userID);
        const raceRef = database.ref('races');
        const newRaceRef = raceRef.push();
        newRaceRef.set({
            name: raceName,  // Including the race name in the data being saved
            characteristics: selectedCharacteristics,
            pointsLeft: remainingPoints
        });
        alert("Race created!");
    });

    // Deity Creator Logic
const deityCreationForm = document.getElementById('domainCreationForm');

deityCreationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = firebase.auth().currentUser;

    if(user){
        // Saving deity to Firebase Realtime Database under the user's unique ID
        const deityRef = database.ref('deities/' + user.uid);
        
        deityRef.set({
            name: deityName,
            playerName: playerName,
            domain: domainDropdown
        });

        alert("Deity created!");
    } else {
        alert("Please login to create a deity.");
    }
});



    // Weekly Actions Logic
    const actionDropdown = document.getElementById('actionDropdown');
    const actionInfo = document.getElementById('actionInfo'); // Assuming this is the element you are using to display action details
    const addActionBtn = document.getElementById('addActionBtn');
    const selectedActionsList = document.getElementById('selectedActionsList');
    const weeklyActionsForm = document.getElementById('weeklyActionsForm');
    const resources = {
        actionPoints: 10,
        wealthPoints: 20,
        magicPoints: 15,
        influencePoints: 25,
        commandPoints: 12
    };

    function updateResourceDisplays() {
        for (let key in resources) {
            const element = document.getElementById(key);
            if (element) element.textContent = resources[key];
        }
    }

    actionDropdown.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const description = selectedOption.getAttribute('data-description');
        const costData = JSON.parse(selectedOption.getAttribute('data-cost'));
        let costString = "";

        for (let resource in costData) {
            costString += `${resource.toUpperCase()}: ${costData[resource]} `;
        }

        actionInfo.innerHTML = `<strong>Description:</strong> ${description ? description : "Select an action to see its description."} <br><strong>Cost:</strong> ${costString}`;
    });

    addActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedOption = actionDropdown.options[actionDropdown.selectedIndex];
        const cost = JSON.parse(selectedOption.getAttribute('data-cost'));

        for (let resource in cost) {
            let resourceKey = `${resource}Points`;
            if (resources[resourceKey] < cost[resource]) {
                alert(`Not enough ${resourceKey.replace('Points', '').toUpperCase()} points for this action.`);
                return;
            }
        }

        for (let resource in cost) {
            let resourceKey = `${resource}Points`;
            resources[resourceKey] -= cost[resource];
        }

        updateResourceDisplays();

        const listItem = document.createElement('li');
        listItem.textContent = selectedOption.textContent;

        const removeBtn = document.createElement('span');
        removeBtn.innerHTML = ' X';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.color = 'red';
        removeBtn.style.marginLeft = '10px';
        removeBtn.addEventListener('click', function() {
            const costRefund = JSON.parse(selectedOption.getAttribute('data-cost'));
            for (let resource in costRefund) {
                let resourceKey = `${resource}Points`;
                resources[resourceKey] += costRefund[resource];
            }
            updateResourceDisplays();
            listItem.remove();
        });

        listItem.appendChild(removeBtn);
        selectedActionsList.appendChild(listItem);
        
    weeklyActionsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedActions = Array.from(selectedActionsList.children).map(li => li.textContent.replace(' X', ''));

    if (selectedActions.length === 0) {
        alert("No actions have been selected for this week!");
        return;
    }

    // Saving data to Firebase Realtime Database
    const userID = auth.currentUser.uid;
    const userRaceRef = database.ref('races/' + userID);
    const actionsRef = database.ref('weeklyActions');
    const newActionsRef = actionsRef.push();
    newActionsRef.set({
        actions: selectedActions,
        resources: resources
    });

    alert("Weekly actions saved!");
});

    });
    
    // Registration Logic
registerBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const email = registerEmail.value;
    const password = registerPassword.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((user) => {
            console.log("User registered successfully", user);
            // You might want to hide registration form and show user's personal content here
        })
        .catch((error) => {
            console.error("Error registering user", error.message);
        });
});

// Login Logic
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((user) => {
    console.log("User logged in successfully", user);
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'none';
    // Show the user's sections here
    document.getElementById('characterPageDiv').style.display = 'block'; // example
})
        .catch((error) => {
            console.error("Error logging in", error.message);
        });
});
});



