# Order Management API

Una API RESTful para la gestión de órdenes construida con NestJS, TypeScript y TypeORM. Este proyecto implementa buenas prácticas de desarrollo backend incluyendo arquitectura modular, validación de entradas, manejo de errores y testing completo.

## Arquitectura y Decisiones Técnicas

### ¿Por qué NestJS?

- **Arquitectura Modular**: Organización del código en módulos independientes que facilitan el mantenimiento y escalabilidad
- **Inyección de Dependencias**: Promueve el desacoplamiento y facilita el testing
- **Decoradores y Metadata**: Simplifica la configuración y define el comportamiento de forma declarativa
- **Ecosistema TypeScript**: Tipado estático y mejor experiencia de desarrollo

### ¿Por qué TypeORM?

- **Mapeo Objeto-Relacional**: Abstrae la complejidad de las consultas SQL
- **Migraciones**: Control de versiones del esquema de base de datos
- **Soft Delete**: Eliminación suave para mantener integridad de datos históricos
- **Relaciones**: Gestión de relaciones entre entidades de forma sencilla

### Principios de Diseño Aplicados

#### 1. Arquitectura Hexagonal
Separación clara entre logica de negocio y y base de datos:

```
src/
├── database/
├── orders
│   └── repositories/
```

#### 2. SOLID Principles

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Abierto para extensión, cerrado para modificación
- **Liskov Substitution**: Uso de interfaces y abstracciones
- **Interface Segregation**: Interfaces específicas por cliente
- **Dependency Inversion**: Dependencias de abstracciones, no concreciones

#### 3. DTOs (Data Transfer Objects)

Validación y transformación de datos usando `class-validator` y `class-transformer`:

```typescript
export class CreateOrderDto {
    @IsNumber()
  customerId: number;

  @IsString()
  sku: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  totalAmount: number;
}
```

## Características

- CRUD completo de órdenes
- Validación de datos con class-validator
- Manejo de errores centralizado
- Soft delete para mantener historial
- Migraciones de base de datos
- Testing unitario y de integración
- Variables de entorno configurables
- Logging estructurado

## Requisitos Previos

- Node.js >= 16
- npm o yarn

## Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/LuiferEduardoo/order-management
cd order-management-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=order_management

# Application
PORT=3000
```

4. **Crear la base de datos**
```bash
createdb order_management
```

5. **Ejecutar migraciones**
```bash
npm run migration:run
```

## Ejecución

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

### Watch mode
```bash
npm run start:debug
```

La API estará disponible en `http://localhost:3000`

## Testing

### Tests unitarios
```bash
npm run test
```

### Cobertura de tests
```bash
npm run test:cov
```

## API Endpoints

### Órdenes

#### Crear una orden
```http
POST /orders
Content-Type: application/json

{
  "customerId": 1,
  "sku": "SKU-ORD-94821",
  "quantity": 3,
  "price": 49900,
  "totalAmount": 149700
}
```

#### Listar todas las órdenes
```http
GET /orders
```

#### Obtener una orden por ID
```http
GET /orders/:id
```

#### Actualizar una orden
```http
PUT /orders/:id
Content-Type: application/json

{
  "quantity": 4,
}
```

#### Eliminar una orden (soft delete)
```http
DELETE /orders/:id
```

## Estructura de la Base de Datos

### Tabla: orders
```sql
  CREATE TABLE `order` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `customer_id` INT NOT NULL,

    `sku` VARCHAR(255) NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,

    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',

    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_order_customer`
      FOREIGN KEY (`customer_id`)
      REFERENCES `customer` (`id`)
  ) ENGINE=InnoDB;
```

### Tabla: customer
```sql
  CREATE TABLE `customer` (
    `id` INT NOT NULL AUTO_INCREMENT,

    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,

    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB;
```

## Migraciones

### Crear una nueva migración
```bash
npm run migration:generate src/dabatase/migrations/MigrationName
```

### Ejecutar migraciones pendientes
```bash
npm run migration:run
```

### Revertir la última migración
```bash
npm run migration:revert
```

### Mostrar migraciones ejecutadas
```bash
npm run migration:show
```

## Manejo de Errores

La API implementa un sistema de manejo de errores centralizado:

```typescript
// Ejemplo de error de validación
{
  "statusCode": 400,
  "message": ["customerId should not be empty"],
  "error": "Bad Request"
}

// Ejemplo de recurso no encontrado
{
  "statusCode": 404,
  "message": "Order with ID abc-123 not found",
  "error": "Not Found"
}
```

## 🔒 Validaciones

### DTOs con class-validator

- `@IsString()`: Valida que el campo sea una cadena
- `@IsNumber()`: Valida que el campo sea un número
- `@IsNotEmpty()`: Valida que el campo no esté vacío
- `@IsArray()`: Valida que el campo sea un array
- `@ValidateNested()`: Valida objetos anidados
- `@Min()`, `@Max()`: Valida rangos numéricos

## Despliegue

### Docker

```dockerfile
# Usa una imagen oficial de Node.js 22 como imagen base
FROM node:22-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y el package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Compila el proyecto NestJS
RUN npm run build

# Expone el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "deploy"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: order-management-db
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: order_management
      MYSQL_USER: order_user
      MYSQL_PASSWORD: order_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: order-management-phpmyadmin
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: rootpassword
    ports:
      - "8080:80"
    depends_on:
      - db
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: order-management-app
    environment:
      PORT: 3000
      DB_PASSWORD: order_password
      DB_USER: order_user
      DB_PORT: 3306
      DB_HOST: db
      DB_NAME: order_management
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  mysql_data:
```

## Mejoras Futuras

- [ ] Implementar autenticación JWT
- [ ] Agregar rate limiting
- [ ] Implementar caché con Redis
- [ ] Implementar eventos y mensajería
- [ ] Agregar healthchecks
- [ ] Implementar logging avanzado con Winston
- [ ] Agregar métricas con Prometheus
- [ ] Implementar CI/CD con GitHub Actions
