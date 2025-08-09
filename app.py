# app.py
from flask import Flask, render_template, request, redirect, url_for
import sqlite3, os, shutil

app = Flask(__name__)

# -------------------- DB PATH (Render disk aware) --------------------
REPO_DB = os.path.join(os.path.dirname(__file__), "fighters.db")  # seed DB in repo
DISK_DIR = "/var/data"                                            # Render disk mount
DISK_DB = os.path.join(DISK_DIR, "fighters.db")

USE_DISK = os.path.exists(DISK_DIR)  # True on Render (disk mounted)

# Seed the disk the first time if it's empty
if USE_DISK and (not os.path.exists(DISK_DB)) and os.path.exists(REPO_DB):
    try:
        shutil.copyfile(REPO_DB, DISK_DB)
        print("✅ Seeded fighters.db to Render disk")
    except Exception as e:
        print("⚠️ Failed to seed DB to disk:", e)

DB_PATH = DISK_DB if USE_DISK else REPO_DB
print("USING DB:", DB_PATH)

def get_conn():
    # check_same_thread=False for threaded servers; set row_factory later per-conn
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn
# --------------------------------------------------------------------


# Fallback list (unchanged)
fighters = []


def get_fighters_from_db():
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM fighters")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows


def get_fighter_by_id_from_db(fighter_id: str):
    # sanitize + normalize
    fighter_id = (fighter_id or "").strip().lower()

    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # case-insensitive match on id
    c.execute("SELECT * FROM fighters WHERE LOWER(id) = ?", (fighter_id,))
    fighter = c.fetchone()
    if not fighter:
        conn.close()
        return None

    fighter_dict = dict(fighter)

    # newest fights first
    c.execute("""
        SELECT result, opponent, date, method, org
        FROM fight_history
        WHERE LOWER(fighter_id) = ?
        ORDER BY date DESC
    """, (fighter_id,))
    fighter_dict["fight_history"] = [dict(r) for r in c.fetchall()]

    conn.close()
    return fighter_dict


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/fighters")
def fighters_page():
    search_query = request.args.get("search", "").strip().lower()
    weight_filter = request.args.get("weight", "").strip().lower()
    try:
        data = get_fighters_from_db()
    except Exception as e:
        print("⚠ DB Error, using backup list:", e)
        data = fighters

    filtered = []
    for f in data:
        name_ok = search_query in f.get("name", "").lower()
        weight_ok = weight_filter in f.get("weight_class", "").lower() if weight_filter else True
        if name_ok and weight_ok:
            filtered.append(f)
    return render_template("fighters.html", fighters=filtered)


@app.route("/fighter/<fighter_id>")
def fighter_profile(fighter_id):
    # sanitize + normalize, and redirect if URL is dirty
    clean_id = (fighter_id or "").strip().lower()
    if clean_id != fighter_id:
        return redirect(url_for("fighter_profile", fighter_id=clean_id), code=301)

    try:
        fighter = get_fighter_by_id_from_db(clean_id)
    except Exception as e:
        print("⚠ DB Error, using backup list:", e)
        fighter = next((f for f in fighters if f.get("id", "").strip().lower() == clean_id), None)

    if not fighter:
        return "Fighter not found", 404
    return render_template("fighter_profile.html", fighter=fighter)


@app.route("/events")
def events_page():
    return render_template("events.html")


@app.route("/merchandise")
def merchandise():
    return render_template("merchandise.html")


@app.route("/sponsors")
def sponsors():
    return render_template("sponsors.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/test-db")
def test_db():
    try:
        names = [f["name"] for f in get_fighters_from_db()]
        return "<br>".join(names)
    except Exception as e:
        return f"DB error: {e}", 500


# quick backend check (optional)
@app.route("/debug-fights/<fighter_id>")
def debug_fights(fighter_id):
    fid = (fighter_id or "").strip().lower()
    conn = get_conn()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        SELECT result, opponent, date, method, org
        FROM fight_history
        WHERE LOWER(fighter_id) = ?
        ORDER BY date DESC
    """, (fid,))
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return "<br>".join([f"{r['date']} — {r['opponent']} — {r['result']} — {r['org']}" for r in rows])


# health check for Render
@app.route("/healthz")
def healthz():
    return "ok", 200


if __name__ == "__main__":
    # For local dev only; Render will run via its own start command
    app.run(debug=True)
