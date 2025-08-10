// Login functionality with space theme
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.querySelector('.login-btn');

    // Default credentials
    const DEFAULT_USERNAME = 'admin';
    const DEFAULT_PASSWORD = 'admin123';

    // Add cosmic particle effect on input focus
    addParticleEffects();

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Handle Enter key in password field
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Add input animations
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            createRippleEffect(this);
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous error
        hideError();

        // Validate inputs
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        // Show loading state
        showLoading();

        // Simulate authentication delay for better UX
        setTimeout(() => {
            if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
                // Successful login
                successfulLogin();
            } else {
                // Failed login
                hideLoading();
                showError('Invalid credentials. Try admin/admin123');
                addShakeAnimation();
            }
        }, 1500);
    }

    function successfulLogin() {
        // Add success animation
        loginBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)';
        loginBtn.innerHTML = '<span>🚀 Mission Launched!</span>';
        
        // Create success particles
        createSuccessParticles();
        
        // Redirect to dashboard after animation
        setTimeout(() => {
            window.location.href = 'pages/dashboard.html';
        }, 2000);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.classList.remove('show');
    }

    function showLoading() {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
    }

    function hideLoading() {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }

    function addShakeAnimation() {
        const card = document.querySelector('.login-card');
        card.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            card.style.animation = 'cardGlow 4s ease-in-out infinite alternate';
        }, 500);
    }

    function createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        element.parentElement.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    function addParticleEffects() {
        // Create additional cosmic elements on interaction
        const inputs = document.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                createFloatingParticles(this);
            });
        });
    }

    function createFloatingParticles(element) {
        const rect = element.getBoundingClientRect();
        const particles = 5;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #87CEEB, transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation: floatUp 2s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }

    function createSuccessParticles() {
        const container = document.querySelector('.login-container');
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particle';
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, #10b981, #34d399);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: 50%;
                top: 50%;
                animation: explode 2s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            `;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2500);
        }
    }

    // Add dynamic styles for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        @keyframes floatUp {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px) scale(0.5);
            }
        }
        
        @keyframes explode {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(0);
            }
            50% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1) translateX(${Math.random() * 200 - 100}px) translateY(${Math.random() * 200 - 100}px);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5) translateX(${Math.random() * 300 - 150}px) translateY(${Math.random() * 300 - 150}px);
            }
        }
        
        .input-group.focused label {
            color: #60a5fa;
            text-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
        }
        
        .ripple {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 10px;
            background: radial-gradient(circle, rgba(135, 206, 250, 0.1) 0%, transparent 70%);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes rippleEffect {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleLogin();
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            usernameInput.value = '';
            passwordInput.value = '';
            hideError();
            usernameInput.focus();
        }
    });

    // Auto-focus username field when page loads
    setTimeout(() => {
        usernameInput.focus();
    }, 500);
});
