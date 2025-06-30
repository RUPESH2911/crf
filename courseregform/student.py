from flask import Blueprint, request, session, render_template, redirect, url_for, flash
import re
from admin import students_list, feedbacks, live_event

student_bp = Blueprint('student_bp', __name__, template_folder='templates')

DEFAULT_PASSWORD = "Srec@123"

# ---------------------------
# Student Login
# ---------------------------
@student_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        roll = request.form.get('roll_number', '').strip()
        password = request.form.get('password', '').strip()
        # Validate roll number format: must start with "718123" followed by 5 digits
        if not re.match(r"^718123\d{5}$", roll):
            flash("Invalid Roll Number format")
            return render_template('student_login.html')
        if password != DEFAULT_PASSWORD:
            flash("Invalid Password")
            return render_template('student_login.html')
        # Verify student is registered (only roll numbers from the uploaded Excel are allowed)
        if roll not in students_list:
            flash("Roll number not registered. Please contact admin.")
            return render_template('student_login.html')
        # Prevent double feedback submission
        if students_list[roll].get('attempted'):
            flash("You have already submitted feedback.")
            return redirect(url_for('student_bp.thankyou'))
        session['roll'] = roll
        return redirect(url_for('student_bp.dashboard'))
    return render_template('student_login.html')

# ---------------------------
# Student Dashboard – Live Event Display
# ---------------------------
@student_bp.route('/dashboard', methods=['GET'])
def dashboard():
    roll = session.get('roll')
    if not roll:
        return redirect(url_for('student_bp.login'))
    if live_event:
        return render_template('student_event.html', roll=roll)
    else:
        return render_template('student_no_event.html', roll=roll)

# ---------------------------
# Course Selection
# ---------------------------
@student_bp.route('/select_course', methods=['GET', 'POST'])
def select_course():
    roll = session.get('roll')
    if not roll:
        return redirect(url_for('student_bp.login'))
    # Dummy available courses
    available_courses = [
        {'course_code': 'CSE101', 'course_title': 'Introduction to Computer Science'},
        {'course_code': 'MTH102', 'course_title': 'Calculus II'},
    ]
    if request.method == 'POST':
        course_code = request.form.get('course_code')
        if course_code:
            session['course_code'] = course_code
            return redirect(url_for('student_bp.feedback'))
    return render_template('student_course.html', roll=roll, available_courses=available_courses)

# ---------------------------
# Feedback Grid Form
# ---------------------------
@student_bp.route('/feedback', methods=['GET', 'POST'])
def feedback():
    roll = session.get('roll')
    course_code = session.get('course_code')
    if not roll or not course_code:
        return redirect(url_for('student_bp.login'))
    staff_list = ['Staff A', 'Staff B', 'Staff C', 'Staff D']
    if request.method == 'POST':
        ratings = []
        for q in range(1, 16):
            rating = request.form.get(f'question_{q}')
            ratings.append(int(rating))
        selected_staff = request.form.get('staff')
        feedbacks[(roll, course_code)] = {'ratings': ratings, 'staff': [selected_staff]}
        students_list[roll]['attempted'] = True
        return redirect(url_for('student_bp.thankyou'))
    return render_template('student_feedback_grid.html', 
                           roll=roll, 
                           course_code=course_code, 
                           staff_list=staff_list)

# ---------------------------
# Thank You Page
# ---------------------------
@student_bp.route('/thankyou')
def thankyou():
    return render_template('thankyou.html')
