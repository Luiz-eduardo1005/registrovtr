-- Criar tabela para armazenar datas finalizadas
CREATE TABLE IF NOT EXISTS datas_finalizadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_datas_finalizadas_data ON datas_finalizadas(data);

-- Habilitar Row Level Security (RLS)
ALTER TABLE datas_finalizadas ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura e escrita
CREATE POLICY "Permitir todas as operações" ON datas_finalizadas
  FOR ALL
  USING (true)
  WITH CHECK (true);

