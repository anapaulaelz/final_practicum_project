// Cosmic Sidebar Functionality
class CosmicSidebar {
    constructor() {
        this.init();
    }

    init() {
        this.createSidebar();
        this.setActiveNavItem();
        this.handleResponsive();
        this.addCosmicEffects();
    }

    createSidebar() {
        const sidebar = document.createElement('nav');
        sidebar.className = 'cosmic-sidebar';
        sidebar.id = 'cosmicSidebar';

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h1 class="cosmos-logo">COSMOS</h1>
                <p class="cosmos-subtitle">Navigation Hub</p>
            </div>
            
            <div class="sidebar-nav">
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="dashboard.html" class="nav-link" data-page="dashboard">
                            <i class="nav-icon fas fa-satellite"></i>
                            <span class="nav-text">Dashboard</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="demand-forecasting.html" class="nav-link" data-page="demand-forecasting">
                            <i class="nav-icon fas fa-meteor"></i>
                            <span class="nav-text">Demand Forecasting</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="smart-inventory.html" class="nav-link" data-page="smart-inventory">
                            <i class="nav-icon fas fa-satellite-dish"></i>
                            <span class="nav-text">Smart Inventory</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="fulfillment.html" class="nav-link" data-page="fulfillment">
                            <i class="nav-icon fas fa-rocket"></i>
                            <span class="nav-text">Fulfillment</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="alarms-alerts.html" class="nav-link" data-page="alarms-alerts">
                            <i class="nav-icon fas fa-sun"></i>
                            <span class="nav-text">Alarms & Alerts</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="todo-board.html" class="nav-link" data-page="todo-board">
                            <i class="nav-icon fas fa-moon"></i>
                            <span class="nav-text">To Do Board</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="calendar.html" class="nav-link" data-page="calendar">
                            <i class="nav-icon fas fa-globe"></i>
                            <span class="nav-text">Calendar</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="partners.html" class="nav-link" data-page="partners">
                            <i class="nav-icon fas fa-user-astronaut"></i>
                            <span class="nav-text">Partners</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="document-base.html" class="nav-link" data-page="document-base">
                            <i class="nav-icon fas fa-space-shuttle"></i>
                            <span class="nav-text">Document Base</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="cosmic-particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
            </div>
        `;

        document.body.insertBefore(sidebar, document.body.firstChild);
        
        // Create toggle button
        this.createToggleButton();
    }

    setActiveNavItem() {
        const currentPage = this.getCurrentPageName();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const pageName = link.getAttribute('data-page');
            if (pageName === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1);
        
        // Remove .html extension and return page name
        return filename.replace('.html', '');
    }

    handleResponsive() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('cosmicSidebar');
            if (window.innerWidth > 768) {
                sidebar.classList.remove('open');
            }
        });
    }

    createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'sidebar-toggle';
        toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(toggleButton);

        // Toggle sidebar collapse/expand
        toggleButton.addEventListener('click', () => {
            const sidebar = document.getElementById('cosmicSidebar');
            
            if (window.innerWidth <= 768) {
                // Mobile behavior
                sidebar.classList.toggle('open');
            } else {
                // Desktop behavior - collapse/expand
                sidebar.classList.toggle('collapsed');
                
                // Update toggle icon
                const icon = toggleButton.querySelector('i');
                if (sidebar.classList.contains('collapsed')) {
                    icon.className = 'fas fa-chevron-right';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('cosmicSidebar');
            const toggleButton = document.querySelector('.sidebar-toggle');
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !toggleButton.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    addCosmicEffects() {
        // Add hover sound effect (optional)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // Add subtle animation or effect here if needed
                this.createStarBurst(link);
            });
        });
    }

    createStarBurst(element) {
        // Create a small star burst effect on hover
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #60a5fa;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: starBurst 0.6s ease-out forwards;
        `;

        const rect = element.getBoundingClientRect();
        star.style.left = (rect.left + rect.width - 20) + 'px';
        star.style.top = (rect.top + rect.height / 2) + 'px';

        document.body.appendChild(star);

        // Add CSS animation
        if (!document.getElementById('starBurstStyle')) {
            const style = document.createElement('style');
            style.id = 'starBurstStyle';
            style.textContent = `
                @keyframes starBurst {
                    0% { 
                        opacity: 1; 
                        transform: scale(0) rotate(0deg); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: scale(3) rotate(180deg); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: scale(0) rotate(360deg); 
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove star after animation
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 600);
    }

    // Method to update main content margin
    updateMainContent() {
        const mainContent = document.querySelector('main') || 
                           document.querySelector('.container') || 
                           document.querySelector('.main-content');
        
        if (mainContent && !mainContent.classList.contains('main-content')) {
            mainContent.classList.add('main-content');
        }
    }
}

// Initialize the cosmic sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cosmicSidebar = new CosmicSidebar();
    cosmicSidebar.updateMainContent();
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmicSidebar;
}
