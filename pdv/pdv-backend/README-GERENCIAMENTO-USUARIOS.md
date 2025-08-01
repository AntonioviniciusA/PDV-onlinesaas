# Sistema de Gerenciamento de Usuários - PDV

## Visão Geral

O sistema de gerenciamento de usuários foi implementado com controle granular de permissões, permitindo criar e gerenciar usuários com diferentes níveis de acesso ao sistema PDV.

## Funcionalidades Implementadas

### 1. Criação de Usuários

- Interface para criar novos usuários
- Seleção de perfil (Operador, Gerente, Fiscal, Administrador)
- Seleção personalizada de permissões
- Aplicação automática de permissões padrão baseadas no perfil

### 2. Gerenciamento de Permissões

- Sistema de permissões granulares organizadas por categoria
- Permissões padrão para cada perfil
- Possibilidade de personalizar permissões individualmente
- Botão para aplicar permissões padrão do perfil selecionado

### 3. Categorias de Permissões

#### PDV

- `pdv.operate` - Operar PDV
- `pdv.authorize` - Autorizar operações
- `pdv.products` - Gerenciar produtos
- `pdv.reports` - Visualizar relatórios
- `pdv.cash` - Gerenciar caixa
- `pdv.labels` - Gerenciar etiquetas

#### Produtos

- `products.view` - Visualizar produtos
- `products.manage` - Gerenciar produtos
- `products.create` - Criar produtos
- `products.edit` - Editar produtos
- `products.delete` - Excluir produtos

#### Relatórios

- `reports.view` - Visualizar relatórios
- `reports.manage` - Gerenciar relatórios
- `reports.export` - Exportar relatórios

#### Caixa

- `cash.manage` - Gerenciar caixa
- `cash.open` - Abrir caixa
- `cash.close` - Fechar caixa
- `cash.view` - Visualizar caixa

#### Etiquetas

- `labels.config` - Configurar etiquetas
- `labels.print` - Imprimir etiquetas
- `labels.manage` - Gerenciar etiquetas

#### Sistema

- `manage.users` - Gerenciar usuários
- `system.config` - Configurar sistema
- `system.backup` - Backup do sistema

#### Administração

- `*` - Acesso total (Administrador)

## Perfis e Permissões Padrão

### Administrador

- **Permissões**: `["*"]` (Acesso total)
- **Descrição**: Acesso completo a todas as funcionalidades do sistema

### Gerente

- **Permissões**: `["pdv.operate", "pdv.authorize", "pdv.products", "pdv.reports", "pdv.cash", "pdv.labels", "manage.users"]`
- **Descrição**: Pode operar o PDV, autorizar operações, gerenciar produtos, visualizar relatórios, gerenciar caixa, etiquetas e usuários

### Operador

- **Permissões**: `["pdv.operate", "pdv.products"]`
- **Descrição**: Pode operar o PDV e gerenciar produtos básicos

### Fiscal

- **Permissões**: `["pdv.operate", "pdv.authorize", "reports.view"]`
- **Descrição**: Pode operar o PDV, autorizar operações e visualizar relatórios

## Endpoints da API

### Configurações do Sistema

- `GET /configuracoes_sistema/` - Buscar configurações
- `PUT /configuracoes_sistema/` - Atualizar configurações
- `GET /configuracoes_sistema/timezones` - Listar timezones
- `GET /configuracoes_sistema/permissoes` - Listar permissões disponíveis

### Gerenciamento de Usuários

- `GET /configuracoes_sistema/usuarios` - Listar usuários
- `POST /configuracoes_sistema/usuarios` - Criar usuário
- `PUT /configuracoes_sistema/usuarios/:id` - Atualizar usuário
- `DELETE /configuracoes_sistema/usuarios/:id` - Excluir usuário

## Estrutura do Banco de Dados

### Tabela `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  `perfil` ENUM('admin', 'operador', 'gerente', 'fiscal') DEFAULT 'operador',
  `permissions` JSON DEFAULT NULL,
  `ativo` BOOLEAN DEFAULT true,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usuários Padrão

O sistema inclui usuários padrão para teste:

1. **Administrador**

   - Email: `admin@dominio.com`
   - Senha: `admin123`
   - Perfil: Administrador
   - Permissões: Acesso total

2. **João Silva (Operador)**

   - Email: `joao.caixa@dominio.com`
   - Senha: `admin123`
   - Perfil: Operador
   - Permissões: Operar PDV, gerenciar produtos, relatórios e etiquetas

3. **Maria Santos (Fiscal)**

   - Email: `maria.fiscal@dominio.com`
   - Senha: `admin123`
   - Perfil: Fiscal
   - Permissões: Operar PDV, autorizar operações, visualizar relatórios

4. **Carlos Oliveira (Gerente)**

   - Email: `carlos.supervisor@dominio.com`
   - Senha: `admin123`
   - Perfil: Gerente
   - Permissões: Operar PDV, autorizar, visualizar produtos e relatórios, gerenciar caixa e usuários

5. **Ana Costa (Gerente)**
   - Email: `ana.gerente@dominio.com`
   - Senha: `admin123`
   - Perfil: Gerente
   - Permissões: Operar PDV, autorizar, gerenciar produtos e relatórios, caixa e etiquetas

## Interface do Usuário

### Aba Sistema

- Configurações da API (número do caixa, link da API, fuso horário)
- Configurações de banco de dados (backup, banco central)
- Configurações de sincronização
- Botões para editar e salvar configurações

### Aba Usuários

- Lista de usuários com informações básicas
- Botão para criar novo usuário
- Botões para editar e excluir usuários
- Modal para criar/editar usuários com:
  - Campos básicos (nome, email, senha, perfil)
  - Seleção de permissões por categoria
  - Botão para aplicar permissões padrão
  - Status ativo/inativo

## Segurança

- Senhas são criptografadas usando bcrypt
- Verificação de permissões para gerenciar usuários
- Validação de dados de entrada
- Proteção contra exclusão do próprio usuário
- Verificação de unicidade de email

## Testes

O sistema inclui testes automatizados para:

- Buscar configurações do sistema
- Listar timezones e permissões
- Criar usuários com permissões personalizadas
- Atualizar usuários
- Validação de permissões padrão

Para executar os testes:

```bash
cd pdv-backend
npm test -- --testNamePattern="configuracoes_sistema"
```

## Melhorias Futuras

1. **Logs de Auditoria**: Implementar logs detalhados de ações dos usuários
2. **Grupos de Usuários**: Criar grupos para facilitar o gerenciamento de permissões
3. **Políticas de Senha**: Implementar políticas de complexidade de senha
4. **Autenticação de Dois Fatores**: Adicionar 2FA para maior segurança
5. **Sessões**: Gerenciar sessões ativas dos usuários
6. **Backup de Usuários**: Sistema de backup automático dos dados de usuários
