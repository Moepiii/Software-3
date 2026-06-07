.PHONY: help db-up db-down db-migrate db-generate db-reset dev test-backend-auth test-backend-usuario test-backend-admin test-backend

help:
	@echo "Comandos disponibles:"
	@echo "  make db-up             - Levantar contenedor PostgreSQL"
	@echo "  make db-down           - Detener contenedor PostgreSQL"
	@echo "  make db-migrate        - Ejecutar migración de Prisma"
	@echo "  make db-generate       - Generar cliente Prisma para Go"
	@echo "  make db-reset          - Reiniciar BD unificada (borra datos + migración limpia + generate)"
	@echo "  make dev               - Ejecutar servidor en modo desarrollo"
	@echo "  make test-backend-auth    - Probar flujo unificado de autenticación"
	@echo "  make test-backend-usuario - Probar flujo unificado de deudas y estados (Persona/Empresa)"
	@echo "  make test-backend-admin   - Probar flujo administrativo unificado"
	@echo "  make test-backend         - Probar toda la suite Backend/tests"

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-migrate:
	go run github.com/steebchen/prisma-client-go migrate dev --name init_unificado

db-generate:
	go run github.com/steebchen/prisma-client-go generate

db-reset:
	docker compose down -v
	docker compose up -d postgres
	@echo "Esperando a que PostgreSQL esté listo..."
	sleep 3
	go run github.com/steebchen/prisma-client-go migrate dev --name init_unificado
	go run github.com/steebchen/prisma-client-go generate

dev:
	go run main.go

test-backend-auth:
	go test ./tests -run TestAuthFlow -count=1 -v

test-backend-usuario:
	go test ./tests -run TestUsuarioFlow -count=1 -v

test-backend-admin:
	go test ./tests -run TestAdminFlow -count=1 -v

test-backend:
	go test ./tests -count=1 -v