@echo off
echo ========================================================
echo Pushing RYMEC ReClaim-iT Portal to GitHub...
echo Target: https://github.com/nagavakkalagadda/RYMEC-ReClain-iT_Portal.git
echo ========================================================
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo If the repository has not been created on GitHub yet, please create it at:
  echo https://github.com/new with name: RYMEC-ReClain-iT_Portal
  echo.
)
pause
