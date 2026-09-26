$ErrorActionPreference = 'Stop'
$DemoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $DemoRoot
if (-not (Test-Path '.venv')) { python -m venv .venv }
& '.venv/Scripts/python.exe' -m pip install -r requirements.txt
& '.venv/Scripts/python.exe' scripts/seed.py
Start-Process -WindowStyle Hidden -FilePath "$DemoRoot/.venv/Scripts/python.exe" -ArgumentList '-m','uvicorn','backend.main:app','--reload','--port','8010' -WorkingDirectory $DemoRoot
python -m http.server 8000 --directory $DemoRoot
