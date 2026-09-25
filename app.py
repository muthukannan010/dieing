from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from db import initialize_database

load_dotenv()

app = Flask(__name__, template_folder="templates", static_folder="public")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "fallback_secret_key")

# Initialize database connection on startup
initialize_database()

# TODO: Import and register blueprints for routes

@app.route("/")
def home():
    # Temporary placeholder for web routes
    return render_template("home.html")

@app.route('/api/predict-color', methods=['POST'])
def predict_color():
    data = request.json
    color_name = data.get('color_name', '')
    fabric_type = data.get('fabric_type', '')
    
    # Mock AI prediction logic
    base_salt = 40
    base_soda = 15
    
    if "red" in color_name.lower():
        dyes = [{"name": "Reactive Red 198", "amount": 2.5}]
    elif "blue" in color_name.lower():
        dyes = [{"name": "Reactive Blue 21", "amount": 3.0}]
    elif "green" in color_name.lower():
        dyes = [{"name": "Reactive Yellow 145", "amount": 1.5}, {"name": "Reactive Blue 21", "amount": 1.5}]
    elif "black" in color_name.lower():
        dyes = [{"name": "Reactive Black 5", "amount": 5.0}]
        base_salt = 60
        base_soda = 20
    else:
        dyes = [{"name": "Standard Base Mix", "amount": 2.0}]

    if "cotton" in fabric_type.lower():
        base_salt += 10
        
    recipe = {
        "predicted_dyes": dyes,
        "salt_g_l": base_salt,
        "soda_ash_g_l": base_soda,
        "confidence": 0.85
    }
    
    return jsonify({"success": True, "recipe": recipe})


@app.errorhandler(500)
def internal_server_error(e):
    return render_template("error.html", title="Server Error", message="An unexpected server-side error occurred. Please contact engineering support."), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print("===================================================")
    print(" DyeTech Pro Engine Started Successfully (Flask)!")
    print(f" Port:    http://localhost:{port}")
    print("===================================================")
    app.run(host="0.0.0.0", port=port, debug=True)
