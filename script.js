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
