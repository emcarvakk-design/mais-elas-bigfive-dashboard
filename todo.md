
- [x] Página de comparação entre respondentes com radar sobreposto
- [x] Filtros avançados no dashboard (por dimensão dominante e data)
- [x] Exportação em lote de PDFs em arquivo ZIP
- [ ] Restaurar gráfico radar no perfil individual
- [x] Adicionar pirâmide dos Níveis Neurológicos de Dilts no dashboard principal
- [x] Corrigir inversão da escala de Estabilidade Emocional (bug crítico)
- [x] Corrigir subfacetas fictícias — remover escores numéricos artificiais
- [x] Adicionar perguntas poderosas do guia ao perfil e ao PDF
- [x] Adicionar perguntas poderosas do guia ao modal de cada dimensão e ao PDF
- [x] Migrar armazenamento de perfis do localStorage para banco de dados
- [x] App do teste: tela de boas-vindas
- [x] App do teste: tela de identificação (nome + email)
- [x] App do teste: questionário com 30 perguntas (uma por vez)
- [x] App do teste: tela de resultado detalhado com subfacetas e insights
- [x] App do teste: notificação automática para a Erica ao concluir
- [x] App do teste: integração com banco de dados (salva perfil direto)
- [x] App do teste: rota tRPC para submissão do teste
- [ ] Integrar planilha IPIP-NEO-120 ao dashboard (ID: 1b--xizm9DcwfsdpQTiSqs4GdF4vX0qqqV2blIAGM04E)
- [ ] Criar lógica de cálculo dos 30 escores reais de subfacetas

## Integração Mais Elas (Roda da Vida Profissional)
- [ ] Copiar componentes e páginas do mais-elas para bigfive-dashboard
- [ ] Adicionar tabela roda_profiles ao schema do bigfive-dashboard
- [ ] Adicionar routers do Mais Elas ao bigfive-dashboard
- [ ] Configurar rota /mais-elas no App.tsx
- [ ] Verificar compilação TypeScript
- [ ] Checkpoint e publicação

## Integração Mais Elas (Roda da Vida Profissional)
- [x] Tabelas roda_profiles e roda_analyses criadas no banco
- [x] Schema do Mais Elas adicionado ao drizzle/schema.ts
- [x] Funções db.ts para Roda da Vida (getAllRodaProfiles, getRodaProfileById, upsertRodaProfile, getRodaAnalysis, saveRodaAnalysis)
- [x] syncJobMaisElas.ts para sincronização com Google Sheets
- [x] maisElasRouter adicionado ao appRouter (procedures: list, getById, sync, getAnalysis, generateAnalysis)
- [x] Dashboard do Mais Elas (/mais-elas) com médias do grupo e lista de mentoradas
- [x] Página de perfil individual (/mais-elas/perfil/:id) com gráfico radar, scores, respostas abertas
- [x] Análise IA por perfil (4 blocos: ajudas, oportunidades, riscos, síntese)
- [x] Guia da Mentora imprimível (RodaMentorGuide.tsx) com perguntas-chave e sinais por dimensão
- [x] Dados de demonstração inseridos (3 perfis: Ana Silva, Maria Santos, Carla Oliveira)
- [x] Rotas registradas no App.tsx (/mais-elas e /mais-elas/perfil/:id)
- [x] Navegação corrigida (Voltar → /mais-elas)
