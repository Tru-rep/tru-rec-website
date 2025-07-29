# app.py
from flask import Flask, render_template, request

app = Flask(__name__)

# Global fighter list with IDs and detailed profiles
fighters = [
    {
        "id": "shamel",
        "name": "Shamel Salahudin",
        "nickname": "Abang Besi",
        "weight_class": "Light Heavyweight",
        "image_thumb": "thumbnails/shamelthumb.png",
        "image_profile": "profiles/shamelpro3.png",
        "wins": 23,
        "losses": 17,
        "draws": 0,
        "kos": 19,
        "age": 34,
        "height": "185 CM",
        "stance": "ORTHODOX",
        "country": "Malaysia",
        "description": "is a proven heavyweight force in Malaysian boxing...",
        "fight_history": [
            {"result": "LOSS", "opponent": "Luqman", "date": "31st May 2025", "method": "UD", "org": "KBX 72 - Singapore"},
            {"result": "LOSS", "opponent": "Ezam", "date": "10th May 2025", "method": "UD", "org": "Golden Glove Malaysia 2025"},
            {"result": "WIN", "opponent": "Joe Wujiang", "date": "1st May 2025", "method": "UD", "org": "Wujiang Fight Night 2.0"}
        ],
        "gallery": ["shamel1.jpeg", "shamel2.jpeg", "shamel3.jpg"]
    },
    {
        "id": "danny",
        "name": "DANNY BOYZ",
        "nickname": "THE SLASHER",
        "weight_class": "Lightweight",
        "image": "danny.png",
        "image_thumb": "thumbnails/Dannythumb.png",
        "image_profile": "profiles/dannypro.png",
        "wins": 3,
        "losses": 1,
        "draws": 0,
        "kos": 2,
        "age": 21,
        "height": "172 CM",
        "stance": "ORTHODOX",
        "country": "Malaysia",
        "description": "Crowd favorite and natural-born hitter...",
        "fight_history": [
            {"result": "Win", "opponent": "Ali Rauf", "date": "2024-12-03", "method": "UD", "org": "TruBoxing"}
        ],
        "gallery": ["danny1.jpg", "danny2.jpg", "danny3.jpg"]
    },
    {
        "id": "buki",
        "name": "BUKI",
        "nickname": "THE WALL",
        "weight_class": "Light Heavyweight",
        "image_thumb": "thumbnails/bukithumb.png",
        "image_profile": "profiles/bukipro2.png",
        "wins": 5,
        "losses": 3,
        "draws": 1,
        "kos": 4,
        "age": 27,
        "height": "180 CM",
        "stance": "SOUTHPAW",
        "country": "Uganda",
        "description": "Relentless pressure fighter in Malaysia...",
        "fight_history": [
            {"result": "Win", "opponent": "Lim Zhi", "date": "2024-07-15", "method": "TKO", "org": "BoxHub"}
        ],
        "gallery": ["buki1.jpg", "buki2.jpg"]
    },

    {
        "id": "amirul",
        "name": "Amirul",
        "nickname": "STEALTH",
        "weight_class": "Welterweight",
        "image_thumb": "thumbnails/ammirulthumb.png",
        "image_profile": "profiles/ammirulpro.png",
        "wins": 6,
        "losses": 2,
        "draws": 0,
        "kos": 5,
        "age": 24,
        "height": "178 CM",
        "stance": "ORTHODOX",
        "country": "MALAYSIA",
        "description": "Calculated and technical, known for movement.",
        "fight_history": [
            {"result": "Win", "opponent": "Reza Talib", "date": "2024-06-20", "method": "KO", "org": "BoxNation"}
        ],
        "gallery": ["mahi1.jpg"]
    },
    {
        "id": "awab",
        "name": "AWAB",
        "nickname": "THE HAMMER",
        "weight_class": "Middleweight",
        "image_thumb": "thumbnails/awabthumb.png",
        "image_profile": "profiles/awabpro.png",
        "wins": 8,
        "losses": 1,
        "draws": 1,
        "kos": 6,
        "age": 22,
        "height": "183 CM",
        "stance": "SOUTHPAW",
        "country": "sudan",
        "description": "Known for brutal left hooks and pressure.",
        "fight_history": [
            {"result": "Win", "opponent": "Zul Akbar", "date": "2024-10-02", "method": "KO", "org": "TruBoxing"}
        ],
        "gallery": ["awab1.jpg", "awab2.jpg"]
    },
    
    {
    "id": "bazooka",
    "name": "Imran Hanafi b Mohamad",
    "nickname": "The Bazooka",
    "weight_class": "Light Heavyweight",
    "image_thumb": "thumbnails/bazokathumb.png",
    "image_profile": "profiles/bazoka.png",
    "wins": 2,
    "losses": 0,
    "draws": 0,
    "kos": 2,
    "age": 28,  # As of 2025, born 16/10/1996
    "height": "179 CM",
    "stance": "Orthodox",
    "country": "Malaysia",
    "description": "Imran, known as The Bazooka, is a heavyweight boxer like no other—a perfect balance of raw power and lightning speed. With a massive, muscular build, he defies expectations by moving with surprising agility and precision. His punches hit like explosions, but it’s his ability to control the tempo and outsmart his opponents that truly sets him apart. In the ring, Imran is more than just a fighter—he’s a strategist in motion, a symbol of harmony between strength and speed, muscle and mind.",
    "fight_history": [
        {
            "result": "Win",
            "opponent": "Zulfamie",
            "date": "24/05/2025",
            "method": "TKO",
            "org": "Ultimate Beatdown 56"
        },
        {
            "result": "Win",
            "opponent": "Jay Kho",
            "date": "23/02/2025",
            "method": "TKO",
            "org": "Ultimate Beatdown 57"
        }
    ],
"gallery": [
    "fighters/Gallery/bazooka1.jpg",
    "fighters/Gallery/bazooka2.jpg",
]    },

    {
        "id": "marquez",
        "name": "arman marquez",
        "nickname": "The peekaboo",
        "weight_class": "Light-weight",
        "image_profile": "thumbnails/armanthumb.png",
        "image_thumb": "profiles/armanpro.png",    
        
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "kos": 0,
        "age": 0,
        "height": "TBA",
        "stance": "TBA",
        "country": "malaysia",
        "description": "Edit this later.",
        "fight_history": [],
        "gallery": []
    },
    {
        "id": "mikaylov",
        "name": "timofey mikaylov",
        "nickname": "The russian eagle",
        "weight_class": "flyweight",
        "image_thumb": "thumbnails/Timofeythumb.png",
        "image_profile": "profiles/tompro.png",

        "wins": 0,
        "losses": 0,
        "draws": 0,
        "kos": 0,
        "age": 0,
        "height": "TBA",
        "stance": "TBA",
        "country": "russia",
        "description": "Edit this later.",
        "fight_history": [],
        "gallery": []
    }
]



@app.route('/')
def home():
    return render_template('index.html')


# Existing fighters list here...

@app.route("/fighter/<fighter_id>")
def fighter_profile(fighter_id):
    fighter = next((f for f in fighters if f["id"] == fighter_id), None)
    if not fighter:
        return "Fighter not found", 404
    return render_template("fighter_profile.html", fighter=fighter)


@app.route("/fighters")
def fighters_page():
    search_query = request.args.get("search", "").strip().lower()
    weight_filter = request.args.get("weight", "").strip().lower()

    # Filter logic
    filtered_fighters = []
    for fighter in fighters:
        name_match = search_query in fighter["name"].lower()
        weight_match = weight_filter in fighter["weight_class"].lower() if weight_filter else True
        if name_match and weight_match:
            filtered_fighters.append(fighter)

    return render_template("fighters.html", fighters=filtered_fighters)

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


if __name__ == '__main__':
    app.run(debug=True)
