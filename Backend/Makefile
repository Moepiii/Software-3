.PHONY: help db-up db-down db-migrate db-generate db-reset dev

help:
	@echo "Comandos disponibles:"
	@echo "  make db-up         - Levantar contenedor PostgreSQL"
	@echo "  make db-down       - Detener contenedor PostgreSQL"
	@echo "  make db-migrate    - Ejecutar migración de Prisma"
	@echo "  make db-generate   - Generar cliente Prisma para Go"
	@echo "  make db-reset      - Reiniciar BD (borra datos + migración limpia)"
	@echo "  make dev           - Ejecutar servidor en modo desarrollo"

db-up:
	docker-compose up -d

db-down:
	docker-compose down

db-migrate:
	go run github.com/steebchen/prisma-client-go migrate dev --name init

db-generate:
	go run github.com/steebchen/prisma-client-go generate

db-reset: db-down
	docker-compose down -v
	docker-compose up -d
	sleep 3
	go run github.com/steebchen/prisma-client-go migrate dev --name init

dev:
	go run cmd/server/main.go