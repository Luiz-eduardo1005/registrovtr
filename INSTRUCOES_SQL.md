# Instruções para Configurar o Banco de Dados no Supabase

## Passo a Passo

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto (ou crie um novo)
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo `schema.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

## O que o Script SQL faz:

- Cria a tabela `checklists` com todos os campos necessários
- Define os tipos de dados corretos para cada campo
- Adiciona validações (CHECK constraints) para garantir dados válidos
- Cria índices para melhorar a performance das consultas
- Habilita Row Level Security (RLS)
- Cria uma política permissiva para desenvolvimento (permite todas as operações)

## Campos da Tabela:

- `id`: UUID único gerado automaticamente
- `data`: Data do checklist
- `prefixed`: Prefixo (spin ou s10)
- `codigo_viatura`: Código da viatura
- `servico`: Serviço (Ordinario ou SEG)
- `turno`: Turno (Primeiro ou Segundo)
- `km_inicial`: KM inicial
- `km_final`: KM final
- `abastecimento`: Quantidade abastecida (litros)
- `motorista`: Motorista (CMT ou PTR)
- `combustivel_inicial`: Combustível inicial (%)
- `combustivel_final`: Combustível final (%)
- `avarias`: JSONB com todas as avarias registradas
- `observacoes`: Campo de texto livre para observações
- `ci`: Campo CI
- `opm`: Campo OPM
- `created_at`: Timestamp de criação automático

## Importante:

⚠️ A política criada permite todas as operações. Em produção, você deve ajustar as políticas de segurança conforme necessário.
