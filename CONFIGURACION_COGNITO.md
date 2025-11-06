# Configuración de Cognito - Solución al Error "Invalid Request"

## Problema Identificado

El error "invalid request" se debe a:
1. **Redirect URI incorrecto**: Está configurado como `http://localhost:3000/` pero debe ser `http://localhost:3000/auth/callback`
2. **Flujo incorrecto**: Estás usando Authorization Code flow pero el código está preparado para Implicit flow

## Solución: Configurar Cognito para Implicit Flow

### Paso 1: Configurar el App Client en Cognito

1. Ve a AWS Console → Cognito → User Pools → Tu Pool
2. Ve a **"App integration"** → **"App clients"**
3. Selecciona tu App Client (o crea uno nuevo)
4. En **"Hosted UI settings"**, asegúrate de tener:
   - **Allowed callback URLs**: `http://localhost:3000/auth/callback`
   - **Allowed sign-out URLs**: `http://localhost:3000/`
5. En **"OAuth 2.0 grant types"**, habilita:
   - ✅ **Implicit grant** (para que funcione con `response_type=token`)
   - ✅ **openid**
   - ✅ **email**
   - ✅ **profile**

### Paso 2: Actualizar Variables de Entorno

Asegúrate de que tu `.env.local` tenga:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COGNITO_DOMAIN=https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=5n2ee26mn0o1bbem2v091gp4fp
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_LOGOUT_URI=http://localhost:3000/
```

### Paso 3: Verificar la Configuración

**IMPORTANTE**: El redirect URI en Cognito debe coincidir EXACTAMENTE con `NEXT_PUBLIC_REDIRECT_URI`:
- ✅ Correcto: `http://localhost:3000/auth/callback`
- ❌ Incorrecto: `http://localhost:3000/`

## Alternativa: Si Prefieres Authorization Code Flow

Si prefieres usar Authorization Code flow (más seguro), necesitas:

1. **Habilitar "Authorization code grant"** en lugar de "Implicit grant"
2. **Configurar PKCE** (recomendado para SPA)
3. **Intercambiar el code por token** (esto ya está implementado en el código)

Pero para SPA simples, Implicit flow es más directo.

## Verificación

Después de configurar:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Haz clic en "Iniciar sesión"
3. Deberías ser redirigido a Cognito
4. Después de autenticarte, deberías volver a `http://localhost:3000/auth/callback` con el token
5. El token se guardará y serás redirigido a la página principal

## Troubleshooting

Si aún ves "invalid request":

1. ✅ Verifica que el redirect URI en Cognito sea EXACTAMENTE `http://localhost:3000/auth/callback`
2. ✅ Verifica que "Implicit grant" esté habilitado
3. ✅ Verifica que los scopes incluyan `openid email profile`
4. ✅ Verifica que el Client ID coincida en `.env.local` y Cognito
5. ✅ Limpia el cache del navegador y prueba en modo incógnito

