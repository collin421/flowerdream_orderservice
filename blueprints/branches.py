from flask import Blueprint, request, render_template, redirect, url_for, jsonify
from .func import get_db

branches_blueprint = Blueprint('branches', __name__, template_folder='templates')

@branches_blueprint.route('/branches', methods=['GET', 'POST'])
def branches():
    db = get_db()
    cur = db.cursor()

    sort_query = request.args.get('sort', 'id')
    page = request.args.get('page', 1, type=int)
    per_page = 10
    offset = (page - 1) * per_page
    
    if request.method == 'POST':
        if 'delete' in request.form:
            branche_id = request.form['delete']
            cur.execute("DELETE FROM branches WHERE id = ?", (branche_id,))
            db.commit()
        elif 'branches_name' in request.form and 'emails' in request.form:
            branches_name = request.form['branches_name']
            emails = request.form['emails'].split(',')

            for email in emails:
                email = email.strip()
                if email:
                    cur.execute("INSERT INTO branches (name, email) VALUES (?, ?)", (branches_name, email))
                    db.commit()

        return redirect(url_for('branches.branches'))
    else:
        cur.execute(f"SELECT * FROM branches ORDER BY {sort_query} LIMIT ? OFFSET ?", (per_page, offset))
        branches = cur.fetchall()

        cur.execute("SELECT COUNT(*) FROM branches")
        total = cur.fetchone()[0]
        total_pages = (total + per_page - 1) // per_page

        return render_template('branches.html',
                               branches=branches,
                               page=page,
                               total_pages=total_pages,
                               current_sort=sort_query)

@branches_blueprint.route('/edit_branch/<int:branch_id>', methods=['POST'])
def edit_branch(branch_id):
    db = get_db()
    cur = db.cursor()
    
    # 요청에서 'name'과 'email' 값을 추출합니다.
    name = request.form['name']
    email = request.form['email']
    
    # 데이터베이스 업데이트 로직을 실행합니다.
    try:
        cur.execute("UPDATE branches SET name = ?, email = ? WHERE id = ?", (name, email, branch_id))
        db.commit()
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500