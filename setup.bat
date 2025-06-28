@echo off
setlocal enabledelayedexpansion

REM Script de configuración para Reporteador de Empresas en Windows
REM Uso: setup.bat [comando]

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Colores para Windows 
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

if "%1"=="" goto setup_default
if "%1"=="help" goto help
if "%1"=="check-deps" goto check-deps
if "%1"=="install" goto install
if "%1"=="setup" goto setup_default
if "%1"=="dev" goto dev
if "%1"=="start" goto start
if "%1"=="test" goto test
if "%1"=="lint" goto lint
if "%1"=="format" goto format
if "%1"=="clean" goto clean
if "%1"=="build" goto build
if "%1"=="create-sample" goto create-sample
if "%1"=="scan" goto scan
if "%1"=="generar-reporte" goto generar-reporte
goto help

:help
echo %BLUE%=== Reporteador de Empresas ===%NC%
echo.
echo %YELLOW%Comandos disponibles:%NC%
echo   %GREEN%setup.bat%NC%               - Configuración inicial completa
echo   %GREEN%setup.bat help%NC%          - Mostrar esta ayuda
echo   %GREEN%setup.bat install%NC%       - Instalar dependencias
echo   %GREEN%setup.bat dev%NC%           - Ejecutar en modo desarrollo
echo   %GREEN%setup.bat start%NC%         - Ejecutar en modo producción
echo   %GREEN%setup.bat test%NC%          - Ejecutar pruebas
echo   %GREEN%setup.bat lint%NC%          - Verificar código con ESLint
echo   %GREEN%setup.bat format%NC%        - Formatear código con Prettier
echo   %GREEN%setup.bat build%NC%         - Construir para producción
echo   %GREEN%setup.bat clean%NC%         - Limpiar archivos temporales
echo   %GREEN%setup.bat check-deps%NC%    - Verificar dependencias del sistema
echo   %GREEN%setup.bat create-sample%NC% - Crear documento DOCX de ejemplo
echo   %GREEN%setup.bat scan%NC%          - Escanear documento DOCX (requiere archivo como parámetro)
echo   %GREEN%setup.bat generar-reporte%NC% - Generar reporte de Calidad de Vida
echo.
echo %YELLOW%Ejemplos de uso:%NC%
echo   %GREEN%setup.bat create-sample%NC%                        - Crea documento de ejemplo
echo   %GREEN%setup.bat scan templates\archivo.docx%NC%           - Escanea archivo específico
echo   %GREEN%setup.bat generar-reporte%NC%                      - Genera reporte corporativo
echo.
goto end

:check-deps
echo %BLUE%Verificando dependencias del sistema...%NC%

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js no está instalado%NC%
    echo %YELLOW%Por favor instala Node.js desde https://nodejs.org%NC%
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %GREEN%✅ Node.js está instalado: !NODE_VERSION!%NC%
)

REM Verificar NPM
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ NPM no está instalado%NC%
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo %GREEN%✅ NPM está instalado: !NPM_VERSION!%NC%
)

echo %GREEN%✅ Todas las dependencias están instaladas%NC%
goto end

:setup_default
echo %BLUE%🚀 Configurando proyecto...%NC%
call :check-deps
if errorlevel 1 goto end

if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
    if errorlevel 1 (
        echo %RED%❌ Error copiando archivo .env%NC%
        goto end
    )
    echo %GREEN%✅ Archivo .env creado%NC%
) else (
    echo %YELLOW%ℹ️ Archivo .env ya existe%NC%
)

call :create-dirs
call :install_deps
echo %GREEN%🎉 ¡Configuración completada!%NC%
echo %YELLOW%Puedes ejecutar 'setup.bat dev' para iniciar el servidor de desarrollo%NC%
goto end

:create-dirs
echo %BLUE%Creando directorios...%NC%
if not exist "uploads" mkdir "uploads"
if not exist "templates" mkdir "templates"
if not exist "output" mkdir "output"
if not exist "logs" mkdir "logs"
echo %GREEN%✅ Directorios creados%NC%
goto :eof

:install
:install_deps
echo %BLUE%📦 Instalando dependencias...%NC%
npm install
if errorlevel 1 (
    echo %RED%❌ Error instalando dependencias%NC%
    goto end
)
echo %GREEN%✅ Dependencias instaladas%NC%
goto end

:dev
echo %BLUE%🔧 Iniciando servidor en modo desarrollo...%NC%
npm run dev
goto end

:start
echo %BLUE%🚀 Iniciando servidor en modo producción...%NC%
npm start
goto end

:test
echo %BLUE%🧪 Ejecutando pruebas...%NC%
npm test
goto end

:lint
echo %BLUE%🔍 Verificando código con ESLint...%NC%
npm run lint
goto end

:format
echo %BLUE%💅 Formateando código con Prettier...%NC%
npm run format
goto end

:build
echo %BLUE%🏗️ Construyendo para producción...%NC%
npm run build
goto end

:clean
echo %BLUE%🧹 Limpiando archivos temporales...%NC%
if exist "node_modules" rmdir /s /q "node_modules"
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
if exist "uploads\*" del /q "uploads\*" 2>nul
if exist "output\*" del /q "output\*" 2>nul
if exist "logs\*" del /q "logs\*" 2>nul
echo %GREEN%✅ Limpieza completada%NC%
goto end

:create-sample
echo %BLUE%📝 Creando documento DOCX de ejemplo...%NC%
node src/createSample.js
if errorlevel 1 (
    echo %RED%❌ Error creando documento de ejemplo%NC%
    goto end
)
echo %GREEN%✅ Documento de ejemplo creado en templates/%NC%
echo %YELLOW%Puedes escanearlo con: setup.bat scan templates\documento-ejemplo-analisis.docx%NC%
goto end

:scan
if "%2"=="" (
    echo %RED%❌ Error: Debes proporcionar la ruta del archivo DOCX%NC%
    echo %YELLOW%Uso: setup.bat scan [ruta-del-archivo.docx]%NC%
    echo %YELLOW%Ejemplo: setup.bat scan templates\mi-documento.docx%NC%
    goto end
)
echo %BLUE%🔍 Escaneando archivo DOCX: %2%NC%
node src/scanDocx.js "%2"
goto end

:end
echo.
pause
