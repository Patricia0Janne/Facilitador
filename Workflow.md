# Workflow do Sistema

## Processamento de Nota

1. Usuário envia XML, PDF ou digita chave
2. Arquivo entra na fila
3. Sistema processa uma nota por vez
4. Dados são extraídos
5. Formulário é preenchido
6. Preview é exibido
7. Usuário confirma ou rejeita
8. Se confirmado:
   - Gerar PDF
   - Salvar na pasta
   - Exportar Excel
9. Próxima nota da fila é processada

## Status da Nota

- Pending (na fila)
- Processing (processando)
- Staging (aguardando confirmação)
- Approved (aprovado)
- Rejected (rejeitado)
- Exported (exportado)
