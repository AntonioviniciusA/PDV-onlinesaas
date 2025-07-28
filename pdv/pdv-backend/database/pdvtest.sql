--possiveis tabelas para o futuro


CREATE TABLE IF NOT EXISTS notas_fiscais (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_loja` VARCHAR(36) NOT NULL,
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
  `id_loja` VARCHAR(36) NOT NULL,
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
  `id_loja` VARCHAR(36) NOT NULL,
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
  `id_loja` VARCHAR(36) NOT NULL,
  `nota_id` INT NOT NULL,
  `a_vista` BOOLEAN,
  `meio` VARCHAR(5),
  `valor` DECIMAL(10,2),
  FOREIGN KEY (`nota_id`) REFERENCES `notas_fiscais`(`id`) ON DELETE CASCADE
);

