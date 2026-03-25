# Facilitador

Sistema para automação de transferência de dados de Notas Fiscais (NF-e) para formulários personalizados, com geração de PDF e exportação de dados.

## 🎯 Objetivo

Automatizar o processo de:

- Ler Nota Fiscal via XML ou PDF
- Extrair dados automaticamente
- Preencher um formulário personalizado
- Gerar PDF para impressão
- Exportar dados para Excel
- Processar múltiplas notas em fila (lote)

> O sistema **não utiliza leitura por código de barras**.
> A extração de dados de PDF será feita utilizando **Inteligência Artificial (Google Document AI)**.

---

## 🧩 Funcionalidades

- Upload de XML
- Upload de PDF
- Extração automática de dados
- Integração com Google Document AI
- Processamento em lote
- Sistema de fila (queue)
- Tela de preview antes de salvar
- Geração de PDF
- Exportação para Excel
- Salvamento em pasta escolhida

---

## 🛠️ Tecnologias (previstas)

- React
- JavaScript
- HTML/CSS
- Google Document AI
- pdf-lib / jsPDF
- SheetJS (Excel)
- xml2js

---

## 📂 Estrutura do Projeto

src/
├── components/
├── pages/
├── services/
├── mappers/
├── models/
├── templates/
├── utils/
└── queue/

---

## 🏗️ Arquitetura (Resumo)

O sistema funciona com um modelo padrão chamado **notaFiscal**.

Fluxo:

XML → Parser → notaFiscal
PDF → Document AI → notaFiscal
notaFiscal → Preview → PDF / Excel / Salvamento

> O objeto **notaFiscal** é a fonte única de verdade do sistema.

---

## 🚀 Roadmap

- Sprint 1: Base + Layout + Preview
- Sprint 2: Upload XML + Parser XML
- Sprint 3: Integração Google Document AI
- Sprint 4: Fila e processamento em lote
- Sprint 5: Geração de PDF
- Sprint 6: Exportação Excel
- Sprint 7: Histórico e Dashboard

---

## 📌 Status

Projeto em desenvolvimento – MVP (Minimum Viable Product)

---

## 👩‍💻 Autora

Patrícia – Desenvolvedora Front-end
