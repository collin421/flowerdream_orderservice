from flask import Blueprint, request, render_template, send_file
from collections import defaultdict
from io import BytesIO
import pandas as pd
from .func import get_db


all_orders_blueprint = Blueprint('all_orders', __name__, template_folder='templates')


@all_orders_blueprint.route('/all_orders', methods=['GET', 'POST'])
def all_orders():
    db = get_db()
    selected_date = None
    orders_by_branch = defaultdict(list)

    if request.method == 'POST':
        selected_date = request.form.get('order_date')
        cur = db.cursor()
        cur.execute('''
            SELECT b.name as branch_name, od.product_name, od.color, SUM(od.quantity) as total_quantity
            FROM orders o
            JOIN branches b ON o.branch_id = b.id
            JOIN order_details od ON o.id = od.order_id
            WHERE o.order_date = ?
            GROUP BY b.name, od.product_name, od.color
            ORDER BY b.name, od.product_name, od.color
        ''', (selected_date,))
        for row in cur.fetchall():
            branch_name = row['branch_name']
            product_info = {'product_name': row['product_name'], 'color': row['color'], 'total_quantity': row['total_quantity']}
            orders_by_branch[branch_name].append(product_info)
        cur.close()

    return render_template('all_orders.html', orders_by_branch=orders_by_branch, selected_date=selected_date)


@all_orders_blueprint.route('/download_all_orders', methods=['POST'])
def download_all_orders():
    selected_date = request.form.get('order_date')
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        SELECT b.name as branch_name, od.product_name, od.color, SUM(od.quantity) as total_quantity
        FROM orders o
        JOIN branches b ON o.branch_id = b.id
        JOIN order_details od ON o.id = od.order_id
        WHERE o.order_date = ?
        GROUP BY b.name, od.product_name, od.color
        ORDER BY b.name, od.product_name, od.color
    ''', (selected_date,))
    
    orders_by_branch = defaultdict(list)
    for row in cur.fetchall():
        branch_name = row['branch_name']
        product_name = row['product_name']
        color = row['color']
        total_quantity = row['total_quantity']
        orders_by_branch[branch_name].append({
            'product_name': product_name,
            'color': color,
            'total_quantity': total_quantity
        })
    cur.close()
    
    df_list = []
    for branch_name, orders in orders_by_branch.items():
        for order in orders:
            df_list.append({
                'Branch Name': branch_name,
                'Product Name': order['product_name'],
                'Color': order['color'],
                'Total Quantity': order['total_quantity']
            })
    df = pd.DataFrame(df_list)
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='All Orders')
    output.seek(0)

    filename = f"all_orders_{selected_date}.xlsx"
    return send_file(output, as_attachment=True,
                     download_name=filename,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
