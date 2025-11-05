-- Adicionar campo finalizado na tabela checklists
ALTER TABLE checklists 
ADD COLUMN IF NOT EXISTS finalizado BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_checklists_finalizado ON checklists(finalizado);

-- Comentário sobre a coluna
COMMENT ON COLUMN checklists.finalizado IS 'Indica se o checklist foi finalizado e não pode mais ser editado';

