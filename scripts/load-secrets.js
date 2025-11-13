#!/usr/bin/env node

/**
 * Script para cargar secrets desde AWS Secrets Manager
 * y exponerlos como variables de entorno para Next.js
 */

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const fs = require('fs');
const path = require('path');

const SECRET_ID = process.env.SECRETS_MANAGER_ID || 'spot/env/frontend';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const OUTPUT_FILE = path.join(__dirname, '..', '.env.local');

/**
 * Escapa y normaliza valores para formato .env seguro
 */
function toEnvValue(v) {
  let s = String(v);
  s = s.replace(/\r\n/g, '\n').replace(/\n/g, '\\n');
  if (/[#=\s"]/g.test(s)) {
    s = `"${s.replace(/"/g, '\\"')}"`;
  }
  return s;
}

async function loadSecrets() {
  const client = new SecretsManagerClient({ region: AWS_REGION });

  try {
    console.log(`🔐 Obteniendo secrets desde AWS Secrets Manager...`);
    console.log(`   Secret ID: ${SECRET_ID}`);
    console.log(`   Región: ${AWS_REGION}`);

    const command = new GetSecretValueCommand({ SecretId: SECRET_ID });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error('No se encontró SecretString en la respuesta');
    }

    let secrets;
    try {
      secrets = JSON.parse(response.SecretString);
    } catch (e) {
      throw new Error(`Secret inválido (JSON parse error): ${e.message}`);
    }

    // ✅ Validar claves requeridas
    const requiredKeys = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_COGNITO_DOMAIN',
      'NEXT_PUBLIC_COGNITO_CLIENT_ID',
      'NEXT_PUBLIC_OAUTH_REDIRECT_URI',
    ];
    const missingKeys = requiredKeys.filter((k) => !(k in secrets));
    if (missingKeys.length > 0) {
      throw new Error(`Faltan claves requeridas en el secret: ${missingKeys.join(', ')}`);
    }

    // ✅ Normalizar valores a string
    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value !== 'string') {
        console.warn(`⚠️  Secret '${key}' no es string; convirtiendo a string`);
        secrets[key] = String(value);
      }
    }

    // 🧾 Generar contenido .env seguro
    const envContent =
      Object.entries(secrets)
        .map(([key, value]) => `${key}=${toEnvValue(value)}`)
        .join('\n') + '\n';

    // ✍️ Escribir archivo con permisos seguros (rw-------)
    fs.writeFileSync(OUTPUT_FILE, envContent, { encoding: 'utf8', mode: 0o600 });

    // 🔒 Reforzar permisos en caso de que ya existiera
    try {
      fs.chmodSync(OUTPUT_FILE, 0o600);
    } catch (err) {
      console.warn('⚠️  No se pudieron ajustar permisos del archivo (posible Windows):', err.message);
    }

    console.log(`✅ Secrets cargados exitosamente`);
    console.log(`   Variables encontradas: ${Object.keys(secrets).length}`);
    console.log(`   Archivo generado: ${OUTPUT_FILE}`);

    // 🌱 Exponer en proceso actual
    Object.entries(secrets).forEach(([key, value]) => {
      process.env[key] = value;
    });

    return secrets;
  } catch (error) {
    console.error('❌ Error al cargar secrets desde AWS Secrets Manager:', error.message);

    if (!fs.existsSync(OUTPUT_FILE)) {
      console.error('⚠️  No existe archivo .env.local de respaldo.');
      console.error('   Configura tus credenciales AWS o crea un .env.local manualmente.');
      process.exit(1);
    }

    console.warn('⚠️  Usando archivo .env.local existente como respaldo');
    return null;
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  loadSecrets()
    .then(() => {
      console.log('✨ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { loadSecrets };
