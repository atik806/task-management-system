import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC44hfwlFlsShip1xw5UamUv3u79s-FGVg",
    authDomain: "task-management-system-9f068.firebaseapp.com",
    projectId: "task-management-system-9f068",
    storageBucket: "task-management-system-9f068.firebasestorage.app",
    messagingSenderId: "246762190630",
    appId: "1:246762190630:web:3ee3c2e9ea80e97deef3e7",
    measurementId: "G-JGDYPZTRTL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLoginModal = document.querySelector('#loginModal .close');
const closeSignupModal = document.querySelector('#signupModal .close');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleSignupBtn = document.getElementById('googleSignupBtn');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const landingLoginBtn = document.getElementById('landingLoginBtn');
const heroLoginBtn = document.getElementById('heroLoginBtn');
const ctaLoginBtn = document.getElementById('ctaLoginBtn');
const footerLoginBtn = document.getElementById('footerLoginBtn');

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in, redirect to app
        window.location.href = '/app';
    }
});

// Open modal when any login button is clicked
function openLoginModal(e) {
    e.preventDefault();
    loginModal.style.display = 'block';
}

landingLoginBtn.addEventListener('click', openLoginModal);
heroLoginBtn.addEventListener('click', openLoginModal);
ctaLoginBtn.addEventListener('click', openLoginModal);
footerLoginBtn.addEventListener('click', openLoginModal);

// Close modals
closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

closeSignupModal.addEventListener('click', () => {
    signupModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === signupModal) {
        signupModal.style.display = 'none';
    }
});

// Switch between login and signup
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    signupModal.style.display = 'block';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.style.display = 'none';
    loginModal.style.display = 'block';
});

// Login
loginSubmit.addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Register
registerSubmit.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
});

// Google Sign In (Login Modal)
googleLoginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        alert('Google sign in failed: ' + error.message);
    }
});

// Google Sign Up (Signup Modal)
googleSignupBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        alert('Google sign up failed: ' + error.message);
    }
});
