COMPOSE		:= docker-compose -p partylens-backend

all: frontend

stop:
	$(COMPOSE) down

purge:
	$(COMPOSE) down -v

dev:
	git pull origin HEAD
	$(COMPOSE) up -d --build api-dev

logs:
	$(COMPOSE) logs

status:
	$(COMPOSE) ps

frontend:
	git pull origin HEAD
	$(COMPOSE) up -d api-frontend

test:
	docker exec -it api-dev yarn test:e2e


.PHONY: test dev
