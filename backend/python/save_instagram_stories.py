#!/usr/bin/env python3
"""
Script para obtener historias activas de Instagram
Extrae toda la información disponible y la guarda en un JSON
"""

import json
import os
import sys
from datetime import datetime
from graphAPI import extract_instagram_id, make_api_request, set_token

def get_stories(instagram_id):
    """Obtiene las historias activas de Instagram"""
    endpoint = f"{instagram_id}/stories"
    
    # Campos básicos para historias
    fields = [
        'id',
        'media_type',
        'media_url',
        'thumbnail_url',
        'timestamp',
        'permalink'
    ]
    
    params = {
        'fields': ','.join(fields)
    }
    
    print(f"Obteniendo historias activas...")
    print(f"Endpoint: {endpoint}")
    print(f"Campos: {fields}")
    
    response = make_api_request(endpoint, params)
    
    if response and 'data' in response:
        print(f"Se encontraron {len(response['data'])} historias activas")
        return response
    else:
        print(f"Error obteniendo historias: {response}")
        return None

def get_story_details(story_id):
    """Obtiene detalles específicos de una historia"""
    endpoint = f"{story_id}"
    
    # Campos detallados para cada historia
    fields = [
        'id',
        'media_type',
        'media_url',
        'thumbnail_url',
        'timestamp',
        'permalink',
        'like_count',
        'is_shared_to_feed',
        'username',
        'caption',
        'comments_count',
        'owner',
        'shortcode'
    ]
    
    params = {
        'fields': ','.join(fields)
    }
    
    response = make_api_request(endpoint, params)
    
    if response:
        print(f"Detalles obtenidos para historia: {story_id}")
        return response
    else:
        print(f"Error obteniendo detalles de historia {story_id}: {response}")
        return None

def get_story_insights(story_id):
    """Obtiene insights de una historia específica"""
    endpoint = f"{story_id}/insights"
    
    # Métricas disponibles para historias (versión actual de la API)
    metrics = [
        'impressions',
        'reach',
        'replies',
        'navigation'
    ]
    
    params = {
        'metric': ','.join(metrics)
    }
    
    response = make_api_request(endpoint, params)
    
    if response and 'data' in response:
        print(f"Insights obtenidos para historia: {story_id}")
        return response
    elif response and 'error' in response:
        error_message = response['error'].get('message', 'Error desconocido')
        error_code = response['error'].get('code', 0)
        
        # Manejar específicamente el error de "Not enough viewers"
        if error_code == 10 or 'not enough viewers' in error_message.lower():
            print(f"No hay suficientes visualizaciones para mostrar insights: {error_message}")
            return {'insufficient_data': True, 'message': error_message, 'error_code': error_code}
        else:
            print(f"Error obteniendo insights de historia {story_id}: {error_message}")
            return None
    else:
        print(f"Error obteniendo insights de historia {story_id}: {response}")
        return None

def process_story_data(story):
    """Procesa y estructura los datos de una historia"""
    processed_story = {
        'id': story.get('id'),
        'media_type': story.get('media_type'),
        'media_url': story.get('media_url'),
        'thumbnail_url': story.get('thumbnail_url'),
        'timestamp': story.get('timestamp'),
        'permalink': story.get('permalink'),
        'like_count': story.get('like_count'),
        'is_shared_to_feed': story.get('is_shared_to_feed'),
        'username': story.get('username'),
        'caption': story.get('caption'),
        'comments_count': story.get('comments_count'),
        'owner': story.get('owner'),
        'shortcode': story.get('shortcode'),
        'processed_at': datetime.now().isoformat()
    }
    
    return processed_story

def save_stories_to_json(stories_data, filename='instagram_stories.json'):
    """Guarda las historias en un archivo JSON"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, filename)
    
    # Crear estructura de datos
    output_data = {
        'metadata': {
            'total_stories': len(stories_data),
            'extracted_at': datetime.now().isoformat(),
            'source': 'Instagram Stories API'
        },
        'stories': stories_data
    }
    
    # Guardar en archivo
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Historias guardadas en: {output_path}")
    return output_path

def main():
    print("=== Obtener Historias Activas de Instagram ===")
    
    # Obtener Instagram ID
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print("No se encontró una cuenta de Instagram Business asociada")
        sys.exit(1)
    
    print(f"Cuenta de Instagram: {page_name} (ID: {instagram_id})")
    
    # Obtener historias activas
    stories_response = get_stories(instagram_id)
    if not stories_response:
        print("No se pudieron obtener las historias")
        sys.exit(1)
    
    stories = stories_response['data']
    
    if not stories:
        print("No hay historias activas en este momento")
        # Crear archivo vacío
        save_stories_to_json([], 'instagram_stories.json')
        sys.exit(0)
    
    print(f"\nProcesando {len(stories)} historias...")
    
    # Procesar cada historia
    processed_stories = []
    for i, story in enumerate(stories, 1):
        print(f"\n--- Historia {i}/{len(stories)} ---")
        print(f"ID: {story.get('id')}")
        print(f"Tipo: {story.get('media_type')}")
        
        # Obtener detalles completos de la historia
        print("Obteniendo detalles completos...")
        detailed_story = get_story_details(story['id'])
        if detailed_story:
            processed_story = process_story_data(detailed_story)
        else:
            processed_story = process_story_data(story)
        
        # Obtener insights de la historia
        print("Obteniendo insights...")
        insights_response = get_story_insights(story['id'])
        if insights_response and 'data' in insights_response:
            insights_data = {}
            for insight in insights_response['data']:
                metric_name = insight.get('name', 'unknown')
                values = insight.get('values', [])
                if values:
                    insights_data[metric_name] = values[0].get('value', 0)
            processed_story['insights'] = insights_data
        elif insights_response and 'insufficient_data' in insights_response:
            processed_story['insights'] = {
                'status': 'insufficient_data',
                'message': insights_response.get('message', 'No hay suficientes visualizaciones para mostrar datos'),
                'error_code': insights_response.get('error_code', 10)
            }
        else:
            processed_story['insights'] = {'status': 'error', 'message': 'No se pudieron obtener insights'}
        
        processed_stories.append(processed_story)
    
    # Guardar en archivo JSON
    output_path = save_stories_to_json(processed_stories)
    
    # Resumen final
    print(f"\nProceso completado!")
    print(f"Archivo guardado: {output_path}")
    print(f"Total de historias procesadas: {len(processed_stories)}")
    
    # Mostrar estadísticas
    media_types = {}
    for story in processed_stories:
        media_type = story.get('media_type', 'UNKNOWN')
        media_types[media_type] = media_types.get(media_type, 0) + 1
    
    print(f"\nEstadisticas:")
    for media_type, count in media_types.items():
        print(f"  - {media_type}: {count} historias")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python save_instagram_stories.py <token>")
        sys.exit(1)
    
    token = sys.argv[1]
    set_token(token)
    main() 