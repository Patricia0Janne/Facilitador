# NFe Automation System

Sistema para automação de transferência de dados de Notas Fiscais (NF-e) para formulários personalizados, com geração de PDF e exportação de dados.

## 🎯 Objetivo

Automatizar o processo de:

- Ler Nota Fiscal via XML, PDF ou chave de acesso
- Extrair dados automaticamente
- Preencher um formulário personalizado
- Gerar PDF para impressão
- Exportar dados para Excel
- Processar múltiplas notas em fila (lote)

## 🧩 Funcionalidades

- Upload de XML
- Upload de PDF (texto, não escaneado)
- Consulta por chave de acesso (código de barras)
- Processamento em lote
- Sistema de fila (queue)
- Tela de preview antes de salvar
- Geração de PDF
- Exportação para Excel
- Salvamento em pasta escolhida

## 🛠️ Tecnologias (previstas)

- React
- JavaScript
- HTML/CSS
- pdf-lib / jsPDF
- SheetJS (Excel)
- xml2js
- pdf-parse

## 📂 Estrutura do Projeto

src/
├── components/
├── pages/
├── services/
├── models/
├── utils/
├── templates/
└── queue/

## 🚀 Roadmap

- Sprint 1: Base + Layout + Preview
- Sprint 2: Upload XML
- Sprint 3: Fila e processamento
- Sprint 4: Exportação PDF/Excel
- Sprint 5: Leitura de PDF
- Sprint 6: Código de barras

## 👩‍💻 Autora

Patrícia – Desenvolvedora Front-end
