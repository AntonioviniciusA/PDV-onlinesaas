DROP DATABASE IF EXISTS pdvlocal;
CREATE DATABASE IF NOT EXISTS pdvlocal;
USE pdvlocal;

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

CREATE TABLE IF NOT EXISTS autorizadores (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `usuario_id` INT,
  `autorizador` VARCHAR(20),
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário administrador padrão
INSERT INTO users (
  id_loja,
  nome,
  email,
  senha,
  perfil,
  permissions,
  ativo
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    'Administrador' AS nome,
    'admin@dominio.com' AS email,
    '$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi' AS senha, -- admin123
    'admin' AS perfil,
    '["*"]' AS permissions,
    1 AS ativo
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@dominio.com'
);

-- Inserir usuário João Silva (caixa)
INSERT INTO users (
  id_loja,
  nome,
  email,
  senha,
  perfil,
  permissions,
  ativo
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    'João Silva' AS nome,
    'joao.caixa@dominio.com' AS email,
    '$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi' AS senha,
    'operador' AS perfil,
    '["pdv.operate","products.view","products.manage","reports.manage","labels.config","pdv.products"]' AS permissions,
    1 AS ativo
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'joao.caixa@dominio.com'
);

-- Inserir usuário Maria Santos (fiscal)
INSERT INTO users (
  id_loja,
  nome,
  email,
  senha,
  perfil,
  permissions,
  ativo
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    'Maria Santos' AS nome,
    'maria.fiscal@dominio.com' AS email,
    '$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi' AS senha,
    'fiscal' AS perfil,
    '["pdv.operate","pdv.authorize","products.view","reports.view"]' AS permissions,
    1 AS ativo
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'maria.fiscal@dominio.com'
);

-- Inserir usuário Carlos Oliveira (supervisor)
INSERT INTO users (
  id_loja,
  nome,
  email,
  senha,
  perfil,
  permissions,
  ativo
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    'Carlos Oliveira' AS nome,
    'carlos.supervisor@dominio.com' AS email,
    '$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi' AS senha,
    'gerente' AS perfil,
    '["pdv.operate","pdv.authorize","products.view","reports.view","cash.manage", "pdv.products", "manage.users"]' AS permissions,
    1 AS ativo
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'carlos.supervisor@dominio.com'
);

-- Inserir usuário Ana Costa (gerente)
INSERT INTO users (
  id_loja,
  nome,
  email,
  senha,
  perfil,
  permissions,
  ativo
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    'Ana Costa' AS nome,
    'ana.gerente@dominio.com' AS email,
    '$2a$10$yjkeg.NF9hK0sxQ/P5CLo.LdhE9B3U1fwXTOLYlB7VrKgN/lccgvi' AS senha,
    'gerente' AS perfil,
    '["pdv.operate","pdv.authorize","products.manage","reports.manage","cash.manage","labels.config", "pdv.products"]' AS permissions,
    1 AS ativo
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'ana.gerente@dominio.com'
);

-- Usuários adicionados conforme user.js

CREATE TABLE IF NOT EXISTS configuracao (
    `id` int AUTO_INCREMENT NOT NULL,
    `id_loja` VARCHAR(36) NOT NULL,
    `seguranca_2fa` BOOLEAN DEFAULT false,
    `dispositivos_2fa` BOOLEAN DEFAULT false,
    `notificacoes_email` BOOLEAN DEFAULT false,
    `notificacoes_sms` BOOLEAN DEFAULT false,
    `notificacoes_push` BOOLEAN DEFAULT false,
    `notificacoes_whatsapp` BOOLEAN DEFAULT false,
    `idioma` VARCHAR(10) DEFAULT 'pt-BR',
    `fuso_horario` VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    `cor_principal` VARCHAR(10) DEFAULT '#000000',
    `cor_secundaria` VARCHAR(10) DEFAULT '#000000',
    `cor_terciaria` VARCHAR(10) DEFAULT '#000000',
    PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS produto (
  `codigo` VARCHAR(13) UNIQUE NOT NULL PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `codigo_barras` VARCHAR(13) UNIQUE NOT NULL,
  `descricao` VARCHAR(255),
  `descricao_fiscal` VARCHAR(255),
  `grupo` VARCHAR(100) NOT NULL,
  `ncm` VARCHAR(20),
  `origem` VARCHAR(2),
  `cfop_entrada` VARCHAR(10),
  `cfop_saida` VARCHAR(10),
  `cst_entrada` VARCHAR(10),
  `cst_saida` VARCHAR(10),
  `modalidade_bc_icms` VARCHAR(10),
  `aliquota_icms` DECIMAL(5,2),
  `aliquota_ipi` DECIMAL(5,2),
  `aliquota_pis` DECIMAL(5,2),
  `aliquota_cofins` DECIMAL(5,2),
  `credito_presumido` VARCHAR(50),
  `categoria_tributaria` VARCHAR(50),
  `cbs` DECIMAL(5,2),
  `ibs` DECIMAL(5,2),
  `ii` DECIMAL(5,2),
  `afrmm_fmm` VARCHAR(50),
  `preco_custo` DECIMAL(10,2),
  `margem_lucro` DECIMAL(5,2),
  `preco_venda` DECIMAL(10,2) ,
  `estoque_minimo` INT,
  `estoque_maximo` INT,
  `estoque_atual` INT,
  `unidade` VARCHAR(20) DEFAULT 'UN',
  `controla_estoque` BOOLEAN DEFAULT false,
  `cfop` VARCHAR(10),
  `csosn` VARCHAR(10),
  `cst` VARCHAR(10),
  `icms` DECIMAL(5,2),
  `ativo` BOOLEAN DEFAULT true,
  `exibir_tela` BOOLEAN DEFAULT true,
  `solicita_quantidade` BOOLEAN DEFAULT false,
  `cest` VARCHAR(10),
  `cst_pis` VARCHAR(10),
  `pis` DECIMAL(5,2),
  `cst_cofins` VARCHAR(10),
  `cofins` DECIMAL(5,2),
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO produto (
  codigo, id_loja, codigo_barras, descricao, descricao_fiscal, grupo, ncm, origem, cfop_entrada, cfop_saida, cst_entrada, cst_saida, modalidade_bc_icms, aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, credito_presumido, categoria_tributaria, cbs, ibs, ii, afrmm_fmm, preco_custo, margem_lucro, preco_venda, estoque_minimo, estoque_maximo, estoque_atual, unidade, controla_estoque, cfop, csosn, cst, icms, ativo, exibir_tela, solicita_quantidade, cest, cst_pis, pis, cst_cofins, cofins
) VALUES
(
  '000000000001', '00000000-0000-0000-0000-000000000000', '7891000100101', 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml', 'Bebidas', '22021000', '0', '1102', '5102', '060', '060', '0', 18.00, 0.00, 1.65, 7.60, '', 'Tributado', 0.00, 0.00, 0.00, '', 3.00, 50.00, 4.50, 10, 100, 50, 'UN', true, '5102', '102', '060', 18.00, true, true, false, '', '01', 1.65, '01', 7.60
),
(
  '000000000002', '00000000-0000-0000-0000-000000000000', '7894900011517', 'Pão Francês (kg)', 'Pão Francês vendido por kg', 'Padaria', '19059090', '0', '1102', '5102', '060', '060', '0', 7.00, 0.00, 1.65, 7.60, '', 'Tributado', 0.00, 0.00, 0.00, '', 5.00, 78.00, 8.90, 5, 50, 20, 'KG', true, '5102', '102', '060', 7.00, true, true, true, '', '01', 1.65, '01', 7.60
),
(
  '000000000003', '00000000-0000-0000-0000-000000000000', '7891025100103', 'Leite Integral 1L', 'Leite Integral longa vida 1 litro', 'Laticínios', '04012010', '0', '1102', '5102', '060', '060', '0', 12.00, 0.00, 1.65, 7.60, '', 'Tributado', 0.00, 0.00, 0.00, '', 3.50, 48.57, 5.20, 8, 80, 30, 'UN', true, '5102', '102', '060', 12.00, true, true, false, '', '01', 1.65, '01', 7.60
);
-- Tabela de caixas
CREATE TABLE IF NOT EXISTS caixas (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `caixa_numero` INT NOT NULL UNIQUE,
  `status` ENUM('aberto', 'fechado') NOT NULL,
  `valor_inicial` DECIMAL(10,2) NOT NULL,
  `valor_final` DECIMAL(10,2) DEFAULT 0,
  `diferenca` DECIMAL(10,2) DEFAULT 0,
  `operador_usuario_id` INT,
  `token` VARCHAR(20) NOT NULL,
  `abertura_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fechamento_em` TIMESTAMP DEFAULT NULL,
  `abertura_autorizador_id` INT DEFAULT NULL,
  `fechamento_autorizador_id` INT DEFAULT NULL,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`operador_usuario_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`abertura_autorizador_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`fechamento_autorizador_id`) REFERENCES `users`(`id`)
);

-- Tabela de cupons fiscais
CREATE TABLE IF NOT EXISTS cupom (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `numero` VARCHAR(50) UNIQUE,
  `user_nome` VARCHAR(100),
  `timestamp` TIMESTAMP NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `desconto` DECIMAL(10,2) DEFAULT 0,
  `payment_method` VARCHAR(50),
  `received_amount` DECIMAL(10,2) DEFAULT 0,
  `change_amount` DECIMAL(10,2) DEFAULT 0,
  `itens` JSON,
  `status` ENUM('online', 'offline') DEFAULT 'online',
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de recibos
CREATE TABLE IF NOT EXISTS recibos (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `numero` VARCHAR(20) NOT NULL UNIQUE,
  `cliente` VARCHAR(100),
  `data` DATE NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `id_integracao` VARCHAR(50) UNIQUE NOT NULL,
  `natureza` VARCHAR(50),
  `cpfcnpj_emitente` VARCHAR(14),
  `cpfcnpj_destinatario` VARCHAR(14),
  `responsavel_cpfcnpj` VARCHAR(14),
  `responsavel_nome` VARCHAR(100),
  `responsavel_email` VARCHAR(100),
  `responsavel_ddd` VARCHAR(3),
  `responsavel_telefone` VARCHAR(20),
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do recibo
CREATE TABLE IF NOT EXISTS recibo_itens (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `recibo_id` INT NOT NULL,
  `descricao` VARCHAR(100) NOT NULL,
  `quantidade` INT NOT NULL,
  `valor_unitario` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`recibo_id`) REFERENCES `recibos`(`id`) ON DELETE CASCADE
);



-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `id_integracao` VARCHAR(50) UNIQUE NOT NULL,
  `id_caixa` INT NOT NULL,
  `operador_usuario_id` INT,
  `data` DATE NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `desconto` DECIMAL(10,2) DEFAULT 0,
  `status` ENUM('pendente', 'pago', 'cancelado') NOT NULL,
  `tipo` ENUM('venda', 'troca') NOT NULL,
  `forma_pagamento` ENUM('dinheiro', 'cartao', 'pix', 'cheque', 'boleto', 'debito', 'credito', 'misto') NOT NULL,
  `parcelas` INT DEFAULT 1,
  `parcelas_pagas` INT DEFAULT 0,
  `parcelas_restantes` INT DEFAULT 0,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`operador_usuario_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`id_caixa`) REFERENCES `caixas`(`id`)
);



-- Tabela de itens de vendas
CREATE TABLE IF NOT EXISTS venda_itens (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `venda_id` INT NOT NULL,
  `produto_codigo` VARCHAR(13),
  `descricao` VARCHAR(255) NOT NULL,
  `quantidade` DECIMAL(10,3) NOT NULL,
  `valor_unitario` DECIMAL(10,2) NOT NULL,
  `valor_total` DECIMAL(10,2) NOT NULL,
  `peso` DECIMAL(10,3) DEFAULT 0,
  `unidade` VARCHAR(10) DEFAULT 'UN',
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`venda_id`) REFERENCES `vendas`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`produto_codigo`) REFERENCES `produto`(`codigo`)
);

-- Criação da tabela de configurações de etiqueta
CREATE TABLE IF NOT EXISTS etiqueta_configuracoes (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  `nome` VARCHAR(100) NOT NULL UNIQUE,
  `largura` INT NOT NULL,
  `altura` INT NOT NULL,
  `mostrar_comparacao` BOOLEAN DEFAULT true,
  `mostrar_icms` BOOLEAN DEFAULT true,
  `mostrar_codigo_de_barra` BOOLEAN DEFAULT true,
  `fonte_nome` INT DEFAULT 12,
  `fonte_preco` INT DEFAULT 18,
  `fonte_comparacao` INT DEFAULT 10,
  `fonte_codigo_de_barra` INT DEFAULT 8,
  `cor_fundo` VARCHAR(20) DEFAULT '#ffffff',
  `cor_texto` VARCHAR(20) DEFAULT '#000000',
  `cor_preco` VARCHAR(20) DEFAULT '#16a34a',
  `cor_comparacao` VARCHAR(20) DEFAULT '#2563eb',
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir template 'Padrão'
INSERT INTO etiqueta_configuracoes (
  nome, largura, altura, mostrar_comparacao, mostrar_icms, mostrar_codigo_de_barra,
  fonte_nome, fonte_preco, fonte_comparacao, fonte_codigo_de_barra,
  cor_fundo, cor_texto, cor_preco, cor_comparacao
)
SELECT * FROM (
  SELECT
    'Padrão' AS nome, 140 AS largura, 100 AS altura,
    1 AS mostrar_comparacao, 1 AS mostrar_icms, 1 AS mostrar_codigo_de_barra,
    12 AS fonte_nome, 18 AS fonte_preco, 10 AS fonte_comparacao, 8 AS fonte_codigo_de_barra,
    '#ffffff' AS cor_fundo, '#000000' AS cor_texto, '#16a34a' AS cor_preco, '#2563eb' AS cor_comparacao
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM etiqueta_configuracoes WHERE nome = 'Padrão'
);

-- Inserir template 'Compacta'
INSERT INTO etiqueta_configuracoes (
  nome, largura, altura, mostrar_comparacao, mostrar_icms, mostrar_codigo_de_barra,
  fonte_nome, fonte_preco, fonte_comparacao, fonte_codigo_de_barra,
  cor_fundo, cor_texto, cor_preco, cor_comparacao
)
SELECT * FROM (
  SELECT
    'Compacta' AS nome, 100 AS largura, 70 AS altura,
    0 AS mostrar_comparacao, 0 AS mostrar_icms, 1 AS mostrar_codigo_de_barra,
    10 AS fonte_nome, 14 AS fonte_preco, 8 AS fonte_comparacao, 6 AS fonte_codigo_de_barra,
    '#ffffff' AS cor_fundo, '#000000' AS cor_texto, '#16a34a' AS cor_preco, '#2563eb' AS cor_comparacao
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM etiqueta_configuracoes WHERE nome = 'Compacta'
);

-- Inserir template 'Premium'
INSERT INTO etiqueta_configuracoes (
  nome, largura, altura, mostrar_comparacao, mostrar_icms, mostrar_codigo_de_barra,
  fonte_nome, fonte_preco, fonte_comparacao, fonte_codigo_de_barra,
  cor_fundo, cor_texto, cor_preco, cor_comparacao
)
SELECT * FROM (
  SELECT
    'Premium' AS nome, 160 AS largura, 120 AS altura,
    1 AS mostrar_comparacao, 1 AS mostrar_icms, 1 AS mostrar_codigo_de_barra,
    14 AS fonte_nome, 22 AS fonte_preco, 12 AS fonte_comparacao, 10 AS fonte_codigo_de_barra,
    '#f8fafc' AS cor_fundo, '#1e293b' AS cor_texto, '#059669' AS cor_preco, '#1d4ed8' AS cor_comparacao
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM etiqueta_configuracoes WHERE nome = 'Premium'
);

CREATE TABLE IF NOT EXISTS impressora_config (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `interface` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `characterSet` VARCHAR(50) DEFAULT 'UTF-8',
  `removeSpecialCharacters` BOOLEAN DEFAULT false,
  `lineCharacter` VARCHAR(5) DEFAULT '-',
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configuração padrão de impressora
INSERT INTO impressora_config (
  id_loja,
  interface,
  type,
  characterSet,
  removeSpecialCharacters,
  lineCharacter
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    'USB' AS interface,
    'EPSON' AS type,
    'UTF-8' AS characterSet,
    0 AS removeSpecialCharacters,
    '-' AS lineCharacter
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM impressora_config WHERE id_loja = '00000000-0000-0000-0000-000000000000'
);

CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
  `numero_caixa` INT DEFAULT 1,
  `link_api_cupom` VARCHAR(255) NOT NULL,
  `timezone` VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  `token_acesso` VARCHAR(500) DEFAULT NULL,
  `token_expiracao` DATETIME DEFAULT NULL,
  `logo` MEDIUMBLOB,
  `bd_backup` BOOLEAN DEFAULT false,
  `bd_central` BOOLEAN DEFAULT false,
  `url_servidor_central` VARCHAR(255) DEFAULT '',
  `sincronizacao_automatico` BOOLEAN DEFAULT false,
  `intervalo_sincronizacao` INT DEFAULT 10,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO configuracoes_sistema (
  id_loja,
  numero_caixa,
  link_api_cupom,
  timezone
)
SELECT * FROM (
  SELECT
    '00000000-0000-0000-0000-000000000000' AS id_loja,
    1 AS numero_caixa,
    'http://localhost:3000/api/cupom' AS link_api_cupom,
    'America/Sao_Paulo' AS timezone
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM configuracoes_sistema WHERE id_loja = '00000000-0000-0000-0000-000000000000'
);

