from flask import Flask, render_template
from blueprints import register_blueprints  # 수정된 임포트 경로

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')
    
register_blueprints(app)  # 블루프린트 등록

if __name__ == '__main__':
    app.run(debug=True)
