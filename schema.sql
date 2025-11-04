-- Criar tabela de checklists
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  prefixed VARCHAR(10) NOT NULL CHECK (prefixed IN ('spin', 's10')),
  codigo_viatura VARCHAR(50) NOT NULL,
  servico VARCHAR(20) NOT NULL CHECK (servico IN ('Ordinario', 'SEG')),
  turno VARCHAR(20) NOT NULL CHECK (turno IN ('Primeiro', 'Segundo')),
  km_inicial INTEGER NOT NULL DEFAULT 0,
  km_final INTEGER NOT NULL DEFAULT 0,
  abastecimento DECIMAL(10, 2) NOT NULL DEFAULT 0,
  motorista VARCHAR(10) NOT NULL CHECK (motorista IN ('CMT', 'PTR')),
  combustivel_inicial DECIMAL(5, 2) NOT NULL DEFAULT 0,
  combustivel_final DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avarias JSONB DEFAULT '{}'::jsonb,
  observacoes TEXT,
  ci VARCHAR(255) NOT NULL,
  opm VARCHAR(255) NOT NULL,
  nome VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_checklists_data ON checklists(data);
CREATE INDEX IF NOT EXISTS idx_checklists_prefixed ON checklists(prefixed);
CREATE INDEX IF NOT EXISTS idx_checklists_created_at ON checklists(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura e escrita (ajuste conforme necessário)
-- Para desenvolvimento, permitir tudo. Em produção, configure políticas adequadas
CREATE POLICY "Permitir todas as operações" ON checklists
  FOR ALL
  USING (true)
  WITH CHECK (true);
