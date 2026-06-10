#!/bin/bash
# akasha-setup.sh — Setup automático do Akasha
# Versão: v0.0.17

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
DB_USER="cabala"
DB_PASS="cabala123"
DB_NAME="cabala_dos_caminhos"
ENV_FILE=".env.local"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}🔮 Akasha Setup — Configurando ambiente...${NC}"
echo ""

# 1. Detectar OS
detect_os() {
    echo -e "${YELLOW}[1/6]${NC} Detectando sistema operacional..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        echo "  → macOS detectado"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        echo "  → Linux detectado"
    else
        echo -e "${RED}❌ Sistema operacional não suportado: $OSTYPE${NC}"
        echo "  Suportamos: Linux (apt) e macOS (brew)"
        exit 1
    fi
}

# 2. Instalar PostgreSQL
install_postgres() {
    echo ""
    echo -e "${YELLOW}[2/6]${NC} Verificando PostgreSQL..."
    
    # Verificar se PostgreSQL já existe
    if command -v psql >/dev/null 2>&1; then
        local pg_version=$(psql --version 2>/dev/null | grep -oP '\d+' | head -1)
        echo -e "  → ${GREEN}PostgreSQL já instalado${NC} (versão: $pg_version)"
        return 0
    fi
    
    echo "  → PostgreSQL não encontrado. Iniciando instalação..."
    
    if [[ "$OS" == "macos" ]]; then
        if ! command -v brew >/dev/null 2>&1; then
            echo -e "${RED}❌ Homebrew não encontrado. Instale em: https://brew.sh${NC}"
            exit 1
        fi
        
        echo "  → Instalando PostgreSQL 16 via Homebrew..."
        brew install postgresql@16 2>/dev/null
        
        # Adicionar ao PATH
        if ! grep -q "postgresql@16" ~/.zshrc 2>/dev/null; then
            echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
        fi
        export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
        
    elif [[ "$OS" == "linux" ]]; then
        echo "  → Instalando PostgreSQL via apt..."
        sudo apt update -qq
        sudo apt install -y postgresql postgresql-contrib
        
        # Iniciar serviço
        if command -v systemctl >/dev/null 2>&1; then
            sudo systemctl start postgresql 2>/dev/null || sudo systemctl start postgresql.service 2>/dev/null
            sudo systemctl enable postgresql 2>/dev/null || true
        else
            sudo service postgresql start 2>/dev/null || true
        fi
    fi
    
    # Aguardar PostgreSQL iniciar
    echo "  → Aguardando PostgreSQL iniciar..."
    sleep 2
    
    # Verificar instalação
    if ! command -v psql >/dev/null 2>&1; then
        echo -e "${RED}❌ Falha ao instalar PostgreSQL${NC}"
        exit 1
    fi
    
    echo -e "  → ${GREEN}PostgreSQL instalado com sucesso${NC}"
}

# 3. Criar usuário e banco
create_database() {
    echo ""
    echo -e "${YELLOW}[3/6]${NC} Configurando banco de dados..."
    
    # Detectar como acessar PostgreSQL
    if [[ "$OS" == "macos" ]]; then
        PG_CMD="psql"
        PG_USER="postgres"
    elif [[ "$OS" == "linux" ]]; then
        PG_CMD="sudo -u postgres psql"
        PG_USER="postgres"
    fi
    
    # Verificar se usuário já existe
    if $PG_CMD -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
        echo "  → Usuário '$DB_USER' já existe"
    else
        echo "  → Criando usuário '$DB_USER'..."
        if [[ "$OS" == "macos" ]]; then
            createuser -s "$DB_USER" 2>/dev/null || true
        else
            sudo -u postgres createuser -s "$DB_USER" 2>/dev/null || true
        fi
    fi
    
    # Definir senha do usuário
    echo "  → Definindo senha para '$DB_USER'..."
    if [[ "$OS" == "macos" ]]; then
        psql -U "$DB_USER" -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || \
        "$PG_CMD" -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
    else
        sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
    fi
    
    # Verificar se banco já existe
    if $PG_CMD -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
        echo "  → Banco '$DB_NAME' já existe"
    else
        echo "  → Criando banco '$DB_NAME'..."
        if [[ "$OS" == "macos" ]]; then
            createdb "$DB_NAME" -O "$DB_USER" 2>/dev/null || \
            psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
        else
            sudo -u postgres createdb "$DB_NAME" -O "$DB_USER" 2>/dev/null || \
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
        fi
    fi
    
    echo -e "  → ${GREEN}Banco de dados configurado${NC}"
}

# 4. Gerar .env.local
create_env() {
    echo ""
    echo -e "${YELLOW}[4/6]${NC} Configurando variáveis de ambiente..."
    
    cd "$PROJECT_ROOT"
    
    if [[ -f "$ENV_FILE" ]]; then
        echo "  → $ENV_FILE já existe"
        
        # Verificar se DATABASE_URL está configurado
        if grep -q "DATABASE_URL" "$ENV_FILE"; then
            echo "  → DATABASE_URL já configurado"
        else
            echo "  → Adicionando DATABASE_URL..."
            echo "" >> "$ENV_FILE"
            echo 'DATABASE_URL="postgresql://'"$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"'"' >> "$ENV_FILE"
        fi
    else
        echo "  → Gerando $ENV_FILE..."
        cat > "$ENV_FILE" << EOF
# Akasha Environment
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
EOF
        echo -e "  → ${GREEN}$ENV_FILE criado${NC}"
    fi
}

# 5. Rodar migrations
run_migrations() {
    echo ""
    echo -e "${YELLOW}[5/6]${NC} Executando migrations Prisma..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar se Prisma está configurado
    if [[ ! -f "prisma/schema.prisma" ]]; then
        echo -e "  → ${YELLOW}Prisma schema não encontrado. Pulando migrations.${NC}"
        return 0
    fi
    
    # Verificar se migrations existem
    if [[ ! -d "prisma/migrations" ]]; then
        echo "  → Nenhuma migration encontrada. Gerando initial migration..."
        npx prisma migrate dev --name init --skip-generate 2>/dev/null || \
        npx prisma migrate dev --name init 2>/dev/null || true
    fi
    
    echo "  → Executando migrations..."
    npx prisma migrate deploy 2>/dev/null || \
    echo -e "  → ${YELLOW}Warning: migrations podem necessitar de ajustes${NC}"
    
    echo -e "  → ${GREEN}Migrations executadas${NC}"
}

# 6. Verificar conexão
verify() {
    echo ""
    echo -e "${YELLOW}[6/6]${NC} Verificando conexão..."
    
    cd "$PROJECT_ROOT"
    
    # Testar conexão direta
    if command -v psql >/dev/null 2>&1; then
        local conn_str="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
        
        if PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
            echo -e "  → ${GREEN}Conexão com banco de dados OK${NC}"
        else
            echo -e "  → ${YELLOW}Conexão direta não funcionou, tentando via pg_isready...${NC}"
            
            if command -v pg_isready >/dev/null 2>&1; then
                pg_isready -h localhost -p 5432 >/dev/null 2>&1 && \
                echo -e "  → ${GREEN}PostgreSQL está rodando${NC}" || \
                echo -e "  → ${YELLOW}PostgreSQL pode não estar rodando${NC}"
            fi
        fi
    fi
    
    # Verificar Prisma
    echo "  → Verificando Prisma Client..."
    if npx prisma db execute --stdin --skip-generate >/dev/null 2>&1 <<< "SELECT 1;" 2>/dev/null; then
        echo -e "  → ${GREEN}Prisma Client OK${NC}"
    else
        echo -e "  → ${YELLOW}Prisma Client pode necessitar de regenerate${NC}"
        echo "    Execute: npx prisma generate"
    fi
}

# Main
main() {
    # Verificar se está no diretório correto
    if [[ ! -f "package.json" ]] && [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        echo -e "${RED}❌ package.json não encontrado.${NC}"
        echo "   Execute este script a partir da raiz do projeto."
        exit 1
    fi
    
    detect_os
    install_postgres
    create_database
    create_env
    run_migrations
    verify
    
    echo ""
    echo -e "${GREEN}✅ Akasha configurado com sucesso!${NC}"
    echo ""
    echo "  Próximos passos:"
    echo "    → Execute 'pnpm dev' para iniciar o servidor"
    echo "    → Ou 'akasha' para iniciar o chat interativo"
    echo ""
}

main "$@"
