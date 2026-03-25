# ARCHITECTURE.md – Facilitador

## 🏗️ Visão Geral

O **Facilitador** é um sistema que extrai dados de Notas Fiscais (XML ou PDF), converte esses dados para um formato padrão e transfere para um formulário, permitindo gerar PDF, exportar Excel e salvar arquivos.

A arquitetura do sistema é baseada em um modelo central chamado **notaFiscal**.

---

## 🧠 Conceito Principal

Todos os arquivos de entrada devem ser convertidos para o mesmo formato:

```
XML → notaFiscal
PDF → notaFiscal
```

Depois que os dados viram `notaFiscal`, todo o restante do sistema funciona a partir desse objeto.

Esse conceito é chamado de:

**Single Source of Truth (Fonte única de verdade)**

---

## 🔄 Fluxo de Dados

```
Entrada (XML ou PDF)
        │
        ├── XML → xmlParser → xmlMapper ─┐
        │                                 │
        └── PDF → Document AI → aiMapper ─┤
                                          ↓
                                      notaFiscal
                                          ↓
                                       Preview
                                          ↓
                                  Confirmação do usuário
                                          ↓
                        ┌───────────────┼───────────────┐
                        ↓                               ↓
                    Gerar PDF                      Exportar Excel
                        ↓
                    Salvar Arquivo
```

---

## 🧩 Módulos do Sistema

| Módulo        | Responsabilidade                |
| ------------- | ------------------------------- |
| Upload        | Receber arquivos XML e PDF      |
| xmlParser     | Ler e converter XML             |
| Document AI   | Extrair dados do PDF            |
| Mapper        | Converter dados para notaFiscal |
| Preview       | Visualização antes de confirmar |
| PDF Generator | Gerar PDF                       |
| Excel Export  | Exportar dados                  |
| Storage       | Salvar arquivos                 |

---

## 📦 Estrutura de Pastas

```
src/
│
├── components/        # Componentes reutilizáveis (Upload, Form, Preview)
├── pages/             # Páginas do sistema
├── services/          # Integrações e regras de negócio
│   ├── documentAI.js
│   ├── xmlParser.js
│   ├── pdfGenerator.js
│   ├── excelExport.js
│   └── fileSaver.js
│
├── mappers/           # Conversão para o modelo notaFiscal
│   ├── xmlMapper.js
│   └── documentAIMapper.js
│
├── models/            # Modelos de dados
│   └── notaFiscal.js
│
├── templates/         # Template HTML do formulário
│   └── formTemplate.html
│
├── utils/             # Funções auxiliares
│
└── queue/             # Processamento em lote
```

---

## 🧠 Camada de Mappers

Os **mappers** são responsáveis por converter qualquer entrada para o modelo padrão `notaFiscal`.

| Entrada           | Mapper           |
| ----------------- | ---------------- |
| XML               | xmlMapper        |
| PDF (Document AI) | documentAIMapper |

Função dos mappers:

```
Dados brutos → Dados organizados → notaFiscal
```

---

## 📄 Geração de PDF

O PDF será gerado a partir de um template HTML:

```
notaFiscal → HTML Template → PDF
```

---

## 📊 Exportação Excel

```
notaFiscal → Excel (.xlsx)
```

---

## 🎯 Resumo da Arquitetura

A arquitetura do Facilitador segue este fluxo:

```
Entrada → Extração → Padronização → Preview → Saída
```

Onde:

| Etapa        | Responsável              |
| ------------ | ------------------------ |
| Entrada      | Upload                   |
| Extração     | XML Parser / Document AI |
| Padronização | Mapper                   |
| Preview      | Interface                |
| Saída        | PDF / Excel / Arquivo    |

```

**Facilitador – Arquitetura do Sistema**
```
