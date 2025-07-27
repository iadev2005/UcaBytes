#!/usr/bin/env python3
"""
Script para crear historias de Instagram
Soporta tanto imágenes (JPG) como videos (MP4)
Media type: STORIES (sin captions)
"""

import argparse
import json
import sys
import os
import time
from graphAPI import extract_instagram_id, make_api_request, set_token

def detect_media_type(media_url):
    """Detecta si es imagen o video basándose en la URL"""
    video_extensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv']
    media_url_lower = media_url.lower()
    for ext in video_extensions:
        if ext in media_url_lower:
            return 'VIDEO'
    return 'IMAGE'

def create_story_container(instagram_id, media_url, media_type):
    """Crea el contenedor para la historia"""
    endpoint = f"{instagram_id}/media"
    params = {
        'media_type': 'STORIES'
    }
    if media_type == 'VIDEO':
        params['video_url'] = media_url
    else:
        params['image_url'] = media_url
    print(f"[DEBUG] Creando contenedor de historia ({media_type})...")
    print(f"[DEBUG] Endpoint: {endpoint}")
    print(f"[DEBUG] Parámetros enviados: {params}")
    response = make_api_request(endpoint, params, method='POST')
    print(f"[DEBUG] Respuesta de creación de contenedor: {response}")
    if response and 'id' in response:
        print(f"[OK] Contenedor creado exitosamente: {response['id']}")
        return response['id']
    else:
        print(f"[ERROR] Error creando contenedor: {response}")
        return None

def publish_story(instagram_id, creation_id, max_attempts=10):
    """Publica la historia con reintentos"""
    endpoint = f"{instagram_id}/media_publish"
    params = {
        'creation_id': creation_id
    }
    print(f"[DEBUG] Publicando historia... (endpoint: {endpoint})")
    for attempt in range(1, max_attempts + 1):
        print(f"[DEBUG] Intento de publicación {attempt}/{max_attempts}...")
        response = make_api_request(endpoint, params, method='POST')
        print(f"[DEBUG] Respuesta intento {attempt}: {response}")
        if response and 'id' in response:
            print(f"[OK] Historia publicada exitosamente: {response['id']}")
            return response
        else:
            print(f"[WARN] Error en intento {attempt}: {response}")
            if attempt < max_attempts:
                print(f"[DEBUG] Reintentando en 5 segundos...")
                time.sleep(5)
            else:
                print(f"[ERROR] Se agotaron los intentos ({max_attempts})")
                return None
    return None

# Las historias no se guardan en archivos JSON
# Se publican directamente sin persistencia local

def main():
    print("=== [DEBUG] Iniciando script para crear historia de Instagram ===")
    parser = argparse.ArgumentParser(description='Crear historia de Instagram')
    parser.add_argument('--media_url', required=True, help='URL del medio (imagen o video)')
    parser.add_argument('token', help='Token de acceso de Instagram')
    args = parser.parse_args()
    print(f"[DEBUG] Argumentos recibidos: {args}")
    print(f"[DEBUG] URL del medio: {args.media_url}")
    
    # Establecer el token
    set_token(args.token)
    
    # Obtener Instagram ID
    instagram_id, page_name = extract_instagram_id()
    print(f"[DEBUG] Resultado de extract_instagram_id: instagram_id={instagram_id}, page_name={page_name}")
    if not instagram_id:
        print("[ERROR] No se encontró una cuenta de Instagram Business asociada")
        sys.exit(1)
    print(f"[OK] Cuenta de Instagram: {page_name} (ID: {instagram_id})")
    # Detectar tipo de medio
    media_type = detect_media_type(args.media_url)
    print(f"[DEBUG] Tipo de medio detectado: {media_type}")
    # Crear contenedor
    creation_id = create_story_container(instagram_id, args.media_url, media_type)
    if not creation_id:
        print("[ERROR] No se pudo crear el contenedor de la historia")
        sys.exit(1)
    # Esperar un momento para que el medio se procese
    print("[DEBUG] Esperando procesamiento del medio (10s)...")
    time.sleep(10)
    # Publicar historia
    story_response = publish_story(instagram_id, creation_id)
    if not story_response:
        print("[ERROR] No se pudo publicar la historia")
        sys.exit(1)
    # Respuesta final
    result = {
        'success': True,
        'message': 'Historia publicada con éxito',
        'response': story_response,
        'media_type': media_type,
        'media_url': args.media_url
    }
    print("\n[OK] ¡Historia publicada exitosamente!")
    print("JSON_RESPONSE_START")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("JSON_RESPONSE_END")

if __name__ == "__main__":
    main() 