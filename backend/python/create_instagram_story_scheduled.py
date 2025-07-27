import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request

def create_story_container(instagram_id, media_url, is_video=False):
    """Crea un contenedor para una historia"""
    params = {
        'media_type': 'STORIES'
    }
    
    # Usar image_url o video_url dependiendo del tipo
    if is_video:
        params['video_url'] = media_url
    else:
        params['image_url'] = media_url
    
    print(f"DEBUG - Parámetros para historia: {params}")
    
    endpoint = f"{instagram_id}/media"
    return make_api_request(endpoint, params, method="POST")

def publish_story(instagram_id, creation_id):
    """Publica la historia en Instagram"""
    params = { 'creation_id': creation_id }
    endpoint = f"{instagram_id}/media_publish"
    return make_api_request(endpoint, params, method="POST")

def is_video_url(url):
    """Determina si la URL es un video"""
    video_extensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv']
    return any(ext in url.lower() for ext in video_extensions) or 'video' in url.lower() or 'reel' in url.lower()

def main():
    parser = argparse.ArgumentParser(description='Crear historia en Instagram con soporte de programación')
    parser.add_argument('--media_url', required=True, help='URL del medio (imagen o video)')
    parser.add_argument('--scheduled_time', type=int, help='Timestamp para programación (opcional)')
    
    args = parser.parse_args()
    
    # Obtener Instagram ID
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print(json.dumps({'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}))
        sys.exit(1)
    
    try:
        # Determinar si es video o imagen
        is_video = is_video_url(args.media_url)
        
        # Paso 1: Crear contenedor de la historia
        print(f"Creando contenedor para historia (STORIES): {args.media_url}")
        container_response = create_story_container(instagram_id, args.media_url, is_video)
        
        if not container_response or 'id' not in container_response:
            print(json.dumps({'success': False, 'error': 'No se pudo crear el contenedor de la historia'}))
            sys.exit(1)
        
        creation_id = container_response['id']
        print(f"Contenedor de historia creado con ID: {creation_id}")
        
        # Si se proporciona scheduled_time, no publicar inmediatamente
        if args.scheduled_time:
            print(f"Historia programada para: {args.scheduled_time}")
            print(json.dumps({'success': True, 'creation_id': creation_id}))
            return
        
        # Paso 2: Publicar la historia con reintentos
        print("Publicando historia...")
        max_attempts = 10
        attempt = 1
        
        while attempt <= max_attempts:
            print(f"Intento {attempt} de {max_attempts} para publicar la historia...")
            
            publish_response = publish_story(instagram_id, creation_id)
            
            if publish_response and 'id' in publish_response:
                print(f"¡Historia publicada exitosamente con ID: {publish_response['id']}!")
                
                # Guardar los datos de la historia publicada
                try:
                    from save_instagram_stories import save_single_story
                    story_data = {
                        'id': publish_response['id'],
                        'media_type': 'VIDEO' if is_video else 'IMAGE',
                        'media_url': args.media_url,
                        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                        'like_count': 0,
                        'comments_count': 0
                    }
                    save_single_story(story_data)
                except Exception as e:
                    print(f"Warning: No se pudo guardar la historia: {e}")
                
                print(json.dumps({'success': True, 'response': publish_response}))
                return
            else:
                print(f"Intento {attempt} falló. Esperando 10 segundos antes del siguiente intento...")
                if attempt < max_attempts:
                    time.sleep(10)
                attempt += 1
        
        # Si llegamos aquí, todos los intentos fallaron
        print(json.dumps({'success': False, 'error': f'No se pudo publicar la historia después de {max_attempts} intentos'}))
        sys.exit(1)
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': f'Error inesperado: {str(e)}'}))
        sys.exit(1)

if __name__ == "__main__":
    main() 