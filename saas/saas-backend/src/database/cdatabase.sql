DROP DATABASE IF EXISTS pdvlocal;
CREATE DATABASE IF NOT EXISTS pdvlocal;
USE pdvlocal;

CREATE TABLE IF NOT EXISTS users(
  `id` INT AUTO_INCREMENT PRIMARY KEY,
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
  `nota_id` INT NOT NULL,
  `a_vista` BOOLEAN,
  `meio` VARCHAR(5),
  `valor` DECIMAL(10,2),
  FOREIGN KEY (`nota_id`) REFERENCES `notas_fiscais`(`id`) ON DELETE CASCADE
);


-- Tabela de recibos
CREATE TABLE IF NOT EXISTS recibos (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
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
  `recibo_id` INT NOT NULL,
  `descricao` VARCHAR(100) NOT NULL,
  `quantidade` INT NOT NULL,
  `valor_unitario` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`recibo_id`) REFERENCES `recibos`(`id`) ON DELETE CASCADE
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
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