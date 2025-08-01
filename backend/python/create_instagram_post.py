import argparse
import sys
import json
import time
from graphAPI import extract_instagram_id, make_api_request, set_token

def main():
    print("[DEBUG] === Iniciando script de creación de post ===")
    parser = argparse.ArgumentParser(description='Crear publicación inmediata en Instagram')
    parser.add_argument('--image_url', required=True, help='URL de la imagen')
    parser.add_argument('--caption', required=True, help='Caption de la publicación')
    parser.add_argument('token', help='Token de acceso de Instagram')
    args = parser.parse_args()

    print(f"[DEBUG] Argumentos recibidos:")
    print(f"[DEBUG] - image_url: {args.image_url}")
    print(f"[DEBUG] - caption: {args.caption}")
    print(f"[DEBUG] - token: {'TOKEN_PROVIDED' if args.token else 'NO_TOKEN'}")

    # Establecer el token
    print("[DEBUG] Estableciendo token...")
    set_token(args.token)
    print("[DEBUG] Token establecido correctamente")

    print("[DEBUG] Extrayendo ID de Instagram...")
    instagram_id, page_name = extract_instagram_id()
    print(f"[DEBUG] Resultado: instagram_id={instagram_id}, page_name={page_name}")
    
    if not instagram_id:
        print("[ERROR] No se encontró una cuenta de Instagram Business asociada")
        print(json.dumps({'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}))
        sys.exit(1)
    
    print(f"[DEBUG] Usando cuenta: {page_name} (ID: {instagram_id})")

    try:
        print("[DEBUG] Creando contenedor de la publicación...")
        params = {
            'image_url': args.image_url,
            'caption': args.caption
        }
        endpoint = f"{instagram_id}/media"
        print(f"[DEBUG] Endpoint: {endpoint}")
        print(f"[DEBUG] Parámetros: {params}")
        
        container_response = make_api_request(endpoint, params, method="POST")
        print(f"[DEBUG] Respuesta del contenedor: {container_response}")

        if container_response and 'id' in container_response:
            creation_id = container_response['id']
            print(f"[DEBUG] Contenedor creado con ID: {creation_id}")
            
            print("[DEBUG] Publicando la publicación...")
            publish_params = { 'creation_id': creation_id }
            publish_endpoint = f"{instagram_id}/media_publish"
            print(f"[DEBUG] Endpoint de publicación: {publish_endpoint}")
            print(f"[DEBUG] Parámetros de publicación: {publish_params}")
            
            publish_response = make_api_request(publish_endpoint, publish_params, method="POST")
            print(f"[DEBUG] Respuesta de publicación: {publish_response}")
            
            if publish_response and 'id' in publish_response:
                print(f"[DEBUG] ¡Publicación exitosa! ID: {publish_response['id']}")
                
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
                    print("[DEBUG] Post guardado en archivo local")
                except Exception as e:
                    # Si falla el guardado, no es crítico, solo log
                    print(f"[WARNING] No se pudo guardar el post: {e}")
            
                # Enviar respuesta de éxito (esta debe ser la última línea)
                result = {'success': True, 'response': publish_response}
                print(json.dumps(result))
                sys.exit(0)
            else:
                print("[ERROR] No se pudo publicar la publicación")
                result = {'success': False, 'error': 'No se pudo publicar la publicación'}
                print(json.dumps(result))
                sys.exit(1)
        else:
            print("[ERROR] No se pudo crear el contenedor de la publicación")
            print(f"[DEBUG] Respuesta completa: {container_response}")
            # Enviar respuesta de error (esta debe ser la última línea)
            result = {'success': False, 'error': 'No se pudo crear el contenedor de la publicación'}
            print(json.dumps(result))
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Error inesperado: {str(e)}")
        result = {'success': False, 'error': f'Error inesperado: {str(e)}'}
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 