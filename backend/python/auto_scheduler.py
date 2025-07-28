import os
import json
import time
import subprocess
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    filename='auto_scheduler.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

SCHEDULED_POSTS_FILE = "scheduled_posts.json"
CONFIG_FILE = "instagram_config.json"

def load_token():
    """Carga el token desde el archivo de configuración"""
    try:
        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)
        return config.get('token')
    except Exception as e:
        logging.error(f"Error cargando token: {e}")
        return None

def process_scheduled_posts(token=None):
    """Procesa las publicaciones programadas una sola vez"""
    if not os.path.exists(SCHEDULED_POSTS_FILE):
        logging.info("No hay archivo de publicaciones programadas")
        return False
    
    try:
        with open(SCHEDULED_POSTS_FILE, 'r') as f:
            posts = json.load(f)
        
        if not posts:
            logging.info("No hay publicaciones programadas")
            return False
        
        # Verificar si hay publicaciones que deben publicarse
        current_time = time.time()
        posts_to_publish = [post for post in posts if current_time >= post['scheduled_time']]
        
        if not posts_to_publish:
            logging.info("No hay publicaciones listas para publicar")
            return False
        
        logging.info(f"Encontradas {len(posts_to_publish)} publicaciones para procesar")
        
        # Obtener token: primero del argumento, luego del archivo temporal
        if not token:
            # Intentar obtener del archivo temporal (para ejecución automática)
            token_file = "current_token.txt"
            if os.path.exists(token_file):
                try:
                    with open(token_file, 'r') as f:
                        token = f.read().strip()
                    logging.info("Token obtenido del archivo temporal")
                except Exception as e:
                    logging.error(f"Error leyendo token del archivo: {e}")
                    return False
            else:
                logging.error("No se proporcionó token como argumento y no hay archivo temporal")
                return False
        
        logging.info(f"Token disponible: {'SÍ' if token else 'NO'}")
        
        # Ejecutar el post_scheduler para procesar las publicaciones
        script_path = os.path.join(os.path.dirname(__file__), "post_scheduler.py")
        result = subprocess.run(['python', script_path, token], 
                              capture_output=True, 
                              text=True, 
                              timeout=60)
        
        if result.returncode == 0:
            logging.info("Publicaciones procesadas exitosamente")
            return True
        else:
            logging.error(f"Error procesando publicaciones: {result.stderr}")
            return False
            
    except Exception as e:
        logging.error(f"Error: {e}")
        return False

def main():
    import sys
    
    logging.info("Auto Scheduler iniciado")
    
    # Obtener token del argumento o del archivo temporal
    token = None
    if len(sys.argv) > 1:
        token = sys.argv[1]
        logging.info(f"Token recibido como argumento: {'SÍ' if token else 'NO'}")
    else:
        logging.info("No se proporcionó token como argumento, intentando obtener del archivo temporal")
    
    success = process_scheduled_posts(token)
    
    if success:
        logging.info("Auto Scheduler completado exitosamente")
    else:
        logging.info("Auto Scheduler completado sin publicaciones")
    
    # El script se detiene automáticamente después de procesar

if __name__ == "__main__":
    main() 