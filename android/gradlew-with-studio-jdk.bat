@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
  goto run
)
if exist "%ProgramFiles(x86)%\Android\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%ProgramFiles(x86)%\Android\Android Studio\jbr"
  goto run
)
if exist "%LocalAppData%\Programs\Android\Android Studio\jbr\bin\java.exe" (
  set "JAVA_HOME=%LocalAppData%\Programs\Android\Android Studio\jbr"
  goto run
)

echo Could not find Android Studio JBR. Set JAVA_HOME to JDK 17 or 21, then run gradlew.bat
exit /b 1

:run
echo Using JAVA_HOME=%JAVA_HOME%
call gradlew.bat %*
