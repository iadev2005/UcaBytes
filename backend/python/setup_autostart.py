import os
import sys
from pathlib import Path
import winshell
from win32com.client import Dispatch

def create_shortcut():
    # Obtener la ruta del directorio actual
    current_dir = os.path.abspath(os.path.dirname(__file__))
    vbs_path = os.path.join(current_dir, "start_instagram_scheduler.vbs")
    
    # Verificar que el archivo VBS existe
    if not os.path.exists(vbs_path):
        print("❌ Error: No se encuentra el archivo start_instagram_scheduler.vbs")
        return False
    
    try:
        # Obtener la carpeta de inicio
        startup_folder = str(Path(winshell.startup()))
        
        # Crear el acceso directo
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(os.path.join(startup_folder, "Instagram Post Scheduler.lnk"))
        shortcut.Targetpath = vbs_path
        shortcut.WorkingDirectory = current_dir
        shortcut.Description = "Servicio de publicación programada de Instagram"
        shortcut.IconLocation = sys.executable
        shortcut.WindowStyle = 7  # Minimized
        shortcut.save()
        
        print("✅ Acceso directo creado exitosamente en la carpeta de inicio")
        print(f"   Ruta: {startup_folder}")
        return True
        
    except Exception as e:
        print("❌ Error creando el acceso directo:", e)
        return False

if __name__ == "__main__":
    print("Configurando inicio automático del servicio...")
    if create_shortcut():
        print("\nEl servicio se iniciará automáticamente cuando inicies Windows.")
        print("Para iniciarlo ahora, haz doble clic en start_instagram_scheduler.vbs")
        print("El servicio se ejecutará en segundo plano (sin ventana visible)")
        print("\nPara verificar que está funcionando:")
        print("1. Programa una publicación usando graphAPI.py")
        print("2. Usa la opción 6 para ver las publicaciones pendientes") 