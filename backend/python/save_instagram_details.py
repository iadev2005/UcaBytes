import json
import os
from graphAPI import extract_instagram_id, get_instagram_details

def save_instagram_details():
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print("❌ No se encontró una cuenta de Instagram Business asociada")
        return

    print(f"Obteniendo información general de Instagram para la página: {page_name} (ID: {instagram_id})")
    details = get_instagram_details(instagram_id)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'instagram_details.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(details, f, ensure_ascii=False, indent=2)
    print(f"✅ Información guardada en {output_path}")

if __name__ == "__main__":
    save_instagram_details() 