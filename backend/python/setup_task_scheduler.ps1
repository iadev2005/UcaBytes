# Script para configurar Windows Task Scheduler
# Ejecuta el smart_scheduler.py cada minuto solo cuando hay publicaciones programadas

$TaskName = "InstagramSmartScheduler"
$ScriptPath = Join-Path $PSScriptRoot "run_smart_scheduler.vbs"

Write-Host "Configurando Windows Task Scheduler para Instagram Smart Scheduler..." -ForegroundColor Green

# Eliminar tarea existente si existe
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Tarea anterior eliminada." -ForegroundColor Yellow
} catch {
    Write-Host "No se encontró tarea anterior." -ForegroundColor Yellow
}

# Crear la acción usando wscript para ejecutar el VBS sin ventana
$Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument $ScriptPath -WorkingDirectory $PSScriptRoot

# Crear el trigger (cada minuto)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 365)

# Configurar el settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Crear la tarea
$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Description "Instagram Smart Scheduler - Ejecuta el scheduler solo cuando hay publicaciones programadas"

# Registrar la tarea
Register-ScheduledTask -TaskName $TaskName -InputObject $Task

Write-Host "✅ Tarea programada creada exitosamente!" -ForegroundColor Green
Write-Host "Nombre de la tarea: $TaskName" -ForegroundColor Cyan
Write-Host "Se ejecutará cada minuto y solo procesará cuando hay publicaciones programadas." -ForegroundColor Cyan
Write-Host "Usando smart_scheduler.py con token del localStorage" -ForegroundColor Green
Write-Host ""
Write-Host "Para verificar el estado de la tarea:" -ForegroundColor Yellow
Write-Host "Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host ""
Write-Host "Para eliminar la tarea:" -ForegroundColor Yellow
Write-Host "Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor White 