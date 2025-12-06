// API Configuration - Change this when deploying to production
const API_BASE = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) 
  ? API_BASE_URL 
  : 'http://localhost:5000/api';

// Show message function
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                showMessage('Erreur: Réponse invalide du serveur');
                return;
            }
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Connexion réussie!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
        }
    });
}

// Password validation function
function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;
    
    return {
        valid: hasUpperCase && hasLowerCase && hasNumber && hasMinLength,
        errors: {
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasMinLength
        }
    };
}

// Signup form handler
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const confirmEmail = document.getElementById('confirmEmail').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate email match
        if (email !== confirmEmail) {
            showMessage('Les emails ne correspondent pas');
            return;
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            showMessage('Les mots de passe ne correspondent pas');
            return;
        }
        
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            const errors = [];
            if (!passwordValidation.errors.hasUpperCase) errors.push('une majuscule');
            if (!passwordValidation.errors.hasLowerCase) errors.push('une minuscule');
            if (!passwordValidation.errors.hasNumber) errors.push('un chiffre');
            if (!passwordValidation.errors.hasMinLength) errors.push('8 caractères minimum');
            showMessage(`Le mot de passe doit contenir: ${errors.join(', ')}`);
            return;
        }
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: email,
            password: password
        };
        
        try {
            const response = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                showMessage('Erreur: Réponse invalide du serveur');
                return;
            }
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('Compte créé avec succès!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage(data.message || 'Erreur lors de la création du compte');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
        }
    });
}

// Check if user is already logged in
if (window.location.pathname.includes('login.html') || 
    window.location.pathname.includes('signup.html')) {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
    }
}