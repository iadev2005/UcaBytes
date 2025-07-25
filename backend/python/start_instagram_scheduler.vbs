Dim WshShell, fso, strPath, pythonCmd

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strPath = fso.GetParentFolderName(WScript.ScriptFullName)
pythonCmd = "pythonw.exe """ & strPath & "\post_scheduler.py"""

WshShell.Run pythonCmd, 0, False

Set WshShell = Nothing
Set fso = Nothing 