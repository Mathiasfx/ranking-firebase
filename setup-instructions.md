# Configuración de Firebase

## 1. Variables de Entorno

Las siguientes variables de entorno ya están configuradas en tu proyecto:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 2. Reglas de Firebase Realtime Database

Para configurar las reglas de seguridad en Firebase:

1. Ve a la consola de Firebase (https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a "Realtime Database" en el menú lateral
4. Haz clic en la pestaña "Reglas"
5. Copia y pega las reglas del archivo `firebase-database-rules.json`
6. Haz clic en "Publicar"

### Explicación de las Reglas:

- **`.read": true`**: Permite lectura pública de los datos (necesario para mostrar la tabla)
- **`.write": "auth != null"`**: Solo usuarios autenticados pueden escribir datos
- **Validaciones**: Aseguran que los datos tengan el formato correcto:
  - Nombre y Apellido: strings no vacíos
  - Email: formato de email válido
  - Puntaje: solo números
  - UID: string no vacío

## 3. Estructura de Datos Esperada

\`\`\`json
{
  "usuarios": {
    "-OWLIDsF2ekqKGpl3Wbi": {
      "Apellido": "González",
      "Email": "usuario@ejemplo.com", 
      "Nombre": "Juan",
      "Puntaje": "850",
      "UID": "usuario@ejemplo.com"
    }
  }
}
\`\`\`

## 4. Verificación de Configuración

El componente `FirebaseStatus` mostrará automáticamente si la conexión es exitosa o si hay algún error de configuración.

## 5. Troubleshooting

Si ves errores:
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que las reglas de Firebase estén publicadas
- Confirma que la URL de la base de datos sea correcta
- Revisa que el proyecto de Firebase tenga Realtime Database habilitado
