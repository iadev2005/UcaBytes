import argparse
import sys
import json
import time
import os
from graphAPI import extract_instagram_id, make_api_request, set_token

def main():
    print("[DEBUG] === Iniciando script de programación de post ===")
    parser = argparse.ArgumentParser(description='Programar publicación en Instagram')
    parser.add_argument('--image_url', required=True, help='URL de la imagen')
    parser.add_argument('--caption', required=True, help='Caption de la publicación')
    parser.add_argument('--scheduled_time', type=int, required=True, help='Timestamp para programación')
    parser.add_argument('token', help='Token de acceso de Instagram')
    args = parser.parse_args()

    print(f"[DEBUG] Argumentos recibidos:")
    print(f"[DEBUG] - image_url: {args.image_url}")
    print(f"[DEBUG] - caption: {args.caption}")
    print(f"[DEBUG] - scheduled_time: {args.scheduled_time}")
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
        result = {'success': False, 'error': 'No se encontró una cuenta de Instagram Business asociada'}
        print(json.dumps(result))
        sys.exit(1)
    
    print(f"[DEBUG] Usando cuenta: {page_name} (ID: {instagram_id})")

    try:
        print("[DEBUG] Creando contenedor de la publicación programada...")
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
            
            # Agregar el nuevo post programado
            new_post = {
                'instagram_id': instagram_id,
                'creation_id': creation_id,
                'scheduled_time': args.scheduled_time,
                'caption': args.caption,
                'image_url': args.image_url,
                'media_type': 'IMAGE'
            }
            
            posts.append(new_post)
            
            # Guardar el archivo
            try:
                with open(scheduled_path, 'w', encoding='utf-8') as f:
                    json.dump(posts, f, indent=2, ensure_ascii=False)
                print(f"[DEBUG] Post programado guardado exitosamente")
            except Exception as e:
                print(f"[ERROR] Error guardando archivo: {e}")
                result = {'success': False, 'error': f'Error guardando programación: {str(e)}'}
                print(json.dumps(result))
                sys.exit(1)
            
            # Enviar respuesta de éxito
            result = {'success': True, 'creation_id': creation_id, 'scheduled_time': args.scheduled_time}
            print(json.dumps(result))
            sys.exit(0)
        else:
            print("[ERROR] No se pudo crear el contenedor de la publicación")
            print(f"[DEBUG] Respuesta completa: {container_response}")
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