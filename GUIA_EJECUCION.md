# 🚀 Guía Completa de Ejecución - Customer Service Chat

Esta guía te ayudará a ejecutar tanto el backend como el frontend del proyecto migrado desde Streamlit.

## 📁 Estructura del Proyecto

```
Desktop/
├── customer-service-chat/           # 📱 Proyecto original (Streamlit)
├── customer-service-chat-backend/   # 🐍 Backend (Python + FastAPI)
└── customer-service-chat-frontend/  # ⚛️ Frontend (React + Next.js)
```

---

## 🐍 PASO 1: Ejecutar el Backend (FastAPI)

### 1.1 Navegar al directorio del backend
```bash
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-backend
```

### 1.2 Activar el entorno virtual
```bash
source venv/bin/activate
```

**❌ Si falla:** El entorno virtual no existe, créalo:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 1.3 Verificar que las variables de entorno estén configuradas
```bash
ls -la | grep .env
```

**❌ Si no existe .env:** Cópialo del proyecto original:
```bash
cp /Users/fabianaariasrosales/Desktop/customer-service-chat/.env .
```

### 1.4 Ejecutar el backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2 --access-log
```

**✅ Deberías ver:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

lsof -i :8000
kill -9 <PID>


### 1.5 Verificar que el backend funciona
**En otra terminal:**
```bash
curl http://localhost:8000/health
```

**✅ Respuesta esperada:**
```json
{"status":"healthy","service":"customer-service-chat-api"}
```

---

## ⚛️ PASO 2: Ejecutar el Frontend (React)

### 2.1 Navegar al directorio del frontend
```bash
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-frontend
```

### 2.2 Instalar dependencias (solo la primera vez)
```bash
npm install
```

### 2.3 Verificar configuración de API
```bash
cat .env.local
```

**❌ Si no existe .env.local:** Créalo:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 2.4 Ejecutar el frontend
```bash
npm run dev
```

**✅ Deberías ver:**
```
▲ Next.js 15.5.5 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.110.125:3000
✓ Starting...
✓ Ready in XXXms
```

**⚠️ Si el puerto 3000 está ocupado:**
```
⚠ Port 3000 is in use by process XXXXX, using available port 3001 instead.
- Local:        http://localhost:3001
```

### 2.5 Verificar que el frontend funciona
**Abre tu navegador y ve a:**
- `http://localhost:3000` (puerto preferido)
- `http://localhost:3001` (si 3000 está ocupado)

---

## 🔧 PASO 3: Verificación Completa

### 3.1 Verificar que ambos servicios están ejecutándose
```bash
# Verificar puertos ocupados
lsof -i :8000 -i :3000 -i :3001

# Verificar backend
curl http://localhost:8000/health

# Verificar frontend
curl http://localhost:3000 | head -1
# o
curl http://localhost:3001 | head -1
```

### 3.2 Probar la comunicación entre frontend y backend
```bash
# Probar API de chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿cómo estás?"}'
```

**✅ Respuesta esperada:**
```json
{
  "success": true,
  "response": "Hola, ¿en qué puedo ayudarte hoy?",
  "session_id": "xxxx-xxxx-xxxx-xxxx",
  "error": null
}
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "AWS_ACCESS_KEY_ID no está configurado"
**Causa:** Variables de entorno faltantes
**Solución:**
```bash
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-backend
cp /Users/fabianaariasrosales/Desktop/customer-service-chat/.env .
```

### ❌ Error: "Port 3000 is in use"
**Causa:** Otro proceso usando el puerto
**Solución:**
```bash
# Ver qué proceso usa el puerto
lsof -i :3000

# Matar el proceso (reemplaza XXXX con el PID)
kill -9 XXXX

# O usar el puerto alternativo (3001)
```

### ❌ Error: "Network Error" en el frontend
**Causa:** CORS o backend no ejecutándose
**Solución:**
1. Verificar que el backend esté ejecutándose: `curl http://localhost:8000/health`
2. Verificar CORS en el backend (ya configurado para puertos 3000 y 3001)
3. Reiniciar ambos servicios

### ❌ Error: "Module not found" en Python
**Causa:** Dependencias no instaladas
**Solución:**
```bash
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-backend
source venv/bin/activate
pip install -r requirements.txt
```

### ❌ Error: "Command not found: python"
**Causa:** Python no está en PATH
**Solución:** Usar `python3` en lugar de `python`

---

## 📋 COMANDOS RÁPIDOS DE REFERENCIA

### Backend
```bash
# Navegar y activar entorno
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-backend
source venv/bin/activate

# Ejecutar
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Verificar
curl http://localhost:8000/health
```

### Frontend
```bash
# Navegar
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-frontend

# Ejecutar
npm run dev

# Verificar
curl http://localhost:3000
```

### Verificación General
```bash
# Ver puertos ocupados
lsof -i :8000 -i :3000 -i :3001

# Probar API
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## 🌐 URLs de Acceso

### Aplicación Principal
- **Frontend:** `http://localhost:3000` o `http://localhost:3001`
- **Backend API:** `http://localhost:8000`

### Documentación y Herramientas
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

---

## 🎯 Flujo de Trabajo Recomendado

1. **Ejecutar backend primero** (Terminal 1)
2. **Verificar que el backend funciona** (`curl http://localhost:8000/health`)
3. **Ejecutar frontend** (Terminal 2)
4. **Abrir navegador** en `http://localhost:3000` o `http://localhost:3001`
5. **Probar el chat** enviando un mensaje

---

## 🔄 Reiniciar Servicios

### Si necesitas reiniciar todo:
```bash
# Matar procesos
pkill -f "uvicorn main:app"
pkill -f "next dev"

# Reiniciar backend
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Reiniciar frontend (en otra terminal)
cd /Users/fabianaariasrosales/Desktop/customer-service-chat-frontend
npm run dev
```

---

## ✅ Checklist de Verificación

- [ ] Backend ejecutándose en puerto 8000
- [ ] Frontend ejecutándose en puerto 3000 o 3001
- [ ] Health check del backend responde OK
- [ ] Frontend carga en el navegador
- [ ] Chat funciona (envía y recibe mensajes)
- [ ] Sidebar muestra información del agente
- [ ] No hay errores de CORS en la consola del navegador

---

## 🆘 Si Todo Falla

1. **Verificar que ambos proyectos existen:**
   ```bash
   ls /Users/fabianaariasrosales/Desktop/ | grep customer-service-chat
   ```

2. **Recrear entorno virtual del backend:**
   ```bash
   cd /Users/fabianaariasrosales/Desktop/customer-service-chat-backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Reinstalar dependencias del frontend:**
   ```bash
   cd /Users/fabianaariasrosales/Desktop/customer-service-chat-frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Verificar variables de entorno:**
   ```bash
   # Backend
   cat /Users/fabianaariasrosales/Desktop/customer-service-chat-backend/.env
   
   # Frontend
   cat /Users/fabianaariasrosales/Desktop/customer-service-chat-frontend/.env.local
   ```

---

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica que todos los archivos estén en su lugar
2. Asegúrate de que las variables de entorno estén configuradas
3. Revisa los logs de ambos servicios para errores específicos
4. Verifica que los puertos no estén ocupados por otros procesos




EXTRAS:

Librería para que acepte las negritas en el texto del agente:
npm install react-markdown

Libreria para poner felchas en el grafico pastel
npm install recharts


Correccion de errores:
- Error Internal Server (“ENOENT… _buildManifest.js.tmp… no such file or directory”)
pkill -f "next dev" 2>/dev/null || true
rm -rf .next .turbo
