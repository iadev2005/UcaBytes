import json
import os
from graphAPI import extract_instagram_id, get_instagram_posts, get_post_details

def save_all_instagram_posts():
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print("❌ No se encontró una cuenta de Instagram Business asociada")
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
        print("❌ No se encontraron publicaciones o hubo un error con la API")

if __name__ == "__main__":
    save_all_instagram_posts() 