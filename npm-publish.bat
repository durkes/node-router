@echo off

call npm publish ./
echo.

del npm-debug.log
pause