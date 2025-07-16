DROP DATABASE IF EXISTS pdvlocal;
CREATE DATABASE IF NOT EXISTS pdvlocal;
USE pdvlocal;

CREATE TABLE IF NOT EXISTS users(
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  `perfil` ENUM('admin', 'operador', 'gerente') DEFAULT 'operador',
  `ativo` BOOLEAN DEFAULT true,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS produto (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `codigo` VARCHAR(50),
  `codigo_barras` VARCHAR(100),
  `descricao` VARCHAR(255),
  `grupo` VARCHAR(100),
  `ncm` VARCHAR(20),
  `preco_custo` DECIMAL(10,2),
  `margem_lucro` DECIMAL(5,2),
  `preco_venda` DECIMAL(10,2),
  `estoque_minimo` INT,
  `estoque_maximo` INT,
  `estoque_atual` INT,
  `unidade` VARCHAR(10),
  `controla_estoque` BOOLEAN,
  `cfop` VARCHAR(10),
  `csosn` VARCHAR(10),
  `cst` VARCHAR(10),
  `icms` DECIMAL(5,2),
  `ativo` BOOLEAN,
  `exibir_tela` BOOLEAN,
  `solicita_quantidade` BOOLEAN,
  `permitir_combinacao` BOOLEAN,
  `cest` VARCHAR(10),
  `cst_pis` VARCHAR(10),
  `pis` DECIMAL(5,2),
  `cst_cofins` VARCHAR(10),
  `cofins` DECIMAL(5,2),
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notas_fiscais (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `id_integracao` VARCHAR(50) UNIQUE NOT NULL,
  `natureza` VARCHAR(50),
  `cpfcnpj_emitente` VARCHAR(14),
  `cpfcnpj_destinatario` VARCHAR(14),
  `responsavel_cpfcnpj` VARCHAR(14),
  `responsavel_nome` VARCHAR(100),
  `responsavel_email` VARCHAR(100),
  `responsavel_ddd` VARCHAR(3),
  `responsavel_telefone` VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS notas_fiscais_itens (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `nota_id` INT NOT NULL,
  `codigo` VARCHAR(50),
  `descricao` TEXT,
  `ncm` VARCHAR(10),
  `cfop` VARCHAR(10),
  `valor_unitario_comercial` DECIMAL(10,2),
  `valor_unitario_tributavel` DECIMAL(10,2),
  `valor_total` DECIMAL(10,2),
  FOREIGN KEY (`nota_id`) REFERENCES `notas_fiscais`(`id`) ON DELETE CASCADE
);
CREATE TABLE notas_fiscais_tributos (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `icms_origem` VARCHAR(2),
  `icms_cst` VARCHAR(3),
  `icms_modalidade_bc` VARCHAR(2),
  `icms_base_calculo` DECIMAL(10,2),
  `icms_aliquota` DECIMAL(10,2),
  `icms_valor` DECIMAL(10,2),
  `pis_cst` VARCHAR(3),
  `pis_base_calculo` DECIMAL(10,2),
  `pis_quantidade` DECIMAL(10,4),
  `pis_aliquota` DECIMAL(10,2),
  `pis_valor` DECIMAL(10,2),
  `cofins_cst` VARCHAR(3),
  `cofins_base_calculo` DECIMAL(10,2),
  `cofins_aliquota` DECIMAL(10,2),
  `cofins_valor` DECIMAL(10,2),
  FOREIGN KEY (`item_id`) REFERENCES `notas_fiscais_itens`(`id`) ON DELETE CASCADE
);
CREATE TABLE notas_fiscais_pagamentos (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `nota_id` INT NOT NULL,
  `a_vista` BOOLEAN,
  `meio` VARCHAR(5),
  `valor` DECIMAL(10,2),
  FOREIGN KEY (`nota_id`) REFERENCES `notas_fiscais`(`id`) ON DELETE CASCADE
);


-- Tabela de recibos
CREATE TABLE IF NOT EXISTS recibos (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
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
  `cliente_id` INT NOT NULL,
  `recibo_id` INT NOT NULL,
  `descricao` VARCHAR(100) NOT NULL,
  `quantidade` INT NOT NULL,
  `valor_unitario` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`recibo_id`) REFERENCES `recibos`(`id`) ON DELETE CASCADE
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT NOT NULL,
  `id_integracao` VARCHAR(50) UNIQUE NOT NULL,
  `data` DATE NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `desconto` DECIMAL(10,2) DEFAULT 0,
  `status` ENUM('pendente', 'pago', 'cancelado') NOT NULL,
  `tipo` ENUM('venda', 'troca') NOT NULL,
  `forma_pagamento` ENUM('dinheiro', 'cartao', 'pix', 'cheque', 'boleto', 'debito', 'credito') NOT NULL,
  `parcelas` INT DEFAULT 1,
  `parcelas_pagas` INT DEFAULT 0,
  `parcelas_restantes` INT DEFAULT 0,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_integracao`) REFERENCES `recibos`(`id_integracao`) ON DELETE CASCADE
);

-- Tabela de configurações de etiqueta
CREATE TABLE IF NOT EXISTS etiqueta_configuracoes (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT DEFAULT 0,
  `nome` VARCHAR(100) NOT NULL,
  `largura` INT NOT NULL,
  `altura` INT NOT NULL,
  `show_comparison` BOOLEAN DEFAULT true,
  `show_icms` BOOLEAN DEFAULT true,
  `show_barcode` BOOLEAN DEFAULT true,
  `font_name` INT DEFAULT 12,
  `font_price` INT DEFAULT 18,
  `font_comparison` INT DEFAULT 10,
  `font_barcode` INT DEFAULT 8,
  `cor_fundo` VARCHAR(20) DEFAULT '#ffffff',
  `cor_texto` VARCHAR(20) DEFAULT '#000000',
  `cor_preco` VARCHAR(20) DEFAULT '#16a34a',
  `cor_comparacao` VARCHAR(20) DEFAULT '#2563eb',
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Inserir template 'Padrão'
INSERT INTO etiqueta_configuracoes (
  nome, largura, altura, show_comparison, show_icms, show_barcode,
  font_name, font_price, font_comparison, font_barcode,
  cor_fundo, cor_texto, cor_preco, cor_comparacao
)
SELECT * FROM (
  SELECT
    'Padrão' AS nome, 140 AS largura, 100 AS altura,
    1 AS show_comparison, 1 AS show_icms, 1 AS show_barcode,
    12 AS font_name, 18 AS font_price, 10 AS font_comparison, 8 AS font_barcode,
    '#ffffff' AS cor_fundo, '#000000' AS cor_texto, '#16a34a' AS cor_preco, '#2563eb' AS cor_comparacao
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM etiqueta_configuracoes WHERE nome = 'Padrão'
);

-- Inserir template 'Compacta'
INSERT INTO etiqueta_configuracoes (
  nome, largura, altura, show_comparison, show_icms, show_barcode,
  font_name, font_price, font_comparison, font_barcode,
  cor_fundo, cor_texto, cor_preco, cor_comparacao
)
SELECT * FROM (
  SELECT
    'Compacta' AS nome, 100 AS largura, 70 AS altura,
    0 AS show_comparison, 0 AS show_icms, 1 AS show_barcode,
    10 AS font_name, 14 AS font_price, 8 AS font_comparison, 6 AS font_barcode,
    '#ffffff' AS cor_fundo, '#000000' AS cor_texto, '#16a34a' AS cor_preco, '#2563eb' AS cor_comparacao
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM etiqueta_configuracoes WHERE nome = 'Compacta'
);

-- Inserir template 'Premium'
INSERT INTO etiqueta_configuracoes (
  nome, largura, altura, show_comparison, show_icms, show_barcode,
  font_name, font_price, font_comparison, font_barcode,
  cor_fundo, cor_texto, cor_preco, cor_comparacao
)
SELECT * FROM (
  SELECT
    'Premium' AS nome, 160 AS largura, 120 AS altura,
    1 AS show_comparison, 1 AS show_icms, 1 AS show_barcode,
    14 AS font_name, 22 AS font_price, 12 AS font_comparison, 10 AS font_barcode,
    '#f8fafc' AS cor_fundo, '#1e293b' AS cor_texto, '#059669' AS cor_preco, '#1d4ed8' AS cor_comparacao
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM etiqueta_configuracoes WHERE nome = 'Premium'
);
