# Sistema de Código de Acesso - PDV SaaS

## Visão Geral

Este sistema implementa uma funcionalidade de código de acesso de 6 dígitos que é gerado automaticamente após um login bem-sucedido. O código pode ser usado para conectar ao servidor do sistema.

## Funcionalidades

### 1. Login com Geração de Código

- Login tradicional com email e senha
- Após login bem-sucedido, um código de 6 dígitos é gerado automaticamente
- O código é salvo no banco de dados com informações de segurança
- Interface visual para exibir e copiar o código

### 2. Segurança

- Códigos expiram em 30 minutos
- Cada código pode ser usado apenas uma vez
- Registro de IP e User-Agent para auditoria
- Validação de expiração no servidor

### 3. Interface do Usuário

- Tela de login limpa e moderna
- Exibição clara do código de acesso
- Botão para copiar código para área de transferência
- Feedback visual de sucesso/erro

## Estrutura do Banco de Dados

### Nova Tabela: `codigos_acesso`

```sql
CREATE TABLE IF NOT EXISTS `codigos_acesso` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` VARCHAR(36) NOT NULL,
  `codigo` VARCHAR(6) NOT NULL,
  `tipo_usuario` ENUM('cliente', 'parceiro') NOT NULL,
  `data_geracao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_expiracao` DATETIME NOT NULL,
  `usado` BOOLEAN DEFAULT false,
  `data_uso` DATETIME NULL,
  `ip_geracao` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`)
);
```

## Arquivos Modificados/Criados

### Backend

- `saas-backend/src/database/database.sql` - Nova tabela
- `saas-backend/src/controllers/cliente.controller.js` - Lógica de geração e verificação
- `saas-backend/src/routes/cliente.router.js` - Nova rota

### Frontend

- `saas-pwa/src/components/landing-components/AuthDialogWithAccessCode.jsx` - Nova tela
- `saas-pwa/src/components/landing-components/PDVLoginDialog.jsx` - Tela específica para PDV
- `saas-pwa/src/components/landing-components/PDVAccessButton.jsx` - Botão de acesso PDV
- `saas-pwa/src/components/landing-components/PDVExample.jsx` - Exemplos de uso
- `saas-pwa/src/services/authServices.js` - Novo método de verificação
- `saas-pwa/src/components/landing-components/ExampleUsage.jsx` - Exemplo de uso

## Como Usar

### 1. Botão de Acesso PDV (Recomendado)

```jsx
import PDVAccessButton from "./components/landing-components/PDVAccessButton";

// Uso simples
<PDVAccessButton>Acesso PDV</PDVAccessButton>

// Com variantes
<PDVAccessButton variant="primary" size="lg">
  Conectar PDV
</PDVAccessButton>
```

### 2. Tela de Login PDV Direta

```jsx
import PDVLoginDialog from "./components/landing-components/PDVLoginDialog";

const [showPDVLogin, setShowPDVLogin] = useState(false);

return (
  <div>
    <button onClick={() => setShowPDVLogin(true)}>Abrir Login PDV</button>

    {showPDVLogin && (
      <PDVLoginDialog
        isOpen={showPDVLogin}
        onClose={() => setShowPDVLogin(false)}
        onAuthSuccess={(data) => console.log(data)}
      />
    )}
  </div>
);
```

### 3. Tela Genérica de Login com Código

```jsx
import AuthDialogWithAccessCode from "./components/landing-components/AuthDialogWithAccessCode";

const [showAuthDialog, setShowAuthDialog] = useState(false);

return (
  <div>
    <button onClick={() => setShowAuthDialog(true)}>
      Login com Código de Acesso
    </button>

    {showAuthDialog && (
      <AuthDialogWithAccessCode
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuthSuccess={(data) => console.log(data)}
      />
    )}
  </div>
);
```

## Fluxo de Funcionamento

1. **Login**: Usuário faz login com email e senha
2. **Validação**: Sistema valida credenciais
3. **Geração**: Se válido, gera código de 6 dígitos
4. **Armazenamento**: Salva código no banco com metadados
5. **Exibição**: Mostra código na interface
6. **Uso**: Usuário pode copiar código para conectar ao servidor

## APIs Disponíveis

### POST `/cliente/login`

- Gera código de acesso automaticamente
- Retorna: `{ token, codigo_acesso, user }`

### POST `/cliente/login-pdv`

- Login específico para PDV com geração de código de acesso
- Retorna: `{ token, codigo_acesso, user }`
- Token inclui campo `acesso: "pdv"`

### POST `/cliente/verificar-codigo-acesso`

- Verifica se código é válido
- Parâmetros: `{ codigo, id_cliente }`
- Retorna: `{ success, token, user }`

## Configurações

### Tempo de Expiração

- Padrão: 30 minutos
- Configurável no controller: `30 * 60000` (milissegundos)

### Formato do Código

- 6 dígitos numéricos
- Geração: `Math.floor(100000 + Math.random() * 900000)`

## Segurança

- Códigos únicos por sessão
- Expiração automática
- Registro de uso
- Validação de IP e User-Agent
- Proteção contra reutilização

## Próximos Passos

1. Implementar verificação de código para parceiros SaaS
2. Adicionar logs de auditoria mais detalhados
3. Implementar rate limiting para geração de códigos
4. Adicionar notificações por email/SMS do código gerado
