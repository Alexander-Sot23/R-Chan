# R-Chan - Plataforma de Foros Anónimos

**Descripción del Proyecto**

R-Chan es una plataforma de foros anónimos tipo imageboard inspirada en for-chan, desarrollada como una aplicación fullstack moderna con Spring Boot (Java) en el backend y React (JavaScript) en el frontend. El sistema incluye un panel de administración/moderación completo con control de publicaciones y sistema de aprobación automática/manual.

**Estado del proyecto:** Completado y funcional  
**Versión:** 1.0.0  
**Última actualización:** Enero 2025

---

**Características Principales**

**Foro Público**
- Publicación anónima de posts y respuestas
- Soporte para imágenes (JPG, PNG) y videos (MP4) hasta 15MB
- Secciones temáticas predefinidas (Tecnología, Ficción, Literatura, etc.)
- Sistema de hilos con posts y respuestas
- Diseño responsive para móviles y desktop
- Interfaz minimalista y moderna

**Sistema de Moderación**
- Aprobación automática: Posts sin archivos y sin palabras restringidas
- Aprobación manual: Posts con archivos o contenido sensible
- Panel de moderación: Solo accesible con credenciales
- Historial de acciones: Log completo de todas las moderaciones
- Filtro de palabras: Configurable desde propiedades

**Panel de Administración**
- Gestión completa de usuarios administradores
- Estadísticas y métricas del sistema
- Control de configuraciones globales
- Historial detallado de actividad
- Sistema de verificación por email

---

**Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Base de Datos │
│   React 19      │◄──►│ Spring Boot 4.0  │◄──►│   MySQL 10.4    │
│   JavaScript    │    │   Java 21        │    │   MariaDB       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Navegador     │    │   Sistema de     │    │  File Storage   │
│   Web           │    │   Archivos       │    │   Local (15MB)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

**Stack Tecnológico**

**Backend (Spring Boot 4.0.0)**
- Java 21 con Spring Boot
- Spring Security con JWT (JSON Web Tokens)
- Spring Data JPA para persistencia
- MySQL 10.4 como base de datos
- Almacenamiento local de archivos (15MB límite)
- JJWT 0.12.6 para autenticación
- Lombok para reducción de código boilerplate

**Frontend (React 19)**
- React 19.2.0 con JavaScript
- React Router DOM 7.11.0 para enrutamiento
- Axios 1.13.2 para llamadas API
- Tailwind CSS 3.4.0 para estilos
- React Hook Form 7.69.0 para formularios
- Radix UI para componentes accesibles
- Lucide React para iconografía

**Herramientas de Desarrollo**
- Maven para construcción del backend
- npm para gestión de dependencias frontend
- MySQL Workbench para administración de BD
- Git para control de versiones

---

**Estructura del Proyecto**

**Backend**
```
com.alexander.spring.r_chan.r_chan/
├── config/             # Configuraciones Spring
├── controllers/        # Controladores REST
├── convert/            # Convertidores personalizados
├── dtos/               # Data Transfer Objects
├── entity/             # Entidades JPA
├── enums/              # Enumeraciones del sistema
├── exceptions/         # Manejo de excepciones
├── model/              # Modelos de negocio
├── repository/         # Repositorios Spring Data
├── security/           # Configuración Spring Security
├── services/           # Lógica de negocio
└── webtoken/           # Utilidades JWT
```

**Frontend**
```
src/
├── components/        # Componentes React
│   ├── common/        # Componentes reutilizables
│   ├── layout/        # Layouts de la aplicación
│   ├── posts/         # Componentes de posts
│   ├── sections/      # Componentes de secciones
│   ├── admin/         # Panel de administración
│   └── moderator/     # Panel de moderación
├── pages/             # Páginas de la aplicación
├── services/          # Servicios API (Axios)
├── hooks/             # Custom hooks
├── context/           # Contextos React
├── utils/             # Utilidades varias
└── styles/            # Estilos Tailwind
```

---

**Sistema de Autenticación**

**Roles y Permisos**
- **ROLE_ADMIN:** Acceso completo al sistema
- **ROLE_MODERATOR:** Solo moderación de contenido
- **PÚBLICO:** Solo lectura y creación de posts

**Flujo de Autenticación JWT**
```
1. POST /api/login → Valida credenciales
2. Genera token JWT firmado
3. Cliente almacena token
4. Token incluido en header Authorization
5. Filtro JWT valida token en cada request
```

**Características de Seguridad**
- Tokens JWT con expiración configurable
- BCrypt para hash de contraseñas
- CORS dinámico con detección automática de IPs locales
- Validación estricta de archivos subidos
- Protección contra ataques comunes (XSS, CSRF, path traversal)

---

**Modelo de Datos**

**Entidades Principales**
```sql
-- Post: Publicaciones principales
-- RePost: Respuestas a posts
-- Section: Secciones temáticas
-- AdminUser: Usuarios administradores
-- ModerationLog: Historial de moderación
-- PasswordResetCode: Códigos para reset de contraseña
```

**Estados y Enumeraciones**
```java
// ApprovalStatus.java
PENDING, APPROVED, REJECTED, AUTO_APPROVED

// AdminRole.java
MODERATOR, ADMIN

// FileType.java
IMAGE, VIDEO

// SectionStatus.java
ACTIVED, DISABLED, HIDDEN
```

---

**API Endpoints**

**Públicos**
```
GET    /api/post                    # Lista posts paginados
GET    /api/post/{id}               # Obtiene post específico
POST   /api/post                    # Crea nuevo post
GET    /api/section                 # Lista secciones activas
POST   /api/login                   # Autenticación (devuelve JWT)
POST   /api/forgot-password         # Solicita reset de contraseña
POST   /api/reset-password          # Cambia contraseña
```

**Administradores**
```
GET    /admin/api/user              # Lista administradores
POST   /admin/api/user/register     # Registra nuevo admin
GET    /admin/api/logs              # Historial de moderación
GET    /admin/api/stats             # Estadísticas del sistema
```

**Moderadores**
```
GET    /moderator/api/post          # Posts para moderar
PUT    /moderator/api/post/{id}     # Modifica/aprueba post
GET    /moderator/api/logs          # Logs del moderador
```

---

**Configuración e Instalación**

**Prerrequisitos**
- Java 21 JDK
- MySQL 10.4+
- Node.js 18+
- Maven 3.8+

### 1. Configuración de Base de Datos
```sql
CREATE DATABASE rchan;
CREATE USER 'rchan_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON rchan.* TO 'rchan_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configuración Backend
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/rchan
spring.datasource.username=rchan_user
spring.datasource.password=password
jwt.secret=your-256-bit-secret-base64-encoded
app.file.upload-dir=./uploads
app.restricted.words=badword1,badword2,badword3
```

### 3. Instalación y Ejecución
```bash
# Backend
cd backend
mvn clean install
java -jar target/r-chan-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm install
npm run dev
```

### 4. Variables de Entorno
```env
# Backend
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rchan
DB_USER=rchan_user
DB_PASS=password
JWT_SECRET=your-secret-key
FILE_UPLOAD_DIR=./uploads

# Frontend
VITE_API_URL=http://localhost:8080/api
VITE_ADMIN_URL=http://localhost:8080/admin/api
```

---

**Características Técnicas**

**Sistema de Moderación Inteligente**
```java
// Lógica de aprobación automática
if (post.hasFile()) {
    post.setApprovalStatus(PENDING);  //Requiere moderación manual
} else {
    if (hasRestrictedWords(post.getContent())) {
        post.setApprovalStatus(PENDING);  //Requiere moderación
    } else {
        post.setApprovalStatus(AUTO_APPROVED);  //Publicado automáticamente
    }
}
```

**Gestión de Archivos**
- Validación MIME type (no solo extensión)
- Renombrado seguro con UUID + timestamp
- Límite de 15MB por archivo
- Soporte para JPG, PNG, MP4
- Prevención de path traversal attacks

**Paginación y Performance**
```java
// Todos los endpoints GET soportan paginación
@RequestParam(defaultValue = "0") int page,
@RequestParam(defaultValue = "10") int size,
@RequestParam(defaultValue = "createdDate,desc") String sort
```

**Optimizaciones de Base de Datos**
```sql
-- Índices implementados
CREATE INDEX idx_post_section ON post(section_id);
CREATE INDEX idx_post_approval ON post(approval_status);
CREATE INDEX idx_post_created ON post(created_date DESC);
```

---

**Desarrollo**

**Comandos Útiles**
```bash
# Backend
mvn spring-boot:run          # Iniciar aplicación
mvn test                     # Ejecutar tests
mvn clean package            # Crear jar ejecutable

# Frontend
npm run dev                  # Desarrollo con hot-reload
npm run build                # Build para producción
npm run preview              # Vista previa del build
````

---

**Métricas**

**Métricas Recopiladas**
- Posts por sección (contadores cacheados)
- Tiempos de respuesta API
- Errores por endpoint
- Uso de almacenamiento
- Actividad de moderadores

---

 **Contacto**

**Desarrollador:** Alexander  
**Email:** alexandersotelo423@gmail.com  

---

**Agradecimientos**

- Spring Boot Team por el excelente framework
- React Team por la librería frontend
- Comunidad open source por las herramientas utilizadas
- Inspirado en for-chan y otras plataformas similares

---

**Nota:** Este proyecto fue desarrollado con fines educativos y de aprendizaje. Se recomienda realizar auditorías de seguridad adicionales antes de desplegar en entornos de producción críticos.

**Última actualización:** Enero 2025
**Versión del README:** 1.0.0
