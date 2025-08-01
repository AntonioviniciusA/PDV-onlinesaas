# Sistema de Cookies para Gerenciamento de Caixa

## Visão Geral

Este sistema implementa um gerenciamento de estado do caixa usando cookies gerenciados exclusivamente pelo backend para persistir os dados entre sessões e recarregamentos da página.

## Como Funciona

### 1. Backend (Node.js/Express)

#### Controller (`caixa.controller.js`)

- **Abrir Caixa**: Quando um caixa é aberto, os dados são salvos no banco de dados e um cookie é definido com as informações do caixa
- **Fechar Caixa**: Quando um caixa é fechado, o cookie é removido
- **Verificar Caixa**: Verifica se o caixa ainda está aberto no banco e atualiza o cookie se necessário

#### Configuração de Cookies

```javascript
// Definir cookie ao abrir caixa
res.cookie("caixa_session", JSON.stringify(caixaData), {
  httpOnly: false, // Permitir acesso via JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS apenas em produção
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
  path: "/",
});

// Limpar cookie ao fechar caixa
res.clearCookie("caixa_session", { path: "/" });
```

### 2. Frontend (React)

#### Serviço (`caixaServices.js`)

Serviço simplificado que apenas faz chamadas para a API:

- `abrirCaixa(amount, usuario)`: Abre um caixa
- `fecharCaixa(amount, usuario)`: Fecha o caixa atual
- `verificaCaixaAberto()`: Verifica se há um caixa aberto

#### Hook (`useCaixa.js`)

Hook personalizado que gerencia o estado do caixa:

- Verifica automaticamente se há um caixa aberto ao carregar
- Fornece funções para abrir/fechar caixa
- Mantém sincronização entre frontend e backend
- **Não gerencia cookies diretamente** - apenas usa os cookies definidos pelo backend

#### Componente (`PdvNav.jsx`)

Usa o hook `useCaixa` para:

- Mostrar status do caixa (aberto/fechado)
- Exibir número do caixa
- Gerenciar ações de abrir/fechar caixa

## Estrutura dos Dados do Cookie

```javascript
{
  id: 123,
  caixa_numero: 1,
  valor_inicial: 100.00,
  token: "12345678901234567890",
  abertura_autorizador_id: 456,
  operador_usuario_id: 789,
  criado_em: "2024-01-01T10:00:00.000Z",
  status: "aberto"
}
```

## Fluxo de Funcionamento

1. **Abertura do Caixa**:

   - Usuário clica em "Abrir Caixa"
   - Backend cria registro no banco
   - Backend define cookie com dados do caixa
   - Frontend recebe resposta e atualiza estado

2. **Verificação de Caixa Aberto**:

   - Ao carregar a página, hook chama API para verificar
   - Backend lê cookie e valida no banco
   - Se válido, retorna dados do caixa; se não, limpa cookie
   - Frontend atualiza estado baseado na resposta

3. **Fechamento do Caixa**:
   - Usuário clica em "Fechar Caixa"
   - Backend atualiza status no banco
   - Backend remove cookie
   - Frontend atualiza estado

## Vantagens

- **Segurança**: Apenas o backend gerencia cookies, evitando manipulação pelo cliente
- **Consistência**: Estado sempre sincronizado entre frontend e backend
- **Simplicidade**: Frontend não precisa se preocupar com gerenciamento de cookies
- **Validação**: Backend sempre valida dados antes de definir cookies

## Rotas da API

- `GET /caixa/verifica-aberto`: Verifica se caixa está aberto
- `POST /caixa/abrir`: Abre um novo caixa
- `POST /caixa/fechar`: Fecha o caixa atual
- `GET /caixa/abertos`: Lista caixas abertos
- `GET /caixa/fechados`: Lista caixas fechados

## Uso no Componente

```javascript
import { useCaixa } from "../hooks/useCaixa";

function MeuComponente() {
  const { cashSession, abrirCaixa, fecharCaixa, loading } = useCaixa();

  return (
    <div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <p>Caixa: {cashSession ? "Aberto" : "Fechado"}</p>
      )}
    </div>
  );
}
```

## Responsabilidades

### Backend

- ✅ Gerenciar cookies (definir/remover)
- ✅ Validar dados do caixa
- ✅ Persistir dados no banco
- ✅ Fornecer APIs para operações

### Frontend

- ✅ Consumir APIs do backend
- ✅ Gerenciar estado local
- ✅ Exibir informações do caixa
- ✅ Interagir com usuário
