import os
import sys
from pathlib import Path
import winshell
from win32com.client import Dispatch

def create_startup_shortcut():
    try:
        # Obtener rutas
        current_dir = os.path.abspath(os.path.dirname(__file__))
        vbs_path = os.path.join(current_dir, "followers_history.vbs")
        startup_folder = str(Path(winshell.startup()))
        
        # Verificar que el archivo VBS existe
        if not os.path.exists(vbs_path):
            print("❌ Error: No se encuentra el archivo followers_history.vbs")
            return False
        
        # Crear el acceso directo
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(os.path.join(startup_folder, "Instagram Follower Tracker.lnk"))
        shortcut.Targetpath = vbs_path
        shortcut.WorkingDirectory = current_dir
        shortcut.Description = "Seguimiento diario de seguidores de Instagram"
        shortcut.IconLocation = sys.executable
        shortcut.WindowStyle = 7  # Minimized
        shortcut.save()
        
        print("✅ Seguimiento de seguidores configurado exitosamente")
        print(f"   Se iniciará automáticamente cuando inicies Windows")
        print(f"   Ruta del acceso directo: {startup_folder}")
        print("\nPara verificar el funcionamiento:")
        print("1. El archivo followers_vbs.log mostrará cuando se ejecuta el script")
        print("2. El archivo followers_history.json contendrá el histórico de seguidores")
        print("3. El archivo followers_tracker.log tendrá los detalles de cada consulta")
        
        return True
        
    except Exception as e:
        print("❌ Error configurando el inicio automático:", e)
        return False

if __name__ == "__main__":
    print("Configurando seguimiento automático de seguidores...")
    create_startup_shortcut() 