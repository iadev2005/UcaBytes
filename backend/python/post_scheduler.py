import os
import json
import requests
from datetime import datetime
import time
import logging
import subprocess
import sys

# Variable global para almacenar el token
CURRENT_TOKEN = None

def set_token(token):
    """Establece el token a usar para las llamadas a la API"""
    global CURRENT_TOKEN
    CURRENT_TOKEN = token

def get_token():
    """Obtiene el token actual"""
    global CURRENT_TOKEN
    if not CURRENT_TOKEN:
        raise ValueError("No se ha establecido un token de Instagram. Use set_token() primero")
    return CURRENT_TOKEN

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
    params['access_token'] = get_token()
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

def publish_story(media_url):
    """Publica una historia ejecutando el script correspondiente"""
    logging.info(f"Intentando publicar historia: {media_url}")
    
    try:
        # Ejecutar el script de historias sin programación (publicación inmediata)
        script_path = os.path.join(os.path.dirname(__file__), "create_instagram_story_scheduled.py")
        
        # Obtener el token actual
        token = get_token()
        
        result = subprocess.run([
            "pythonw.exe", script_path, 
            "--media_url", media_url,
            token
        ], capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if result.returncode == 0:
            logging.info(f"Historia publicada exitosamente: {media_url}")
            return True
        else:
            logging.error(f"Error al publicar historia: {result.stderr}")
            return False
    except Exception as e:
        logging.error(f"Error ejecutando script de historia: {e}")
        return False

def publish_story_by_id(instagram_id, creation_id):
    """Publica una historia usando el creation_id existente"""
    logging.info(f"Intentando publicar historia con creation_id: {creation_id}")
    
    try:
        # Usar la API directamente para publicar la historia
        publish_params = {
            "creation_id": creation_id
        }
        publish_endpoint = f"{instagram_id}/media_publish"
        response = make_api_request(publish_endpoint, publish_params, method="POST")
        
        if response and 'id' in response:
            logging.info(f"Historia publicada exitosamente con ID: {response['id']}")
            return True
        else:
            logging.error(f"Error al publicar historia con creation_id: {creation_id}")
            return False
    except Exception as e:
        logging.error(f"Error publicando historia con creation_id: {e}")
        return False

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
            
            # Manejar diferentes tipos de contenido
            if post.get('is_story'):
                # Es una historia - usar el creation_id existente
                if publish_story_by_id(post['instagram_id'], post['creation_id']):
                    logging.info(f"Historia procesada exitosamente: {post['media_url']}")
                else:
                    logging.error(f"Error procesando historia: {post['media_url']}")
            else:
                # Es un post normal
                publish_post(post['instagram_id'], post['creation_id'])
        else:
            remaining_posts.append(post)
    
    if len(posts) != len(remaining_posts):
        save_scheduled_posts(remaining_posts)

if __name__ == "__main__":
    # Verificar si se proporcionó un token como argumento
    if len(sys.argv) < 2:
        print("Uso: python post_scheduler.py <token>")
        sys.exit(1)
    
    # Establecer el token
    token = sys.argv[1]
    set_token(token)
    
    logging.info("Servicio de publicación programada iniciado")
    while True:
        try:
            check_and_publish()
            time.sleep(60)  # Revisa cada minuto
        except Exception as e:
            logging.error(f"Error en el servicio: {e}")
            time.sleep(60)  # Continúa incluso si hay errores 