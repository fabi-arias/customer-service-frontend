#!/bin/bash

# Script para actualizar un secret existente en AWS Secrets Manager

SECRET_ID="spot/env/frontend"
AWS_REGION="us-east-1"

echo "🔐 Actualizando secret en AWS Secrets Manager..."
echo "   Secret ID: $SECRET_ID"
echo "   Region: $AWS_REGION"
echo ""

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI no está instalado"
    exit 1
fi

# Verificar credenciales
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: No se encontraron credenciales válidas de AWS"
    exit 1
fi

# Obtener el secret actual
echo "📥 Obteniendo valores actuales del secret..."
aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ID" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text > /tmp/secret-current.json

if [ $? -ne 0 ]; then
    echo "❌ Error: No se pudo obtener el secret actual"
    exit 1
fi

echo "📝 Valores actuales:"
cat /tmp/secret-current.json | jq .
echo ""

# Crear archivo temporal para editar
cp /tmp/secret-current.json /tmp/secret-new.json

echo "✏️  Edita el archivo /tmp/secret-new.json con tus nuevos valores"
echo "   (Presiona Enter cuando hayas terminado de editar)"
read -p ""

# Si el usuario tiene un editor configurado, abrirlo
if [ -n "$EDITOR" ]; then
    $EDITOR /tmp/secret-new.json
else
    echo "💡 Tip: Configura la variable EDITOR para editar automáticamente"
    echo "   export EDITOR=nano  # o vim, code, etc."
fi

echo ""
echo "📝 Nuevos valores:"
cat /tmp/secret-new.json | jq .
echo ""

read -p "¿Actualizar el secret con estos valores? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operación cancelada"
    rm -f /tmp/secret-current.json /tmp/secret-new.json
    exit 0
fi

# Actualizar el secret
echo "📤 Actualizando secret..."
if aws secretsmanager update-secret \
    --secret-id "$SECRET_ID" \
    --secret-string file:///tmp/secret-new.json \
    --region "$AWS_REGION" > /dev/null; then
    
    echo "✅ Secret actualizado exitosamente!"
    echo ""
    echo "🔄 Para aplicar los cambios en tu proyecto local:"
    echo "   npm run load-secrets"
    echo ""
else
    echo "❌ Error al actualizar el secret"
fi

# Limpiar archivos temporales
rm -f /tmp/secret-current.json /tmp/secret-new.json

