import os
import json
import time
import subprocess
from datetime import datetime, timedelta

SCHEDULED_POSTS_FILE = "scheduled_posts.json"
CONFIG_FILE = "instagram_config.json"

def load_token():
    """Carga el token con la misma lógica que auto_scheduler.py"""
    # Primero intentar obtener del archivo temporal (token del localStorage)
    token_file = "current_token.txt"
    if os.path.exists(token_file):
        try:
            with open(token_file, 'r') as f:
                token = f.read().strip()
            if token:
                print(f"[{datetime.now()}] Token obtenido del archivo temporal (localStorage)")
                return token
        except Exception as e:
            print(f"Error leyendo token del archivo temporal: {e}")
    
    # Si no hay archivo temporal, usar el config.json como fallback
    try:
        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)
        token = config.get('token')
        if token:
            print(f"[{datetime.now()}] Token obtenido del archivo de configuración")
            return token
    except Exception as e:
        print(f"Error cargando token del config: {e}")
    
    print(f"[{datetime.now()}] No se pudo cargar ningún token")
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
        
        # Si hay posts en el archivo, ejecutar el scheduler
        # El post_scheduler.py se encargará de determinar cuáles publicar
        return True
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
            return False
        
        print(f"[{datetime.now()}] Token disponible: {'SÍ' if token else 'NO'}")
        
        script_path = os.path.join(os.path.dirname(__file__), "post_scheduler.py")
        result = subprocess.run(['python', script_path, token], 
                              capture_output=True, 
                              text=True, 
                              timeout=60)  # Timeout de 1 minuto
        
        if result.returncode == 0:
            print(f"[{datetime.now()}] Post scheduler ejecutado exitosamente")
            return True
        else:
            print(f"[{datetime.now()}] Error ejecutando post scheduler: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"[{datetime.now()}] Post scheduler tardó demasiado, se canceló")
        return False
    except Exception as e:
        print(f"[{datetime.now()}] Error ejecutando post scheduler: {e}")
        return False

def main():
    print(f"[{datetime.now()}] Smart Scheduler iniciado")
    
    # Verificar si hay publicaciones programadas
    if has_scheduled_posts():
        print(f"[{datetime.now()}] Publicaciones programadas encontradas, ejecutando scheduler...")
        success = run_post_scheduler()
        
        if success:
            print(f"[{datetime.now()}] Smart Scheduler completado exitosamente")
        else:
            print(f"[{datetime.now()}] Smart Scheduler completado con errores")
    else:
        print(f"[{datetime.now()}] No hay publicaciones programadas")
        print(f"[{datetime.now()}] Smart Scheduler completado sin acción")

if __name__ == "__main__":
    main() 