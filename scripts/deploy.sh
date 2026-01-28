#!/bin/bash
# =============================================================================
# Script de déploiement - Yamaha DRT
# Usage: ./scripts/deploy.sh [first|update|restart]
# =============================================================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/yamaha-drt"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/opt/backups/yamaha-drt"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."

    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi

    # Docker Compose
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi

    # Fichier .env
    if [ ! -f "$APP_DIR/.env" ]; then
        log_error "Le fichier .env n'existe pas dans $APP_DIR"
        exit 1
    fi

    log_success "Tous les prérequis sont satisfaits"
}

# Premier déploiement
first_deploy() {
    log_info "=== Premier déploiement ==="

    check_prerequisites

    cd "$APP_DIR"

    # Créer les volumes externes Traefik si non existants
    log_info "Création des volumes Docker..."
    docker volume create traefik_data 2>/dev/null || true
    docker volume create n8n_data 2>/dev/null || true

    # Créer les répertoires nécessaires
    log_info "Création des répertoires..."
    mkdir -p uploads apps/api/logs
    chmod 755 uploads apps/api/logs

    # Construire les images
    log_info "Construction des images Docker..."
    docker compose -f "$COMPOSE_FILE" build --no-cache

    # Démarrer les services de base (DB et Redis)
    log_info "Démarrage de la base de données et Redis..."
    docker compose -f "$COMPOSE_FILE" up -d postgres redis

    # Attendre que PostgreSQL soit prêt
    log_info "Attente de PostgreSQL..."
    sleep 10
    until docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U yamaha_user; do
        log_info "PostgreSQL n'est pas encore prêt, attente..."
        sleep 5
    done
    log_success "PostgreSQL est prêt"

    # Exécuter les migrations Prisma
    log_info "Exécution des migrations de base de données..."
    docker compose -f "$COMPOSE_FILE" run --rm api npx prisma migrate deploy --schema=/app/packages/database/prisma/schema.prisma

    # Démarrer tous les services
    log_info "Démarrage de tous les services..."
    docker compose -f "$COMPOSE_FILE" up -d

    # Vérifier l'état des services
    sleep 10
    docker compose -f "$COMPOSE_FILE" ps

    log_success "=== Déploiement initial terminé ==="
    log_info "Les services sont accessibles aux URLs configurées"
}

# Mise à jour
update_deploy() {
    log_info "=== Mise à jour de l'application ==="

    check_prerequisites

    cd "$APP_DIR"

    # Backup de la base de données
    backup_database

    # Pull des derniers changements (si git)
    if [ -d ".git" ]; then
        log_info "Récupération des dernières modifications..."
        git pull origin main
    fi

    # Reconstruire les images
    log_info "Reconstruction des images Docker..."
    docker compose -f "$COMPOSE_FILE" build --no-cache api

    # Reconstruire les frontends localement et copier
    log_info "Construction des frontends..."
    npm run build

    # Redémarrer les services
    log_info "Redémarrage des services..."
    docker compose -f "$COMPOSE_FILE" up -d

    # Exécuter les migrations si nécessaires
    log_info "Vérification des migrations..."
    docker compose -f "$COMPOSE_FILE" run --rm api npx prisma migrate deploy --schema=/app/packages/database/prisma/schema.prisma

    # Vérifier l'état
    sleep 5
    docker compose -f "$COMPOSE_FILE" ps

    log_success "=== Mise à jour terminée ==="
}

# Redémarrage simple
restart_services() {
    log_info "=== Redémarrage des services ==="

    cd "$APP_DIR"

    docker compose -f "$COMPOSE_FILE" restart

    sleep 5
    docker compose -f "$COMPOSE_FILE" ps

    log_success "=== Redémarrage terminé ==="
}

# Backup de la base de données
backup_database() {
    log_info "Sauvegarde de la base de données..."

    mkdir -p "$BACKUP_DIR"

    BACKUP_FILE="$BACKUP_DIR/yamaha_drt_$(date +%Y%m%d_%H%M%S).sql"

    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U yamaha_user yamaha_drt > "$BACKUP_FILE"

    # Compression
    gzip "$BACKUP_FILE"

    # Garder seulement les 7 derniers backups
    ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm

    log_success "Backup créé: ${BACKUP_FILE}.gz"
}

# Afficher les logs
show_logs() {
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100 "$@"
}

# État des services
show_status() {
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    log_info "Utilisation des ressources:"
    docker stats --no-stream
}

# Stop tous les services
stop_services() {
    log_info "Arrêt de tous les services..."
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" down
    log_success "Services arrêtés"
}

# Nettoyage complet (supprime les volumes)
clean_all() {
    log_warning "=== ATTENTION: Cette commande va supprimer TOUTES les données ==="
    log_warning "Les volumes de base de données seront supprimés"
    read -p "Êtes-vous sûr de vouloir continuer? (tapez 'oui' pour confirmer): " confirmation

    if [ "$confirmation" != "oui" ]; then
        log_info "Annulé"
        exit 0
    fi

    log_info "Arrêt et suppression de tous les services et volumes..."
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" down -v
    log_success "Nettoyage terminé"
}

# Seed de la base de données
seed_database() {
    log_info "Seeding de la base de données..."
    cd "$APP_DIR"
    docker compose -f "$COMPOSE_FILE" run --rm api npx prisma db seed --schema=/app/packages/database/prisma/schema.prisma
    log_success "Seed terminé"
}

# Menu d'aide
show_help() {
    echo "Usage: $0 [commande]"
    echo ""
    echo "Commandes disponibles:"
    echo "  first     Premier déploiement complet"
    echo "  update    Mise à jour de l'application"
    echo "  restart   Redémarrer tous les services"
    echo "  stop      Arrêter tous les services"
    echo "  clean     Nettoyer complètement (supprime volumes et données)"
    echo "  status    Afficher l'état des services"
    echo "  logs      Afficher les logs (ajoutez le nom du service pour filtrer)"
    echo "  backup    Créer un backup de la base de données"
    echo "  seed      Initialiser les données de démonstration"
    echo "  help      Afficher cette aide"
}

# Point d'entrée principal
case "${1:-help}" in
    first)
        first_deploy
        ;;
    update)
        update_deploy
        ;;
    restart)
        restart_services
        ;;
    stop)
        stop_services
        ;;
    clean)
        clean_all
        ;;
    status)
        show_status
        ;;
    logs)
        shift
        show_logs "$@"
        ;;
    backup)
        backup_database
        ;;
    seed)
        seed_database
        ;;
    help|*)
        show_help
        ;;
esac
