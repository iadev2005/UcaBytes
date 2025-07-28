#!/usr/bin/env python3
"""
Script de prueba para verificar que el scheduler funciona correctamente
"""

import os
import json
import time
from datetime import datetime, timedelta

def test_scheduler():
    """Prueba el scheduler con un post de prueba"""
    
    # Cargar el token
    try:
        with open("instagram_config.json", 'r') as f:
            config = json.load(f)
        token = config.get('token')
        print(f"Token cargado: {'SÍ' if token else 'NO'}")
    except Exception as e:
        print(f"Error cargando token: {e}")
        return False
    
    # Crear un post de prueba para dentro de 2 minutos
    test_time = int(time.time()) + 120  # 2 minutos desde ahora
    
    test_post = {
        "instagram_id": "17841475801593188",
        "creation_id": "TEST_CREATION_ID",
        "scheduled_time": test_time,
        "caption": "POST DE PRUEBA - Sistema limpiado",
        "image_url": "https://example.com/test.jpg",
        "media_type": "IMAGE"
    }
    
    # Guardar el post de prueba
    try:
        with open("scheduled_posts.json", 'w') as f:
            json.dump([test_post], f, indent=2)
        print(f"Post de prueba creado para: {datetime.fromtimestamp(test_time)}")
    except Exception as e:
        print(f"Error guardando post de prueba: {e}")
        return False
    
    # Ejecutar el auto_scheduler
    try:
        import subprocess
        result = subprocess.run(['python', 'auto_scheduler.py'], 
                              capture_output=True, 
                              text=True, 
                              timeout=30)
        
        print(f"Auto scheduler ejecutado - Return code: {result.returncode}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"Error ejecutando auto_scheduler: {e}")
        return False

if __name__ == "__main__":
    print("=== PRUEBA DEL SCHEDULER ===")
    print(f"Tiempo actual: {datetime.now()}")
    
    success = test_scheduler()
    
    if success:
        print("✅ Prueba exitosa - El scheduler funciona correctamente")
    else:
        print("❌ Prueba fallida - Hay problemas con el scheduler")
    
    print("=== FIN DE PRUEBA ===") 