import argparse
import sys
import json
import time
import os
from graphAPI import extract_instagram_id, make_api_request, set_token

def detect_media_type(url):
    """Detecta si una URL es video o imagen"""
    is_video = any(ext in url.lower() for ext in ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv']) or \
               'video' in url.lower() or \
               'reel' in url.lower()
    return 'REELS' if is_video else 'IMAGE'

def create_media_container(instagram_id, media_url, media_type):
    """Crea un contenedor para un medio (imagen o video)"""
    params = {
        'is_carousel_item': 'true'
    }
    
    if media_type == 'REELS':
        params['media_type'] = 'REELS'
        params['video_url'] = media_url
    else:
        # Para imágenes, NO especificar media_type
        params['image_url'] = media_url
    
    # NO agregar caption aquí para elementos de carrusel
    # El caption va solo en el carrusel principal
    
    print(f"DEBUG - Parámetros para {media_type}: {params}")
    
    endpoint = f"{instagram_id}/media"
    return make_api_request(endpoint, params, method="POST")

def main():
    print("[DEBUG] === Iniciando script de programación de carrusel mixto ===")
    parser = argparse.ArgumentParser(description='Programar carrusel mixto en Instagram')
    parser.add_argument('--media_urls', required=True, nargs='+', help='URLs de imágenes y videos')
    parser.add_argument('--caption', required=True, help='Caption del carrusel')
    parser.add_argument('--scheduled_time', type=int, required=True, help='Timestamp para programación')
    parser.add_argument('token', help='Token de acceso de Instagram')
    
    args = parser.parse_args()
    
    print(f"[DEBUG] Argumentos recibidos:")
    print(f"[DEBUG] - media_urls: {args.media_urls}")
    print(f"[DEBUG] - caption: {args.caption}")
    print(f"[DEBUG] - scheduled_time: {args.scheduled_time}")
    print(f"[DEBUG] - token: {'TOKEN_PROVIDED' if args.token else 'NO_TOKEN'}")
    
    # Establecer el token
    print("[DEBUG] Estableciendo token...")
    set_token(args.token)
    print("[DEBUG] Token establecido correctamente")
    
    # Validaciones
    if len(args.media_urls) < 2:
        print("[ERROR] Se requieren al menos 2 medios para crear un carrusel")
        result = {'success': False, 'error': 'Se requieren al menos 2 medios para crear un carrusel'}
        print(json.dumps(result))
        sys.exit(1)
    
    if len(args.media_urls) > 10:
        print("[ERROR] Máximo 10 medios permitidos")
        result = {'success': False, 'error': 'Máximo 10 medios permitidos'}
        print(json.dumps(result))
        sys.exit(1)
    
    # Obtener Instagram ID
    print("[DEBUG] Extrayendo ID de Instagram...")
    instagram_id, page_name = extract_instagram_id()
    print(f"[DEBUG] Resultado: instagram_id={instagram_id}, page_name={page_name}")
    
    if not instagram_id:
        print("[ERROR] No se encontró una cuenta de Instagram Business asociada")
        result = {'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}
        print(json.dumps(result))
        sys.exit(1)
    
    print(f"[DEBUG] Usando cuenta: {page_name} (ID: {instagram_id})")
    
    try:
        # Paso 1: Crear contenedores para cada medio
        creation_ids = []
        media_types = []
        
        for i, media_url in enumerate(args.media_urls):
            print(f"[DEBUG] Creando contenedor {i+1}/{len(args.media_urls)} para: {media_url}")
            
            # Detectar tipo de medio
            media_type = detect_media_type(media_url)
            media_types.append(media_type)
            
            # Crear contenedor
            container_response = create_media_container(instagram_id, media_url, media_type)
            
            if container_response and 'id' in container_response:
                creation_id = container_response['id']
                creation_ids.append(creation_id)
                print(f"[DEBUG] Contenedor creado con ID: {creation_id}")
            else:
                print(f"[ERROR] Error creando contenedor para: {media_url}")
                result = {'success': False, 'error': f'Error creando contenedor para: {media_url}'}
                print(json.dumps(result))
                sys.exit(1)
            
            # Pausa entre requests
            if i < len(args.media_urls) - 1:
                time.sleep(1)
        
        print(f"[DEBUG] Todos los contenedores creados: {creation_ids}")
        
        # Paso 2: Crear el carrusel principal
        print("[DEBUG] Creando carrusel principal...")
        carousel_params = {
            'children': ','.join(creation_ids),
            'media_type': 'CAROUSEL',
            'caption': args.caption
        }
        
        print(f"[DEBUG] Parámetros del carrusel: {carousel_params}")
        
        # Reintentos para crear el carrusel principal
        max_carousel_attempts = 10
        carousel_attempt = 1
        
        while carousel_attempt <= max_carousel_attempts:
            print(f"[DEBUG] Intento {carousel_attempt} de {max_carousel_attempts} para crear el carrusel principal...")
            
            carousel_endpoint = f"{instagram_id}/media"
            carousel_response = make_api_request(carousel_endpoint, carousel_params, method="POST")
            
            if carousel_response and 'id' in carousel_response:
                print(f"[DEBUG] Carrusel principal creado exitosamente con ID: {carousel_response['id']}")
                break
            else:
                print(f"[DEBUG] Intento {carousel_attempt} falló. Esperando 10 segundos...")
                if carousel_attempt < max_carousel_attempts:
                    time.sleep(10)
            carousel_attempt += 1
        
        if not carousel_response or 'id' not in carousel_response:
            print(f"[ERROR] No se pudo crear el carrusel principal después de {max_carousel_attempts} intentos")
            result = {'success': False, 'error': f'No se pudo crear el carrusel principal después de {max_carousel_attempts} intentos'}
            print(json.dumps(result))
            sys.exit(1)
        
        carousel_id = carousel_response['id']
        print(f"[DEBUG] Contenedor carrusel creado con ID: {carousel_id}")
        
        # Guardar en scheduled_posts.json
        print("[DEBUG] Guardando en scheduled_posts.json...")
        scheduled_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scheduled_posts.json')
        
        posts = []
        if os.path.exists(scheduled_path):
            try:
                with open(scheduled_path, 'r', encoding='utf-8') as f:
                    posts = json.load(f)
            except Exception as e:
                print(f"[WARNING] Error leyendo archivo existente: {e}")
                posts = []
        
        # Agregar el nuevo carrusel mixto programado
        new_post = {
            'instagram_id': instagram_id,
            'creation_id': carousel_id,
            'scheduled_time': args.scheduled_time,
            'caption': args.caption,
            'media_urls': args.media_urls,
            'media_types': media_types,
            'media_type': 'CAROUSEL',
            'is_carousel': True,
            'is_mixed': True
        }
        
        posts.append(new_post)
        
        # Guardar el archivo
        try:
            with open(scheduled_path, 'w', encoding='utf-8') as f:
                json.dump(posts, f, indent=2, ensure_ascii=False)
            print(f"[DEBUG] Carrusel mixto programado guardado exitosamente")
        except Exception as e:
            print(f"[ERROR] Error guardando archivo: {e}")
            result = {'success': False, 'error': f'Error guardando programación: {str(e)}'}
            print(json.dumps(result))
            sys.exit(1)
        
        # Enviar respuesta de éxito
        result = {'success': True, 'creation_id': carousel_id, 'scheduled_time': args.scheduled_time}
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        print(f"[ERROR] Error inesperado: {str(e)}")
        result = {'success': False, 'error': f'Error inesperado: {str(e)}'}
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 