// Fulfillment Page JavaScript
class FulfillmentManager {
    constructor() {
        this.currentWeek = new Date();
        this.orders = [];
        // Internal partners available for assignment
        this.employees = [
            { id: 1, name: 'German Gomez', role: 'Direction', avatar: 'G', capacity: 15, assigned: 6 },
            { id: 2, name: 'Valeria Elizondo', role: 'Operations', avatar: 'V', capacity: 10, assigned: 8 }
        ];
        this.zones = [
            { id: 'norte', name: 'Zona Norte', shippingDays: 2, orders: 15, capacity: 0.8 },
            { id: 'centro', name: 'Zona Centro', shippingDays: 3, orders: 23, capacity: 1.0 },
            { id: 'bajio', name: 'Zona Bajío-Occidente', shippingDays: 4, orders: 8, capacity: 0.6 },
            { id: 'sur', name: 'Zona Sur', shippingDays: 5, orders: 12, capacity: 0.8 }
        ];
        this.init();
    }

    init() {
        this.generateSampleOrders();
        this.populatePackingList();
        this.populatePriorityMatrix();
        this.populateCalendar();
        this.bindEvents();
        this.updateMetrics();
    }

    generateSampleOrders() {
        const products = [
            'Tundra Eau de Parfum',
            'Set LeBoret No. 1',
            'Set Descubriendo LeBoret',
            'Sahara Eau de Parfum',
            'Manhattan Eau de Parfum'
        ];
        
        const zones = ['Zona Norte', 'Zona Centro', 'Zona Bajío–Occidente', 'Zona Sur'];
        const statuses = ['pending', 'processing', 'ready'];
        
        for (let i = 1; i <= 50; i++) {
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 7));
            
            const product = products[Math.floor(Math.random() * products.length)];
            const zone = zones[Math.floor(Math.random() * zones.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Assign to internal partners or leave unassigned
            // 60% chance assigned to German Gomez (ID 1), 30% chance assigned to Valeria Elizondo (ID 2), 10% chance unassigned (null)
            let employeeId;
            const assignmentRandom = Math.random();
            if (assignmentRandom < 0.6) {
                employeeId = 1; // German Gomez
            } else if (assignmentRandom < 0.9) {
                employeeId = 2; // Valeria Elizondo
            } else {
                employeeId = null; // Unassigned
            }
            
            const daysSinceOrder = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
            const priorityScore = this.calculatePriorityScore(daysSinceOrder, zone, product);
            
            this.orders.push({
                id: `ORD-${String(i).padStart(4, '0')}`,
                product,
                zone,
                orderDate,
                daysSinceOrder,
                priorityScore,
                status,
                assignedTo: employeeId,
                quantity: Math.floor(Math.random() * 5) + 1
            });
        }
        
        // Sort by priority score (highest first)
        this.orders.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    calculatePriorityScore(daysSinceOrder, zone, product) {
        let score = daysSinceOrder * 10;
        
        // Zone factor
        const zoneFactors = {
            'Zona Sur': 15,
            'Zona Bajío–Occidente': 10,
            'Zona Centro': 5,
            'Zona Norte': 0
        };
        score += zoneFactors[zone] || 0;
        
        // Product complexity factor
        if (product.includes('Set')) {
            score += 5;
        }
        
        return Math.min(score, 100);
    }

    getPriorityLevel(score) {
        if (score >= 70) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 30) return 'medium';
        return 'low';
    }

    populatePackingList() {
        const packingList = document.getElementById('packingList');
        if (!packingList) return;
        
        const todaysOrders = this.orders.filter(order => order.status === 'pending').slice(0, 15);
        
        packingList.innerHTML = todaysOrders.map(order => {
            const employee = this.employees.find(emp => emp.id === order.assignedTo);
            const priorityLevel = this.getPriorityLevel(order.priorityScore);
            
            return `
                <div class="packing-item ${priorityLevel}" data-order-id="${order.id}" draggable="true">
                    <div class="item-header">
                        <span class="order-id">${order.id}</span>
                        <span class="priority-badge ${priorityLevel}">${priorityLevel}</span>
                    </div>
                    <div class="item-details">
                        <div><strong>${order.product}</strong></div>
                        <div>📍 ${order.zone}</div>
                        <div>👤 ${employee ? employee.name : 'Unassigned'}</div>
                        <div>📦 ${order.quantity} units</div>
                        <div>⏰ ${order.daysSinceOrder} days ago</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    populatePriorityMatrix() {
        const tableBody = document.getElementById('priorityTableBody');
        if (!tableBody) return;
        
        const topPriorityOrders = this.orders.slice(0, 20);
        
        tableBody.innerHTML = topPriorityOrders.map(order => {
            const employee = this.employees.find(emp => emp.id === order.assignedTo);
            const priorityLevel = this.getPriorityLevel(order.priorityScore);
            
            return `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.product}</td>
                    <td>${order.zone}</td>
                    <td>${order.daysSinceOrder}</td>
                    <td><span class="priority-score ${priorityLevel}">${order.priorityScore}</span></td>
                    <td>${employee ? employee.name : 'Unassigned'}</td>
                    <td><span class="status-badge ${order.status}">${order.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn start-btn" onclick="fulfillmentManager.updateOrderStatus('${order.id}', 'processing')" title="Start Processing">
                                <i class="fas fa-play"></i> Start
                            </button>
                            <button class="action-btn assign-btn" onclick="fulfillmentManager.assignOrder('${order.id}')" title="Assign to Team Member">
                                <i class="fas fa-user-plus"></i> Assign
                            </button>
                            <button class="action-btn view-btn" onclick="fulfillmentManager.viewOrderDetails('${order.id}')" title="View Details">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    populateCalendar() {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;
        
        const startOfWeek = new Date(this.currentWeek);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
        
        let calendarHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            
            const dayOrders = this.getDayOrders(currentDay);
            const eventsHTML = dayOrders.map(order => {
                const priorityLevel = this.getPriorityLevel(order.priorityScore);
                return `<div class="calendar-event ${priorityLevel}-priority">${order.id}</div>`;
            }).join('');
            
            calendarHTML += `
                <div class="calendar-day">
                    <div class="day-number">${currentDay.getDate()}</div>
                    <div class="day-events">${eventsHTML}</div>
                </div>
            `;
        }
        
        calendarBody.innerHTML = calendarHTML;
        
        // Update week title
        const weekTitle = document.getElementById('currentWeek');
        if (weekTitle) {
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            weekTitle.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
    }

    getDayOrders(date) {
        // Simulate orders scheduled for specific days
        const dayOfWeek = date.getDay();
        const ordersPerDay = Math.floor(Math.random() * 8) + 2;
        return this.orders.slice(dayOfWeek * 3, dayOfWeek * 3 + ordersPerDay);
    }

    updateMetrics() {
        // Update summary metrics
        const metrics = {
            todayOrders: this.orders.filter(order => order.status === 'pending').length,
            avgFulfillment: '4.2',
            fifoCompliance: '94',
            pendingOrders: this.orders.filter(order => order.status === 'pending').length
        };
        
        Object.keys(metrics).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = metrics[key];
            }
        });
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterPackingList(e.target.dataset.filter);
            });
        });

        // Drag and drop for packing items
        this.bindDragAndDrop();

        // Date selector
        const dateSelector = document.getElementById('packingDate');
        if (dateSelector) {
            dateSelector.addEventListener('change', () => {
                this.populatePackingList();
            });
        }
    }

    bindDragAndDrop() {
        const packingList = document.getElementById('packingList');
        if (!packingList) return;

        packingList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('packing-item')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.orderId);
                e.target.style.opacity = '0.5';
            }
        });

        packingList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('packing-item')) {
                e.target.style.opacity = '1';
            }
        });

        packingList.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        packingList.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedOrderId = e.dataTransfer.getData('text/plain');
            const targetItem = e.target.closest('.packing-item');
            
            if (targetItem && draggedOrderId) {
                this.reorderPackingList(draggedOrderId, targetItem.dataset.orderId);
            }
        });
    }

    filterPackingList(filter) {
        const items = document.querySelectorAll('.packing-item');
        
        items.forEach(item => {
            const shouldShow = filter === 'all' || 
                             (filter === 'priority' && item.classList.contains('critical')) ||
                             (filter === 'standard' && !item.classList.contains('critical'));
            
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    reorderPackingList(draggedOrderId, targetOrderId) {
        const draggedOrder = this.orders.find(order => order.id === draggedOrderId);
        const targetOrder = this.orders.find(order => order.id === targetOrderId);
        
        if (draggedOrder && targetOrder) {
            // Remove dragged order from current position
            const draggedIndex = this.orders.indexOf(draggedOrder);
            this.orders.splice(draggedIndex, 1);
            
            // Insert at new position
            const targetIndex = this.orders.indexOf(targetOrder);
            this.orders.splice(targetIndex, 0, draggedOrder);
            
            // Refresh the display
            this.populatePackingList();
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(order => order.id === orderId);
        if (order) {
            order.status = newStatus;
            this.populatePackingList();
            this.populatePriorityMatrix();
            
            // Show success message
            this.showNotification(`Order ${orderId} updated to ${newStatus}`, 'success');
        }
    }

    assignOrder(orderId) {
        // Find employee with lowest workload
        const availableEmployee = this.employees.reduce((prev, current) => 
            (prev.assigned / prev.capacity) < (current.assigned / current.capacity) ? prev : current
        );
        
        const order = this.orders.find(order => order.id === orderId);
        if (order && availableEmployee) {
            order.assignedTo = availableEmployee.id;
            availableEmployee.assigned++;
            
            this.populatePackingList();
            this.populatePriorityMatrix();
            
            this.showNotification(`Order ${orderId} assigned to ${availableEmployee.name}`, 'success');
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(order => order.id === orderId);
        if (order) {
            const employee = this.employees.find(emp => emp.id === order.assignedTo);
            alert(`Order Details:\n\nID: ${order.id}\nProduct: ${order.product}\nZone: ${order.zone}\nQuantity: ${order.quantity}\nDays Since Order: ${order.daysSinceOrder}\nPriority Score: ${order.priorityScore}\nAssigned To: ${employee ? employee.name : 'Unassigned'}\nStatus: ${order.status}`);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            background: ${type === 'success' ? '#38a169' : '#667eea'};
            color: white;
            border-radius: 6px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refreshPriorityMatrix() {
        // Recalculate priority scores
        this.orders.forEach(order => {
            order.priorityScore = this.calculatePriorityScore(order.daysSinceOrder, order.zone, order.product);
        });
        
        // Resort orders
        this.orders.sort((a, b) => b.priorityScore - a.priorityScore);
        
        // Refresh displays
        this.populatePackingList();
        this.populatePriorityMatrix();
        
        this.showNotification('Priority matrix refreshed', 'success');
    }

    changeWeek(direction) {
        const newWeek = new Date(this.currentWeek);
        newWeek.setDate(newWeek.getDate() + (direction * 7));
        this.currentWeek = newWeek;
        this.populateCalendar();
    }
}

// Global functions for HTML onclick handlers
function refreshPriorityMatrix() {
    fulfillmentManager.refreshPriorityMatrix();
}

function changeWeek(direction) {
    fulfillmentManager.changeWeek(direction);
}

// Initialize when DOM is loaded
let fulfillmentManager;

document.addEventListener('DOMContentLoaded', () => {
    fulfillmentManager = new FulfillmentManager();
    
    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FulfillmentManager;
}
