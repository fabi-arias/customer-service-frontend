import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Cargar variables de entorno desde .env.local
  // El archivo .env.local debe ser generado por scripts/load-secrets.js
  // antes del build usando: npm run load-secrets
  
  env: {
    // Aquí puedes mapear variables de entorno explícitamente si lo necesitas
    // Next.js cargará automáticamente las variables NEXT_PUBLIC_* de .env.local
  },

  // Configuración para evitar que Next.js maneje rutas de API del backend
  // Estas rutas deben ser manejadas por el backend FastAPI, no por Next.js
  async rewrites() {
    return {
      // No hacer rewrite de rutas de API - deben ir directamente al backend
      // El proxy/load balancer debe enrutar /api/* y /auth/* al backend
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
