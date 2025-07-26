import os
import json
import requests
from datetime import datetime
import time
import logging

TOKEN = "EAAKJrM0WC6IBPDZARfB40mVCydyEj9uULvnInAL4potOvXZBvCYF51kEn4e8H7RlP8PqTggFJQZA8d2KrmZBWAbRm3ULAp6Ly4l7msqBSNB91ulOuV3keO2dDm0fxTVN0vW2GPiZCBhzspHf5Gwkbgv9JP9wdnDlFns3AxiNlK4hZB3mZBvfgFiZCItXLxNIFEv5y5FbVmjtPRSu7jbIpaP025r281pZBOGaHfTeO"
APP_ID = "1047562113346147"
API_VER = "v23.0"
BASE_URL = f"https://graph.facebook.com/{API_VER}"
SCHEDULED_POSTS_FILE = "scheduled_posts.json"
LOG_FILE = "instagram_scheduler.log"

# Configurar logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def make_api_request(endpoint, params=None, method="GET"):
    if params is None:
        params = {}
    params['access_token'] = TOKEN
    params['app_id'] = APP_ID
    
    try:
        if method == "GET":
            resp = requests.get(f"{BASE_URL}/{endpoint}", params=params, timeout=10)
        elif method == "POST":
            resp = requests.post(f"{BASE_URL}/{endpoint}", data=params, timeout=10)
        
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error en la API: {e}")
        return None

def publish_post(instagram_id, creation_id):
    """Publica el contenido en Instagram"""
    logging.info(f"Intentando publicar post {creation_id}")
    publish_params = {
        "creation_id": creation_id
    }
    publish_endpoint = f"{instagram_id}/media_publish"
    response = make_api_request(publish_endpoint, publish_params, method="POST")
    
    if response:
        logging.info(f"Publicación exitosa: {creation_id}")
    else:
        logging.error(f"Error al publicar: {creation_id}")
    return response

def load_scheduled_posts():
    """Carga las publicaciones programadas desde el archivo"""
    if os.path.exists(SCHEDULED_POSTS_FILE):
        with open(SCHEDULED_POSTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_scheduled_posts(posts):
    """Guarda las publicaciones programadas en el archivo"""
    with open(SCHEDULED_POSTS_FILE, 'w') as f:
        json.dump(posts, f, indent=2)

def check_and_publish():
    """Revisa y publica los posts programados"""
    posts = load_scheduled_posts()
    current_time = time.time()
    remaining_posts = []
    
    for post in posts:
        if current_time >= post['scheduled_time']:
            logging.info(f"Procesando publicación programada para {datetime.fromtimestamp(post['scheduled_time'])}")
            publish_post(post['instagram_id'], post['creation_id'])
        else:
            remaining_posts.append(post)
    
    if len(posts) != len(remaining_posts):
        save_scheduled_posts(remaining_posts)

if __name__ == "__main__":
    logging.info("Servicio de publicación programada iniciado")
    while True:
        try:
            check_and_publish()
            time.sleep(60)  # Revisa cada minuto
        except Exception as e:
            logging.error(f"Error en el servicio: {e}")
            time.sleep(60)  # Continúa incluso si hay errores 