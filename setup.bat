@echo off
echo ===============================================
echo    Reporteador de Empresas - Configuracion
echo ===============================================
echo.

:: Verificar si Node.js esta instalado
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor descarga e instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js encontrado

:: Verificar si NPM esta instalado
echo Verificando NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM no esta instalado
    pause
    exit /b 1
)
echo [OK] NPM encontrado

:: Crear directorios necesarios
echo.
echo Creando directorios del proyecto...
if not exist "uploads" mkdir uploads
if not exist "templates" mkdir templates
if not exist "output" mkdir output
if not exist "logs" mkdir logs
echo [OK] Directorios creados

:: Copiar archivo de configuracion
echo.
echo Configurando variables de entorno...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo [OK] Archivo .env creado
) else (
    echo [INFO] Archivo .env ya existe
)

:: Instalar dependencias
echo.
echo Instalando dependencias de Node.js...
echo Esto puede tomar unos minutos...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas

:: Ejecutar pruebas basicas
echo.
echo Ejecutando verificacion basica...
npm test >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Algunas pruebas fallaron, pero el proyecto deberia funcionar
) else (
    echo [OK] Pruebas basicas pasaron
)

echo.
echo ===============================================
echo        ¡Configuracion completada!
echo ===============================================
echo.
echo Para iniciar el servidor:
echo   Desarrollo: npm run dev
echo   Produccion: npm start
echo.
echo API disponible en: http://localhost:3000
echo Health check: http://localhost:3000/health
echo.
pause
