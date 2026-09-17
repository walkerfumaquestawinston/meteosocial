@echo off
setlocal
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Apri questa cartella in Codex e chiedi di avviare MeteoSocial.
  echo Non e stato trovato Node. Le istruzioni sono in RIPRENDI-QUI.md.
  popd
  pause
  exit /b 1
)
node tools/resume.mjs
set "meteo_exit=%ERRORLEVEL%"
popd
if not "%meteo_exit%"=="0" pause
exit /b %meteo_exit%
