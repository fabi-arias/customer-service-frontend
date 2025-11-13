// src/config/secrets.ts
// Gestión de secrets desde AWS Secrets Manager para el frontend

/**
 * Esta es una versión simplificada del sistema de secrets.
 * 
 * En Next.js, las variables de entorno se cargan en tiempo de build
 * para las variables públicas (NEXT_PUBLIC_*) y en tiempo de ejecución
 * para las variables del servidor.
 * 
 * El script scripts/load-secrets.js se encarga de obtener los secrets
 * de AWS Secrets Manager y escribirlos en .env.local antes del build.
 */

export const config = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // AWS Config (para uso del servidor, no exponer públicamente)
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  secretsManagerId: process.env.SECRETS_MANAGER_ID || 'spot/env/frontend',
  
  // Otras configuraciones públicas que necesites
  // Agrega aquí más variables según tus necesidades
};

/**
 * Helper para obtener variables de entorno con validación
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Variable de entorno requerida no encontrada: ${key}`);
    }
    console.warn(`⚠️ Variable de entorno no encontrada: ${key}`);
    return '';
  }
  
  return value || defaultValue || '';
}

/**
 * Helper para obtener variables públicas de Next.js
 */
export function getPublicEnvVar(key: string, defaultValue?: string): string {
  if (!key.startsWith('NEXT_PUBLIC_')) {
    console.warn(`⚠️ Variable ${key} no tiene el prefijo NEXT_PUBLIC_ y no estará disponible en el cliente`);
  }
  return getEnvVar(key, defaultValue);
}

export default config;

