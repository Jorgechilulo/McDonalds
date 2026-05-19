CREATE DATABASE McDonalds;
USE McDonalds;

-- Tabela para o cardápio e combos (Gerido pelo Administrador)
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    precoOriginal DECIMAL(10,2) NOT NULL,
    precoPromocional DECIMAL(10,2) NOT NULL,
    imagem TEXT,
    categoria VARCHAR(50),
    desconto INT DEFAULT 0,
    pontos INT DEFAULT 0,
    isCombo TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB; -- Ao escrever ENGINE=InnoDB no final do comando de criação da tabela, você está a dizer ao MySQL:"Usa o motor chamado InnoDB para cuidar desta tabela."
-- Segurança contra falhas , Chaves Estrangeiras (Relacionamentos),Performance

-- Tabela para o Delivery (Estafetas)
CREATE TABLE IF NOT EXISTS delivery_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_motoqueiro VARCHAR(100) NOT NULL,
    entregas_concluidas INT DEFAULT 0,
    estado_operacional VARCHAR(50) DEFAULT 'Disponível',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Dados de teste para o Delivery
INSERT INTO delivery_status (nome_motoqueiro, entregas_concluidas, estado_operacional) VALUES
('Cláudio Silva', 48, 'Em Rota'),
('Mateus Antunes', 42, 'Disponível'),
('António João', 35, 'Folga')
ON DUPLICATE KEY UPDATE nome_motoqueiro=nome_motoqueiro;