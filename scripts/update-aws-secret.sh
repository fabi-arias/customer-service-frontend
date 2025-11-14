#!/bin/bash
set -euo pipefail

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
if ! aws sts get-caller-identity --region "$AWS_REGION" &> /dev/null; then
    echo "❌ Error: No se encontraron credenciales válidas de AWS"
    exit 1
fi

# Crear archivos temporales con permisos restrictivos (rw-------)
make_temp() {
  # Compatibilidad macOS/GNU
  local t
  t=$(mktemp 2>/dev/null || mktemp -t secret) || return 1
  chmod 600 "$t" || return 1
  echo "$t"
}

TEMP_CURRENT=$(make_temp) || { echo "❌ No se pudo crear archivo temporal"; exit 1; }
TEMP_NEW=$(make_temp) || { echo "❌ No se pudo crear archivo temporal"; exit 1; }
trap 'rm -f "$TEMP_CURRENT" "$TEMP_NEW"' EXIT

# Obtener el secret actual
echo "📥 Obteniendo valores actuales del secret..."
aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ID" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text > "$TEMP_CURRENT"

echo "📝 Valores actuales:"
if command -v jq &> /dev/null; then
  jq . < "$TEMP_CURRENT"
else
  echo "⚠️  'jq' no está instalado; mostrando contenido plano:"
  cat "$TEMP_CURRENT"
fi
echo ""

# Crear archivo temporal para editar
cp "$TEMP_CURRENT" "$TEMP_NEW"

echo "✏️  Edita el archivo $TEMP_NEW con tus nuevos valores"
echo "   (Presiona Enter para continuar y abrir el editor si está configurado)"
read -r _

# Si el usuario tiene un editor configurado, abrirlo
if [ -n "${EDITOR:-}" ]; then
    "$EDITOR" "$TEMP_NEW"
else
    echo "💡 Tip: Configura la variable EDITOR para editar automáticamente"
    echo "   export EDITOR=nano  # o vim, code, etc."
fi

echo ""
echo "📝 Nuevos valores:"
if command -v jq &> /dev/null; then
  jq . < "$TEMP_NEW"
else
  echo "⚠️  'jq' no está instalado; mostrando contenido plano:"
  cat "$TEMP_NEW"
fi
echo ""

read -p "¿Actualizar el secret con estos valores? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operación cancelada"
    exit 0
fi

# Actualizar el secret
echo "📤 Actualizando secret..."
if aws secretsmanager update-secret \
    --secret-id "$SECRET_ID" \
    --secret-string file://"$TEMP_NEW" \
    --region "$AWS_REGION" > /dev/null; then
    
    echo "✅ Secret actualizado exitosamente!"
    echo ""
    echo "🔄 Para aplicar los cambios en tu proyecto local:"
    echo "   npm run load-secrets"
    echo ""
else
    echo "❌ Error al actualizar el secret"
    exit 1
fi
