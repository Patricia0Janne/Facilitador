export function validateChaveAcesso(chave) {
  const digits = chave.replace(/\D/g, '')
  return digits.length === 44
}
