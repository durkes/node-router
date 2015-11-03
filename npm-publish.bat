@echo off

call npm publish ./

del npm-debug.log
pause