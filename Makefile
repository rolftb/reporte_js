# Makefile para Reporteador de Empresas

# Variables
NODE_VERSION := $(shell node --version 2>/dev/null || echo "No instalado")
NPM_VERSION := $(shell npm --version 2>/dev/null || echo "No instalado")

# Colores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

.PHONY: help install dev start test build clean setup check-deps lint format

# Comando por defecto
help:
	@echo "$(BLUE)=== Reporteador de Empresas ===$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@echo "  $(GREEN)make setup$(NC)       - Configuración inicial completa"
	@echo "  $(GREEN)make install$(NC)     - Instalar dependencias"
	@echo "  $(GREEN)make dev$(NC)         - Ejecutar en modo desarrollo"
	@echo "  $(GREEN)make start$(NC)       - Ejecutar en modo producción"
	@echo "  $(GREEN)make test$(NC)        - Ejecutar pruebas"
	@echo "  $(GREEN)make lint$(NC)        - Verificar código con ESLint"
	@echo "  $(GREEN)make format$(NC)      - Formatear código con Prettier"
	@echo "  $(GREEN)make build$(NC)       - Construir para producción"
	@echo "  $(GREEN)make clean$(NC)       - Limpiar archivos temporales"
	@echo "  $(GREEN)make check-deps$(NC)  - Verificar dependencias del sistema"
	@echo ""

# Verificar dependencias del sistema
check-deps:
	@echo "$(BLUE)Verificando dependencias del sistema...$(NC)"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "NPM: $(NPM_VERSION)"
	@if [ "$(NODE_VERSION)" = "No instalado" ]; then \
		echo "$(RED)❌ Node.js no está instalado$(NC)"; \
		echo "$(YELLOW)Por favor instala Node.js desde https://nodejs.org$(NC)"; \
		exit 1; \
	else \
		echo "$(GREEN)✅ Node.js está instalado$(NC)"; \
	fi
	@if [ "$(NPM_VERSION)" = "No instalado" ]; then \
		echo "$(RED)❌ NPM no está instalado$(NC)"; \
		exit 1; \
	else \
		echo "$(GREEN)✅ NPM está instalado$(NC)"; \
	fi

# Configuración inicial completa
setup: check-deps
	@echo "$(BLUE)🚀 Configurando proyecto...$(NC)"
	@cp .env.example .env
	@echo "$(GREEN)✅ Archivo .env creado$(NC)"
	@$(MAKE) install
	@$(MAKE) create-dirs
	@echo "$(GREEN)🎉 ¡Configuración completada!$(NC)"
	@echo "$(YELLOW)Puedes ejecutar 'make dev' para iniciar el servidor de desarrollo$(NC)"

# Crear directorios necesarios
create-dirs:
	@echo "$(BLUE)Creando directorios...$(NC)"
	@mkdir -p uploads templates output logs
	@echo "$(GREEN)✅ Directorios creados$(NC)"

# Instalar dependencias
install: check-deps
	@echo "$(BLUE)📦 Instalando dependencias...$(NC)"
	@npm install
	@echo "$(GREEN)✅ Dependencias instaladas$(NC)"

# Modo desarrollo
dev: 
	@echo "$(BLUE)🔧 Iniciando servidor en modo desarrollo...$(NC)"
	@npm run dev

# Modo producción
start:
	@echo "$(BLUE)🚀 Iniciando servidor en modo producción...$(NC)"
	@npm start

# Ejecutar pruebas
test:
	@echo "$(BLUE)🧪 Ejecutando pruebas...$(NC)"
	@npm test

# Linter
lint:
	@echo "$(BLUE)🔍 Verificando código con ESLint...$(NC)"
	@npm run lint

# Formatear código
format:
	@echo "$(BLUE)💅 Formateando código con Prettier...$(NC)"
	@npm run format

# Construir para producción
build:
	@echo "$(BLUE)🏗️ Construyendo para producción...$(NC)"
	@npm run build

# Limpiar archivos temporales
clean:
	@echo "$(BLUE)🧹 Limpiando archivos temporales...$(NC)"
	@rm -rf node_modules dist build
	@rm -rf uploads/* output/* logs/*
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# Reinstalar todo
reinstall: clean install

# Información del proyecto
info:
	@echo "$(BLUE)=== Información del Proyecto ===$(NC)"
	@echo "Nombre: Reporteador de Empresas"
	@echo "Versión: 1.0.0"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "NPM: $(NPM_VERSION)"
	@echo "Directorio: $(PWD)"
