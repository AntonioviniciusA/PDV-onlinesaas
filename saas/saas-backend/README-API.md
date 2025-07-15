# API de Planos - Documentação

## Endpoints Disponíveis

### 1. Health Check

```
GET /saas/health
```

Verifica se o backend está funcionando.

### 2. Buscar Todos os Planos

```
GET /saas/plano
```

Retorna todos os planos ativos.

### 3. Buscar Planos por Ciclo de Cobrança

```
GET /saas/plano?billing_cycle=monthly
GET /saas/plano?billing_cycle=yearly
```

Filtra planos por ciclo de cobrança (mensal ou anual).

### 4. Buscar Plano por ID

```
GET /saas/plano/:id
```

Retorna um plano específico por ID.

## Como Testar

### 1. Iniciar o Backend

```bash
cd saas-backend
npm start
```

### 2. Executar Testes Automáticos

```bash
node test-plano.js
```

### 3. Testes Manuais com cURL

#### Health Check:

```bash
curl http://localhost:3000/saas/health
```

#### Todos os Planos:

```bash
curl http://localhost:3000/saas/plano
```

#### Planos Mensais:

```bash
curl http://localhost:3000/saas/plano?billing_cycle=monthly
```

#### Planos Anuais:

```bash
curl http://localhost:3000/saas/plano?billing_cycle=yearly
```

## Estrutura da Resposta

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-do-plano",
      "nome": "Básico",
      "ciclo_cobranca": "monthly",
      "preco": 90.0,
      "preco_exibicao": "R$ 90",
      "descricao": "Perfeito para pequenas empresas e startups.",
      "max_usuarios": 5,
      "limite_armazenamento_gb": 5,
      "nivel_analytics": "basic",
      "nivel_suporte": "email",
      "acesso_api": false,
      "nivel_acesso_api": "none",
      "integracoes_personalizadas": false,
      "funcionalidades": [
        "Até 5 usuários",
        "Analytics básico",
        "5GB de armazenamento",
        "Suporte por email"
      ],
      "popular": false,
      "texto_cta": "Teste Grátis",
      "ordem_exibicao": 1,
      "ativo": true
    }
  ],
  "count": 1
}
```

## Configuração do Frontend

O frontend está configurado para:

- Usar React Query com cache
- Fazer requisições para `http://localhost:3000/saas/plano`
- Transformar dados do backend para o formato do frontend
- Exibir estados de loading e erro

## Troubleshooting

### Erro de CORS

Verificar se o CORS está configurado corretamente no `server.js`.

### Erro de Conexão

Verificar se o MySQL está rodando e as credenciais estão corretas no `.env`.

### Erro de Tabela

Verificar se o seed dos planos foi executado com sucesso.
