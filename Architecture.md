# Arquitetura do Sistema

O sistema será uma aplicação Front-end com processamento local de arquivos.

## Arquitetura Geral

Usuário → Upload Nota → Parser → Objeto notaFiscal → Layout → Preview → Exportar PDF/Excel

## Módulos

### 1. Upload

Responsável por receber:

- XML
- PDF
- Chave de acesso

### 2. Parser

Responsável por extrair dados da nota:

- Número da nota
- Data
- Destinatário
- CPF/CNPJ
- Itens
- Valores

### 3. Queue (Fila)

Responsável por:

- Processar notas uma por vez
- Controlar status
- Enviar para staging

### 4. Layout Engine

Responsável por:

- Preencher formulário
- Gerar preview
- Gerar PDF

### 5. Export

Responsável por:

- Salvar PDF
- Salvar Excel

## Fluxo de Dados

Arquivo → Parser → notaFiscal (JSON) → Layout → Preview → Confirmar → Exportar
