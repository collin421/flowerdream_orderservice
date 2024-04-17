from flask import Blueprint, request, render_template, redirect, url_for, jsonify
from .func import get_db

sales_blueprint = Blueprint('sales', __name__, template_folder='templates')

@sales_blueprint.route('/sales', methods=['GET', 'POST'])
def sales_entry():
    db = get_db()
    cur = db.cursor()

    if request.method == 'POST':
        # 폼 데이터 수집
        sale_date = request.form.get('sale_date')
        branch_id = request.form.get('branch_id')
        email = request.form.get('email')
        sales_card_sweetdream = request.form.get('sales_card_sweetdream') or 0
        sales_card_glory = request.form.get('sales_card_glory') or 0
        sales_cash = request.form.get('sales_cash') or 0
        sales_zeropay = request.form.get('sales_zeropay') or 0
        sales_transfer = request.form.get('sales_transfer') or 0
        total_sales = sum([
            float(sales_card_sweetdream),
            float(sales_card_glory),
            float(sales_cash),
            float(sales_zeropay),
            float(sales_transfer)
        ])

        # 매출 데이터 저장
        cur.execute("""
            INSERT INTO sales (sale_date, branch_id, email, sales_card_sweetdream, sales_card_glory, sales_cash, sales_zeropay, sales_transfer, total_sales)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sale_date, branch_id, email, sales_card_sweetdream, sales_card_glory, sales_cash, sales_zeropay, sales_transfer, total_sales))
        db.commit()

        return redirect(url_for('sales.sales_confirmation', sale_id=cur.lastrowid))

    else:
        # GET 요청 시, 매출 입력 페이지 렌더링
        return render_template('sales_entry.html')

@sales_blueprint.route('/api/branches')
def api_branches():
    db = get_db()
    cur = db.cursor()
    cur.execute('SELECT id, name, email FROM branches')
    branches = cur.fetchall()
    return jsonify([{'id': branch['id'], 'name': branch['name'], 'email': branch['email']} for branch in branches])


@sales_blueprint.route('/api/branch/<int:branch_id>/emails', methods=['GET'])
def api_branch_emails(branch_id):
    db = get_db()
    cur = db.cursor()
    cur.execute('SELECT email FROM branches WHERE id = ?', (branch_id,))
    branch_email = cur.fetchone()
    if branch_email:
        return jsonify({'emails': [branch_email['email']]})  # 이메일이 단일 값인 경우
    return jsonify({'emails': []}), 404

# 매출 입력 확인 페이지 (추가 구현이 필요)
@sales_blueprint.route('/sales/confirmation/<int:sale_id>')
def sales_confirmation(sale_id):
    # 매출 입력 확인 페이지 구현
    pass