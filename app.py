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
