# Site de Registro de Checklist de Viatura

Sistema de registro de checklist de viatura de final de turno com integração ao Supabase.

## Funcionalidades

### Ver Registros de Checklists
- Visualizar todos os registros de checklists
- Filtrar por data
- Filtrar por prefixo (SPIN ou S10)

### Fazer Checklist
- Seleção de prefixo (SPIN ou S10)
- Seleção de código da viatura baseado no prefixo
- Seleção de serviço (Ordinário ou SEG)
- Seleção de turno (Primeiro ou Segundo)
- Registro de KM inicial/final e abastecimento
- Seleção de motorista (CMT ou PTR)
- Registro de combustível inicial e final
- Tabela de avarias com 18 tipos diferentes
- Lista completa de itens de 1º escalão, pneus e itens gerais
- Campo de observações
- Campos para CI e OPM

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o Supabase:
   - Execute o script SQL em `schema.sql` no Supabase SQL Editor
   - As credenciais já estão configuradas no código

3. Execute o projeto:
```bash
npm run dev
```

4. Acesse o site em `http://localhost:3000`

## Schema do Banco de Dados

Execute o arquivo `schema.sql` no SQL Editor do Supabase para criar a tabela e configurações necessárias.

## Estrutura do Projeto

- `app/` - Páginas e componentes Next.js
- `lib/` - Configuração do Supabase
- `schema.sql` - Script SQL para criar o banco de dados
