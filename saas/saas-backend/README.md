# SaaS Backend - Sistema de Avaliação Gratuita e Assinatura

Backend desenvolvido em Node.js para um sistema SaaS que oferece avaliação gratuita de 3 dias e posterior pagamento por assinatura através da API ASSAS.

## 🚀 Funcionalidades

- **Cadastro de Usuários**: Registro com avaliação gratuita de 3 dias
- **Autenticação JWT**: Sistema seguro de login/logout
- **Controle de Acesso**: Middleware para proteger rotas
- **Integração ASSAS**: Pagamento por assinatura via API ASSAS
- **Gestão de Assinaturas**: Controle de status e renovação

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- PostgreSQL (versão 12 ou superior)
- Conta na ASSAS (para API de pagamentos)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd saas-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados PostgreSQL

```sql
CREATE DATABASE saas_db;
CREATE USER saas_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE saas_db TO saas_user;
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_db
DB_USER=saas_user
DB_PASSWORD=sua_senha

# JWT Secret
JWT_SECRET=seu_jwt_secret_super_seguro

# Configurações da API ASSAS
ASSAS_API_KEY=sua_api_key_assas
ASSAS_BASE_URL=https://api.asaas.com/v3

# Configurações da Avaliação Gratuita (em dias)
FREE_TRIAL_DAYS=3
```

### 5. Execute as migrações

```bash
npm run migrate
```

### 6. Inicie o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── database.js      # Configuração do Sequelize
│   └── assas.js         # Configuração da API ASSAS
├── controllers/
│   ├── authController.js    # Controle de autenticação
│   ├── userController.js    # Controle de usuários
│   └── assinaturasController.js # Controle de assinaturas
├── models/
│   ├── User.js          # Modelo de usuário
│   └── assinaturas.js  # Modelo de assinatura
├── routes/
│   ├── auth.js          # Rotas de autenticação
│   ├── users.js         # Rotas de usuários
│   └── assinaturass.js # Rotas de assinaturas
├── middlewares/
│   ├── auth.js          # Middleware de autenticação
│   └── trialCheck.js    # Verificação de avaliação gratuita
├── services/
│   └── assasService.js  # Serviço de integração ASSAS
└── server.js            # Arquivo principal do servidor
```

## 🔌 API Endpoints

### Autenticação

- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Usuários

- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil

### Assinaturas

- `POST /api/assinaturass/create` - Criar assinatura
- `GET /api/assinaturass/status` - Status da assinatura
- `POST /api/assinaturass/cancel` - Cancelar assinatura

## 🔐 Fluxo de Autenticação

1. **Cadastro**: Usuário se registra e recebe 3 dias de avaliação gratuita
2. **Login**: Autenticação via JWT
3. **Verificação**: Middleware verifica se o período gratuito expirou
4. **Assinatura**: Se expirou, redireciona para criação de assinatura

## 💳 Integração ASSAS

O sistema integra com a API ASSAS para:

- Criar assinaturas recorrentes
- Processar pagamentos
- Receber webhooks de atualização de status
- Gerenciar cancelamentos

## 🧪 Testes

```bash
npm test
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm test` - Executa os testes
- `npm run migrate` - Executa as migrações do banco

## 🔧 Configurações Adicionais

### Rate Limiting

O sistema inclui rate limiting para proteger contra ataques de força bruta.

### CORS

Configurado para permitir requisições de origens específicas.

### Helmet

Segurança adicional com headers HTTP seguros.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## 📄 Licença

Este projeto está sob a licença MIT.
