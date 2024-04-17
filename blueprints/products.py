from flask import Blueprint, request, render_template, redirect, url_for
from .func import get_db, generate_code

products_blueprint = Blueprint('products', __name__, template_folder='templates')

@products_blueprint.route('/products', methods=['GET', 'POST'])
def products():
    db = get_db()
    cur = db.cursor()

    sort_query = request.args.get('sort', 'id')
    filter_query = request.args.get('filter', '')  # 필터 적용을 위해 filter_query를 추가

    # 정렬 쿼리 처리
    if sort_query == 'name desc':
        sort_query = 'name DESC'
    elif sort_query == 'name':
        sort_query = 'name ASC'
    # 여기에 필요한 경우 다른 정렬 조건을 추가할 수 있습니다.

    page = request.args.get('page', 1, type=int)
    per_page = 20
    offset = (page - 1) * per_page

    # 필터 적용 조건을 추가합니다.
    if filter_query:
        # LIKE 연산자를 사용하여 이름에 filter_query가 포함된 상품만 선택
        cur.execute(f"SELECT * FROM products WHERE name LIKE ? ORDER BY {sort_query} LIMIT ? OFFSET ?", ('%' + filter_query + '%', per_page, offset))
    else:
        cur.execute(f"SELECT * FROM products ORDER BY {sort_query} LIMIT ? OFFSET ?", (per_page, offset))
    products = cur.fetchall()

    if request.method == 'POST':
        if 'delete' in request.form:
            product_id = request.form['delete']
            cur.execute("DELETE FROM products WHERE id = ?", (product_id,))
            db.commit()
        elif 'product_name' in request.form and 'options' in request.form:
            product_name = request.form['product_name']
            options = request.form['options'].split(',')

            for option in options:
                option = option.strip()
                if option:
                    product_code = generate_code(6)
                    cur.execute("INSERT INTO products (name, color, code) VALUES (?, ?, ?)", (product_name, option, product_code))
                    db.commit()

        return redirect(url_for('products.products'))
    else:
        # 이 부분은 불필요하게 중복되므로 삭제합니다.
        # 상품 조회 및 페이징 처리 로직은 위에서 이미 처리하고 있습니다.

        cur.execute("SELECT COUNT(*) FROM products WHERE name LIKE ?", ('%' + filter_query + '%',))
        total = cur.fetchone()[0]
        total_pages = (total + per_page - 1) // per_page

        return render_template('products.html',
                               products=products,
                               page=page,
                               total_pages=total_pages,
                               current_sort=sort_query,
                               filter_query=filter_query)  # 필터링 적용된 쿼리를 템플릿으로 전달

@products_blueprint.route('/edit_product/<int:product_id>', methods=['POST'])
def edit_product(product_id):
    db = get_db()
    cur = db.cursor()

    name = request.form['name']
    color = request.form['color']
    cur.execute("UPDATE products SET name = ?, color = ? WHERE id = ?", (name, color, product_id))
    db.commit()
    return "Success", 200