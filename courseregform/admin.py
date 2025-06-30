from flask import Blueprint, request, jsonify, render_template, redirect, url_for, session, send_file, flash
import io
import pandas as pd
# Make sure you have installed fpdf: pip install fpdf (or pip install fpdf2)
from fpdf import FPDF

admin_bp = Blueprint('admin_bp', __name__, template_folder='templates')

# In‑memory storages – in a real app replace these with a database
faculty_data = {}     # {faculty_id: {name, dept}}
students_list = {}    # {roll_number: {name, department, attempted: False}}
feedbacks = {}        # {(roll_number, course_code): { ratings: list, staff: list }}
live_event = False    # controls whether a feedback event is active

def get_form():
    return request.form.to_dict()

# ---------------------------
# Admin Login & Panel
# ---------------------------
@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        d = get_form()
        if d.get('username') == 'admin' and d.get('password') == 'admin123':
            session['admin'] = True
            return redirect(url_for('admin_bp.panel'))
        flash("Invalid credentials")
        return render_template('admin_login.html')
    return render_template('admin_login.html')

@admin_bp.route('/panel')
def panel():
    if not session.get('admin'):
        return redirect(url_for('admin_bp.login'))
    return render_template('admin_panel.html', live_event=live_event)

# ---------------------------
# Host / End Feedback Event
# ---------------------------
@admin_bp.route('/host_event', methods=['POST'])
def host_event():
    global live_event
    if not session.get('admin'):
        return redirect(url_for('admin_bp.login'))
    live_event = True
    flash("Feedback event is now live.")
    return redirect(url_for('admin_bp.panel'))

@admin_bp.route('/end_event', methods=['POST'])
def end_event():
    global live_event
    if not session.get('admin'):
        return redirect(url_for('admin_bp.login'))
    live_event = False
    flash("Feedback event has ended.")
    return redirect(url_for('admin_bp.panel'))

# ---------------------------
# Upload Students via Excel
# ---------------------------
@admin_bp.route('/upload_students', methods=['GET', 'POST'])
def upload_students():
    if not session.get('admin'):
        return redirect(url_for('admin_bp.login'))
    if request.method == 'POST':
        file = request.files.get('file')
        if not file:
            flash("No file selected")
            return redirect(url_for('admin_bp.upload_students'))
        try:
            df = pd.read_excel(file)
            # Expected columns: roll_number, name, department
            for idx, row in df.iterrows():
                # Convert the roll number to a string and remove any trailing decimals,
                # e.g., "71812301231.0" becomes "71812301231"
                roll_raw = str(row['roll_number']).strip()
                roll = roll_raw.split('.')[0] if '.' in roll_raw else roll_raw
                students_list[roll] = {
                    'name': row['name'],
                    'department': row.get('department', 'Unknown'),
                    'attempted': False
                }
            flash("Students uploaded successfully.")
        except Exception as e:
            flash("Error processing file: " + str(e))
        return redirect(url_for('admin_bp.panel'))
    return render_template('upload_students.html')

# ---------------------------
# Admin Results Dashboard
# ---------------------------
@admin_bp.route('/dashboard')
def dashboard():
    if not session.get('admin'):
        return redirect(url_for('admin_bp.login'))
    # Build a list of students who have not submitted feedback
    not_attempted = [roll for roll, stu in students_list.items() if not stu.get('attempted')]
    
    # Build summary data: For each (course_code, staff) pair, collect ratings and count responses.
    summary = {}
    for (roll, course_code), data in feedbacks.items():
        ratings = data['ratings']        # list of 15 ratings
        staff_selected = data['staff']     # list containing one staff value
        if course_code not in summary:
            summary[course_code] = {}
        for staff in staff_selected:
            if staff not in summary[course_code]:
                summary[course_code][staff] = {'total_ratings': [0]*15, 'count': 0}
            summary[course_code][staff]['count'] += 1
            for i in range(15):
                summary[course_code][staff]['total_ratings'][i] += ratings[i]

    # Compute average ratings for each question
    for course_code, staffs in summary.items():
        for staff, data in staffs.items():
            count = data['count']
            avg_ratings = [round(total / count, 2) if count else 0 for total in data['total_ratings']]
            summary[course_code][staff]['avg_ratings'] = avg_ratings

    # Calculate overall attendance percentage
    total_students = len(students_list)
    attended = sum(1 for stu in students_list.values() if stu.get('attempted'))
    attendance_percentage = round((attended / total_students) * 100, 2) if total_students else 0

    return render_template('admin_dashboard.html', 
                           summary=summary, 
                           not_attempted=not_attempted, 
                           attendance_percentage=attendance_percentage)

# ---------------------------
# Download PDF of Feedback Data
# ---------------------------
@admin_bp.route('/download_pdf')
def download_pdf():
    if not session.get('admin'):
        return redirect(url_for('admin_bp.login'))
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Feedback Summary", ln=1, align='C')
    for (roll, course_code), data in feedbacks.items():
        pdf.cell(200, 10, txt=f"Roll: {roll}  Course: {course_code}", ln=1)
        pdf.cell(200, 10, txt="Ratings: " + ", ".join(map(str, data['ratings'])), ln=1)
    pdf_output = io.BytesIO()
    pdf.output(pdf_output)
    pdf_output.seek(0)
    return send_file(pdf_output, as_attachment=True, download_name='feedback_summary.pdf', mimetype='application/pdf')
