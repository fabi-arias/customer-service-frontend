# ✅ Verificación Paso a Paso - Configuración Cognito

## 🔍 Verificación 1: Variables de Entorno

Tu `.env.local` está correcto:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_COGNITO_DOMAIN=https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=5n2ee26mn0o1bbem2v091gp4fp
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_LOGOUT_URI=http://localhost:3000/
```
✅ **Correcto**

## 🔍 Verificación 2: Configuración en AWS Cognito

### Paso 1: Ve a tu User Pool
1. AWS Console → Cognito → User Pools
2. Selecciona: `us-east-1_WcnMdx46J`
3. Ve a **"App integration"** tab

### Paso 2: Configura el App Client
1. En **"App clients"**, selecciona: `5n2ee26mn0o1bbem2v091gp4fp`
2. Haz clic en **"Edit"**

### Paso 3: Configura Hosted UI (CRÍTICO)

**Allowed OAuth flows:**
- ✅ Marca **"Implicit grant"** (DEBE estar marcado)
- ❌ NO marques "Authorization code grant" (a menos que uses PKCE)

**Allowed callback URLs:**
- ✅ Agrega EXACTAMENTE: `http://localhost:3000/auth/callback`
- ❌ NO debe tener barra final: `http://localhost:3000/auth/callback/`
- ❌ NO debe ser: `http://localhost:3000/`

**Allowed sign-out URLs:**
- ✅ Agrega: `http://localhost:3000/`

**Allowed OAuth scopes:**
- ✅ Marca: `openid`
- ✅ Marca: `email`
- ✅ Marca: `profile`

### Paso 4: Guarda los cambios
- Haz clic en **"Save changes"**
- Espera a que se guarde (puede tardar unos segundos)

## 🔍 Verificación 3: URL Generada

El código genera esta URL:
```
https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com/login?
  client_id=5n2ee26mn0o1bbem2v091gp4fp&
  response_type=token&
  scope=openid%20email%20profile&
  redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback
```

✅ **Verifica que:**
- `response_type=token` (no `code`)
- `redirect_uri` sea `http://localhost:3000/auth/callback` (decodificado)

## 🔍 Verificación 4: Probar el Flujo

1. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Abre la consola del navegador** (F12)

3. **Haz clic en "Iniciar sesión"**

4. **Verifica la URL a la que redirige:**
   - Debe ser: `https://us-east-1wcnmdx46j.auth.us-east-1.amazoncognito.com/login?...`
   - Con `response_type=token`

5. **Después de autenticarte:**
   - Debes ser redirigido a: `http://localhost:3000/auth/callback#id_token=...`
   - El token viene en el fragment (después del `#`)

6. **Revisa la consola del navegador:**
   - NO debe haber errores de "invalid_request"
   - Si hay error, copia el mensaje exacto

## 🐛 Troubleshooting

### Error: "invalid_request"

**Posibles causas:**
1. ❌ "Implicit grant" NO está habilitado en Cognito
2. ❌ Callback URL no coincide exactamente
3. ❌ El scope no está habilitado en Cognito

**Solución:**
- Ve a Cognito → App Client → Edit
- Verifica que "Implicit grant" esté marcado
- Verifica que el callback URL sea exactamente `http://localhost:3000/auth/callback`

### Error: "redirect_uri_mismatch"

**Causa:** El redirect_uri en la URL no coincide con el configurado en Cognito

**Solución:**
- Verifica que en Cognito tengas: `http://localhost:3000/auth/callback`
- Verifica que en `.env.local` tengas: `NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback`
- Ambos deben ser IDÉNTICOS

### El token no aparece en el callback

**Causa:** El flujo no es Implicit o hay un error

**Solución:**
- Abre la consola del navegador
- Ve a la pestaña "Network"
- Busca la petición a `/auth/callback`
- Verifica que tenga `#id_token=...` en la URL

## 📝 Checklist Final

Antes de probar, verifica:

- [ ] Implicit grant está habilitado en Cognito
- [ ] Callback URL es exactamente `http://localhost:3000/auth/callback`
- [ ] Los scopes `openid`, `email`, `profile` están habilitados
- [ ] `.env.local` tiene todas las variables correctas
- [ ] El servidor de desarrollo está corriendo
- [ ] La consola del navegador está abierta para ver errores

## 🎯 Si Aún No Funciona

1. **Comparte el error exacto** de la consola del navegador
2. **Comparte la URL completa** a la que redirige Cognito
3. **Verifica que guardaste los cambios** en Cognito (puede tardar unos segundos)

