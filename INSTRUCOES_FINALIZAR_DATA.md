# Instruções para Criar a Tabela de Datas Finalizadas

## Passo a Passo

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo `schema_finalizar_data.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

## O que o Script SQL faz:

- Cria a tabela `datas_finalizadas` para armazenar as datas que foram finalizadas
- Define um campo único `data` para evitar duplicatas
- Cria um índice para melhorar a performance das consultas
- Habilita Row Level Security (RLS)
- Cria uma política permissiva para desenvolvimento

## Funcionalidade:

Após executar o script, você poderá:
- Finalizar uma data específica através do botão "Finalizar Data"
- Quando uma data estiver finalizada:
  - Não será possível criar novos registros para essa data
  - Não será possível editar registros existentes dessa data
  - O campo de data ficará desabilitado
  - O botão de editar não aparecerá na visualização dos detalhes

## Importante:

⚠️ A política criada permite todas as operações. Em produção, você deve ajustar as políticas de segurança conforme necessário.

