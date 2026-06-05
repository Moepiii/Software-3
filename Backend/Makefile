.PHONY: help db-up db-down db-migrate db-generate db-reset dev test-backend-auth test-backend-persona test-backend-empresa test-backend-admin test-backend

help:
	@echo "Comandos disponibles:"
	@echo "  make db-up         - Levantar contenedor PostgreSQL"
	@echo "  make db-down       - Detener contenedor PostgreSQL"
	@echo "  make db-migrate    - Ejecutar migración de Prisma"
	@echo "  make db-generate   - Generar cliente Prisma para Go"
	@echo "  make db-reset      - Reiniciar BD (borra datos + migración limpia)"
	@echo "  make dev           - Ejecutar servidor en modo desarrollo"
	@echo "  make test-backend-auth    - Probar flujo auth del backend"
	@echo "  make test-backend-persona - Probar flujo persona del backend"
	@echo "  make test-backend-empresa - Probar flujo empresa del backend"
	@echo "  make test-backend-admin   - Probar flujo admin del backend"
	@echo "  make test-backend         - Probar toda la suite Backend/tests"

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

test-backend-auth:
	go test ./tests -run TestAuth -count=1 -v

test-backend-persona:
	go test ./tests -run TestPersona -count=1 -v

test-backend-empresa:
	go test ./tests -run TestEmpresa -count=1 -v

test-backend-admin:
	go test ./tests -run TestAdmin -count=1 -v

test-backend:
	go test ./tests -count=1 -v
