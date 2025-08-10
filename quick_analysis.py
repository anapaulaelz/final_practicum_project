import pandas as pd

# Load and analyze data excluding 'prueba1'
inventory = pd.read_csv('data/inventory_summary.csv')
inventory['Día'] = pd.to_datetime(inventory['Día'])

# Get latest inventory excluding prueba1
latest_inventory = inventory[inventory['Nombre del producto'] != 'prueba1'].sort_values('Día').groupby('Nombre del producto').tail(1)

print('=== LATEST INVENTORY (excluding prueba1) ===')
for _, row in latest_inventory.iterrows():
    stock = row['Unidades de inventario finales']
    product = row['Nombre del producto']
    print(f'{product}: {stock} units')

# Analyze critical stock levels
CRITICAL_THRESHOLD = 15
LOW_THRESHOLD = 30

critical_products = []
low_stock_products = []
normal_stock_products = []

for _, row in latest_inventory.iterrows():
    product = row['Nombre del producto']
    stock = row['Unidades de inventario finales']
    
    if stock <= CRITICAL_THRESHOLD:
        critical_products.append({'product': product, 'stock': stock})
    elif stock <= LOW_THRESHOLD:
        low_stock_products.append({'product': product, 'stock': stock})
    else:
        normal_stock_products.append({'product': product, 'stock': stock})

print(f'\n=== ANALYSIS RESULTS ===')
print(f'CRITICAL Stock (≤{CRITICAL_THRESHOLD} units): {len(critical_products)} products')
for item in critical_products:
    print(f'  - {item["product"]}: {item["stock"]} units')

print(f'LOW Stock ({CRITICAL_THRESHOLD+1}-{LOW_THRESHOLD} units): {len(low_stock_products)} products')
for item in low_stock_products:
    print(f'  - {item["product"]}: {item["stock"]} units')

print(f'NORMAL Stock (>{LOW_THRESHOLD} units): {len(normal_stock_products)} products')
for item in normal_stock_products:
    print(f'  - {item["product"]}: {item["stock"]} units')

# Calculate metrics
total_products = len(latest_inventory)
total_units = latest_inventory['Unidades de inventario finales'].sum()
total_value = latest_inventory['Valor final del inventario'].sum()

print(f'\n=== DASHBOARD METRICS ===')
print(f'Total Products: {total_products}')
print(f'Critical Stock Items: {len(critical_products)}')
print(f'Reorder Alerts: {len(low_stock_products) + len(critical_products)}')
print(f'Total Stock Units: {total_units}')
print('Total Inventory Value: $' + str(int(total_value)))
