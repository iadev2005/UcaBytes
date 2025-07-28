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
    
    logging.info(f"Haciendo request {method} a: {BASE_URL}/{endpoint}")
    logging.info(f"Token disponible: {'SÍ' if get_token() else 'NO'}")
    
    try:
        if method == "GET":
            logging.info(f"GET request con params: {params}")
            resp = requests.get(f"{BASE_URL}/{endpoint}", params=params, timeout=10)
        elif method == "POST":
            logging.info(f"POST request con data: {params}")
            resp = requests.post(f"{BASE_URL}/{endpoint}", data=params, timeout=10)
        
        logging.info(f"Status code: {resp.status_code}")
        logging.info(f"Response headers: {dict(resp.headers)}")
        
        resp.raise_for_status()
        response_json = resp.json()
        logging.info(f"Request exitoso: {response_json}")
        return response_json
    except requests.exceptions.RequestException as e:
        logging.error(f"Error en la API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            logging.error(f"Response status: {e.response.status_code}")
            logging.error(f"Response text: {e.response.text}")
        return None

def publish_post(instagram_id, creation_id):
    """Publica el contenido en Instagram"""
    logging.info(f"Intentando publicar post con creation_id: {creation_id}")
    logging.info(f"Endpoint: {instagram_id}/media_publish")
    
    publish_params = {
        "creation_id": creation_id
    }
    logging.info(f"Parámetros: {publish_params}")
    
    publish_endpoint = f"{instagram_id}/media_publish"
    response = make_api_request(publish_endpoint, publish_params, method="POST")
    
    logging.info(f"Respuesta de la API: {response}")
    
    if response and 'id' in response:
        logging.info(f"Publicación exitosa! Post ID: {response['id']}")
        return True
    else:
        logging.error(f"Error al publicar post {creation_id}")
        logging.error(f"Respuesta completa: {response}")
        return False

def publish_story(media_url):
    """Publica una historia ejecutando el script correspondiente"""
    logging.info(f"Intentando publicar historia: {media_url}")
    
    try:
        # Ejecutar el script de historias sin programación (publicación inmediata)
        script_path = os.path.join(os.path.dirname(__file__), "create_instagram_story_scheduled.py")
        
        # Obtener el token actual
        token = get_token()
        
        result = subprocess.run([
            "python", script_path, 
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
    logging.info("=== INICIANDO check_and_publish ===")
    posts = load_scheduled_posts()
    logging.info(f"Posts cargados del archivo: {len(posts)}")
    
    current_time = time.time()
    logging.info(f"Tiempo actual: {current_time} ({datetime.fromtimestamp(current_time)})")
    remaining_posts = []
    published_count = 0
    
    for i, post in enumerate(posts):
        logging.info(f"--- Procesando post {i+1}/{len(posts)} ---")
        logging.info(f"Post data: {post}")
        
        if current_time >= post['scheduled_time']:
            scheduled_time_str = datetime.fromtimestamp(post['scheduled_time'])
            logging.info(f"Post listo para publicar (programado para: {scheduled_time_str})")
            
            # Manejar diferentes tipos de contenido
            if post.get('is_story'):
                logging.info("Procesando HISTORIA...")
                if publish_story_by_id(post['instagram_id'], post['creation_id']):
                    logging.info(f"Historia publicada exitosamente: {post.get('media_url', 'N/A')}")
                    published_count += 1
                else:
                    logging.error(f"Error procesando historia: {post.get('media_url', 'N/A')}")
                    # NO eliminar de remaining_posts para reintentar después
                    remaining_posts.append(post)
            elif post.get('is_carousel') or post.get('is_mixed'):
                logging.info("Procesando CARRUSEL...")
                if publish_post(post['instagram_id'], post['creation_id']):
                    logging.info(f"Carrusel publicado exitosamente: {post.get('media_urls', 'N/A')}")
                    published_count += 1
                else:
                    logging.error(f"Error procesando carrusel: {post.get('media_urls', 'N/A')}")
                    # NO eliminar de remaining_posts para reintentar después
                    remaining_posts.append(post)
            elif post.get('is_video'):
                logging.info("Procesando VIDEO...")
                if publish_post(post['instagram_id'], post['creation_id']):
                    logging.info(f"Video publicado exitosamente: {post.get('video_url', 'N/A')}")
                    published_count += 1
                else:
                    logging.error(f"Error procesando video: {post.get('video_url', 'N/A')}")
                    # NO eliminar de remaining_posts para reintentar después
                    remaining_posts.append(post)
            else:
                logging.info("Procesando POST NORMAL...")
                if publish_post(post['instagram_id'], post['creation_id']):
                    logging.info(f"Post publicado exitosamente")
                    published_count += 1
                else:
                    logging.error(f"Error procesando post normal")
                    # NO eliminar de remaining_posts para reintentar después
                    remaining_posts.append(post)
        else:
            scheduled_time_str = datetime.fromtimestamp(post['scheduled_time'])
            logging.info(f"Post aún no listo (programado para: {scheduled_time_str})")
            remaining_posts.append(post)
    
    logging.info(f"=== RESUMEN ===")
    logging.info(f"Posts totales: {len(posts)}")
    logging.info(f"Posts publicados exitosamente: {published_count}")
    logging.info(f"Posts que quedan en archivo: {len(remaining_posts)}")
    
    # Solo guardar si hubo cambios
    if len(posts) != len(remaining_posts):
        logging.info("Guardando posts restantes en archivo...")
        save_scheduled_posts(remaining_posts)
        logging.info("Archivo actualizado")
    else:
        logging.info("No hay cambios en el archivo")
    
    logging.info("=== FIN check_and_publish ===")

if __name__ == "__main__":
    logging.info("=== INICIANDO POST_SCHEDULER ===")
    logging.info(f"Directorio actual: {os.getcwd()}")
    logging.info(f"Archivo de posts programados: {SCHEDULED_POSTS_FILE}")
    logging.info(f"Archivo de log: {LOG_FILE}")
    
    # Verificar si se proporcionó un token como argumento
    if len(sys.argv) < 2:
        logging.error("No se proporcionó token como argumento")
        print("Uso: python post_scheduler.py <token>")
        sys.exit(1)
    
    # Establecer el token - ignorar cualquier --single-run
    token = None
    for arg in sys.argv[1:]:
        if not arg.startswith('--'):
            token = arg
            break
    
    if not token:
        logging.error("No se encontró un token válido en los argumentos")
        print("Uso: python post_scheduler.py <token>")
        sys.exit(1)
    logging.info(f"Token recibido: {'SÍ' if token else 'NO'}")
    set_token(token)
    logging.info("Token establecido correctamente")
    
    logging.info("Servicio de publicación programada iniciado")
    
    # Detectar si se ejecuta desde auto_scheduler (una sola vez) o como servicio continuo
    # Si se ejecuta desde auto_scheduler, procesar una sola vez y salir
    # Si se ejecuta directamente, modo servicio continuo
    try:
        # Intentar procesar una sola vez
        logging.info("Iniciando procesamiento de posts programados...")
        check_and_publish()
        logging.info("Procesamiento completado")
        sys.exit(0)
    except KeyboardInterrupt:
        logging.info("Servicio interrumpido por el usuario")
        sys.exit(0)
    except Exception as e:
        logging.error(f"Error en el servicio: {e}")
        logging.error(f"Traceback completo:", exc_info=True)
        sys.exit(1) 