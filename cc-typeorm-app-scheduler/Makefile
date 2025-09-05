.PHONY: help install dev build start test lint format db-up db-down db-reset migrate seed clean

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies and setup environment
	npm install
	cp .env.example .env

dev: ## Start development server
	npm run dev

build: ## Build the application
	npm run build

start: ## Start production server
	npm run start:prod

test: ## Run tests
	npm test

test-e2e: ## Run e2e tests
	npm run test:e2e

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

typecheck: ## Run TypeScript type checking
	npm run typecheck

db-up: ## Start database
	docker-compose up -d postgres

db-down: ## Stop database
	docker-compose down

db-reset: ## Reset database
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 5
	npm run migration:run
	npm run seed

migrate: ## Run migrations
	npm run migration:run

migrate-generate: ## Generate a new migration
	npm run migration:generate

seed: ## Seed database
	npm run seed

clean: ## Clean build artifacts and dependencies
	rm -rf dist node_modules coverage