#!/usr/bin/env python3
"""
LeBorêt Inventory Analysis
Calculate accurate inventory metrics from CSV data
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

def load_data():
    """Load all CSV files"""
    try:
        inventory = pd.read_csv('data/inventory_summary.csv')
        partners = pd.read_csv('data/partners.csv')
        sales = pd.read_csv('data/Total_sales_per_product.csv')
        
        print("Data loaded successfully!")
        print(f"Inventory records: {len(inventory)}")
        print(f"Partners: {len(partners)}")
        print(f"Sales records: {len(sales)}")
        
        return inventory, partners, sales
    except Exception as e:
        print(f"Error loading data: {e}")
        return None, None, None

def analyze_inventory_status(inventory, sales):
    """Analyze inventory status and calculate accurate metrics"""
    print("\n=== INVENTORY ANALYSIS ===")
    
    # Get the latest inventory data (most recent date for each product)
    print("Getting latest inventory data...")
    inventory['Día'] = pd.to_datetime(inventory['Día'])
    latest_inventory = inventory.sort_values('Día').groupby('Nombre del producto').tail(1)
    
    # Display latest inventory data
    print(f"\nLatest Inventory Data ({len(latest_inventory)} products):")
    for _, row in latest_inventory.iterrows():
        print(f"{row['Nombre del producto']}: {row['Unidades de inventario finales']} units (Date: {row['Día'].strftime('%Y-%m-%d')})")
    
    # Calculate daily demand from sales data (if available)
    sales_analysis = {}
    if sales is not None and not sales.empty:
        print("\nCalculating daily demand from sales data...")
        
        # Group sales by product and sum up total units sold
        sales_by_product = sales.groupby('Nombre del producto')['Artículos netos vendidos'].sum()
        
        # Calculate date range for sales data
        sales['Día'] = pd.to_datetime(sales['Día'])
        date_range = (sales['Día'].max() - sales['Día'].min()).days + 1
        
        print(f"Sales data covers {date_range} days")
        
        for product, total_sold in sales_by_product.items():
            daily_demand = total_sold / date_range if date_range > 0 else 0
            sales_analysis[product] = {
                'total_sold': total_sold,
                'daily_demand': daily_demand
            }
        
        print(f"\nDaily Demand Analysis:")
        for product, data in sales_analysis.items():
            print(f"{product}: {data['daily_demand']:.2f} units/day (Total sold: {data['total_sold']})")
    
    # Analyze critical stock levels
    print("\n=== CRITICAL STOCK ANALYSIS ===")
    
    # Define thresholds
    CRITICAL_THRESHOLD = 15  # Units below this are critical
    LOW_THRESHOLD = 30       # Units below this are low
    
    critical_products = []
    low_stock_products = []
    normal_stock_products = []
    
    for _, row in latest_inventory.iterrows():
        product = row['Nombre del producto']
        stock = row['Unidades de inventario finales']
        
        if stock <= CRITICAL_THRESHOLD:
            critical_products.append({
                'product': product,
                'current_stock': stock,
                'status': 'CRITICAL'
            })
        elif stock <= LOW_THRESHOLD:
            low_stock_products.append({
                'product': product,
                'current_stock': stock,
                'status': 'LOW'
            })
        else:
            normal_stock_products.append({
                'product': product,
                'current_stock': stock,
                'status': 'NORMAL'
            })
    
    print(f"\nCRITICAL Stock (≤{CRITICAL_THRESHOLD} units): {len(critical_products)} products")
    for item in critical_products:
        print(f"  - {item['product']}: {item['current_stock']} units")
    
    print(f"\nLOW Stock ({CRITICAL_THRESHOLD+1}-{LOW_THRESHOLD} units): {len(low_stock_products)} products")
    for item in low_stock_products:
        print(f"  - {item['product']}: {item['current_stock']} units")
    
    print(f"\nNORMAL Stock (>{LOW_THRESHOLD} units): {len(normal_stock_products)} products")
    for item in normal_stock_products:
        print(f"  - {item['product']}: {item['current_stock']} units")
    
    print(f"\nCRITICAL Stock (≤{CRITICAL_THRESHOLD} units): {len(critical_products)} products")
    for item in critical_products:
        print(f"  - {item['product']}: {item['current_stock']} units")
    
    print(f"\nLOW Stock ({CRITICAL_THRESHOLD+1}-{LOW_THRESHOLD} units): {len(low_stock_products)} products")
    for item in low_stock_products:
        print(f"  - {item['product']}: {item['current_stock']} units")
    
    print(f"\nNORMAL Stock (>{LOW_THRESHOLD} units): {len(normal_stock_products)} products")
    for item in normal_stock_products:
        print(f"  - {item['product']}: {item['current_stock']} units")
    
    # Calculate reorder recommendations
    print("\n=== REORDER RECOMMENDATIONS ===")
    reorder_needed = []
    
    for _, row in latest_inventory.iterrows():
        product = row['Nombre del producto']
        current_stock = row['Unidades de inventario finales']
        
        # Calculate recommended reorder point (example: 21 days of stock)
        if product in sales_analysis:
            daily_demand = sales_analysis[product]['daily_demand']
            recommended_stock = daily_demand * 21  # 21 days buffer
            
            if current_stock <= recommended_stock:
                reorder_qty = max(50, recommended_stock * 2 - current_stock)  # At least 50 units or 2x buffer
                reorder_needed.append({
                    'product': product,
                    'current_stock': current_stock,
                    'daily_demand': daily_demand,
                    'recommended_stock': recommended_stock,
                    'reorder_qty': int(reorder_qty),
                    'priority': 'HIGH' if current_stock <= CRITICAL_THRESHOLD else 'MEDIUM'
                })
        else:
            # No sales data, use conservative approach
            if current_stock <= CRITICAL_THRESHOLD:
                reorder_needed.append({
                    'product': product,
                    'current_stock': current_stock,
                    'daily_demand': 0,
                    'recommended_stock': 50,  # Conservative estimate
                    'reorder_qty': 100,
                    'priority': 'HIGH'
                })
    
    for item in reorder_needed:
        if item['daily_demand'] > 0:
            print(f"{item['product']}: Current={item['current_stock']}, Daily demand={item['daily_demand']:.2f}, Recommended={item['recommended_stock']:.1f}, Order={item['reorder_qty']} units ({item['priority']} priority)")
        else:
            print(f"{item['product']}: Current={item['current_stock']}, Order={item['reorder_qty']} units ({item['priority']} priority) - No sales data")
    
    # Calculate key metrics
    total_products = len(latest_inventory)
    total_units = latest_inventory['Unidades de inventario finales'].sum()
    avg_stock_per_product = total_units / total_products if total_products > 0 else 0
    
    metrics = {
        'total_products': total_products,
        'total_units': total_units,
        'critical_products': len(critical_products),
        'low_stock_products': len(low_stock_products),
        'reorder_needed': len(reorder_needed),
        'avg_stock_per_product': avg_stock_per_product,
        'critical_details': critical_products,
        'low_stock_details': low_stock_products,
        'reorder_details': reorder_needed
    }
    
    return metrics

def analyze_partners(partners):
    """Analyze supplier/partner data"""
    print("\n=== PARTNER ANALYSIS ===")
    
    if partners is not None and not partners.empty:
        print("Partners Data:")
        print(partners.to_string())
        
        # Count by type if available
        if 'Type' in partners.columns:
            partner_types = partners['Type'].value_counts()
            print(f"\nPartner Types:")
            print(partner_types.to_string())
        
        return {
            'total_partners': len(partners),
            'partner_details': partners.to_dict('records') if not partners.empty else []
        }
    else:
        print("No partner data available")
        return {'total_partners': 0, 'partner_details': []}

def generate_dashboard_json(metrics, partner_metrics):
    """Generate JSON data for the dashboard"""
    dashboard_data = {
        'last_updated': datetime.now().isoformat(),
        'metrics': {
            'total_products': int(metrics['total_products']),
            'total_stock_units': int(metrics['total_units']),
            'critical_stock_items': int(metrics['critical_products']),
            'reorder_alerts': int(metrics['reorder_needed']),
            'active_suppliers': int(partner_metrics['total_partners']),
            'avg_stock_per_product': round(float(metrics['avg_stock_per_product']), 1)
        },
        'critical_stock_details': [
            {
                'product': item['product'],
                'current_stock': int(item['current_stock']),
                'status': item['status']
            } for item in metrics['critical_details']
        ],
        'low_stock_details': [
            {
                'product': item['product'],
                'current_stock': int(item['current_stock']),
                'status': item['status']
            } for item in metrics['low_stock_details']
        ],
        'reorder_details': [
            {
                'product': item['product'],
                'current_stock': int(item['current_stock']),
                'daily_demand': round(float(item.get('daily_demand', 0)), 2),
                'recommended_stock': round(float(item.get('recommended_stock', 0)), 1),
                'reorder_qty': int(item['reorder_qty']),
                'priority': item['priority']
            } for item in metrics['reorder_details']
        ],
        'partner_details': partner_metrics['partner_details']
    }
    
    return dashboard_data

def main():
    print("LeBorêt Inventory Analysis")
    print("=" * 40)
    
    # Load data
    inventory, partners, sales = load_data()
    
    if inventory is None:
        print("Cannot proceed without inventory data!")
        return
    
    # Analyze inventory
    metrics = analyze_inventory_status(inventory, sales)
    
    # Analyze partners
    partner_metrics = analyze_partners(partners)
    
    # Generate dashboard data
    dashboard_data = generate_dashboard_json(metrics, partner_metrics)
    
    # Save results
    with open('inventory_dashboard_data.json', 'w', encoding='utf-8') as f:
        json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n=== SUMMARY ===")
    print(f"Total Products: {metrics['total_products']}")
    print(f"Total Stock Units: {metrics['total_units']}")
    print(f"Critical Stock Items: {metrics['critical_products']}")
    print(f"Products Needing Reorder: {metrics['reorder_needed']}")
    print(f"Active Suppliers: {partner_metrics['total_partners']}")
    print(f"Average Stock per Product: {metrics['avg_stock_per_product']:.1f}")
    
    print(f"\nDashboard data saved to: inventory_dashboard_data.json")
    
    return dashboard_data

if __name__ == "__main__":
    main()
