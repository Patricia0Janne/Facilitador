# Modelo de Dados - Nota Fiscal

Objeto padrão que o sistema vai usar:

```js
notaFiscal = {
  numero: "",
  chaveAcesso: "",
  dataEmissao: "",

  emitente: {
    nome: "",
    cnpj: "",
  },

  destinatario: {
    nome: "",
    cpfCnpj: "",
  },

  itens: [
    {
      descricao: "",
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: 0,
    },
  ],

  totais: {
    valorProdutos: 0,
    valorNota: 0,
  },
};
```
