#!/bin/bash

# Script para crear el secret en AWS Secrets Manager
# Este script debe ejecutarse una sola vez para configurar el secret inicial

SECRET_ID="spot/env/frontend"
AWS_REGION="us-east-1"

echo "🔐 Configurando secret en AWS Secrets Manager..."
echo "   Secret ID: $SECRET_ID"
echo "   Region: $AWS_REGION"
echo ""

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI no está instalado"
    echo "   Instálalo desde: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar credenciales
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: No se encontraron credenciales válidas de AWS"
    echo "   Ejecuta: aws configure"
    exit 1
fi

echo "✅ Credenciales AWS verificadas"
echo ""

# Crear el contenido del secret
cat > /tmp/secret.json <<EOF
{
  "NEXT_PUBLIC_API_URL": "http://localhost:8000"
}
EOF

echo "📝 Contenido del secret (por defecto):"
cat /tmp/secret.json
echo ""
echo "⚠️  Puedes editar /tmp/secret.json antes de continuar para personalizar los valores"
echo ""
read -p "¿Deseas continuar con estos valores? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Edita /tmp/secret.json y ejecuta:"
    echo "  aws secretsmanager create-secret \\"
    echo "    --name $SECRET_ID \\"
    echo "    --description \"Variables de entorno para el frontend\" \\"
    echo "    --secret-string file:///tmp/secret.json \\"
    echo "    --region $AWS_REGION"
    exit 0
fi

# Intentar crear el secret
echo "Creando secret en AWS..."

if aws secretsmanager create-secret \
    --name "$SECRET_ID" \
    --description "Variables de entorno para el frontend" \
    --secret-string file:///tmp/secret.json \
    --region "$AWS_REGION" 2>&1; then
    
    echo ""
    echo "✅ Secret creado exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Ejecuta: npm install"
    echo "   2. Ejecuta: npm run load-secrets"
    echo "   3. Ejecuta: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Error al crear el secret"
    echo ""
    echo "Si el secret ya existe, puedes actualizarlo con:"
    echo "  aws secretsmanager update-secret \\"
    echo "    --secret-id $SECRET_ID \\"
    echo "    --secret-string file:///tmp/secret.json \\"
    echo "    --region $AWS_REGION"
    echo ""
fi

# Limpiar archivo temporal
rm -f /tmp/secret.json

