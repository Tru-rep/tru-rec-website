# app_db_safe.py
from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)

# -----------------------------
# BACKUP: Hardcoded fighter list (unchanged)
# -----------------------------
fighters = [
    # Your full fighter list from app.py goes here (keep it as-is for backup)
]

# -----------------------------
# Database helper functions
# -----------------------------
def get_fighters_from_db():
    conn = sqlite3.connect('fighters.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM fighters")
    fighters = [dict(row) for row in c.fetchall()]
    conn.close()
    return fighters

def get_fighter_by_id_from_db(fighter_id):
    conn = sqlite3.connect('fighters.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM fighters WHERE id = ?", (fighter_id,))
    fighter = c.fetchone()
    if not fighter:
        conn.close()
        return None

    fighter_dict = dict(fighter)

    # Get fight history for this fighter
    c.execute("SELECT result, opponent, date, method, org FROM fight_history WHERE fighter_id = ?", (fighter_id,))
    fighter_dict["fight_history"] = [dict(row) for row in c.fetchall()]
    conn.close()
    return fighter_dict

# -----------------------------
# Routes
# -----------------------------
@app.route('/')
def home():
    return render_template('index.html')

@app.route("/fighters")
def fighters_page():
    search_query = request.args.get("search", "").strip().lower()
    weight_filter = request.args.get("weight", "").strip().lower()

    try:
        fighters_data = get_fighters_from_db()
    except Exception as e:
        print("⚠ DB Error, using backup list:", e)
        fighters_data = fighters  # fallback

    filtered_fighters = []
    for fighter in fighters_data:
        name_match = search_query in fighter["name"].lower()
        weight_match = weight_filter in fighter["weight_class"].lower() if weight_filter else True
        if name_match and weight_match:
            filtered_fighters.append(fighter)

    return render_template("fighters.html", fighters=filtered_fighters)

@app.route("/fighter/<fighter_id>")
def fighter_profile(fighter_id):
    try:
        fighter = get_fighter_by_id_from_db(fighter_id)
    except Exception as e:
        print("⚠ DB Error, using backup list:", e)
        fighter = next((f for f in fighters if f["id"] == fighter_id), None)

    if not fighter:
        return "Fighter not found", 404
    return render_template("fighter_profile.html", fighter=fighter)

@app.route("/events")
def events_page():
    return render_template("events.html")

@app.route('/merchandise')
def merchandise():
    return render_template('merchandise.html')

@app.route('/sponsors')
def sponsors():
    return render_template('sponsors.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/test-db')
def test_db():
    fighters_data = get_fighters_from_db()
    names = [f["name"] for f in fighters_data]
    return "<br>".join(names)

# -----------------------------
# Run
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
