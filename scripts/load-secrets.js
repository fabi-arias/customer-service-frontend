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

async function loadSecrets() {
  const client = new SecretsManagerClient({ region: AWS_REGION });

  try {
    console.log(`🔐 Obteniendo secrets desde AWS Secrets Manager...`);
    console.log(`   Secret ID: ${SECRET_ID}`);
    console.log(`   Region: ${AWS_REGION}`);

    const command = new GetSecretValueCommand({
      SecretId: SECRET_ID,
    });

    const response = await client.send(command);
    const secretString = response.SecretString;

    if (!secretString) {
      throw new Error('No se encontró SecretString en la respuesta');
    }

    const secrets = JSON.parse(secretString);
    
    // Convertir el objeto de secrets a formato .env
    const envContent = Object.entries(secrets)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Escribir el archivo .env.local
    fs.writeFileSync(OUTPUT_FILE, envContent, 'utf8');
    
    console.log(`✅ Secrets cargados exitosamente`);
    console.log(`   Variables encontradas: ${Object.keys(secrets).length}`);
    console.log(`   Archivo generado: ${OUTPUT_FILE}`);
    
    // También exponer las variables en el proceso actual
    Object.entries(secrets).forEach(([key, value]) => {
      process.env[key] = value;
    });

    return secrets;
  } catch (error) {
    console.error('❌ Error al cargar secrets desde AWS Secrets Manager:', error.message);
    
    // Si no hay un .env.local existente, fallar
    if (!fs.existsSync(OUTPUT_FILE)) {
      console.error('⚠️  No existe archivo .env.local de respaldo.');
      console.error('   Por favor configura tus credenciales AWS o crea un .env.local manualmente para desarrollo local.');
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

