#!/usr/bin/env python3
"""
Script de prueba para el carrusel de Instagram
"""

from create_instagram_carousel import create_instagram_carousel

def test_carousel():
    """
    Función de prueba para crear un carrusel
    """
    # URLs de ejemplo (reemplaza con URLs reales)
    image_urls = [
        "https://picsum.photos/1080/1080?random=1",
        "https://picsum.photos/1080/1080?random=2", 
        "https://picsum.photos/1080/1080?random=3"
    ]
    
    caption = "🎉 ¡Mi primer carrusel automático! 🚀\n\nProbando la nueva funcionalidad de carruseles múltiples.\n\n#Instagram #Carrusel #Automation #Testing"
    
    print("🧪 Iniciando prueba de carrusel...")
    print(f"📸 Imágenes: {len(image_urls)}")
    print(f"📝 Caption: {caption[:50]}...")
    
    # Crear el carrusel
    result = create_instagram_carousel(image_urls, caption)
    
    if result:
        print("\n✅ ¡Prueba exitosa!")
        print(f"   Post ID: {result['id']}")
        return True
    else:
        print("\n❌ Prueba fallida")
        return False

if __name__ == "__main__":
    test_carousel()