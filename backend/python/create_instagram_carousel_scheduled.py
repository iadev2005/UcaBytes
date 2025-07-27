import argparse
import sys
import json
import time
import os
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

def main():
    print("[DEBUG] === Iniciando script de programación de carrusel ===")
    parser = argparse.ArgumentParser(description='Programar carrusel en Instagram')
    parser.add_argument('--image_urls', nargs='+', required=True, help='URLs de las imágenes')
    parser.add_argument('--caption', required=True, help='Caption de la publicación')
    parser.add_argument('--scheduled_time', type=int, required=True, help='Timestamp para programación')
    parser.add_argument('token', help='Token de acceso de Instagram')
    args = parser.parse_args()

    print(f"[DEBUG] Argumentos recibidos:")
    print(f"[DEBUG] - image_urls: {args.image_urls}")
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

    # Validar número de imágenes
    if len(args.image_urls) < 2:
        print("[ERROR] Se requieren al menos 2 imágenes para un carrusel")
        result = {'success': False, 'error': 'Se requieren al menos 2 imágenes para un carrusel'}
        print(json.dumps(result))
        sys.exit(1)
    
    if len(args.image_urls) > 10:
        print("[ERROR] Máximo 10 imágenes permitidas en un carrusel")
        result = {'success': False, 'error': 'Máximo 10 imágenes permitidas en un carrusel'}
        print(json.dumps(result))
        sys.exit(1)

    try:
        print("[DEBUG] Creando contenedores individuales para cada imagen...")
        # Paso 1: Crear contenedores individuales para cada imagen
        children_ids = []
        for i, image_url in enumerate(args.image_urls):
            print(f"[DEBUG] Procesando imagen {i+1}/{len(args.image_urls)}: {image_url}")
            item_id = create_carousel_item(instagram_id, image_url)
            if item_id:
                children_ids.append(item_id)
                print(f"[DEBUG] Contenedor creado con ID: {item_id}")
            else:
                print(f"[ERROR] Error creando contenedor para imagen: {image_url}")
                result = {'success': False, 'error': f'Error creando contenedor para imagen: {image_url}'}
                print(json.dumps(result))
                sys.exit(1)
            time.sleep(1)  # Pausa entre requests
        
        print(f"[DEBUG] Todos los contenedores creados: {children_ids}")
        
        print("[DEBUG] Creando contenedor principal del carrusel...")
        # Paso 2: Crear contenedor principal del carrusel
        carousel_id = create_carousel_container(instagram_id, children_ids, args.caption)
        if not carousel_id:
            print("[ERROR] Error creando contenedor carrusel")
            result = {'success': False, 'error': 'Error creando contenedor carrusel'}
            print(json.dumps(result))
            sys.exit(1)
        
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
        
        # Agregar el nuevo carrusel programado
        new_post = {
            'instagram_id': instagram_id,
            'creation_id': carousel_id,
            'scheduled_time': args.scheduled_time,
            'caption': args.caption,
            'image_urls': args.image_urls,
            'media_type': 'CAROUSEL',
            'is_carousel': True
        }
        
        posts.append(new_post)
        
        # Guardar el archivo
        try:
            with open(scheduled_path, 'w', encoding='utf-8') as f:
                json.dump(posts, f, indent=2, ensure_ascii=False)
            print(f"[DEBUG] Carrusel programado guardado exitosamente")
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