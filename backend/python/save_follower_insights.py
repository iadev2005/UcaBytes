import os
import json
import sys
from graphAPI import extract_instagram_id, get_follower_insights, set_token

def save_follower_insights():
    """
    Ejecuta la opción 9 de graphAPI.py (Ver variación de seguidores) y guarda la respuesta en un archivo JSON.
    """
    print("Obteniendo ID de Instagram Business...")
    instagram_id, page_name = extract_instagram_id()
    
    if not instagram_id:
        print("No se encontro una cuenta de Instagram Business asociada")
        return
    
    print(f"Consultando variación de seguidores para la página: {page_name}")
    print(f"ID de Instagram: {instagram_id}")
    
    # Obtener los datos de variación de seguidores
    data = get_follower_insights(instagram_id)
    
    if not data:
        print("No se pudieron obtener los datos de variacion de seguidores")
        return
    
    # Guardar los datos en un archivo JSON
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "follower_insights.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Datos guardados exitosamente en: {output_file}")
    
    # Mostrar los datos en la consola
    print("\nRespuesta en JSON:")
    print(json.dumps(data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    # Verificar que se proporcionó el token
    if len(sys.argv) != 2:
        print("Uso: python save_follower_insights.py <token>")
        sys.exit(1)
    
    # Establecer el token
    token = sys.argv[1]
    set_token(token)
    
    save_follower_insights()