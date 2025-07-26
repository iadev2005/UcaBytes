import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request

def main():
    parser = argparse.ArgumentParser(description='Crear publicación de video inmediata en Instagram')
    parser.add_argument('--video_url', required=True, help='URL del video')
    parser.add_argument('--caption', required=True, help='Caption de la publicación')
    args = parser.parse_args()

    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print(json.dumps({'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}))
        sys.exit(1)

    params = {
        'video_url': args.video_url,
        'media_type': 'REELS',
        'caption': args.caption
    }
    endpoint = f"{instagram_id}/media"
    container_response = make_api_request(endpoint, params, method="POST")

    if container_response and 'id' in container_response:
        creation_id = container_response['id']
        print(f"Contenedor creado con ID: {creation_id}")
        
        # Intentar publicar el video con múltiples intentos
        max_attempts = 5
        attempt = 1
        
        while attempt <= max_attempts:
            print(f"Intento {attempt} de {max_attempts} para publicar el video...")
            
            publish_params = { 'creation_id': creation_id }
            publish_endpoint = f"{instagram_id}/media_publish"
            publish_response = make_api_request(publish_endpoint, publish_params, method="POST")
            
            if publish_response and 'id' in publish_response:
                # ¡Éxito! Video publicado
                print(f"¡Video publicado exitosamente con ID: {publish_response['id']}!")
                
                # Guardar los datos del post publicado
                try:
                    from save_instagram_posts import save_single_post
                    post_data = {
                        'id': publish_response['id'],
                        'media_type': 'VIDEO',
                        'caption': args.caption,
                        'video_url': args.video_url,
                        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                        'like_count': 0,
                        'comments_count': 0
                    }
                    save_single_post(post_data)
                except Exception as e:
                    # Si falla el guardado, no es crítico, solo log
                    print(f"Warning: No se pudo guardar el post: {e}")
                
                print(json.dumps({'success': True, 'response': publish_response}))
                return
            else:
                print(f"Intento {attempt} falló. Esperando 10 segundos antes del siguiente intento...")
                if attempt < max_attempts:
                    time.sleep(10)  # Esperar 10 segundos antes del siguiente intento
                attempt += 1
        
        # Si llegamos aquí, todos los intentos fallaron
        print(json.dumps({'success': False, 'error': f'No se pudo publicar el video después de {max_attempts} intentos'}))
        sys.exit(1)
    else:
        print(json.dumps({'success': False, 'error': 'No se pudo crear el contenedor del video'}))
        sys.exit(1)

if __name__ == "__main__":
    main() 