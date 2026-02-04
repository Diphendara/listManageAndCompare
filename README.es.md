# ListManageAndCompare

Una aplicación web offline-first basada en React Native para gestionar inventarios y listas personalizadas. Todos los datos persisten localmente con funcionalidad de copia de seguridad automática. Perfecta para rastrear coleccionables, inventarios o mazos de cartas personalizadas.

**Versión**: 1.0  
**Última Actualización**: 4 de Febrero de 2026

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
  - [Instalación en Windows](#instalación-en-windows)
  - [Instalación en macOS](#instalación-en-macos)
- [Ejecutar el Proyecto](#ejecutar-el-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Pruebas](#pruebas)
- [Solución de Problemas](#solución-de-problemas)

---

## ✨ Características

- **Gestión de Inventario**: Añadir, editar, eliminar y buscar artículos con cantidades y etiquetas
- **Listas Personalizadas**: Crear listas personalizadas con editor completo
- **Comparaciones**: Comparar tu inventario contra listas deseadas para ver qué tienes y qué falta
- **Importar/Exportar**: 
  - Importar múltiples archivos de inventario (JSON/TXT)
  - Exportar inventario y listas en formato JSON o TXT
  - Soporte para importación/exportación por lotes con selección de formato
- **Offline-First**: Todos los datos almacenados localmente, sin dependencias de nube
- **Copias de Seguridad Automáticas**: Se crean automáticamente con cada guardado
- **Diseño Responsivo**: Funciona en navegadores de escritorio y móviles
- **Formato en Mayúsculas Inicial**: Presentación limpia en toda la aplicación

---

## 🖥️ Requisitos del Sistema

### Requisitos Mínimos

- **Node.js**: v18.x o superior
- **npm**: v9.x o superior (viene con Node.js)
- **RAM**: Mínimo 2GB
- **Espacio en Disco**: 500MB para node_modules y dependencias

### Recomendado

- **Node.js**: v20.x o superior
- **npm**: v10.x o superior
- **RAM**: 4GB o más
- **macOS**: Mac M1/M2 o Intel con actualizaciones recientes
- **Windows**: Windows 10/11 con actualizaciones recientes

---

## 💻 Instalación

### Instalación en Windows

#### Paso 1: Instalar Node.js y npm

1. **Descargar Node.js**:
   - Ve a [nodejs.org](https://nodejs.org)
   - Descarga la versión LTS (Soporte a Largo Plazo)
   - Ejecuta el instalador (archivo .msi)

2. **Seguir el instalador**:
   - Acepta el acuerdo de licencia
   - Mantén la ruta de instalación por defecto: `C:\Program Files\nodejs`
   - Marca "Add to PATH" (normalmente está marcado por defecto)
   - Completa la instalación

3. **Verifica la instalación**:
   - Abre **Símbolo del Sistema** (presiona `Win + R`, escribe `cmd`, presiona Enter)
   - Ejecuta estos comandos:
     ```bash
     node --version
     npm --version
     ```
   - Deberías ver números de versión (ej: v20.10.0)

#### Paso 2: Clonar o Extraer el Proyecto

**Opción A: Usando Git (Recomendado)**

1. Instala Git desde [git-scm.com](https://git-scm.com)
2. Abre Símbolo del Sistema y navega a tu directorio deseado:
   ```bash
   cd C:\Users\TuNombre\Documents
   ```
3. Clona el repositorio:
   ```bash
   git clone https://github.com/Diphendara/listManageAndCompare.git
   cd listManageAndCompare
   ```

**Opción B: Descarga Manual**

1. Descarga el archivo ZIP del proyecto
2. Extrae la carpeta (ej: `C:\Users\TuNombre\Documents\listManageAndCompare`)
3. Abre Símbolo del Sistema y navega a la carpeta:
   ```bash
   cd C:\Users\TuNombre\Documents\listManageAndCompare
   ```

#### Paso 3: Instalar Dependencias

```bash
npm install
```

Esto descargará e instalará todos los paquetes requeridos (React, React Native, Expo, etc.).
Espera a que el proceso se complete (normalmente 2-5 minutos).

#### Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm start
```

Deberías ver una salida como:
```
Starting Metro Bundler
Web is running at http://localhost:8081
Press 'w' to open web, 'a' to open Android, 'i' to open iOS
```

Presiona **`w`** para abrir la aplicación en tu navegador predeterminado.

---

### Instalación en macOS

#### Paso 1: Instalar Node.js y npm

**Opción A: Usando Homebrew (Más Fácil)**

1. **Instala Homebrew** (si no lo tienes aún):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Instala Node.js**:
   ```bash
   brew install node
   ```

3. **Verifica la instalación**:
   ```bash
   node --version
   npm --version
   ```

**Opción B: Descarga Directa**

1. Ve a [nodejs.org](https://nodejs.org)
2. Descarga la versión LTS de macOS (elige según tu Mac: Intel o ARM)
3. Ejecuta el instalador (archivo .pkg)
4. Sigue el asistente de instalación

#### Paso 2: Clonar o Extraer el Proyecto

**Opción A: Usando Git**

1. Abre Terminal y navega a tu directorio deseado:
   ```bash
   cd ~/Documents
   ```

2. Clona el repositorio:
   ```bash
   git clone https://github.com/Diphendara/listManageAndCompare.git
   cd listManageAndCompare
   ```

**Opción B: Descarga Manual**

1. Descarga el archivo ZIP del proyecto
2. Se extrae automáticamente
3. Abre Terminal y navega:
   ```bash
   cd ~/Documents/listManageAndCompare
   ```

#### Paso 3: Instalar Dependencias

```bash
npm install
```

Espera a que se complete (normalmente 2-5 minutos).

#### Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm start
```

Presiona **`w`** para abrir la aplicación en tu navegador predeterminado.

---

## 🚀 Ejecutar el Proyecto

### Modo de Desarrollo

```bash
npm start
```

Esto inicia el servidor de desarrollo de Expo. Puedes:
- Presionar `w` para abrir en navegador web
- Presionar `a` para abrir en emulador Android
- Presionar `i` para abrir en simulador iOS
- Presionar `q` para salir

### Solo Web

```bash
npm run web
```

Abre la aplicación directamente en tu navegador web en `http://localhost:8081`

### Ejecutar Pruebas

```bash
npm test
```

Ejecuta todas las pruebas unitarias (56 pruebas en utilidades, modelos y servicios).

### Compilar para Producción

```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
ListManageAndCompare/
├── src/
│   ├── app/                    # Componente principal
│   ├── components/             # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TextArea.tsx
│   │   ├── Toast.tsx
│   │   └── MultiFileImportButton.tsx
│   ├── screens/                # Páginas principales
│   │   ├── inventory/          # Gestión de inventario
│   │   ├── lists/              # Listas personalizadas
│   │   ├── comparisons/        # Comparar listas
│   │   └── settings/           # Configuración
│   ├── services/               # Lógica de negocio
│   │   ├── inventoryService.ts
│   │   ├── storageService.ts
│   │   └── customListsService.ts
│   ├── parsers/                # Análisis de texto
│   │   ├── itemParser.ts
│   │   └── listItemParser.ts
│   ├── models/                 # Tipos de datos
│   │   ├── Item.ts
│   │   ├── Inventory.ts
│   │   └── CustomList.ts
│   └── utils/                  # Funciones auxiliares
├── __tests__/                  # Archivos de prueba (56 tests)
├── app.json                    # Configuración de Expo
├── package.json                # Dependencias
└── README.es.md                # Este archivo
```

---

## 📜 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Iniciar Dev | `npm start` | Inicia servidor de desarrollo de Expo |
| Solo Web | `npm run web` | Inicia servidor de desarrollo solo web |
| Ejecutar Pruebas | `npm test` | Ejecuta todas las pruebas unitarias |
| Compilar | `npm run build` | Crea compilación para producción |

---

## 🧪 Pruebas

El proyecto incluye cobertura integral de pruebas:

```bash
npm test
```

**Estadísticas de Pruebas**:
- **56 pruebas totales** en 11 suites de prueba
- **Utilidades probadas**: Análisis, formateo, fusión, manejo de fechas
- **Modelos probados**: Item, Inventario, ListaPersonalizada
- **Servicios probados**: Almacenamiento, adaptador de memoria, persistencia

Los archivos de prueba están ubicados en el directorio `__tests__/`.

---

## 📖 Guía de Uso

### Gestión de Inventario

1. Navega a la pestaña **Inventario**
2. Usa **Buscar** para encontrar artículos por nombre o etiqueta
3. **Añade artículos** usando el formato: `5x Espada #arma`
4. **Etiqueta artículos** para organizar (opcional): `#armadura`, `#poción`, etc.
5. **Descarga** en formato JSON o TXT
6. **Importa** desde archivos

### Crear Listas Personalizadas

1. Ve a la pestaña **Listas Personalizadas**
2. Haz clic en **Crear Nueva Lista**
3. Nombra tu lista (ej: "Mi Colección")
4. Añade artículos en formato: `cantidad x nombre`
5. Marca listas como **En Uso** para rastrearlas
6. Descarga o comparte

### Comparar Listas

1. Navega a la pestaña **Comparaciones**
2. Pega tu lista deseada en el área de texto
3. La aplicación muestra:
   - ✅ Cartas que tienes (filtradas del inventario)
   - ❌ Cartas que necesitas
4. Copia resultados al portapapeles
5. Descarga en formato TXT

### Configuración

- Gestiona copias de seguridad
- Ver estadísticas de inventario
- Configurar frecuencia de copias de seguridad

---

## 🔧 Solución de Problemas

### "Comando no encontrado: npm"

**Windows**:
1. Abre Símbolo del Sistema y ejecuta: `node --version`
2. Si falla, Node.js no se instaló correctamente
3. Reinstala Node.js y reinicia tu computadora

**macOS**:
1. Abre Terminal y ejecuta: `node --version`
2. Si falla, ejecuta: `brew install node`
3. O reinstala desde [nodejs.org](https://nodejs.org)

### El puerto 8081 ya está en uso

Si ves "Port 8081 is already in use":

**Windows**:
```bash
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

**macOS**:
```bash
lsof -i :8081
kill -9 <PID>
```

### La instalación de dependencias falla

1. Limpia el caché de npm:
   ```bash
   npm cache clean --force
   ```

2. Elimina `node_modules` y `package-lock.json`:
   - Windows: `rmdir /s /q node_modules` luego elimina `package-lock.json`
   - macOS: `rm -rf node_modules package-lock.json`

3. Reinstala:
   ```bash
   npm install
   ```

### Las pruebas fallan después de cambios

```bash
npm test -- --clearCache
npm test
```

### La aplicación web no carga

1. Verifica si el servidor de desarrollo está ejecutándose (terminal muestra salida de Metro Bundler)
2. Intenta limpiar el caché del navegador (Ctrl+Shift+Supr o Cmd+Shift+Supr)
3. Reinicia el servidor de desarrollo: Detén (Ctrl+C) y ejecuta `npm start` nuevamente

---

## 🤝 Contribuir

Para contribuir mejoras:

1. Crea una rama de característica: `git checkout -b feature/tu-caracteristica`
2. Realiza tus cambios y prueba: `npm test`
3. Confirma: `git commit -m "Añade tu característica"`
4. Empuja: `git push origin feature/tu-caracteristica`
5. Crea un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

---

## 📞 Soporte

Para problemas, preguntas o sugerencias:
1. Consulta la sección [Solución de Problemas](#solución-de-problemas)
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

## 🎉 Lista de Verificación para Comenzar

- [ ] Node.js v18+ instalado
- [ ] Proyecto clonado/extraído
- [ ] `npm install` completado
- [ ] `npm start` ejecutándose correctamente
- [ ] Navegador web mostrando la aplicación
- [ ] Pruebas pasando (`npm test`)
- [ ] ¡Listo para usar! 🚀

---

**¡Feliz gestión de inventario! Gestiona tu inventario con facilidad.** ✨
