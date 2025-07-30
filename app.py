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
        "losses": 0,
        "draws": 0,
        "kos": 2,
        "age": 20,
        "height": "175 CM",
        "stance": "MULTISTANCE",
        "country": "Malaysia",
        "description": "Danial “Danny” Iskandar is a self-trained fighter from Tanjung Putih Melati who blends full-contact Silat, Muay Thai, and Boxing into a powerful, pressure-heavy style. Known for sharp one-two combos, explosive counters, and unorthodox footwork, Danny brings relentless energy and striking precision into every fight always aiming to break rhythm and dominate",
        "fight_history": [
            {"result": "Win", "opponent": "Sugar", "date": "2025-05-24", "method": "KO", "org": "TruBoxing"},
            {"result": "Win", "opponent": "Adzmer", "date": "2025-06-28", "method": "KO", "org": "TruBoxing"}
        ],
       
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
        "age": 28,
        "height": "179 CM",
        "stance": "Orthodox",
        "country": "Malaysia",
        "description": "Imran, known as The Bazooka, is a heavyweight boxer like no other—a perfect balance of raw power and lightning speed. With a massive, muscular build, he defies expectations by moving with surprising agility and precision. His punches hit like explosions, but it’s his ability to control the tempo and outsmart his opponents that truly sets him apart. In the ring, Imran is more than just a fighter—he’s a strategist in motion, a symbol of harmony between strength and speed, muscle and mind.",
        "fight_history": [
            {"result": "Win", "opponent": "Zulfamie", "date": "24/05/2025", "method": "TKO", "org": "Ultimate Beatdown 56"},
            {"result": "Win", "opponent": "Jay Kho", "date": "23/02/2025", "method": "TKO", "org": "Ultimate Beatdown 57"}
        ],
  
    },
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
      
    },
    {
        "id": "calif",
        "name": "Muhammad Calif Hairi",
        "nickname": "Calif Chaos",
        "weight_class": "Atomweight",
        "image_thumb": "thumbnails/califthumb.png",
        "image_profile": "profiles/shadow.png",
        "wins": 1,
        "losses": 1,
        "draws": 0,
        "kos": 1,
        "age": 15,
        "height": "160 CM",
        "stance": "Orthodox",
        "country": "Malaysia",
        "description": "Young, fearless, and disciplined — Muhammad Calif Hairi, aka 'Calif Chaos', is quickly gaining attention as one of Sabah’s most promising prospects. His relentless drive and sharp fundamentals make him a rising star in the Atomweight division.",
        "fight_history": [
            {"result": "Win", "opponent": "Aqil Rais Khan", "date": "26/04/2025", "method": "KO", "org": "Malaysia Fight League"},
            {"result": "Lose", "opponent": "Muhammad Firdaus Yaakob", "date": "26/07/2025", "method": "Unanimous Decision", "org": "Malaysia Fight League"}
        ],
        
    },
    {
    "id": "yusri_ucop",
    "name": "Muhammad Yusri bin Abdullah",
    "nickname": "Yusri Ucop",
    "weight_class": "Super Welterweight",  # ~70 kg
    "image_thumb": "thumbnails/yusrithumb.png",   # please insert
    "image_profile": "profiles/yusripro.png",         # please insert
    "wins": 0,
    "losses": 1,
    "draws": 0,
    "kos": 0,
    "age": 29,                      # DOB 6/5/1996 → age as of 2025-07-30
    "height": "168 CM",
    "stance": "Orthodox",
    "country": "Malaysia",
    "description": "Disciplined Kajang-based boxer competing around the 70 kg mark. Focused on sharpening fundamentals and gaining ring experience in the super welterweight class.",
    "fight_history": [
        {
            "result": "Lose",
            "opponent": "unknown",
            "date": "unknown",
            "method": "TKO",
            "org": "TBA"
        }
    ],
   
},
{
    "id": "rizqy",
    "name": "Muhammad Rizqullah bin Muzaffar Shah",
    "nickname": "Rizqy",
    "weight_class": "Pinweight",
    "image_thumb": "thumbnails/rizkythumb.png",   # please insert
    "image_profile": "profiles/shadow.png",         # please insert
    "wins": 2,
    "losses": 0,
    "draws": 0,
    "kos": 0,
    "age": 9,                      # DOB 02 Nov 2015 → age as of 2025-07-30
    "height": "130 CM",
    "stance": "TBA",
    "country": "Malaysia",
    "description": "Young Malaysian prospect at 25–30 kg; disciplined and active on the amateur scene.",
    "fight_history": [
        {
            "result": "Win",
            "opponent": "Al Firas",
            "date": "TBA",
            "method": "Unanimous Decision",
            "org": "Twins Championship Amateur"
        },
        {
            "result": "Win",
            "opponent": "Mika",
            "date": "TBA",
            "method": "Unanimous Decision",
            "org": "TruBoxing & Twin"
        }
    ]
},
{
    "id": "aqil_anak_rimau",
    "name": "Muhammad Aqil Asyraaf Bin Mohd Rasyiddie",
    "nickname": "Aqil Anak Rimau",
    "weight_class": "Paperweight ",
    "image_thumb": "thumbnails/aqilthumb.png",      # please insert
    "image_profile": "profiles/aqilpro.png",         # please insert
    "wins": 5,
    "losses": 1,
    "draws": 0,
    "kos": 1,                                        # TKO in Fight 6
    "age": 13,                                       # DOB 2012-05-14
    "height": "161 CM",
    "stance": "TBA",                                 # please confirm: Orthodox / Southpaw / Multi-Stance
    "country": "Malaysia",
    "description": (
        "KLBA prospect at 36–39 kg with high work-rate and disciplined ring craft. "
        "Best Boxer (Tinju Bakat Kebangsaan 13–14 thn). Gym: Kuala Lumpur Boxing Academy (KLBA). "
        "Coaches: Azmi Bin Yusuf / Norfazlie Bin Adni. Socials: Facebook/TikTok 'Aqil Anak Rimau'."
    ),
    "fight_history": [
        {
            "result": "Lose",
            "opponent": "Rizqi Mirza",
            "date": "2024-11-16",
            "method": "Points",
            "org": "Trust Boxing Championship — Seremban Prima"
        },
        {
            "result": "Win",
            "opponent": "Lupa",
            "date": "2025-02-08",                    # event 8–9 Feb; using first day
            "method": "Points",
            "org": "Twin Championship X — Seremban Prima (Event 8–9 Feb 2025)"
        },
        {
            "result": "Win",
            "opponent": "Muhammad Arief Bin Azmi (Trg)",
            "date": "2025-02-12",
            "method": "Points",
            "org": "Kejohanan Tinju Bakat Kebangsaan 2025 (13–14) — Majlis Sukan Negara, Nilai"
        },
        {
            "result": "Win",
            "opponent": "Elthonly Anak Tensa (SRWK)",
            "date": "2025-02-13",
            "method": "Points",
            "org": "Kejohanan Tinju Bakat Kebangsaan 2025 (13–14) — Majlis Sukan Negara, Nilai"
        },
        {
            "result": "Win",
            "opponent": "Muhammad Aakif Hambali Bin Ahmad (Perlis)",
            "date": "2025-02-14",
            "method": "Points",
            "org": "Kejohanan Tinju Bakat Kebangsaan 2025 (13–14) — (Location/Weight TBA)"
        },
        {
            "result": "Win",
            "opponent": "M. Hafiz",
            "date": "2025-06-14",                    # event 14–15 Jun; using first day
            "method": "TKO (R2)",
            "org": "Twins Championship Amateur & Pro FT Hari Belia Negara — Dataran Merdeka (Event 14–15 Jun 2025)"
        }
    ]
}


]

@app.route('/')
def home():
    return render_template('index.html')

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
