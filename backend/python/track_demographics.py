import os
import json
from datetime import datetime
import time
from graphAPI import (
    extract_instagram_id,
    get_follower_demographics,
    get_follower_demographics_by_age,
    get_follower_demographics_by_city
)

DEMOGRAPHICS_FILE = "demographics_history.json"
CHECK_INTERVAL = 3600  # 1 hora en segundos

def load_demographics_history():
    """Carga el histórico de demografías desde el archivo JSON"""
    if os.path.exists(DEMOGRAPHICS_FILE):
        with open(DEMOGRAPHICS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_demographics_history(history):
    """Guarda el histórico de demografías en el archivo JSON"""
    with open(DEMOGRAPHICS_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

def extract_demographic_data(data, key='gender'):
    """Extrae los datos demográficos de la respuesta de la API"""
    try:
        if not data or 'data' not in data or not data['data']:
            return {}
        
        total_value = data['data'][0].get('total_value', {})
        if not total_value or 'breakdowns' not in total_value:
            return {}
        
        result_dict = {}
        for breakdown in total_value['breakdowns']:
            if breakdown['dimension_keys'][0] == key:
                for result in breakdown['results']:
                    dimension = result['dimension_values'][0]
                    value = result['value']
                    result_dict[dimension] = value
                break
        
        return result_dict
    except Exception as e:
        print(f"Error extrayendo datos de {key}:", e)
        return {}

def track_demographics():
    """Obtiene y guarda las demografías actuales"""
    try:
        print("\n=== Iniciando tracking de demografías ===")
        print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Obtener ID de Instagram
        print("\nObteniendo ID de Instagram...")
        instagram_id, page_name = extract_instagram_id()
        if not instagram_id:
            print("❌ No se pudo obtener el ID de Instagram")
            return False
        print(f"✅ ID obtenido: {instagram_id}")
        print(f"✅ Página: {page_name}")

        # Obtener datos demográficos
        print("\nObteniendo datos de género...")
        gender_data = get_follower_demographics(instagram_id)
        gender_values = extract_demographic_data(gender_data, 'gender')
        print("Datos de género procesados:", gender_values)
        
        print("\nObteniendo datos de edad...")
        age_data = get_follower_demographics_by_age(instagram_id)
        age_values = extract_demographic_data(age_data, 'age')
        print("Datos de edad procesados:", age_values)
        
        print("\nObteniendo datos de ciudad...")
        city_data = get_follower_demographics_by_city(instagram_id)
        city_values = extract_demographic_data(city_data, 'city')
        print("Datos de ciudad procesados:", city_values)

        # Cargar histórico existente
        history = load_demographics_history()
        
        # Fecha actual en formato ISO
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Guardar datos del día
        history[today] = {
            "gender": gender_values,
            "age": age_values,
            "city": city_values
        }
        
        # Guardar en archivo
        save_demographics_history(history)
        print(f"\n✅ Demografías guardadas correctamente para {today}")
        
        # Mostrar resumen
        print("\nResumen de demografías:")
        print("Género:", history[today]["gender"])
        print("Edad:", history[today]["age"])
        print("Ciudad:", history[today]["city"])
        
        return True
        
    except Exception as e:
        print(f"❌ Error al trackear demografías: {e}")
        import traceback
        print("Detalles del error:")
        print(traceback.format_exc())
        return False

def get_last_tracked_date():
    """Obtiene la última fecha en que se registraron datos"""
    try:
        history = load_demographics_history()
        if not history:
            return None
        return max(history.keys())
    except Exception:
        return None

def main_loop():
    """Bucle principal que verifica cada hora si necesita actualizar los datos"""
    print("Iniciando servicio de tracking de demografías...")
    print("Verificando cada hora si es necesario actualizar los datos.")
    
    while True:
        try:
            current_date = datetime.now().strftime("%Y-%m-%d")
            last_tracked = get_last_tracked_date()
            
            if last_tracked != current_date:
                print(f"\nNuevo día detectado. Último registro: {last_tracked}, Día actual: {current_date}")
                track_demographics()
            else:
                print(f"\nVerificación {datetime.now().strftime('%H:%M:%S')}: Ya se tienen datos para hoy ({current_date})")
            
            # Esperar una hora
            time.sleep(CHECK_INTERVAL)
            
        except Exception as e:
            print(f"Error en el bucle principal: {e}")
            time.sleep(CHECK_INTERVAL)  # Esperar antes de reintentar

if __name__ == "__main__":
    main_loop() 