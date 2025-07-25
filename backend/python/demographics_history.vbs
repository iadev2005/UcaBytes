Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtener el directorio actual
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Crear archivo de log
logFile = strPath & "\demographics_vbs.log"
Set objFile = objFSO.OpenTextFile(logFile, 8, True)
objFile.WriteLine "=== Iniciando servicio de tracking de demografías ==="
objFile.WriteLine "Fecha y hora: " & Now()
objFile.WriteLine "Directorio: " & strPath

' Ejecutar el script de Python en segundo plano
strCommand = "pythonw """ & strPath & "\track_demographics.py"""
objShell.Run strCommand, 0, False

objFile.WriteLine "Script iniciado en segundo plano"
objFile.WriteLine "El script verificará cada hora si necesita actualizar los datos"
objFile.WriteLine "Los datos se guardarán en: " & strPath & "\demographics_history.json"
objFile.WriteLine "----------------------------------------"
objFile.Close 