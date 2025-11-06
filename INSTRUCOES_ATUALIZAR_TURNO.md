# Instruções para Atualizar a Constraint do Campo Turno

## Passo a Passo

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo `schema_update_turno.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

## O que o Script SQL faz:

- Remove a constraint antiga `checklists_turno_check` que só permitia 'Primeiro' e 'Segundo'
- Aumenta o tamanho do campo `turno` de VARCHAR(20) para VARCHAR(50) para acomodar valores combinados
- Adiciona uma nova constraint que aceita todos os valores possíveis:
  - `Primeiro`
  - `Segundo`
  - `12Hs`
  - `8Hs (2x2)`
  - `12Hs - Primeiro`
  - `12Hs - Segundo`
  - `8Hs (2x2) - Primeiro`
  - `8Hs (2x2) - Segundo`

## Importante:

⚠️ Este script é seguro e não afeta os dados existentes. Ele apenas atualiza a validação do campo para aceitar os novos formatos de turno.

## Após executar:

Você poderá salvar checklists com os novos valores combinados de turno sem erros de constraint.

