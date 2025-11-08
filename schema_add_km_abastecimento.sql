-- Adicionar campo km_abastecimento na tabela checklists
ALTER TABLE checklists 
ADD COLUMN IF NOT EXISTS km_abastecimento INTEGER DEFAULT 0;

-- Comentário sobre a coluna
COMMENT ON COLUMN checklists.km_abastecimento IS 'KM na hora do abastecimento';

