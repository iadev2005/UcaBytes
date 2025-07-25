Option Explicit

' Configuración
Const CHECK_INTERVAL = 3600 ' Revisar cada hora (en segundos)
Const LOG_FILE = "followers_vbs.log"

' Variables globales
Dim lastRunDate
Dim WshShell, fso, strPath

' Inicializar objetos
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Función para escribir en el log
Sub WriteLog(message)
    Dim logFile
    Set logFile = fso.OpenTextFile(strPath & "\" & LOG_FILE, 8, True)
    logFile.WriteLine Now & " - " & message
    logFile.Close
End Sub

' Función para ejecutar el script de Python
Sub RunTracker()
    Dim pythonCmd
    pythonCmd = "pythonw.exe """ & strPath & "\track_followers.py"""
    WshShell.Run pythonCmd, 0, False
    WriteLog "Script de seguimiento ejecutado"
End Sub

' Función principal
Sub Main()
    WriteLog "Servicio de seguimiento iniciado"
    lastRunDate = Date
    
    ' Primera ejecución
    RunTracker
    
    ' Bucle principal
    Do While True
        ' Si es un nuevo día
        If Date > lastRunDate Then
            RunTracker
            lastRunDate = Date
        End If
        
        WScript.Sleep CHECK_INTERVAL * 1000 ' Convertir segundos a milisegundos
    Loop
End Sub

' Iniciar el script
Main

' Limpiar
Set WshShell = Nothing
Set fso = Nothing 