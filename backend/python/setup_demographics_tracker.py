import os
import sys
from pathlib import Path
import winreg as reg

def add_to_startup():
    """Agrega el script VBS al inicio automático de Windows"""
    try:
        # Obtener la ruta del script VBS
        script_dir = os.path.dirname(os.path.abspath(__file__))
        vbs_path = os.path.join(script_dir, "demographics_history.vbs")
        
        if not os.path.exists(vbs_path):
            print(f"❌ No se encontró el archivo {vbs_path}")
            return False
        
        # Abrir la clave de registro de inicio
        key = reg.HKEY_CURRENT_USER
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        
        try:
            # Abrir la clave con permisos de escritura
            registry_key = reg.OpenKey(key, key_path, 0, reg.KEY_WRITE)
            
            # Agregar el script al registro
            reg.SetValueEx(registry_key, "InstagramDemographicsTracker", 0, reg.REG_SZ, vbs_path)
            
            # Cerrar la clave
            reg.CloseKey(registry_key)
            
            print("✅ Script agregado correctamente al inicio automático")
            return True
            
        except WindowsError as e:
            print(f"❌ Error al acceder al registro de Windows: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error al configurar el inicio automático: {e}")
        return False

def main():
    """Función principal"""
    print("\n=== Configuración del Tracker de Demografías de Instagram ===")
    
    # Verificar que estamos en Windows
    if not sys.platform.startswith('win'):
        print("❌ Este script solo funciona en Windows")
        return
    
    # Agregar al inicio automático
    if add_to_startup():
        print("\nConfiguración completada. El script se ejecutará automáticamente al iniciar Windows.")
        print("Los datos se guardarán en 'demographics_history.json'")
        print("Puede revisar los logs en 'demographics_vbs.log'")
    else:
        print("\n❌ No se pudo completar la configuración")

if __name__ == "__main__":
    main() 