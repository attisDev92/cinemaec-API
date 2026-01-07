#!/bin/bash

# ===================================================================
# Script de validación de variables de entorno para Render
# ===================================================================

echo "🔍 Validando variables de entorno para despliegue en Render..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

MISSING_VARS=()
OPTIONAL_VARS=()

# Función para verificar variable requerida
check_required() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗${NC} $var_name - FALTANTE"
        MISSING_VARS+=("$var_name")
    else
        echo -e "${GREEN}✓${NC} $var_name - Configurada"
    fi
}

# Función para verificar variable opcional
check_optional() {
    local var_name=$1
    local var_value="${!var_name}"
    local default_value=$2
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}○${NC} $var_name - Usando default: $default_value"
        OPTIONAL_VARS+=("$var_name")
    else
        echo -e "${GREEN}✓${NC} $var_name - Configurada"
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Variables Requeridas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# App Configuration
echo "🔧 Configuración de Aplicación:"
check_required "NODE_ENV"
check_optional "PORT" "3000"
echo ""

# Database Configuration
echo "🗄️  Configuración de Base de Datos:"
check_required "DB_HOST"
check_optional "DB_PORT" "5432"
check_required "DB_USERNAME"
check_required "DB_PASSWORD"
check_required "DB_NAME"
check_optional "DB_SSL" "false"
echo ""

# JWT Configuration
echo "🔐 Configuración de JWT:"
check_required "JWT_SECRET"
check_optional "JWT_EXPIRES_IN" "7d"
echo ""

# Firebase Configuration
echo "🔥 Configuración de Firebase:"
check_required "FIREBASE_PROJECT_ID"
check_required "FIREBASE_PRIVATE_KEY"
check_required "FIREBASE_CLIENT_EMAIL"
check_required "FIREBASE_DATABASE_URL"
echo ""

# Email Configuration
echo "📧 Configuración de Email:"
check_optional "MAIL_HOST" "smtp.gmail.com"
check_optional "MAIL_PORT" "587"
check_required "MAIL_USER"
check_required "MAIL_PASSWORD"
check_optional "MAIL_FROM" "CinemaEC <noreply@cinemaec.com>"
echo ""

# CORS Configuration
echo "🌐 Configuración de CORS:"
check_optional "CORS_ORIGIN" "http://localhost:3000"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Todas las variables requeridas están configuradas${NC}"
    echo ""
    echo "🚀 Listo para desplegar en Render!"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ve a https://dashboard.render.com"
    echo "2. Crea un nuevo Web Service desde tu repositorio"
    echo "3. Copia las variables de entorno desde tu archivo .env"
    echo "4. Configura Runtime: Docker"
    echo "5. Deploy!"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Faltan ${#MISSING_VARS[@]} variables requeridas:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Por favor configura estas variables antes de desplegar."
    echo "Puedes usar .env.render.example como referencia."
    echo ""
    exit 1
fi

if [ ${#OPTIONAL_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Variables opcionales usando valores por defecto:${NC}"
    for var in "${OPTIONAL_VARS[@]}"; do
        echo "   - $var"
    done
fi
