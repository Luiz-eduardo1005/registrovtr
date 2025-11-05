# Instruções para Adicionar Campo Finalizado na Tabela Checklists

## Passo a Passo

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo `schema_finalizar_checklist.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

## O que o Script SQL faz:

- Adiciona o campo `finalizado` (BOOLEAN) na tabela `checklists`
- Define o valor padrão como `FALSE` (não finalizado)
- Cria um índice para melhorar a performance das consultas
- Adiciona um comentário explicativo sobre a coluna

## Funcionalidade:

Após executar o script, você poderá:
- **Finalizar Checklist**: Selecionar registros individuais e finalizá-los através do botão "Finalizar Checklist"
- Quando um checklist estiver finalizado:
  - Não será possível editar o registro
  - O campo de data ficará desabilitado ao tentar editar
  - O botão de editar não aparecerá na visualização dos detalhes
  - O registro aparecerá com status "✓ Finalizado" na lista
  - Registros finalizados não podem ser selecionados para finalizar novamente

## Como usar:

1. Vá em "Finalizar Checklist"
2. Você verá todos os registros (igual a "Ver Registros de Checklists")
3. Marque os checkboxes dos registros que deseja finalizar
4. Clique em "Finalizar Checklist"
5. Os registros selecionados serão marcados como finalizados e não poderão mais ser editados

## Importante:

⚠️ Esta funcionalidade finaliza registros individuais, não datas inteiras. Cada registro pode ser finalizado independentemente.

