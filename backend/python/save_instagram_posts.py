import json
import os
import sys
from graphAPI import extract_instagram_id, get_instagram_posts, get_post_details, set_token

def save_single_post(post_data):
    """Guarda un solo post en el archivo de posts de Instagram"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'instagram_posts.json')
    
    # Leer posts existentes
    existing_posts = []
    if os.path.exists(output_path):
        try:
            with open(output_path, 'r', encoding='utf-8') as f:
                existing_posts = json.load(f)
        except:
            existing_posts = []
    
    # Verificar si el post ya existe (por ID)
    post_exists = False
    for i, post in enumerate(existing_posts):
        if post.get('id') == post_data['id']:
            existing_posts[i] = post_data
            post_exists = True
            break
    
    # Si no existe, agregarlo al inicio
    if not post_exists:
        existing_posts.insert(0, post_data)
    
    # Guardar todos los posts
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(existing_posts, f, ensure_ascii=False, indent=2)
    
    print(f"Post guardado: {post_data['id']}")

def save_all_instagram_posts():
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print("No se encontró una cuenta de Instagram Business asociada")
        return

    print(f"Obteniendo publicaciones de Instagram para la página: {page_name} (ID: {instagram_id})")
    data = get_instagram_posts(instagram_id)
    if data and 'data' in data:
        all_details = []
        for post in data['data']:
            post_id = post['id']
            details = get_post_details(post_id)
            if details:
                all_details.append(details)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, 'instagram_posts.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_details, f, ensure_ascii=False, indent=2)
        print(f"Se guardaron los detalles de {len(all_details)} publicaciones en {output_path}")
    else:
        print("No se encontraron publicaciones o hubo un error con la API")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python save_instagram_posts.py <token>")
        sys.exit(1)
    
    token = sys.argv[1]
    set_token(token)
    save_all_instagram_posts() 