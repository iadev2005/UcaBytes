#!/usr/bin/env python3
"""
Script para validar un token de Instagram usando la API de Graph
"""

import sys
import json
import os

# Agregar el directorio actual al path para importar graphAPI
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from graphAPI import set_token, make_api_request
except ImportError as e:
    print(json.dumps({
        "valid": False,
        "error": f"Error importando graphAPI: {str(e)}"
    }))
    sys.exit(1)

def validate_token(token):
    """
    Valida un token de Instagram haciendo una llamada a la API
    """
    try:
        # Establecer el token
        set_token(token)
        
        # Hacer una llamada simple a la API para validar el token
        # Usamos el endpoint de la cuenta para validar
        response = make_api_request('/me/accounts')
        
        if 'data' in response:
            # Token válido
            return {
                "valid": True,
                "message": "Token válido"
            }
        else:
            # Token inválido
            return {
                "valid": False,
                "error": "Token inválido o expirado"
            }
            
    except Exception as e:
        return {
            "valid": False,
            "error": f"Error validando token: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "valid": False,
            "error": "Uso: python validate_token.py <token>"
        }))
        sys.exit(1)
    
    token = sys.argv[1]
    result = validate_token(token)
    print(json.dumps(result)) 