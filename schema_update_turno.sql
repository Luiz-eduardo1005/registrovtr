-- Script para atualizar a constraint do campo turno na tabela checklists
-- Este script permite os novos valores combinados de turno

-- Primeiro, remover a constraint antiga
ALTER TABLE checklists 
DROP CONSTRAINT IF EXISTS checklists_turno_check;

-- Aumentar o tamanho do campo turno para acomodar valores combinados
-- Exemplo: '8Hs (2x2) - Segundo' tem 20 caracteres, então vamos usar 50 para ter margem
ALTER TABLE checklists 
ALTER COLUMN turno TYPE VARCHAR(50);

-- Adicionar nova constraint que aceita todos os valores possíveis
ALTER TABLE checklists 
ADD CONSTRAINT checklists_turno_check 
CHECK (
  turno IN (
    'Primeiro', 
    'Segundo', 
    '12Hs', 
    '8Hs (2x2)', 
    '12Hs - Primeiro', 
    '12Hs - Segundo', 
    '8Hs (2x2) - Primeiro', 
    '8Hs (2x2) - Segundo'
  )
);

-- Comentário sobre a coluna atualizada
COMMENT ON COLUMN checklists.turno IS 'Turno do serviço. Pode ser: Primeiro, Segundo, 12Hs, 8Hs (2x2), ou combinações como "12Hs - Primeiro", "8Hs (2x2) - Segundo"';

