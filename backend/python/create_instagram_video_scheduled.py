import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request

def create_video_container(instagram_id, video_url, caption=None):
    """Crea un contenedor para un video individual"""
    params = {
        'media_type': 'REELS',
        'video_url': video_url
    }
    
    if caption:
        params['caption'] = caption
    
    print(f"DEBUG - Parámetros para video: {params}")
    
    endpoint = f"{instagram_id}/media"
    return make_api_request(endpoint, params, method="POST")

def publish_video(instagram_id, creation_id):
    """Publica el video en Instagram"""
    params = { 'creation_id': creation_id }
    endpoint = f"{instagram_id}/media_publish"
    return make_api_request(endpoint, params, method="POST")

def main():
    parser = argparse.ArgumentParser(description='Crear video individual en Instagram con soporte de programación')
    parser.add_argument('--video_url', required=True, help='URL del video')
    parser.add_argument('--caption', required=True, help='Caption del video')
    parser.add_argument('--scheduled_time', type=int, help='Timestamp para programación (opcional)')
    
    args = parser.parse_args()
    
    # Obtener Instagram ID
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print(json.dumps({'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}))
        sys.exit(1)
    
    try:
        # Paso 1: Crear contenedor del video
        print(f"Creando contenedor para video: {args.video_url}")
        container_response = create_video_container(instagram_id, args.video_url, args.caption)
        
        if not container_response or 'id' not in container_response:
            print(json.dumps({'success': False, 'error': 'No se pudo crear el contenedor del video'}))
            sys.exit(1)
        
        creation_id = container_response['id']
        print(f"Contenedor de video creado con ID: {creation_id}")
        
        # Si se proporciona scheduled_time, no publicar inmediatamente
        if args.scheduled_time:
            print(f"Video programado para: {args.scheduled_time}")
            print(json.dumps({'success': True, 'creation_id': creation_id}))
            return
        
        # Paso 2: Publicar el video con reintentos
        print("Publicando video...")
        max_attempts = 10
        attempt = 1
        
        while attempt <= max_attempts:
            print(f"Intento {attempt} de {max_attempts} para publicar el video...")
            
            publish_response = publish_video(instagram_id, creation_id)
            
            if publish_response and 'id' in publish_response:
                print(f"¡Video publicado exitosamente con ID: {publish_response['id']}!")
                
                # Guardar los datos del post publicado
                try:
                    from save_instagram_posts import save_single_post
                    post_data = {
                        'id': publish_response['id'],
                        'media_type': 'REELS',
                        'caption': args.caption,
                        'media_url': args.video_url,
                        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                        'like_count': 0,
                        'comments_count': 0
                    }
                    save_single_post(post_data)
                except Exception as e:
                    print(f"Warning: No se pudo guardar el post: {e}")
                
                print(json.dumps({'success': True, 'response': publish_response}))
                return
            else:
                print(f"Intento {attempt} falló. Esperando 10 segundos antes del siguiente intento...")
                if attempt < max_attempts:
                    time.sleep(10)
                attempt += 1
        
        # Si llegamos aquí, todos los intentos fallaron
        print(json.dumps({'success': False, 'error': f'No se pudo publicar el video después de {max_attempts} intentos'}))
        sys.exit(1)
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': f'Error inesperado: {str(e)}'}))
        sys.exit(1)

if __name__ == "__main__":
    main() 