import argparse
import sys
import json
import time
import os
from graphAPI import extract_instagram_id, make_api_request, set_token

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
    print("[DEBUG] === Iniciando script de programación de historia ===")
    parser = argparse.ArgumentParser(description='Crear historia en Instagram con soporte de programación')
    parser.add_argument('--media_url', required=True, help='URL del medio (imagen o video)')
    parser.add_argument('--scheduled_time', type=int, help='Timestamp para programación (opcional)')
    parser.add_argument('token', help='Token de acceso de Instagram')
    
    args = parser.parse_args()
    
    print(f"[DEBUG] Argumentos recibidos:")
    print(f"[DEBUG] - media_url: {args.media_url}")
    print(f"[DEBUG] - scheduled_time: {args.scheduled_time}")
    print(f"[DEBUG] - token: {'TOKEN_PROVIDED' if args.token else 'NO_TOKEN'}")
    
    # Establecer el token
    print("[DEBUG] Estableciendo token...")
    set_token(args.token)
    print("[DEBUG] Token establecido correctamente")
    
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
        # Determinar si es video o imagen
        is_video = is_video_url(args.media_url)
        print(f"[DEBUG] Tipo de medio detectado: {'VIDEO' if is_video else 'IMAGEN'}")
        
        # Paso 1: Crear contenedor de la historia
        print(f"[DEBUG] Creando contenedor para historia (STORIES): {args.media_url}")
        container_response = create_story_container(instagram_id, args.media_url, is_video)
        
        if not container_response or 'id' not in container_response:
            print("[ERROR] No se pudo crear el contenedor de la historia")
            result = {'success': False, 'error': 'No se pudo crear el contenedor de la historia'}
            print(json.dumps(result))
            sys.exit(1)
        
        creation_id = container_response['id']
        print(f"[DEBUG] Contenedor de historia creado con ID: {creation_id}")
        
        # Si se proporciona scheduled_time, guardar en scheduled_posts.json
        if args.scheduled_time:
            print(f"[DEBUG] Historia programada para: {args.scheduled_time}")
            
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
            
            # Agregar la nueva historia programada
            new_post = {
                'instagram_id': instagram_id,
                'creation_id': creation_id,
                'scheduled_time': args.scheduled_time,
                'media_url': args.media_url,
                'media_type': 'VIDEO' if is_video else 'IMAGE',
                'is_story': True,
                'is_video': is_video
            }
            
            posts.append(new_post)
            
            # Guardar el archivo
            try:
                with open(scheduled_path, 'w', encoding='utf-8') as f:
                    json.dump(posts, f, indent=2, ensure_ascii=False)
                print(f"[DEBUG] Historia programada guardada exitosamente")
            except Exception as e:
                print(f"[ERROR] Error guardando archivo: {e}")
                result = {'success': False, 'error': f'Error guardando programación: {str(e)}'}
                print(json.dumps(result))
                sys.exit(1)
            
            # Enviar respuesta de éxito
            result = {'success': True, 'creation_id': creation_id, 'scheduled_time': args.scheduled_time}
            print(json.dumps(result))
            sys.exit(0)
        
        # Paso 2: Publicar la historia inmediatamente con reintentos
        print("[DEBUG] Publicando historia inmediatamente...")
        max_attempts = 10
        attempt = 1
        
        while attempt <= max_attempts:
            print(f"[DEBUG] Intento {attempt} de {max_attempts} para publicar la historia...")
            
            publish_response = publish_story(instagram_id, creation_id)
            
            if publish_response and 'id' in publish_response:
                print(f"[DEBUG] ¡Historia publicada exitosamente con ID: {publish_response['id']}!")
                
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
                    print("[DEBUG] Historia guardada en instagram_stories.json")
                except Exception as e:
                    print(f"[WARNING] No se pudo guardar la historia: {e}")
                
                result = {'success': True, 'response': publish_response}
                print(json.dumps(result))
                sys.exit(0)
            else:
                print(f"[DEBUG] Intento {attempt} falló. Esperando 10 segundos antes del siguiente intento...")
                if attempt < max_attempts:
                    time.sleep(10)
                attempt += 1
        
        # Si llegamos aquí, todos los intentos fallaron
        print(f"[ERROR] No se pudo publicar la historia después de {max_attempts} intentos")
        result = {'success': False, 'error': f'No se pudo publicar la historia después de {max_attempts} intentos'}
        print(json.dumps(result))
        sys.exit(1)
            
    except Exception as e:
        print(f"[ERROR] Error inesperado: {str(e)}")
        result = {'success': False, 'error': f'Error inesperado: {str(e)}'}
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main() 