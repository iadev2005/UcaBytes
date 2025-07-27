import os
import requests
import json
from datetime import datetime, timedelta
import time

TOKEN = "EAAKJrM0WC6IBPEoZAy428EsfZCQypR6QBffH7kdXLZCOW2ZATAmiXZAwYJKITSQe82361NIfdzw3xiCAR5P2MzBYaFuA3PZB7E7ARInzaNC8wm0hAFBxD5ojeEnPZByE04p7tF5AmEUcm2s970vlleoBkYSWJsHlb5l79lBvUSIpjb3s2pQmchgx9kdFndPdAZBKhb6lqLZA6d3uNp6Qv1aZARvnUgO3MrEOwvlz9e"
APP_ID = "1047562113346147"
API_VER = "v23.0"
BASE_URL = f"https://graph.facebook.com/{API_VER}"
SCHEDULED_POSTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scheduled_posts.json")

def make_api_request(endpoint, params=None, method="GET"):
    if params is None:
        params = {}
    params['access_token'] = TOKEN
    params['app_id'] = APP_ID
    
    try:
        if method == "GET":
            resp = requests.get(f"{BASE_URL}/{endpoint}", params=params, timeout=10)
        elif method == "POST":
            resp = requests.post(f"{BASE_URL}/{endpoint}", data=params, timeout=10)
        
        # Intentar obtener la respuesta JSON incluso si hay error HTTP
        try:
            response_json = resp.json()
        except:
            response_json = None
        
        # Si hay error HTTP, devolver la respuesta JSON con el error
        if resp.status_code >= 400:
            if response_json:
                return response_json
            else:
                print(f"Error HTTP {resp.status_code}: {resp.text}")
                return None
        
        return response_json
    except requests.exceptions.RequestException as e:
        print("Error llamando a la API:", e)
        return None

def get_facebook_pages():
    return make_api_request("me/accounts")

def get_instagram_business_account():
    endpoint = f"me/accounts?fields=instagram_business_account,name"
    return make_api_request(endpoint)

def get_instagram_details(instagram_id):
    fields = "followers_count,follows_count,media_count,name,biography,username,profile_picture_url"
    return make_api_request(f"me/accounts?fields=instagram_business_account{{{fields}}}")

def get_instagram_posts(instagram_id):
    """Obtiene todas las publicaciones de la cuenta de Instagram con paginación"""
    all_posts = []
    endpoint = f"{instagram_id}/media"
    params = {
        'fields': 'id,caption,timestamp,media_type',
        'limit': 100  # Máximo permitido por la API
    }
    
    print("Obteniendo posts con paginación...")
    page_count = 0
    
    while True:
        page_count += 1
        print(f"Obteniendo página {page_count}...")
        
        response = make_api_request(endpoint, params)
        
        if not response or 'data' not in response:
            print(f"Error en página {page_count} o no hay más datos")
            break
            
        posts = response['data']
        all_posts.extend(posts)
        print(f"Página {page_count}: {len(posts)} posts obtenidos")
        
        # Verificar si hay más páginas
        if 'paging' in response and 'cursors' in response['paging'] and 'after' in response['paging']['cursors']:
            params['after'] = response['paging']['cursors']['after']
        else:
            print("No hay más páginas disponibles")
            break
    
    print(f"Total de posts obtenidos: {len(all_posts)}")
    return {'data': all_posts}

def create_instagram_post(instagram_id):
    print("\n=== Crear nueva publicación en Instagram ===")
    image_url = input("Ingrese la URL de la imagen: ")
    caption = input("Ingrese la descripción de la publicación: ")
    
    params = {
        "image_url": image_url,
        "caption": caption
    }
    
    print("\nCreando contenedor de la publicación...")
    endpoint = f"{instagram_id}/media"
    container_response = make_api_request(endpoint, params, method="POST")
    
    if container_response and 'id' in container_response:
        print("\nPublicando contenido en Instagram...")
        creation_id = container_response['id']
        publish_params = {
            "creation_id": creation_id
        }
        publish_endpoint = f"{instagram_id}/media_publish"
        publish_response = make_api_request(publish_endpoint, publish_params, method="POST")
        print("\nRespuesta de la publicación:")
        print_json(publish_response)
        return publish_response
    else:
        print("❌ No se pudo crear el contenedor de la publicación")
        return None

def load_scheduled_posts():
    """Carga las publicaciones programadas desde el archivo"""
    if os.path.exists(SCHEDULED_POSTS_FILE):
        with open(SCHEDULED_POSTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_scheduled_posts(posts):
    """Guarda las publicaciones programadas en el archivo"""
    with open(SCHEDULED_POSTS_FILE, 'w') as f:
        json.dump(posts, f, indent=2)

def schedule_instagram_post(instagram_id):
    print("\n=== Programar nueva publicación en Instagram ===")
    image_url = input("Ingrese la URL de la imagen: ")
    caption = input("Ingrese la descripción de la publicación: ")
    
    while True:
        try:
            fecha = input("\nIngrese la fecha y hora para la publicación (formato: DD/MM/YYYY HH:MM): ")
            fecha_dt = datetime.strptime(fecha, "%d/%m/%Y %H:%M")
            scheduled_time = fecha_dt.timestamp()
            
            if scheduled_time <= time.time():
                print("❌ La fecha debe ser futura. Por favor, intente de nuevo.")
                continue
            break
        except ValueError:
            print("❌ Formato de fecha incorrecto. Use DD/MM/YYYY HH:MM")
    
    print("\nCreando contenedor de la publicación...")
    container_params = {
        "image_url": image_url,
        "caption": caption
    }
    
    endpoint = f"{instagram_id}/media"
    container_response = make_api_request(endpoint, container_params, method="POST")
    print_json(container_response)
    
    if container_response and 'id' in container_response:
        creation_id = container_response['id']
        
        # Guardar la publicación programada
        scheduled_posts = load_scheduled_posts()
        scheduled_posts.append({
            'instagram_id': instagram_id,
            'creation_id': creation_id,
            'scheduled_time': scheduled_time,
            'caption': caption,
            'image_url': image_url
        })
        save_scheduled_posts(scheduled_posts)
        
        print(f"\nPublicacion programada para: {fecha}")
        print("La publicación se realizará automáticamente a la hora programada.")
        print("Puede cerrar este programa. El servicio post_scheduler.py se encargará de la publicación.")
        return container_response
    else:
        print("❌ No se pudo crear el contenedor de la publicación")
        return None

def get_post_details(post_id):
    """Obtiene información detallada de una publicación específica"""
    fields = "like_count,media_url,caption,comments_count,comments,media_type,children{media_url,media_type},insights.metric(impressions,reach,saved,total_interactions){title,values}"
    endpoint = f"{post_id}?fields={fields}"
    return make_api_request(endpoint)

def show_post_list_and_select(instagram_id):
    """Muestra lista de publicaciones y permite seleccionar una"""
    data = get_instagram_posts(instagram_id)
    if data and 'data' in data:
        print("\n=== Publicaciones disponibles ===")
        for i, post in enumerate(data['data'], 1):
            caption = post.get('caption', 'Sin descripción')
            
            # Convertir el timestamp ISO 8601 a datetime
            try:
                timestamp_str = post.get('timestamp', '')
                if timestamp_str:
                    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S%z")
                else:
                    timestamp = datetime.now()
            except ValueError:
                timestamp = datetime.now()
                
            media_type = post.get('media_type', 'DESCONOCIDO')
            
            # Truncar el caption si es muy largo
            if caption and len(caption) > 50:
                caption = caption[:47] + "..."
            
            print(f"\n{i}. ID: {post['id']}")
            print(f"   Fecha: {timestamp.strftime('%d/%m/%Y %H:%M')}")
            print(f"   Tipo: {media_type}")
            print(f"   Caption: {caption}")
        
        while True:
            try:
                seleccion = int(input("\nSeleccione el número de la publicación (0 para cancelar): "))
                if seleccion == 0:
                    return None
                if 1 <= seleccion <= len(data['data']):
                    return data['data'][seleccion - 1]['id']
                print("❌ Número no válido")
            except ValueError:
                print("❌ Por favor, ingrese un número válido")
    else:
        print("❌ No se encontraron publicaciones")
        return None

def print_json(data):
    if data:
        print("Respuesta en JSON:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print("No se obtuvieron datos")

def extract_instagram_id():
    data = get_instagram_business_account()
    if data and 'data' in data:
        for page in data['data']:
            if 'instagram_business_account' in page:
                return page['instagram_business_account']['id'], page['name']
    return None, None

def get_follower_insights(instagram_id):
    """Obtiene las estadísticas de seguidores de los últimos 30 días"""
    endpoint = f"{instagram_id}/insights?metric=follower_count&period=day&since=2025-07-22&until=2025-08-21"
    return make_api_request(endpoint)

def get_follower_demographics(instagram_id):
    """Obtiene la demografía de seguidores por género"""
    endpoint = f"{instagram_id}/insights?metric=follower_demographics&period=lifetime&breakdown=gender&metric_type=total_value"
    return make_api_request(endpoint)

def get_follower_demographics_by_age(instagram_id):
    """Obtiene la demografía de seguidores por edad"""
    endpoint = f"{instagram_id}/insights?metric=follower_demographics&period=lifetime&breakdown=age&metric_type=total_value"
    return make_api_request(endpoint)

def get_follower_demographics_by_city(instagram_id):
    """Obtiene la demografía de seguidores por ciudad"""
    endpoint = f"{instagram_id}/insights?metric=follower_demographics&period=lifetime&breakdown=city&metric_type=total_value"
    return make_api_request(endpoint)

def get_follower_history():
    """Lee y muestra el histórico de seguidores"""
    history_file = "followers_history.json"
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
            
        # Ordenar por fecha
        dates = sorted(history.keys())
        print("\n=== Histórico de Seguidores ===")
        
        for i, date in enumerate(dates):
            followers = history[date]
            variation = ""
            if i > 0:
                prev_followers = history[dates[i-1]]
                diff = followers - prev_followers
                variation = f" ({diff:+d})"
            
            print(f"{date}: {followers} seguidores{variation}")
    else:
        print("❌ No se encontró el archivo de histórico de seguidores")

def show_menu():
    while True:
        print("\n=== Menú de Facebook Graph API ===")
        print("1. Ver páginas de Facebook")
        print("2. Ver cuenta de Instagram Business asociada")
        print("3. Ver información detallada de Instagram")
        print("4. Crear nueva publicación en Instagram")
        print("5. Programar publicación para fecha específica")
        print("6. Ver publicaciones programadas pendientes")
        print("7. Ver todas las publicaciones de Instagram")
        print("8. Ver detalles y estadísticas de una publicación")
        print("9. Ver variación de seguidores (últimos 30 días)")
        print("10. Ver demografía de seguidores por género")
        print("11. Ver demografía de seguidores por edad")
        print("12. Ver demografía de seguidores por ciudad")
        print("13. Ver histórico de seguidores")
        print("14. Salir")
        
        opcion = input("\nSeleccione una opción (1-14): ")
        
        if opcion == "1":
            print("\nConsultando páginas de Facebook...")
            data = get_facebook_pages()
            print_json(data)
        
        elif opcion == "2":
            print("\nConsultando cuenta de Instagram Business...")
            data = get_instagram_business_account()
            print_json(data)
        
        elif opcion == "3":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nConsultando información de Instagram para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = get_instagram_details(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")
        
        elif opcion == "4":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nCreando publicación para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = create_instagram_post(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")

        elif opcion == "5":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nProgramando publicación para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = schedule_instagram_post(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")
        
        elif opcion == "6":
            posts = load_scheduled_posts()
            if posts:
                print("\n=== Publicaciones programadas pendientes ===")
                for i, post in enumerate(posts, 1):
                    fecha = datetime.fromtimestamp(post['scheduled_time'])
                    print(f"\n{i}. Fecha: {fecha}")
                    print(f"   Caption: {post['caption']}")
                    print(f"   Image URL: {post['image_url']}")
            else:
                print("\nNo hay publicaciones programadas pendientes")
        
        elif opcion == "7":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nConsultando publicaciones de Instagram para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = get_instagram_posts(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")
        
        elif opcion == "8":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nSeleccionando publicación de la página: {page_name}")
                post_id = show_post_list_and_select(instagram_id)
                if post_id:
                    print(f"\nConsultando detalles de la publicación: {post_id}")
                    data = get_post_details(post_id)
                    print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")

        elif opcion == "9":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nConsultando variación de seguidores para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = get_follower_insights(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")

        elif opcion == "10":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nConsultando demografía de seguidores por género para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = get_follower_demographics(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")

        elif opcion == "11":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nConsultando demografía de seguidores por edad para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = get_follower_demographics_by_age(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")

        elif opcion == "12":
            print("\nObteniendo ID de Instagram Business...")
            instagram_id, page_name = extract_instagram_id()
            if instagram_id:
                print(f"\nConsultando demografía de seguidores por ciudad para la página: {page_name}")
                print(f"ID de Instagram: {instagram_id}")
                data = get_follower_demographics_by_city(instagram_id)
                print_json(data)
            else:
                print("❌ No se encontró una cuenta de Instagram Business asociada")
        
        elif opcion == "13":
            get_follower_history()
        
        elif opcion == "14":
            print("\n¡Hasta luego!")
            break
        
        else:
            print("\n❌ Opción no válida. Por favor, intente de nuevo.")

if __name__ == "__main__":
    show_menu()
