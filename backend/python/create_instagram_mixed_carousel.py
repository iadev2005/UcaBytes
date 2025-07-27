import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request, set_token

def detect_media_type(url):
    """Detecta si una URL es video o imagen"""
    is_video = any(ext in url.lower() for ext in ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv']) or \
               'video' in url.lower() or \
               'reel' in url.lower()
    return 'REELS' if is_video else 'IMAGE'

def create_media_container(instagram_id, media_url, media_type, caption=None):
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

def publish_carousel(instagram_id, creation_ids):
    """Publica el carrusel usando los IDs de creación"""
    params = { 'creation_id': creation_ids[0] }
    endpoint = f"{instagram_id}/media_publish"
    return make_api_request(endpoint, params, method="POST")

def main():
    print("[DEBUG] === Iniciando script de carrusel mixto ===")
    parser = argparse.ArgumentParser(description='Crear carrusel mixto en Instagram')
    parser.add_argument('--media_urls', required=True, nargs='+', help='URLs de imágenes y videos')
    parser.add_argument('--caption', required=True, help='Caption del carrusel')
    parser.add_argument('--scheduled_time', type=int, help='Timestamp para programación (opcional)')
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
            print(f"Creando contenedor {i+1}/{len(args.media_urls)} para: {media_url}")
            
            # Detectar tipo de medio
            is_video = any(ext in media_url.lower() for ext in ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv']) or \
                      'video' in media_url.lower() or \
                      'reel' in media_url.lower()
            
            # Para carruseles, usar REELS para videos
            media_type = 'REELS' if is_video else 'IMAGE'
            media_types.append(media_type)
            
            # Crear contenedor individual con reintentos si es video
            if is_video:
                print(f"Creando contenedor de video con reintentos...")
                max_container_attempts = 3
                container_attempt = 1
                container_response = None
                
                while container_attempt <= max_container_attempts:
                    print(f"Intento {container_attempt} de {max_container_attempts} para crear contenedor de video...")
                    container_response = create_media_container(instagram_id, media_url, media_type)
                    
                    if container_response and 'id' in container_response:
                        print(f"Contenedor de video creado exitosamente con ID: {container_response['id']}")
                        break
                    else:
                        print(f"Intento {container_attempt} falló. Esperando 5 segundos...")
                        if container_attempt < max_container_attempts:
                            time.sleep(5)
                        container_attempt += 1
                
                if not container_response or 'id' not in container_response:
                    print(json.dumps({'success': False, 'error': f'No se pudo crear el contenedor de video después de {max_container_attempts} intentos: {media_url}'}))
                    sys.exit(1)
            else:
                # Para imágenes, crear directamente
                container_response = create_media_container(instagram_id, media_url, media_type)
                
                if not container_response or 'id' not in container_response:
                    print(json.dumps({'success': False, 'error': f'No se pudo crear el contenedor para: {media_url}'}))
                    sys.exit(1)
            
            creation_ids.append(container_response['id'])
            print(f"Contenedor {i+1} creado con ID: {container_response['id']}")
            
            # Si es video, esperar un poco para que se procese
            if is_video:
                print(f"Esperando 5 segundos para que el video se procese...")
                time.sleep(5)
        
        # Paso 2: Crear el carrusel principal con reintentos
        print("Creando carrusel principal...")
        carousel_params = {
            'children': ','.join(creation_ids),
            'media_type': 'CAROUSEL',
            'caption': args.caption
        }
        print(f"Parámetros del carrusel: {carousel_params}")
        
        carousel_endpoint = f"{instagram_id}/media"
        
        # Reintentos para crear el carrusel principal
        max_carousel_attempts = 10
        carousel_attempt = 1
        carousel_response = None
        
        while carousel_attempt <= max_carousel_attempts:
            print(f"Intento {carousel_attempt} de {max_carousel_attempts} para crear el carrusel principal...")
            carousel_response = make_api_request(carousel_endpoint, carousel_params, method="POST")
            
            if carousel_response and 'id' in carousel_response:
                print(f"Carrusel principal creado exitosamente con ID: {carousel_response['id']}")
                break
            else:
                print(f"Intento {carousel_attempt} falló. Esperando 10 segundos...")
                if carousel_attempt < max_carousel_attempts:
                    time.sleep(10)
            carousel_attempt += 1
        
        if not carousel_response or 'id' not in carousel_response:
            print(json.dumps({'success': False, 'error': f'No se pudo crear el carrusel principal después de {max_carousel_attempts} intentos'}))
            sys.exit(1)
        
        if carousel_response and 'id' in carousel_response:
            carousel_id = carousel_response['id']
            print(f"Carrusel creado con ID: {carousel_id}")
            
            # Si se proporciona scheduled_time, no publicar inmediatamente
            if args.scheduled_time:
                print(f"[DEBUG] Carrusel programado para: {args.scheduled_time}")
                result = {'success': True, 'creation_id': carousel_id}
                print(json.dumps(result))
                sys.exit(0)
            
            # Paso 3: Publicar el carrusel con reintentos si contiene videos
            has_videos = any(media_type == 'REELS' for media_type in media_types)
            
            if has_videos:
                print("[DEBUG] Carrusel contiene videos. Iniciando reintentos para publicación...")
                max_attempts = 10
                attempt = 1
                
                while attempt <= max_attempts:
                    print(f"[DEBUG] Intento {attempt} de {max_attempts} para publicar el carrusel...")
                    
                    publish_params = { 'creation_id': carousel_id }
                    publish_endpoint = f"{instagram_id}/media_publish"
                    publish_response = make_api_request(publish_endpoint, publish_params, method="POST")
                    
                    if publish_response and 'id' in publish_response:
                        print(f"[DEBUG] ¡Carrusel publicado exitosamente con ID: {publish_response['id']}!")
                        
                        # Guardar los datos del post publicado
                        try:
                            from save_instagram_posts import save_single_post
                            post_data = {
                                'id': publish_response['id'],
                                'media_type': 'CAROUSEL',
                                'caption': args.caption,
                                'children': [
                                    {
                                        'media_url': url,
                                        'media_type': 'VIDEO' if media_type == 'REELS' else media_type
                                    } for url, media_type in zip(args.media_urls, media_types)
                                ],
                                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                                'like_count': 0,
                                'comments_count': 0
                            }
                            save_single_post(post_data)
                            print("[DEBUG] Post guardado en archivo local")
                        except Exception as e:
                            print(f"[WARNING] No se pudo guardar el post: {e}")
                        
                        # Enviar respuesta de éxito
                        result = {'success': True, 'response': publish_response}
                        print(json.dumps(result))
                        sys.exit(0)
                    else:
                        print(f"[DEBUG] Intento {attempt} falló. Esperando 10 segundos antes del siguiente intento...")
                        if attempt < max_attempts:
                            time.sleep(10)
                        attempt += 1
                
                # Si llegamos aquí, todos los intentos fallaron
                print(f"[ERROR] No se pudo publicar el carrusel después de {max_attempts} intentos")
                result = {'success': False, 'error': f'No se pudo publicar el carrusel después de {max_attempts} intentos'}
                print(json.dumps(result))
                sys.exit(1)
            else:
                # Solo imágenes, publicar directamente
                print("[DEBUG] Publicando carrusel de solo imágenes...")
                publish_params = { 'creation_id': carousel_id }
                publish_endpoint = f"{instagram_id}/media_publish"
                publish_response = make_api_request(publish_endpoint, publish_params, method="POST")
                
                if publish_response and 'id' in publish_response:
                    print(f"[DEBUG] ¡Carrusel publicado exitosamente con ID: {publish_response['id']}!")
                    
                    # Guardar los datos del post publicado
                    try:
                        from save_instagram_posts import save_single_post
                        post_data = {
                            'id': publish_response['id'],
                            'media_type': 'CAROUSEL',
                            'caption': args.caption,
                            'children': [
                                {
                                    'media_url': url,
                                    'media_type': 'VIDEO' if media_type == 'REELS' else media_type
                                } for url, media_type in zip(args.media_urls, media_types)
                            ],
                            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                            'like_count': 0,
                            'comments_count': 0
                        }
                        save_single_post(post_data)
                        print("[DEBUG] Post guardado en archivo local")
                    except Exception as e:
                        print(f"[WARNING] No se pudo guardar el post: {e}")
                    
                    # Enviar respuesta de éxito
                    result = {'success': True, 'response': publish_response}
                    print(json.dumps(result))
                    sys.exit(0)
                else:
                    print("[ERROR] Error publicando carrusel")
                    result = {'success': False, 'error': 'Error publicando carrusel'}
                    print(json.dumps(result))
                    sys.exit(1)
        else:
            print("[ERROR] No se pudo crear el carrusel principal")
            result = {'success': False, 'error': 'No se pudo crear el carrusel principal'}
            print(json.dumps(result))
            sys.exit(1)
            
    except Exception as e:
        print(f"[ERROR] Error inesperado: {str(e)}")
        result = {'success': False, 'error': f'Error inesperado: {str(e)}'}
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 