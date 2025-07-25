@echo off
title Instagram Post Scheduler Service
echo Starting Instagram Post Scheduler Service...
python "%~dp0post_scheduler.py"
pause 