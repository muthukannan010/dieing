import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("FATAL: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(url, key)

def initialize_database():
    print("Connecting to Supabase...")
    try:
        # Quick health check
        response = supabase.table("users").select("id").limit(1).execute()
        print("Supabase client initialized successfully.")
    except Exception as e:
        print("Supabase connection test note:", e)

def get_mode():
    return "supabase"

def get_client() -> Client:
    return supabase
