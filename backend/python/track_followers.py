import os
import json
import requests
from datetime import datetime, timedelta
import logging

# Configuración
TOKEN = "EAAKJrM0WC6IBPPB6dthaaZCVMgc3mfWaOknXshBOeCDXSV8gBpTVwlnQy9GuMMusQdtY6NSK3x3MeuAGhkAEObRhvjaIsQGX7uzg2yKiwnI7l5t8koeFMkGdnbWrgJOmFxvEjTTjCEYZAdYeYVi3R5qGL95aQJGPG8WZBUH7bpX4EbeRcrNW4vCEsBBZCsaLDNg1F8Fx9EuxO5cDAZB3qlCqptkhWCHZBezvlaxQZDZD"
APP_ID = "1047562113346147"
API_VER = "v23.0"
BASE_URL = f"https://graph.facebook.com/{API_VER}"
INSTAGRAM_ID = "17841475801593188"
HISTORY_FILE = "followers_history.json"
LOG_FILE = "followers_tracker.log"

# Configurar logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def make_api_request(endpoint, params=None):
    if params is None:
        params = {}
    params['access_token'] = TOKEN
    params['app_id'] = APP_ID
    
    try:
        resp = requests.get(f"{BASE_URL}/{endpoint}", params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logging.error(f"Error en la API: {e}")
        return None

def get_instagram_details():
    fields = "followers_count,follows_count,media_count,name,biography,username"
    endpoint = f"me/accounts?fields=instagram_business_account{{{fields}}}"
    return make_api_request(endpoint)

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    # Inicializar con los datos históricos conocidos
    return {
        "2025-07-22": 0,  # Fecha de creación
        "2025-07-23": 1   # Primer seguidor
    }

def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def track_followers():
    logging.info("Iniciando seguimiento de seguidores")
    
    # Cargar historial
    history = load_history()
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Si ya tenemos datos de hoy, no hacer nada
    if today in history:
        logging.info(f"Ya tenemos datos para hoy ({today})")
        return
    
    # Obtener datos actuales
    data = get_instagram_details()
    if data and 'data' in data:
        for page in data['data']:
            if 'instagram_business_account' in page:
                followers = page['instagram_business_account'].get('followers_count', 0)
                
                # Guardar en el historial
                history[today] = followers
                save_history(history)
                
                logging.info(f"Seguidores actualizados para {today}: {followers}")
                
                # Mostrar variación
                dates = sorted(history.keys())
                if len(dates) > 1:
                    yesterday = dates[-2]
                    variation = followers - history[yesterday]
                    logging.info(f"Variación desde ayer ({yesterday}): {variation:+d}")
                
                return
    
    logging.error("No se pudo obtener el número de seguidores")

if __name__ == "__main__":
    track_followers() 