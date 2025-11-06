# Variables de Entorno - Frontend

## Archivo: `.env.local`

Agrega estas variables a tu archivo `.env.local` del frontend:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# AWS Cognito Configuration
NEXT_PUBLIC_COGNITO_DOMAIN=https://<tu-domain>.auth.<region>.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=<APP_CLIENT_ID>

# Redirect URIs
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_LOGOUT_URI=http://localhost:3000/
```

### Ejemplo completo (reemplaza con tus valores reales):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COGNITO_DOMAIN=https://muscle-chat.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdefghijklmnop
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_LOGOUT_URI=http://localhost:3000/
```

## Cómo obtener los valores:

1. **NEXT_PUBLIC_COGNITO_DOMAIN**: 
   - Ve a AWS Console → Cognito → User Pools → Tu Pool
   - En "App integration" → "Domain" verás el dominio
   - Formato: `https://<tu-dominio>.auth.<region>.amazoncognito.com`

2. **NEXT_PUBLIC_COGNITO_CLIENT_ID**:
   - En el mismo User Pool → "App integration" → "App clients"
   - Copia el "Client ID" de tu App Client

3. **NEXT_PUBLIC_REDIRECT_URI y NEXT_PUBLIC_LOGOUT_URI**:
   - Deben coincidir con los URIs configurados en Cognito
   - Para desarrollo local: `http://localhost:3000/auth/callback` y `http://localhost:3000/`

