import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request

def main():
    parser = argparse.ArgumentParser(description='Crear publicación inmediata en Instagram')
    parser.add_argument('--image_url', required=True, help='URL de la imagen')
    parser.add_argument('--caption', required=True, help='Caption de la publicación')
    args = parser.parse_args()

    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print(json.dumps({'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}))
        sys.exit(1)

    params = {
        'image_url': args.image_url,
        'caption': args.caption
    }
    endpoint = f"{instagram_id}/media"
    container_response = make_api_request(endpoint, params, method="POST")

    if container_response and 'id' in container_response:
        creation_id = container_response['id']
        publish_params = { 'creation_id': creation_id }
        publish_endpoint = f"{instagram_id}/media_publish"
        publish_response = make_api_request(publish_endpoint, publish_params, method="POST")
        
        if publish_response and 'id' in publish_response:
            # Guardar los datos del post publicado
            try:
                from save_instagram_posts import save_single_post
                post_data = {
                    'id': publish_response['id'],
                    'media_type': 'IMAGE',
                    'caption': args.caption,
                    'media_url': args.image_url,
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                    'like_count': 0,
                    'comments_count': 0
                }
                save_single_post(post_data)
            except Exception as e:
                # Si falla el guardado, no es crítico, solo log
                print(f"Warning: No se pudo guardar el post: {e}")
        
        print(json.dumps({'success': True, 'response': publish_response}))
    else:
        print(json.dumps({'success': False, 'error': 'No se pudo crear el contenedor de la publicación'}))
        sys.exit(1)

if __name__ == "__main__":
    main() 