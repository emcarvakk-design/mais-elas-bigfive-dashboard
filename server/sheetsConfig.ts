/**
 * sheetsConfig.ts — Configuração centralizada das planilhas Google Sheets
 *
 * IMPORTANTE: Quando um novo formulário for criado ou a planilha vinculada
 * for alterada, atualize APENAS este arquivo. Todos os outros módulos
 * (syncJob.ts, routers.ts) importam daqui.
 *
 * Como encontrar o SHEET_ID e GID corretos:
 *   1. Abra o formulário no Google Forms
 *   2. Clique em "Respostas" → ícone de planilha (verde)
 *   3. A URL da planilha será: https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=GID
 *   4. Copie o SHEET_ID e o GID para cá
 *   5. Certifique-se de que a planilha está compartilhada como "Qualquer pessoa com o link → Leitor"
 */

export const SHEETS_CONFIG = {
  /**
   * Formulário IPIP-120 (120 questões — versão preferencial)
   * Formulário: "Teste de Personalidade Big Five — Versão Completa (IPIP-NEO-120)"
   * ID do formulário: 1O6Ig9-xJ4f-iStIP-RJu0V3RnW2qe_IcficXVs8zSfM
   * Planilha vinculada: "Teste de Personalidade Big Five — Versão Completa (IPIP-NEO-120) (respostas)"
   */
  IPIP120: {
    SHEET_ID: '1b--xizm9DcwfsdpQTiSqs4GdF4vX0qqqV2blIAGM04E',
    GID: '1081644880',
  },

  /**
   * Formulário 30 questões (versão legado)
   * Formulário: "Teste de Personalidade Big Five"
   * ID do formulário: 1jExTYPh6DXJCSzE-hILVRH-v_AfixkwxT2tLQl1BTaI
   * Planilha vinculada: "Teste de Personalidade Big Five (respostas)"
   */
  Q30: {
    SHEET_ID: '1gStVG2NRfrQe7E2fGMU1RC2xwRd2ZGcX50oJHLeG-3U',
    GID: '724087005',
  },
} as const;
