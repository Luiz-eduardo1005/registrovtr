-- Script para atualizar tabela existente com o campo nome
-- Execute este script se a tabela já foi criada sem o campo nome

-- Adicionar coluna nome se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'checklists' AND column_name = 'nome'
  ) THEN
    ALTER TABLE checklists ADD COLUMN nome VARCHAR(255);
  END IF;
END $$;
