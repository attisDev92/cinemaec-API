#!/bin/bash

# Script de prueba para verificar el envío de emails

echo "🧪 Probando envío de email de verificación..."
echo ""
echo "Asegúrate de haber configurado las variables de entorno en .env:"
echo "  - MAIL_USER: Tu email de Gmail"
echo "  - MAIL_PASSWORD: Contraseña de aplicación de Gmail"
echo ""
echo "Presiona Enter para continuar o Ctrl+C para cancelar..."
read

# Solicitar email de prueba
echo "Ingresa el email donde quieres recibir la prueba:"
read EMAIL

# Generar datos de prueba
CEDULA=$(date +%s)
PASSWORD="TestPassword123"

echo ""
echo "📧 Enviando solicitud de registro a: $EMAIL"
echo ""

# Hacer la solicitud
RESPONSE=$(curl -s -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"cedula\":\"$CEDULA\",\"password\":\"$PASSWORD\"}")

echo "Respuesta del servidor:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Solicitud enviada. Revisa tu bandeja de entrada (y spam) en: $EMAIL"
echo ""
echo "Si no recibes el email:"
echo "  1. Verifica los logs del servidor"
echo "  2. Revisa las credenciales de Gmail en .env"
echo "  3. Consulta EMAIL_SETUP.md para más información"
