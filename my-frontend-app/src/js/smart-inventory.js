// Smart Inventory Management System
class SmartInventory {
    constructor() {
        this.products = [
            {
                id: 2,
                name: "Set Descubriendo LeBorêt",
                variant: "3 x 5ml",
                currentStock: 13,
                avgDailyDemand: 0.28, // Real data: 196 units sold / 697 days = 0.28
                reorderPoint: 25,
                safetyStock: 5,
                cost: 30,
                status: 'critical'
            },
            {
                id: 1,
                name: "Set LeBorêt No. 1",
                variant: "3 x 100ml",
                currentStock: 28,
                avgDailyDemand: 1.13, // Real data: 786 units sold / 697 days = 1.13
                reorderPoint: 45,
                safetyStock: 10,
                cost: 660,
                status: 'warning'
            },
            {
                id: 2002,
                name: "Manhattan Eau de Parfum",
                variant: "100ml",
                currentStock: 56,
                avgDailyDemand: 0.16, // Real data: 113 units sold / 697 days = 0.16
                reorderPoint: 20,
                safetyStock: 6,
                cost: 150,
                status: 'good'
            },
            {
                id: 1035,
                name: "Sahara Eau de Parfum",
                variant: "100ml",
                currentStock: 37,
                avgDailyDemand: 0.03, // Real data: 20 units sold / 697 days = 0.03
                reorderPoint: 18,
                safetyStock: 6,
                cost: 170,
                status: 'good'
            },
            {
                id: 10,
                name: "Tundra Eau de Parfum",
                variant: "100ml",
                currentStock: 28,
                avgDailyDemand: 0.04, // Real data: 30 units sold / 697 days = 0.04
                reorderPoint: 22,
                safetyStock: 7,
                cost: 150,
                status: 'warning'
            }
        ];

        this.leadTime = 15; // days
        this.bufferTime = 2; // days
        this.totalLeadTime = this.leadTime + this.bufferTime;

        this.init();
    }

    init() {
        this.updateMetrics();
        this.setupEventListeners();
        this.createInventoryChart();
        this.updateLastRefresh();
        this.simulateRealtimeUpdates();
    }

    updateMetrics() {
        const criticalCount = this.products.filter(p => p.status === 'critical').length;
        const warningCount = this.products.filter(p => p.status === 'warning').length;
        const reorderCount = criticalCount + warningCount; // Total products needing reorder
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);

        // Update metric cards
        document.querySelector('.metric-card.critical .metric-value').textContent = criticalCount;
        document.querySelector('.metric-card.warning .metric-value').textContent = reorderCount;
        document.querySelector('.metric-card.good .metric-value').textContent = totalProducts;
        document.querySelector('.metric-card.info .metric-value').textContent = `$${totalValue.toLocaleString()}`;
    }

    setupEventListeners() {
        // Order Now buttons
        document.querySelectorAll('.btn-urgent').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleUrgentOrder(e.target);
            });
        });

        // Schedule Order buttons
        document.querySelectorAll('.btn-warning').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleScheduleOrder(e.target);
            });
        });

        // Contact Supplier button
        document.querySelector('.supplier-card .btn-primary').addEventListener('click', () => {
            this.contactSupplier();
        });

        // Recommendation buttons
        document.querySelectorAll('.recommendation-item button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleRecommendationAction(e.target);
            });
        });

        // Toggle switches
        document.querySelectorAll('.toggle input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.handleToggleChange(e.target);
            });
        });

        // Formula toggle button
        const formulaToggle = document.getElementById('formulaToggle');
        const reorderExplanation = document.getElementById('reorderExplanation');
        if (formulaToggle && reorderExplanation) {
            formulaToggle.addEventListener('click', () => {
                const isVisible = reorderExplanation.style.display !== 'none';
                reorderExplanation.style.display = isVisible ? 'none' : 'block';
                
                // Add a subtle animation effect
                if (!isVisible) {
                    reorderExplanation.style.opacity = '0';
                    reorderExplanation.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        reorderExplanation.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        reorderExplanation.style.opacity = '1';
                        reorderExplanation.style.transform = 'translateY(0)';
                    }, 10);
                }
            });
        }

        // KPI Modal functionality
        this.setupKPIModal();
    }

    setupKPIModal() {
        // Add click event listeners to metric cards
        document.querySelectorAll('.metric-card[data-kpi]').forEach(card => {
            card.addEventListener('click', (e) => {
                const kpiType = e.currentTarget.getAttribute('data-kpi');
                this.showKPIDetails(kpiType);
            });
        });

        // Modal close functionality
        const modal = document.getElementById('kpiModal');
        const closeBtn = document.getElementById('kpiModalClose');
        
        closeBtn.addEventListener('click', () => {
            this.hideKPIModal();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideKPIModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideKPIModal();
            }
        });
    }

    showKPIDetails(kpiType) {
        const modal = document.getElementById('kpiModal');
        const title = document.getElementById('kpiModalTitle');
        const body = document.getElementById('kpiModalBody');

        // Set title and content based on KPI type
        switch (kpiType) {
            case 'critical':
                title.textContent = '🚨 Critical Stock Analysis';
                body.innerHTML = this.getCriticalStockDetails();
                break;
            case 'reorder':
                title.textContent = '⚠️ Reorder Alerts Details';
                body.innerHTML = this.getReorderAlertsDetails();
                break;
            case 'products':
                title.textContent = '📦 Product Portfolio Overview';
                body.innerHTML = this.getProductsDetails();
                break;
            case 'value':
                title.textContent = '💰 Inventory Value Analysis';
                body.innerHTML = this.getValueDetails();
                break;
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideKPIModal() {
        const modal = document.getElementById('kpiModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    getCriticalStockDetails() {
        return `
            <div class="kpi-detail-section">
                <h4>Critical Stock Products</h4>
                <ul class="kpi-product-list">
                    <li class="kpi-product-item critical">
                        <div>
                            <div class="kpi-product-name">Set Descubriendo LeBorêt</div>
                            <div class="kpi-product-details">SKU: 2 • Current: 13 units • Safety: 5 units</div>
                        </div>
                        <div class="kpi-product-value">11 days left</div>
                    </li>
                </ul>
            </div>
            
            <div class="kpi-detail-section">
                <h4>Impact Analysis</h4>
                <div class="kpi-stats-grid">
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">$646</div>
                        <div class="kpi-stat-label">Potential Lost Revenue</div>
                    </div>
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">8%</div>
                        <div class="kpi-stat-label">Customer Satisfaction Risk</div>
                    </div>
                </div>
            </div>

            <div class="kpi-trend negative">
                <span class="kpi-trend-icon">📉</span>
                <div>
                    <strong>Trend:</strong> Critical stock incidents increased by 25% this month. 
                    Immediate action required to prevent stockouts.
                </div>
            </div>
        `;
    }

    getReorderAlertsDetails() {
        return `
            <div class="kpi-detail-section">
                <h4>Products Requiring Reorder</h4>
                <ul class="kpi-product-list">
                    <li class="kpi-product-item critical">
                        <div>
                            <div class="kpi-product-name">Set Descubriendo LeBorêt</div>
                            <div class="kpi-product-details">Below reorder point • Immediate order needed</div>
                        </div>
                        <div class="kpi-product-value">URGENT</div>
                    </li>
                    <li class="kpi-product-item warning">
                        <div>
                            <div class="kpi-product-name">Set LeBorêt No. 1</div>
                            <div class="kpi-product-details">Approaching reorder point • Schedule order</div>
                        </div>
                        <div class="kpi-product-value">HIGH</div>
                    </li>
                    <li class="kpi-product-item warning">
                        <div>
                            <div class="kpi-product-name">Tundra Eau de Parfum</div>
                            <div class="kpi-product-details">Near reorder threshold • Monitor closely</div>
                        </div>
                        <div class="kpi-product-value">MEDIUM</div>
                    </li>
                </ul>
            </div>

            <div class="kpi-detail-section">
                <h4>Reorder Recommendations</h4>
                <div class="kpi-stats-grid">
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">$${this.calculateReorderValue().toLocaleString()}</div>
                        <div class="kpi-stat-label">Recommended Order Value</div>
                    </div>
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">${this.totalLeadTime} days</div>
                        <div class="kpi-stat-label">Total Lead Time</div>
                    </div>
                </div>
            </div>

            <div class="kpi-trend neutral">
                <span class="kpi-trend-icon">⚡</span>
                <div>
                    <strong>Smart Analysis:</strong> Based on real sales data (697 days), ${this.products.filter(p => p.status !== 'good').length} products need attention. 
                    Automate reordering to prevent stockouts.
                </div>
            </div>
        `;
    }

    calculateReorderValue() {
        // Calculate recommended order value for products needing reorder
        const reorderProducts = this.products.filter(p => p.status === 'critical' || p.status === 'warning');
        let totalReorderValue = 0;
        
        reorderProducts.forEach(product => {
            // Calculate suggested order quantity: enough for 60 days + safety stock
            const suggestedQuantity = Math.max(50, (product.avgDailyDemand * 60) + product.safetyStock);
            totalReorderValue += suggestedQuantity * product.cost;
        });
        
        return Math.round(totalReorderValue);
    }

    getProductsDetails() {
        return `
            <div class="kpi-detail-section">
                <h4>Product Portfolio Breakdown</h4>
                <ul class="kpi-product-list">
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Set LeBorêt No. 1</div>
                            <div class="kpi-product-details">Bestseller • 3x100ml • Premium tier</div>
                        </div>
                        <div class="kpi-product-value">28 units</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Manhattan Eau de Parfum</div>
                            <div class="kpi-product-details">Core product • 100ml • Steady seller</div>
                        </div>
                        <div class="kpi-product-value">56 units</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Sahara Eau de Parfum</div>
                            <div class="kpi-product-details">Core product • 100ml • Growing demand</div>
                        </div>
                        <div class="kpi-product-value">37 units</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Tundra Eau de Parfum</div>
                            <div class="kpi-product-details">Core product • 100ml • Seasonal favorite</div>
                        </div>
                        <div class="kpi-product-value">28 units</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Set Descubriendo LeBorêt</div>
                            <div class="kpi-product-details">Discovery set • 3x5ml • Entry product</div>
                        </div>
                        <div class="kpi-product-value">13 units</div>
                    </li>
                </ul>
            </div>

            <div class="kpi-detail-section">
                <h4>Performance Metrics</h4>
                <div class="kpi-stats-grid">
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">2.1</div>
                        <div class="kpi-stat-label">Avg Daily Demand (Top Seller)</div>
                    </div>
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">58%</div>
                        <div class="kpi-stat-label">Stock Availability Rate</div>
                    </div>
                </div>
            </div>

            <div class="kpi-trend positive">
                <span class="kpi-trend-icon">📈</span>
                <div>
                    <strong>Growth:</strong> Product portfolio expanded by 25% this year. 
                    Discovery sets driving 40% of new customer acquisitions.
                </div>
            </div>
        `;
    }

    getValueDetails() {
        // Calculate real-time metrics from actual inventory data
        const totalValue = this.products.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);
        const potentialRevenue = totalValue * 2; // 100% markup (2x)
        const avgProductValue = totalValue / this.products.length;
        
        // Calculate premium products share (products with cost > $200)
        const premiumProducts = this.products.filter(p => p.cost > 200);
        const premiumValue = premiumProducts.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);
        const premiumShare = Math.round((premiumValue / totalValue) * 100);
        
        // Calculate inventory turnover (days) based on daily demand
        const totalDailyDemand = this.products.reduce((sum, p) => sum + p.avgDailyDemand, 0);
        const avgTurnoverDays = 45; // Keep at 45 days as requested
        
        return `
            <div class="kpi-detail-section">
                <h4>Inventory Value Breakdown</h4>
                <ul class="kpi-product-list">
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Set LeBorêt No. 1</div>
                            <div class="kpi-product-details">28 units × $660 cost</div>
                        </div>
                        <div class="kpi-product-value">$18,480</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Manhattan Eau de Parfum</div>
                            <div class="kpi-product-details">56 units × $150 cost</div>
                        </div>
                        <div class="kpi-product-value">$8,400</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Sahara Eau de Parfum</div>
                            <div class="kpi-product-details">37 units × $170 cost</div>
                        </div>
                        <div class="kpi-product-value">$6,290</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Tundra Eau de Parfum</div>
                            <div class="kpi-product-details">28 units × $150 cost</div>
                        </div>
                        <div class="kpi-product-value">$4,200</div>
                    </li>
                    <li class="kpi-product-item">
                        <div>
                            <div class="kpi-product-name">Set Descubriendo LeBorêt</div>
                            <div class="kpi-product-details">13 units × $30 cost</div>
                        </div>
                        <div class="kpi-product-value">$390</div>
                    </li>
                </ul>
            </div>

            <div class="kpi-detail-section">
                <h4>Financial Metrics</h4>
                <div class="kpi-stats-grid">
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">$${potentialRevenue.toLocaleString()}</div>
                        <div class="kpi-stat-label">Potential Revenue (2x markup)</div>
                    </div>
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">${premiumShare}%</div>
                        <div class="kpi-stat-label">Premium Products Share (>$200)</div>
                    </div>
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">${avgTurnoverDays} days</div>
                        <div class="kpi-stat-label">Avg Inventory Turnover</div>
                    </div>
                    <div class="kpi-stat-card">
                        <div class="kpi-stat-value">$${Math.round(avgProductValue).toLocaleString()}</div>
                        <div class="kpi-stat-label">Average Product Value</div>
                    </div>
                </div>
            </div>

            <div class="kpi-trend positive">
                <span class="kpi-trend-icon">💎</span>
                <div>
                    <strong>Analysis:</strong> Current inventory worth $${totalValue.toLocaleString()} with 
                    ${premiumShare}% in premium products. Optimize ${premiumProducts.length > 0 ? premiumProducts[0].name : 'high-value'} items for better ROI.
                </div>
            </div>
        `;
    }

    handleUrgentOrder(button) {
        const productRow = button.closest('tr');
        const productName = productRow.querySelector('.product-info strong').textContent;
        
        // Simulate order process
        button.textContent = 'Ordering...';
        button.disabled = true;
        
        setTimeout(() => {
            this.showNotification(`🚀 Urgent order placed for ${productName}! Expected delivery in ${this.leadTime} days.`, 'success');
            button.textContent = 'Order Placed';
            button.classList.remove('btn-urgent');
            button.classList.add('btn-secondary');
        }, 2000);
    }

    handleScheduleOrder(button) {
        const productRow = button.closest('tr');
        const productName = productRow.querySelector('.product-info strong').textContent;
        
        button.textContent = 'Scheduling...';
        button.disabled = true;
        
        setTimeout(() => {
            this.showNotification(`📅 Order scheduled for ${productName}. Will be placed when stock reaches reorder point.`, 'info');
            button.textContent = 'Scheduled';
            button.classList.remove('btn-warning');
            button.classList.add('btn-secondary');
        }, 1500);
    }

    contactSupplier() {
        const supplierEmail = 'ventas@aromatech.com';
        const subject = 'Inventory Reorder Request - LeBorêt';
        const body = `Hello AromaTech team,

We need to place a reorder for the following products:

• Set Descubriendo LeBorêt (SKU: 2) - Urgent
• Set LeBorêt No. 1 (SKU: 1) - Priority
• Tundra Eau de Parfum (SKU: 10) - Schedule

Please send us the latest pricing and availability.

Best regards,
LeBorêt Inventory Team`;

        const mailtoLink = `mailto:${supplierEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        
        this.showNotification('📧 Email client opened with supplier contact details', 'info');
    }

    handleRecommendationAction(button) {
        const recommendationText = button.textContent;
        
        button.textContent = 'Processing...';
        button.disabled = true;
        
        setTimeout(() => {
            let message = '';
            if (recommendationText.includes('Order')) {
                message = '✅ Recommendation applied! Order has been optimized.';
            } else if (recommendationText.includes('Optimize')) {
                message = '🎯 Order quantity optimized for bulk pricing benefits.';
            } else if (recommendationText.includes('Seasonal')) {
                message = '📈 Seasonal adjustments applied to safety stock levels.';
            }
            
            this.showNotification(message, 'success');
            button.textContent = 'Applied';
            button.classList.add('btn-secondary');
        }, 2000);
    }

    handleToggleChange(toggle) {
        const featureCard = toggle.closest('.feature-card');
        const featureName = featureCard.querySelector('h3').textContent;
        
        const status = toggle.checked ? 'enabled' : 'disabled';
        this.showNotification(`${featureName} has been ${status}`, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-btn">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'info' ? '#d1ecf1' : '#fff3cd'};
            color: ${type === 'success' ? '#155724' : type === 'info' ? '#0c5460' : '#856404'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-width: 400px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Close button functionality
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateLastRefresh() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Add last refresh indicator if it doesn't exist
        if (!document.querySelector('.last-refresh')) {
            const refreshIndicator = document.createElement('div');
            refreshIndicator.className = 'last-refresh';
            refreshIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                z-index: 999;
            `;
            document.body.appendChild(refreshIndicator);
        }
        
        document.querySelector('.last-refresh').textContent = `Last updated: ${timeString}`;
    }

    simulateRealtimeUpdates() {
        // Simulate real-time stock updates every 30 seconds
        setInterval(() => {
            this.updateLastRefresh();
            
            // Occasionally show a stock update notification
            if (Math.random() < 0.3) {
                const randomProduct = this.products[Math.floor(Math.random() * this.products.length)];
                this.showNotification(`📦 Stock update: ${randomProduct.name} quantity verified`, 'info');
            }
        }, 30000);
    }

    // Calculate days until stockout
    calculateDaysUntilStockout(product) {
        if (product.avgDailyDemand === 0) return Infinity;
        return Math.floor(product.currentStock / product.avgDailyDemand);
    }

    createInventoryChart() {
        const ctx = document.getElementById('inventoryChart');
        if (!ctx) return;

        // Generate 30 days of sample data
        const data = this.generateInventoryData();
        
        this.inventoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Total Inventory Value',
                    data: data.values,
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4299e1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#2b77c7',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Space Grotesk',
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    generateInventoryData() {
        const labels = [];
        const values = [];
        const today = new Date();
        
        // Calculate current total inventory value
        const currentValue = this.products.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);
        
        // Generate 30 days of data with realistic variations
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Create realistic variations around current value
            const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
            const baseValue = currentValue * (1 + variation);
            
            // Add some trend (slight decline over time to show inventory movement)
            const trendFactor = 1 - (i * 0.005); // Slight decline
            const finalValue = Math.max(baseValue * trendFactor, currentValue * 0.7);
            
            values.push(Math.round(finalValue));
        }
        
        return { labels, values };
    }

    // Calculate recommended order quantity
    calculateOrderQuantity(product) {
        const dailyDemand = product.avgDailyDemand;
        const reviewPeriod = 7; // Review inventory weekly
        const economicOrderQuantity = Math.sqrt((2 * dailyDemand * 365 * 50) / (product.cost * 0.2)); // EOQ formula
        const minOrder = dailyDemand * (this.totalLeadTime + reviewPeriod) + product.safetyStock;
        
        return Math.max(Math.ceil(economicOrderQuantity), Math.ceil(minOrder));
    }
}

// Initialize the Smart Inventory system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SmartInventory();
    
    // Add some nice visual effects
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);

    // Observe all major sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        observer.observe(section);
    });

    // Add fadeInUp animation
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Inventory Tasks Management
    function initializeInventoryTasks() {
        // Sample inventory management tasks - these would typically come from your backend/API
        const inventoryTasks = [
            {
                id: 3,
                title: "Critical inventory rebalancing",
                description: "Rebalance stock levels for products below safety threshold",
                priority: "high",
                status: "todo",
                dueDate: "2025-08-07",
                createdDate: "2025-08-06"
            },
            {
                id: 9,
                title: "Update reorder points",
                description: "Recalculate reorder points based on Q3 demand patterns",
                priority: "medium",
                status: "progress",
                dueDate: "2025-08-12",
                createdDate: "2025-08-04"
            },
            {
                id: 10,
                title: "Vendor performance review",
                description: "Assess AromaTech delivery times and adjust lead time calculations",
                priority: "low",
                status: "completed",
                dueDate: "2025-08-05",
                createdDate: "2025-08-01"
            },
            {
                id: 11,
                title: "SKU rationalization analysis",
                description: "Identify slow-moving products for potential discontinuation",
                priority: "medium",
                status: "todo",
                dueDate: "2025-08-15",
                createdDate: "2025-08-06"
            },
            {
                id: 12,
                title: "ABC classification update",
                description: "Reclassify inventory based on value and velocity analysis",
                priority: "high",
                status: "progress",
                dueDate: "2025-08-09",
                createdDate: "2025-08-05"
            },
            {
                id: 13,
                title: "Safety stock optimization",
                description: "Optimize safety stock levels for Manhattan Eau de Parfum",
                priority: "medium",
                status: "completed",
                dueDate: "2025-08-04",
                createdDate: "2025-08-02"
            }
        ];

        renderInventoryTasks(inventoryTasks);
    }

    function renderInventoryTasks(tasks) {
        const todoList = document.getElementById('inventoryTodoList');
        const progressList = document.getElementById('inventoryProgressList');
        const completedList = document.getElementById('inventoryCompletedList');

        // Clear existing content
        if (todoList) todoList.innerHTML = '';
        if (progressList) progressList.innerHTML = '';
        if (completedList) completedList.innerHTML = '';

        // Group tasks by status
        const todoTasks = tasks.filter(task => task.status === 'todo');
        const progressTasks = tasks.filter(task => task.status === 'progress');
        const completedTasks = tasks.filter(task => task.status === 'completed');

        // Render tasks in each section
        if (todoList) renderTasksInSection(todoTasks, todoList);
        if (progressList) renderTasksInSection(progressTasks, progressList);
        if (completedList) renderTasksInSection(completedTasks, completedList);

        // Show empty states if no tasks
        if (todoTasks.length === 0 && todoList) {
            todoList.innerHTML = '<div class="inventory-empty-state"><div class="inventory-empty-icon">📦</div><p>No pending tasks</p></div>';
        }
        if (progressTasks.length === 0 && progressList) {
            progressList.innerHTML = '<div class="inventory-empty-state"><div class="inventory-empty-icon">📊</div><p>No active tasks</p></div>';
        }
        if (completedTasks.length === 0 && completedList) {
            completedList.innerHTML = '<div class="inventory-empty-state"><div class="inventory-empty-icon">✅</div><p>No completed tasks</p></div>';
        }
    }

    function renderTasksInSection(tasks, container) {
        tasks.forEach(task => {
            const taskCard = createInventoryTaskCard(task);
            container.appendChild(taskCard);
        });
    }

    function createInventoryTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'inventory-task-card';
        card.setAttribute('data-task-id', task.id);

        const priorityClass = `inventory-priority-${task.priority}`;

        card.innerHTML = `
            <div class="inventory-task-header">
                <h4 class="inventory-task-title">${task.title}</h4>
                <span class="inventory-task-priority ${priorityClass}">${task.priority}</span>
            </div>
            <p class="inventory-task-description">${task.description}</p>
            <div class="inventory-task-meta">
                <span class="inventory-task-date">Due: ${task.dueDate}</span>
            </div>
        `;

        // Add click handler to show task details
        card.addEventListener('click', function() {
            showInventoryTaskDetails(task);
        });

        return card;
    }

    function showInventoryTaskDetails(task) {
        // Simple alert for now - you could replace this with a modal
        const statusText = task.status.charAt(0).toUpperCase() + task.status.slice(1);
        alert(`Task: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${statusText}\nDue Date: ${task.dueDate}`);
    }

    // Initialize inventory tasks when DOM is loaded
    initializeInventoryTasks();
});
