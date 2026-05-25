
# REQUISITOS
* **Go** 
* **Docker** 
* **Node.js**
* **PostgreSQL**

# Correr el Proyecto
# Backend
Este proyecto se maneja usando prisma y docker. Es decir que no se puede correr de golpe haciendo un go run. Antes de seguir colocate en la carpeta de backend

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
Posicionate en la carpeta llamada frotend
# Paso 1. Preinstalacion Segura

Debido a los problemas de hackeo se usara un gestor de paquetes distintos al comun.
Ejecuta

```bash
npm install -g pnpm
```
Esto instalara el nuevo gesto de paquetes pnpm.

Si se instalo correctamente con

```bash
pnpm -v
```
Deberias ver la version

# Paso 2. Corre el programa.

Ejecuta 

```bash
pnpm install
pnpm run dev
```
# EXTRA
pnmp tiene el comando

```bash
 pnpm config list 
```
Esto te abre un archivo de configuracion dende se puede cambiar como la herramienta descarga los paquetes




