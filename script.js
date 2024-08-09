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

// openTab FUNCTION HERE
function openTab(tabName) {
    let i, tabcontent, tablinks;

    // Hide all elements with class="tab-content" by default
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Show the specific tab content
    document.getElementById(tabName).style.display = "block";
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
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
    const logoutBtn = document.getElementById('logoutBtn');
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
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');

    // Hide all tabs initially
    deityCreationTab.style.display = 'none';
    raceCreatorTab.style.display = 'none';
    weeklyActionsTab.style.display = 'none';
    timelineTab.style.display = 'none';
    worldMapTab.style.display = 'none';
    discussionBoardTab.style.display = 'none';

        // Show the login form by default
    loginForm.style.display = 'block';

    showLogin.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    });

    showRegister.addEventListener('click', () => {
        registrationForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

function checkUserState(user) {
    const deityRef = database.ref('deities/' + user.uid);
    deityRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const deityData = snapshot.val();
            deityNameDisplay.textContent = deityData.name;
            domainDisplay.textContent = deityData.domain;

            // Check if the user has a race
            const raceRef = database.ref('races/' + user.uid);
            raceRef.once('value').then(raceSnapshot => {
                if (raceSnapshot.exists()) {
                    // Race exists, show Weekly Actions and hide others
                    openTab('weeklyActions');
                    weeklyActionsTab.style.display = 'block';
                    timelineTab.style.display = 'block';
                    worldMapTab.style.display = 'block';
                    discussionBoardTab.style.display = 'block';
                    deityCreationTab.style.display = 'none';
                    raceCreatorTab.style.display = 'none';
                } else {
                    // No race, show Race Creator and hide others
                    openTab('raceCreator');
                    raceCreatorTab.style.display = 'block';
                    weeklyActionsTab.style.display = 'none';
                    timelineTab.style.display = 'none';
                    worldMapTab.style.display = 'none';
                    discussionBoardTab.style.display = 'none';
                }
            });
        } else {
            // No deity, show Deity Creator and hide others
            openTab('deityCreator');
            deityCreationTab.style.display = 'block';
            raceCreatorTab.style.display = 'none';
            weeklyActionsTab.style.display = 'none';
            timelineTab.style.display = 'none';
            worldMapTab.style.display = 'none';
            discussionBoardTab.style.display = 'none';
        }
    });
}

    // Authentication State Change Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        // Hide the authContainer when the user is logged in
        document.getElementById('authContainer').style.display = 'none';
        checkUserState(user); // Check user state after login
        logoutBtn.style.display = 'block';
    } else {
        // Show the authContainer and default to the login form
        document.getElementById('authContainer').style.display = 'block';
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none'; // Ensure registration form is hidden by default
        deityCreationTab.style.display = 'none';
        raceCreatorTab.style.display = 'none';
        weeklyActionsTab.style.display = 'none';
        timelineTab.style.display = 'none';
        worldMapTab.style.display = 'none';
        discussionBoardTab.style.display = 'none';
        logoutBtn.style.display = 'none';
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
                    checkUserState(user); // Check for race after deity creation
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
            checkUserState(user); // Check user state after login
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
    const raceName = raceNameInput.value.trim();  // Get the value and trim any white spaces
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
        name: raceName,  // Including the race name in the data being saved
        characteristics: selectedCharacteristics,
        pointsLeft: remainingPoints
    }).then(() => {
        alert("Race created successfully!");

        // Move to Weekly Actions and hide the Deity Creator and Race Creator tabs
        openTab('weeklyActions');
        deityCreationTab.style.display = 'none';
        raceCreatorTab.style.display = 'none';
        weeklyActionsTab.style.display = 'block';
        timelineTab.style.display = 'block';
        worldMapTab.style.display = 'block';
        discussionBoardTab.style.display = 'block';
        logoutBtn.style.display = 'block';
    }).catch((error) => {
        console.error("Error creating race: ", error);
        alert("There was an error creating your race. Please try again.");
    });
});




    // Logout Logic
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log('User signed out');
            alert('You have been logged out.');
            // Redirect or hide/show relevant content if needed
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
});
