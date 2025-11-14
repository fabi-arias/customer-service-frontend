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
};

export default nextConfig;
