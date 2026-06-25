<div align="center">

# 🏥 CitaMed
### Sistema de Gestión Médica

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

*Sistema web fullstack para la gestión integral de una clínica médica*

</div>

---

## 📋 Descripción

**CitaMed** es un sistema de gestión médica desarrollado con **Spring Boot** en el backend y **Angular** en el frontend. Permite administrar citas, pacientes, médicos, historiales clínicos y pagos, con control de acceso diferenciado por roles y dashboards personalizados para cada tipo de usuario.

---

## ✨ Funcionalidades principales

- 🔐 **Autenticación segura** con JWT y control de acceso por roles
- 📅 **Gestión de citas** con validación de horarios médicos disponibles
- 👥 **Gestión de pacientes** con historial clínico completo
- 🩺 **Panel médico** con sus propias citas, pacientes y horarios
- 💵 **Módulo de pagos** con estados (Pendiente → Pagado / Anulado)
- 📋 **Historial médico** con próxima cita sugerida según disponibilidad
- 🏥 **Dashboards diferenciados** por rol con métricas en tiempo real
- 👤 **Perfil propio** editable para médicos y recepcionistas

---

## 👥 Roles del sistema

| Rol | Acceso |
|---|---|
| **ADMIN** | Acceso total al sistema |
| **MÉDICO** | Sus citas, pacientes, horarios e historial |
| **RECEPCIONISTA** | Citas, pacientes, historial y pagos |

---

## 🛠️ Tecnologías utilizadas

### Backend
| Tecnología | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 3.5 |
| Spring Security + JWT | 6 |
| Spring Data JPA | 3.5 |
| MySQL | 8.0 |
| Lombok | 1.18 |
| Maven | 3.9 |

### Frontend
| Tecnología | Versión |
|---|---|
| Angular | 21 |
| TypeScript | 5 |
| RxJS | 7 |
| Bootstrap | 5 |
| SCSS | — |

---

## 📁 Estructura del proyecto

## 📁 Estructura del proyecto

```text
citamed/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── clinica/
│   │   │           └── demo/
│   │   │               ├── controller/         # Endpoints REST
│   │   │               ├── dto/                # Transferencia de datos
│   │   │               ├── exception/          # Manejo global de errores
│   │   │               ├── model/              # Entidades JPA
│   │   │               ├── repository/         # Acceso a datos
│   │   │               ├── security/           # JWT y autenticación
│   │   │               └── service/            # Lógica de negocio
│   │   ├── resources/
│   │   │   └── application.properties
│   │   └── test/                              # Tests unitarios
│   └──
├── frontend/
│   └── src/
│       └── app/
│           ├── auth/                          # Login
│           ├── core/                          # Guards, servicios y modelos
│           ├── shared/                        # Componentes reutilizables
│           ├── dashboard/                     # Panel principal por rol
│           ├── citas/                         # Gestión de citas
│           ├── pacientes/                     # Gestión de pacientes
│           ├── medicos/                       # Gestión de médicos
│           ├── especialidades/                # Especialidades médicas
│           ├── consultorios/                  # Consultorios
│           ├── horarios/                      # Horarios médicos
│           ├── historial/                     # Historial clínico
│           ├── pagos/                         # Pagos y facturación
│           ├── recepcionistas/                # Gestión de recepcionistas
│           └── usuarios/                      # Gestión de usuarios
├── .gitignore
├── pom.xml                                   # Dependencias Maven
└── mvnw                                      # Maven Wrapper
```
---

## ⚙️ Configuración del entorno

### Requisitos previos
- Java 21
- Node.js 18+
- Angular CLI 21
- MySQL 8.0+
- Maven 3.9+

### 1. Clonar el repositorio
```bash
git clone https://github.com/DarkMafia312/citamed.git
cd citamed
```

### 2. Configurar la base de datos
```sql
CREATE DATABASE citamed_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/citamed_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD
jwt.secret=TU_JWT_SECRET
jwt.expiration=86400000
```

### 4. Iniciar el backend
```bash
./mvnw spring-boot:run
```
> Servidor en `http://localhost:8082`

### 5. Iniciar el frontend
```bash
cd frontend
npm install
ng serve
```
> Aplicación en `http://localhost:4200`

---

## 👤 Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin01` | `admin123` | ADMIN |
| `med.garcia` | `medico123` | MÉDICO |
| `recep01` | `recep123` | RECEPCIONISTA |

---

## 🔗 Endpoints principales

| Módulo | Base URL |
|---|---|
| Autenticación | `/api/auth` |
| Pacientes | `/api/pacientes` |
| Médicos | `/api/medicos` |
| Citas | `/api/citas` |
| Horarios | `/api/horarios` |
| Historial | `/api/historial` |
| Pagos | `/api/pagos` |
| Especialidades | `/api/especialidades` |
| Consultorios | `/api/consultorios` |
| Recepcionistas | `/api/recepcionistas` |
| Usuarios | `/api/usuarios` |
| Dashboard | `/api/dashboard` |

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos.

## 👥 Responsable del Trabajo
Gutierrez Sernaque Fernado Antonio

---

<div align="center">

Desarrollado con ❤️ usando Spring Boot y Angular

</div>
