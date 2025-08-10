#!/usr/bin/env python3

# Test the updated financial calculations
products = [
    {'name': 'Set LeBorêt No. 1', 'stock': 28, 'cost': 660, 'demand': 1.13, 'status': 'warning'},
    {'name': 'Manhattan Eau de Parfum', 'stock': 56, 'cost': 150, 'demand': 0.16, 'status': 'good'},
    {'name': 'Sahara Eau de Parfum', 'stock': 37, 'cost': 170, 'demand': 0.03, 'status': 'good'},
    {'name': 'Tundra Eau de Parfum', 'stock': 28, 'cost': 150, 'demand': 0.04, 'status': 'warning'},
    {'name': 'Set Descubriendo LeBorêt', 'stock': 13, 'cost': 30, 'demand': 0.28, 'status': 'critical'}
]

# Calculate metrics
total_value = sum(p['stock'] * p['cost'] for p in products)
potential_revenue = total_value * 2
avg_product_value = total_value / len(products)

# Premium products (cost > 200)
premium_products = [p for p in products if p['cost'] > 200]
premium_value = sum(p['stock'] * p['cost'] for p in premium_products)
premium_share = round((premium_value / total_value) * 100)

# Avg turnover days per product
turnover_days = [p['stock'] / p['demand'] if p['demand'] > 0 else 999 for p in products]
avg_turnover = round(sum(turnover_days) / len(turnover_days))

# Reorder value calculation
reorder_products = [p for p in products if p['status'] in ['critical', 'warning']]
reorder_value = 0
for p in reorder_products:
    suggested_qty = max(50, (p['demand'] * 60) + 10)  # 60 days + safety
    reorder_value += suggested_qty * p['cost']

print('=== CORRECTED FINANCIAL METRICS ===')
print(f'Total Inventory Value: ${total_value:,}')
print(f'Potential Revenue (2x): ${potential_revenue:,}')
print(f'Average Product Value: ${avg_product_value:,.0f}')
print(f'Premium Share (cost>$200): {premium_share}%')
print(f'Average Turnover Days: {avg_turnover}')
print(f'Recommended Reorder Value: ${reorder_value:,.0f}')
print()
print('Premium products:', [p['name'] for p in premium_products])
print('Reorder needed:', [p['name'] for p in reorder_products])

# Show detailed breakdown
print('\n=== DETAILED BREAKDOWN ===')
for p in products:
    days_remaining = p['stock'] / p['demand'] if p['demand'] > 0 else float('inf')
    print(f"{p['name']}: {p['stock']} units, {p['demand']}/day = {days_remaining:.0f} days supply")
