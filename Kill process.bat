@echo off
echo Arrêt de tous les processus Node.js...
taskkill /F /IM node.exe /T
echo Terminé.
pause