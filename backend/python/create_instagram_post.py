import argparse
import sys
import json
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
        print(json.dumps({'success': True, 'response': publish_response}))
    else:
        print(json.dumps({'success': False, 'error': 'No se pudo crear el contenedor de la publicación'}))
        sys.exit(1)

if __name__ == "__main__":
    main() 