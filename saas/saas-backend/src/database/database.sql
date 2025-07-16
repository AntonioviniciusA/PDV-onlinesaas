-- DROP DATABASE pdvsaas;
CREATE DATABASE IF NOT EXISTS pdvsaas;
USE pdvsaas;

CREATE TABLE IF NOT EXISTS `parceiro_saas`(
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) UNIQUE NOT NULL, 
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `telefone` VARCHAR(15) NOT NULL,
    `ativo` BOOLEAN DEFAULT true,
    `assas_id_cliente` VARCHAR(255) UNIQUE NULL,
    `ultimo_login` DATETIME NULL,
    `afiliado` BOOLEAN DEFAULT false,
    `email_verificado` BOOLEAN DEFAULT false,
    `dupla_autenticacao` BOOLEAN DEFAULT false,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `cliente`(
    `id` VARCHAR(36) NOT NULL,
    `razao_social` VARCHAR(255),
    `cnpj` VARCHAR(18) UNIQUE NOT NULL,
    `nome_representante` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(14) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(15) NOT NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `estado` VARCHAR(100) NOT NULL,
    `cep` VARCHAR(10) NOT NULL,
    `pais` VARCHAR(100) NOT NULL,
    `assas_id_cliente` VARCHAR(255) UNIQUE NULL,
    `ultimo_login` DATETIME NULL,
    `ativo` BOOLEAN DEFAULT true,
    `dupla_autenticacao` BOOLEAN DEFAULT false,
    `parceiro_saas_id` VARCHAR(36) NULL,
    `email_verificado` BOOLEAN DEFAULT false,
    `id_configuracao` VARCHAR(36) NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`parceiro_saas_id`) REFERENCES `parceiro_saas`(`id`)
);

-- Adicionar coluna email_verificado se não existir (para compatibilidade)
ALTER TABLE `cliente` ADD COLUMN IF NOT EXISTS `email_verificado` BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS `plano`(
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `ciclo_cobranca` ENUM('monthly', 'yearly') NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `preco_exibicao` VARCHAR(50) NOT NULL,
    `descricao` TEXT NOT NULL,
    `max_usuarios` INT NOT NULL,
    `limite_armazenamento_gb` INT NOT NULL,
    `nivel_analytics` ENUM('basic', 'advanced', 'custom') DEFAULT 'basic',
    `nivel_suporte` ENUM(
        'email',
        'priority_email',
        'phone_24_7'
    ) DEFAULT 'email',
    `acesso_api` BOOLEAN DEFAULT false,
    `nivel_acesso_api` ENUM('none', 'basic', 'advanced') DEFAULT 'none',
    `integracoes_personalizadas` BOOLEAN DEFAULT false,
    `funcionalidades` JSON NOT NULL,
    `popular` BOOLEAN DEFAULT false,
    `texto_cta` VARCHAR(50) DEFAULT 'Teste Grátis',
    `ativo` BOOLEAN DEFAULT true,
    `ordem_exibicao` INT NULL,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `assinaturas`(
    `id` VARCHAR(36) NOT NULL,
    `id_cliente` VARCHAR(36) NOT NULL,
    `assas_id_assinatura` VARCHAR(255) UNIQUE NOT NULL,
    `assas_id_cliente` VARCHAR(255) NOT NULL,
    `id_plano` int NOT NULL,
    `ciclo_cobranca` ENUM('monthly', 'yearly') DEFAULT 'monthly',
    `data_inicio` DATETIME NOT NULL,
    `data_fim` DATETIME NOT NULL,
    `data_cobranca` DATETIME NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('active', 'inactive', 'cancelled') DEFAULT 'active',
    PRIMARY KEY(`id`),
    FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`),
    FOREIGN KEY (`id_plano`) REFERENCES `plano`(`id`)
);

CREATE TABLE IF NOT EXISTS `codigos_verificacao` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cliente` VARCHAR(36) NOT NULL,
  `codigo` VARCHAR(6) NOT NULL,
  `expiracao` DATETIME NOT NULL,
   FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`)
);

CREATE TABLE IF NOT EXISTS `configuracao`(
    `id` VARCHAR(36) NOT NULL,
    `id_cliente` VARCHAR(36) NOT NULL,
    `id_assinatura` VARCHAR(36) NOT NULL,
    `id_plano` int NOT NULL,
    `id_assinatura` VARCHAR(36) NOT NULL,
    `seguranca_2fa` BOOLEAN DEFAULT false,
    `dispositivos_2fa` BOOLEAN DEFAULT false,
    `notificacoes_email` BOOLEAN DEFAULT false,
    `notificacoes_sms` BOOLEAN DEFAULT false,
    `notificacoes_push` BOOLEAN DEFAULT false,
    `notificacoes_whatsapp` BOOLEAN DEFAULT false,
    `idioma` VARCHAR(10) DEFAULT 'pt-BR',
    `fuso_horario` VARCHAR(10) DEFAULT 'America/Sao_Paulo',
    `cor_principal` VARCHAR(10) DEFAULT '#000000',
    `cor_secundaria` VARCHAR(10) DEFAULT '#000000',
    `cor_terciaria` VARCHAR(10) DEFAULT '#000000',
    PRIMARY KEY(`id`),
    FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id`),
    FOREIGN KEY (`id_plano`) REFERENCES `plano`(`id`),
    FOREIGN KEY (`id_assinatura`) REFERENCES `assinaturas`(`id`)
);

