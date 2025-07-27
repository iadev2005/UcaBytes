import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request, set_token

def create_carousel_item(instagram_id, image_url):
    """Crear un contenedor individual para cada imagen del carrusel"""
    params = {
        'image_url': image_url,
        'is_carousel_item': 'true'
    }
    
    print(f"DEBUG - Parámetros para imagen: {params}")
    
    endpoint = f"{instagram_id}/media"
    response = make_api_request(endpoint, params, method="POST")
    
    if response and 'id' in response:
        return response['id']
    else:
        return None

def create_carousel_container(instagram_id, children_ids, caption):
    """Crear el contenedor principal del carrusel"""
    params = {
        'children': ','.join(children_ids),
        'media_type': 'CAROUSEL',
        'caption': caption
    }
    
    print(f"DEBUG - Parámetros del carrusel: {params}")
    
    endpoint = f"{instagram_id}/media"
    response = make_api_request(endpoint, params, method="POST")
    
    if response and 'id' in response:
        return response['id']
    else:
        return None

def publish_carousel(instagram_id, creation_id):
    """Publicar el carrusel en Instagram"""
    params = {
        'creation_id': creation_id
    }
    
    endpoint = f"{instagram_id}/media_publish"
    response = make_api_request(endpoint, params, method="POST")
    
    return response

def main():
    parser = argparse.ArgumentParser(description='Crear carrusel de Instagram con múltiples imágenes')
    parser.add_argument('--image_urls', nargs='+', required=True, help='URLs de las imágenes')
    parser.add_argument('--caption', required=True, help='Caption de la publicación')
    parser.add_argument('--scheduled_time', type=int, help='Timestamp para programación (opcional)')
    parser.add_argument('token', help='Token de acceso de Instagram')
    args = parser.parse_args()

    # Establecer el token
    set_token(args.token)

    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print(json.dumps({'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}))
        sys.exit(1)

    # Validar número de imágenes
    if len(args.image_urls) < 2:
        print(json.dumps({'success': False, 'error': 'Se requieren al menos 2 imágenes para un carrusel'}))
        sys.exit(1)
    
    if len(args.image_urls) > 10:
        print(json.dumps({'success': False, 'error': 'Máximo 10 imágenes permitidas en un carrusel'}))
        sys.exit(1)

    try:
        # Paso 1: Crear contenedores individuales para cada imagen
        children_ids = []
        for image_url in args.image_urls:
            item_id = create_carousel_item(instagram_id, image_url)
            if item_id:
                children_ids.append(item_id)
            else:
                print(json.dumps({'success': False, 'error': f'Error creando contenedor para imagen: {image_url}'}))
                sys.exit(1)
            time.sleep(1)  # Pausa entre requests
        
        # Paso 2: Crear contenedor principal del carrusel
        carousel_id = create_carousel_container(instagram_id, children_ids, args.caption)
        if not carousel_id:
            print(json.dumps({'success': False, 'error': 'Error creando contenedor carrusel'}))
            sys.exit(1)
        
        # Si se proporciona scheduled_time, no publicar inmediatamente
        if args.scheduled_time:
            print(f"Carrusel programado para: {args.scheduled_time}")
            print(json.dumps({'success': True, 'creation_id': carousel_id}))
            return
        
        # Paso 3: Publicar el carrusel
        publish_response = publish_carousel(instagram_id, carousel_id)
        
        if publish_response and 'id' in publish_response:
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
                            'media_type': 'IMAGE'
                        } for url in args.image_urls
                    ],
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
            print(json.dumps({'success': False, 'error': 'Error publicando carrusel'}))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': f'Error inesperado: {str(e)}'}))
        sys.exit(1)

if __name__ == "__main__":
    main()