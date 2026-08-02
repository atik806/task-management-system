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

// ---- Inline Validation Helpers (replaces alert()) ----

// Highlight a single field and show its message
function setError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input-error');
    const wrap = input.closest('.field');
    if (wrap) {
        const msg = wrap.querySelector('.error-msg');
        if (msg) msg.textContent = message;
    }
}

// Show a form-level error banner
function setFormError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;
    const el = form.querySelector('.form-error');
    if (el) {
        el.textContent = message;
        el.hidden = false;
    }
}

// Clear all field + form errors inside a form
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    const formError = form.querySelector('.form-error');
    if (formError) {
        formError.textContent = '';
        formError.hidden = true;
    }
}

// Clear a field's error as soon as the user types
document.querySelectorAll('input[id]').forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const wrap = input.closest('.field');
        if (wrap) {
            const msg = wrap.querySelector('.error-msg');
            if (msg) msg.textContent = '';
        }
        const form = input.closest('form');
        if (form) {
            const formError = form.querySelector('.form-error');
            if (formError) {
                formError.textContent = '';
                formError.hidden = true;
            }
        }
    });
});

// Login
loginSubmit.addEventListener('click', async () => {
    clearFormErrors('loginForm');
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (!email) { setError('emailInput', 'Please enter your email'); }
    if (!password) { setError('passwordInput', 'Please enter your password'); }
    if (!email || !password) return;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        setFormError('loginForm', error.message);
    }
});

// Register
registerSubmit.addEventListener('click', async () => {
    clearFormErrors('signupForm');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!name) { setError('signupName', 'Please enter your name'); }
    if (!email) { setError('signupEmail', 'Please enter your email'); }
    if (!password) { setError('signupPassword', 'Please enter a password'); }
    if (!confirmPassword) { setError('signupConfirmPassword', 'Please confirm your password'); }
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
        setError('signupPassword', 'Passwords do not match');
        setError('signupConfirmPassword', 'Passwords do not match');
        return;
    }

    if (password.length < 6) {
        setError('signupPassword', 'Password must be at least 6 characters long');
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        setFormError('signupForm', error.message);
    }
});

// Google Sign In (Login Modal)
googleLoginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        setFormError('loginForm', 'Google sign in failed: ' + error.message);
    }
});

// Google Sign Up (Signup Modal)
googleSignupBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        // Redirect will happen automatically via onAuthStateChanged
    } catch (error) {
        setFormError('signupForm', 'Google sign up failed: ' + error.message);
    }
});

// ---- UI Enhancements ----

// Enter key submits the form
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    loginSubmit?.click();
});

signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    registerSubmit?.click();
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

function closeMobileNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    const icon = navToggle.querySelector('i');
    if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
    }
}

if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-xmark', isOpen);
        }
    });

    // Close panel when a nav link is chosen
    primaryNav.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}

// Close the mobile panel + clear login errors whenever a login button opens the modal
[landingLoginBtn, heroLoginBtn, ctaLoginBtn, footerLoginBtn].forEach(btn => {
    btn?.addEventListener('click', () => {
        closeMobileNav();
        clearFormErrors('loginForm');
    });
});

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Scroll spy — highlight the nav link of the section in view
const spySections = ['how-it-works', 'features', 'testimonials', 'faq', 'about'];
const navLinks = primaryNav ? primaryNav.querySelectorAll('a[href^="#"]') : [];
const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
    });
}, { rootMargin: '-40% 0px -55% 0px' });

spySections.forEach(id => {
    const el = document.getElementById(id);
    if (el) spyObserver.observe(el);
});

// Scroll reveal — fade sections up as they enter the viewport
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// FAQ — only one item open at a time
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            document.querySelectorAll('.faq-item[open]').forEach(other => {
                if (other !== item) other.open = false;
            });
        }
    });
});

// Password show / hide toggles
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const wrap = toggle.closest('.input-wrap');
        const input = wrap ? wrap.querySelector('input') : null;
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye', !show);
            icon.classList.toggle('fa-eye-slash', show);
        }
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
});

// Escape closes any open modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    }
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Dark Mode ----
const themeToggleBtn = document.getElementById('themeToggle');

function syncThemeToggle(isDark) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-moon', !isDark);
        icon.classList.toggle('fa-sun', isDark);
        icon.classList.remove('icon-pop');
        void icon.offsetWidth; // restart the pop animation
        icon.classList.add('icon-pop');
    }
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.setAttribute('title', label);
}

function applyTheme(isDark, animate = true) {
    const commit = () => {
        document.body.classList.toggle('dark-mode', isDark);
        syncThemeToggle(isDark);
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {
            /* private mode — ignore */
        }
    };

    // Same storage key + class as the dashboard, so the choice carries across pages.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && !reduced && document.startViewTransition) {
        document.startViewTransition(commit);
    } else {
        commit();
    }
}

// Apply saved theme on load (no animation — avoids a flash on first paint)
applyTheme((localStorage.getItem('theme') || 'light') === 'dark', false);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        applyTheme(!document.body.classList.contains('dark-mode'));
    });
}
