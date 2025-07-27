import os
import json
import time
import subprocess
from datetime import datetime, timedelta

SCHEDULED_POSTS_FILE = "scheduled_posts.json"
CONFIG_FILE = "instagram_config.json"

def load_token():
    """Carga el token desde el archivo de configuración"""
    try:
        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)
        return config.get('token')
    except Exception as e:
        print(f"Error cargando token: {e}")
        return None

def has_scheduled_posts():
    """Verifica si hay publicaciones programadas"""
    if not os.path.exists(SCHEDULED_POSTS_FILE):
        return False
    
    try:
        with open(SCHEDULED_POSTS_FILE, 'r') as f:
            posts = json.load(f)
        
        if not posts:
            return False
        
        # Verificar si hay al menos una publicación programada para el futuro
        current_time = time.time()
        for post in posts:
            if post['scheduled_time'] > current_time:
                return True
        
        return False
    except Exception as e:
        print(f"Error leyendo scheduled_posts.json: {e}")
        return False

def run_post_scheduler():
    """Ejecuta el post_scheduler.py"""
    try:
        # Cargar el token
        token = load_token()
        if not token:
            print(f"[{datetime.now()}] No se pudo cargar el token de Instagram")
            return
        
        script_path = os.path.join(os.path.dirname(__file__), "post_scheduler.py")
        result = subprocess.run(['python', script_path, token], 
                              capture_output=True, 
                              text=True, 
                              timeout=60)  # Timeout de 1 minuto
        
        if result.returncode == 0:
            print(f"[{datetime.now()}] Post scheduler ejecutado exitosamente")
        else:
            print(f"[{datetime.now()}] Error ejecutando post scheduler: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        print(f"[{datetime.now()}] Post scheduler tardó demasiado, se canceló")
    except Exception as e:
        print(f"[{datetime.now()}] Error ejecutando post scheduler: {e}")

def main():
    print(f"[{datetime.now()}] Smart Scheduler iniciado")
    
    # Verificar si hay publicaciones programadas
    if has_scheduled_posts():
        print(f"[{datetime.now()}] Publicaciones programadas encontradas, ejecutando scheduler...")
        run_post_scheduler()
    else:
        print(f"[{datetime.now()}] No hay publicaciones programadas")
    
    print(f"[{datetime.now()}] Smart Scheduler completado")

if __name__ == "__main__":
    main() 