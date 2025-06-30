from flask import Flask, render_template
from admin import admin_bp
from student import student_bp

app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route('/')
def index():
    return render_template('index.html')

# Register blueprints for admin and student routes
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(student_bp, url_prefix='/student')

if __name__ == '__main__':
    app.run(debug=True, port=5800)
