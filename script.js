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

const auth = firebase.auth();
const database = firebase.database();

// Simple Authentication Test
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');

    // Register New User
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = registerEmail.value;
        const password = registerPassword.value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((user) => {
                console.log("User registered successfully:", user);
            })
            .catch((error) => {
                console.error("Error registering user:", error.message);
            });
    });

    // Login Existing User
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = loginEmail.value;
        const password = loginPassword.value;

        auth.signInWithEmailAndPassword(email, password)
            .then((user) => {
                console.log("User logged in successfully:", user);
                // Test Writing to Firebase
                database.ref('test/' + user.user.uid).set({
                    message: "User logged in and can write to database!"
                });
            })
            .catch((error) => {
                console.error("Error logging in:", error.message);
            });
    });
});

// Reintroducing Deity Creation Logic
document.addEventListener('DOMContentLoaded', function() {
    const deityCreationForm = document.getElementById('domainCreationForm');
    const deityCreationTab = document.getElementById('deityCreationTab');
    const weeklyActionsTab = document.getElementById('weeklyActionsTab');
    const deityNameDisplay = document.getElementById('deityNameDisplay');
    const domainDisplay = document.getElementById('domainDisplay');

    auth.onAuthStateChanged((user) => {
        if (user) {
            const deityRef = database.ref('deities/' + user.uid);
            deityRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    const deityData = snapshot.val();
                    // Deity exists, show Weekly Actions and deity info
                    deityNameDisplay.textContent = deityData.name;
                    domainDisplay.textContent = deityData.domain;

                    weeklyActionsTab.style.display = 'block';
                    deityCreationTab.style.display = 'none';
                } else {
                    // No deity, show Deity Creator
                    deityCreationTab.style.display = 'block';
                    weeklyActionsTab.style.display = 'none';
                }
            });

            document.getElementById('logoutBtn').style.display = 'block';
        } else {
            // User is logged out, hide everything
            deityCreationTab.style.display = 'none';
            weeklyActionsTab.style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'none';
        }
    });

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
                        weeklyActionsTab.style.display = 'block';

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

