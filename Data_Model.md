## 🧾 Modelo de Dados – notaFiscal

O objeto `notaFiscal` é o núcleo do sistema.

```js
export const notaFiscal = {
  info: {
    numero: "",
    serie: "",
    dataEmissao: "",
    chaveAcesso: "",
  },

  emitente: {
    nome: "",
    cnpj: "",
    endereco: "",
  },

  destinatario: {
    nome: "",
    cpfCnpj: "",
    endereco: "",
  },

  itens: [
    {
      codigo: "",
      descricao: "",
      quantidade: "",
      valorUnitario: "",
      valorTotal: "",
    },
  ],

  totais: {
    valorProdutos: "",
    valorNota: "",
  },
};
```

---
