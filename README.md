
# REQUISITOS
* **Go** 
* **Docker** 
* **Node.js**
* **PostgreSQL**

# Correr el Proyecto

# Paso previo
Desde la raíz del repositorio, instala las dependencias con `pnpm`:

```bash
pnpm install
```

# Backend
Este proyecto se maneja usando prisma y docker. Antes de seguir, colocate en la carpeta de `Backend` o usa los scripts de la raíz.

# Paso 1. Montar la base de datos
Utiliza el comando

```bash
docker-compose up -d
```
Esto genera una maquina virtual donde se guardara la base de datos del proyecto 

# Paso 2. Migrar los cambios

Si la base de datos ha sido modificada por alguien es necesario que tu base de datos esta al dia con los cambios.
Ejecuta

```bash
go run github.com/steebchen/prisma-client-go migrate deploy
```
# Paso 3. Generar el cliente

Para que puedas hacer cambios en la base de datos necesitas el cliente de Prisma para programar.
Ejecuta

```bash
go run github.com/steebchen/prisma-client-go generate
```
# Paso 4. Corre el backend

Ejecuta
```bash
go run cmd/server/main.go
```

# Frontend
Posicionate en la carpeta llamada `Frontend` o ejecuta el script de la raíz.

```bash
pnpm --dir Frontend run dev
```

Si prefieres usar el script raíz:

```bash
pnpm run dev:frontend
```
# EXTRA
pnmp tiene el comando

```bash
 pnpm config list 
```
Esto te abre un archivo de configuracion dende se puede cambiar como la herramienta descarga los paquetes


# Refactorización

Esta rama tiene la refactorización del backend (las tablas de personas y empresas se unificaron en la tabla usuarios, y lo mismo para las deudas). Por lo que es necesario borrar la base de datos vieja y suplantarla por esta nueva. Los pasos son: 

# Paso 1. Apaga los contenedores y destruye el volumen físico de la base de datos vieja

```bash
docker compose down -v
```

# Paso 2. Levanta de nuevo el contenedor de PostgreSQL completamente limpio

```bash
docker compose up -d
```

O 

```bash
docker compose up -d postgres
```

# Paso 3. Crea la migración inicial unificada (desde la carpeta Backend)

```bash
go run github.com/steebchen/prisma-client-go migrate dev
```

# Paso 4. Genera el nuevo cliente de prisma (desde la carpeta Backend)

```bash
go run github.com/steebchen/prisma-client-go generate
```

Oooooo usa el Makefile y ya xddd
