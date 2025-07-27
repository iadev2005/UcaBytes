import json
import os
import sys
from graphAPI import extract_instagram_id, get_instagram_details, set_token

def save_instagram_details():
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print("No se encontro una cuenta de Instagram Business asociada")
        return

    print(f"Obteniendo información general de Instagram para la página: {page_name} (ID: {instagram_id})")
    details = get_instagram_details(instagram_id)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'instagram_details.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(details, f, ensure_ascii=False, indent=2)
    print(f"Informacion guardada en {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python save_instagram_details.py <token>")
        sys.exit(1)
    
    token = sys.argv[1]
    set_token(token)
    save_instagram_details() 