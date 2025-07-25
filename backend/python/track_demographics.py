import os
import json
from graphAPI import (
    extract_instagram_id,
    get_follower_demographics,
    get_follower_demographics_by_age,
    get_follower_demographics_by_city
)

HISTORY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demographics_history.json")

def main():
    instagram_id, page_name = extract_instagram_id()
    if not instagram_id:
        print("No se encontro una cuenta de Instagram Business asociada.")
        return

    print(f"Obteniendo demografía de seguidores para la página: {page_name} (ID: {instagram_id})")

    gender_data = get_follower_demographics(instagram_id)
    age_data = get_follower_demographics_by_age(instagram_id)
    city_data = get_follower_demographics_by_city(instagram_id)

    demographics = {
        'gender': gender_data,
        'age': age_data,
        'city': city_data
    }

    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(demographics, f, indent=2, ensure_ascii=False)

    print(f"Respuestas guardadas en {HISTORY_FILE}.")

if __name__ == "__main__":
    main() 