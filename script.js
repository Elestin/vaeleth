// Firebase Configuration
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

document.addEventListener('DOMContentLoaded', function() {
    // Element References
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
    const raceCreatorSection = document.getElementById('raceCreator');
    const weeklyActionsSection = document.getElementById('weeklyActions');
    const deityCreationTab = document.getElementById('deityCreationTab');
    const timelineTab = document.getElementById('timelineTab');
    const worldMapTab = document.getElementById('worldMapTab');
    const discussionBoardTab = document.getElementById('discussionBoardTab');
    const deityNameDisplay = document.getElementById('deityNameDisplay');
    const domainDisplay = document.getElementById('domainDisplay');
    const deityCreationForm = document.getElementById('domainCreationForm');

    // Hide all tabs initially
    deityCreationTab.style.display = 'none';
    raceCreatorTab.style.display = 'none';
    weeklyActionsTab.style.display = 'none';
    timelineTab.style.display = 'none';
    worldMapTab.style.display = 'none';
    discussionBoardTab.style.display = 'none';

    auth.onAuthStateChanged((user) => {
        if (user) {
            const deityRef = database.ref('deities/' + user.uid);
            deityRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    const deityData = snapshot.val();
                    // Deity exists, show Weekly Actions, Timeline, World Map, and Discussion Board
                    deityNameDisplay.textContent = deityData.name;
                    domainDisplay.textContent = deityData.domain;

                    weeklyActionsTab.style.display = 'block';
                    timelineTab.style.display = 'block';
                    worldMapTab.style.display = 'block';
                    discussionBoardTab.style.display = 'block';
                } else {
                    // No deity, show Deity Creator and Race Creator
                    deityCreationTab.style.display = 'block';
                    raceCreatorTab.style.display = 'block';
                }
            });

            document.getElementById('logoutBtn').style.display = 'block';
        } else {
            // User is logged out, hide everything
            deityCreationTab.style.display = 'none';
            raceCreatorTab.style.display = 'none';
            weeklyActionsTab.style.display = 'none';
            timelineTab.style.display = 'none';
            worldMapTab.style.display = 'none';
            discussionBoardTab.style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'none';
        }
    });

    // Deity Creator Form Submission
    deityCreationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        if (user) {
            const deityRef = database.ref('deities/' + user.uid);
            deityRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    alert("You have already created a deity. You cannot create another one.");
                } else {
                    const deityName = document.getElementById('deityName').value.trim();
                    const playerName = document.getElementById('playerName').value.trim();
                    const domainDropdown = document.getElementById('domainDropdown').value;

                    deityRef.set({
                        name: deityName,
                        playerName: playerName,
                        domain: domainDropdown
                    }).then(() => {
                        alert("Deity created successfully!");
                        deityCreationTab.style.display = 'none';
                        raceCreatorTab.style.display = 'none';
                        weeklyActionsTab.style.display = 'block';
                        timelineTab.style.display = 'block';
                        worldMapTab.style.display = 'block';
                        discussionBoardTab.style.display = 'block';

                        deityNameDisplay.textContent = deityName;
                        domainDisplay.textContent = domainDropdown;
                    }).catch((error) => {
                        console.error("Error creating deity: ", error);
                        alert("There was an error creating your deity. Please try again.");
                    });
                }
            }).catch((error) => {
                console.error("Error checking deity: ", error);
                alert("There was an error checking your deity status. Please try again.");
            });
        } else {
            alert("You must be logged in to create a deity.");
        }
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

// Race Creator Logic
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
    const raceName = raceNameInput.value.trim(); // Get the value and trim any white spaces
    if (!raceName) {
        alert("Please provide a race name!");
        return;
    }
    if (selectedCharacteristics.length === 0) {
        alert("You haven't selected any characteristics!");
        return;
    }

    const userID = auth.currentUser.uid;
    const raceRef = database.ref('races/' + userID);
    raceRef.set({
        name: raceName, // Including the race name in the data being saved
        characteristics: selectedCharacteristics,
        pointsLeft: remainingPoints
    });
    alert("Race created!");
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
});

weeklyActionsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedActions = Array.from(selectedActionsList.children).map(li => li.textContent.replace(' X', ''));

    if (selectedActions.length === 0) {
        alert("No actions have been selected for this week!");
        return;
    }

    // Saving data to Firebase Realtime Database
    const userID = auth.currentUser.uid;
    const actionsRef = database.ref('weeklyActions/' + userID);
    actionsRef.set({
        actions: selectedActions,
        resources: resources
    });

    alert("Weekly actions saved!");
});

// Logout Logic
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('User signed out');
        alert('You have been logged out.');
        // Redirect or hide/show relevant content if needed
        deityCreationTab.style.display = 'none';
        raceCreatorTab.style.display = 'none';
        weeklyActionsTab.style.display = 'none';
        timelineTab.style.display = 'none';
        worldMapTab.style.display = 'none';
        discussionBoardTab.style.display = 'none';
        document.getElementById('characterPageDiv').style.display = 'none';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

// Action Tab Management
function openTab(tabName) {
    let x = document.getElementsByClassName("tab-content");
    for (let i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}

// Example of opening tabs based on login state
auth.onAuthStateChanged((user) => {
    if (user) {
        // Show appropriate tab based on whether deity exists
        const deityRef = database.ref('deities/' + user.uid);
        deityRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                openTab('weeklyActions');
            } else {
                openTab('deityCreator');
            }
        });
    } else {
        openTab('loginForm');
    }
});

// Initial tab state management (you can change as needed)
openTab('loginForm');
}); // Ensure this closing bracket matches the opening `document.addEventListener('DOMContentLoaded', function() {` at the top
