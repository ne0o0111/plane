# Custom Plane web → build + đẩy server + restart
# Bạn chạy local:  make release
# Agent/Cursor: không SSH lên server.

IMAGE       ?= myplane/plane-frontend:custom
DOCKERFILE  ?= apps/web/Dockerfile.web
PLATFORM    ?= linux/amd64
DEPLOY_HOST ?= root@207.148.125.186
PLANE_DIR   ?= /opt/plane-selfhost
COMPOSE     ?= plane-app/docker-compose.yaml
ENV_FILE    ?= plane-app/plane.env

.PHONY: release build ship restart

release: build ship restart
	@echo "Done → $(IMAGE) trên $(DEPLOY_HOST)"

build:
	docker build --platform $(PLATFORM) -f $(DOCKERFILE) -t $(IMAGE) .

ship:
	docker save $(IMAGE) | gzip | ssh -o BatchMode=yes $(DEPLOY_HOST) 'gunzip | docker load'

restart:
	ssh -o BatchMode=yes $(DEPLOY_HOST) '\
		set -e; \
		cd $(PLANE_DIR); \
		docker compose -f $(COMPOSE) --env-file=$(ENV_FILE) up -d web; \
		docker ps --filter name=plane-app-web --format "{{.Names}} {{.Image}} {{.Status}}"'
