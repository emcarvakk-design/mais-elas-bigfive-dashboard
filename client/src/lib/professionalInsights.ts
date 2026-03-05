import { BigFiveProfile } from '@/lib/bigfive';

export interface ProfessionalInsight {
  title: string;
  content: string;
}

/**
 * Gera insights profissionais baseados no perfil Big Five.
 *
 * NOTA sobre Estabilidade Emocional:
 * Pontuação ALTA = maior estabilidade (resiliente, calma sob pressão).
 * Pontuação BAIXA = maior sensibilidade emocional (reativa ao estresse).
 * Isso está alinhado ao guia da Erica.
 */
export function generateProfessionalInsights(profile: BigFiveProfile): ProfessionalInsight[] {
  const { dimensions } = profile;
  const insights: ProfessionalInsight[] = [];

  // ── Potencial de Liderança ──────────────────────────────────────────────────
  const leadershipScore =
    (dimensions.conscientiousness.score + dimensions.extraversion.score + dimensions.agreeableness.score) / 3;
  if (leadershipScore >= 70) {
    insights.push({
      title: '🎯 Potencial de Liderança',
      content: `Com alta conscienciosidade (${dimensions.conscientiousness.score}%), ${
        dimensions.extraversion.score >= 60 ? 'boa comunicação' : 'capacidade de foco'
      } e agradabilidade (${dimensions.agreeableness.score}%), há forte potencial para posições de liderança. A combinação de organização e empatia permite gerenciar equipes com efetividade. Recomenda-se buscar oportunidades de liderança em projetos ou equipes.`,
    });
  }

  // ── Criatividade e Inovação ─────────────────────────────────────────────────
  if (dimensions.openness.score >= 75) {
    insights.push({
      title: '💡 Forte Potencial Criativo e Inovador',
      content: `A abertura à experiência (${dimensions.openness.score}%) indica forte capacidade criativa e disposição para inovação. Perfil ideal para funções que exigem pensamento criativo, resolução de problemas complexos e adaptação a mudanças. Considere carreiras em P&D, estratégia, design ou empreendedorismo.`,
    });
  }

  // ── Execução e Confiabilidade ───────────────────────────────────────────────
  if (dimensions.conscientiousness.score >= 80) {
    insights.push({
      title: '⚡ Executora Confiável e Focada',
      content: `A conscienciosidade muito elevada (${dimensions.conscientiousness.score}%) indica excelente capacidade de execução e confiabilidade. Perfil ideal para projetos críticos, posições que exigem atenção aos detalhes e cumprimento de prazos. Atenção: gerenciar o perfeccionismo para evitar burnout é um ponto importante de desenvolvimento.`,
    });
  }

  // ── Colaboração e Empatia ───────────────────────────────────────────────────
  if (dimensions.agreeableness.score >= 70) {
    insights.push({
      title: '🤝 Excelente Colaboradora e Empática',
      content: `A agradabilidade (${dimensions.agreeableness.score}%) indica forte capacidade de colaboração e empatia. Trabalha bem em equipes, é confiável e busca harmonia. Ideal para funções que exigem trabalho em equipe, mentoria ou suporte. Ponto de atenção: desenvolver assertividade para equilibrar colaboração com limites pessoais saudáveis.`,
    });
  }

  // ── Estabilidade Emocional (pontuação alta = positivo) ──────────────────────
  if (dimensions.emotionalStability.score >= 75) {
    insights.push({
      title: '🧘 Estabilidade Emocional como Ativo',
      content: `A estabilidade emocional elevada (${dimensions.emotionalStability.score}%) indica excelente capacidade de lidar com pressão e estresse. Mantém clareza em situações de crise e é difícil de desestabilizar. Ideal para posições de alta pressão, gestão de crises ou ambientes dinâmicos. Use essa fortaleza como diferencial de liderança.`,
    });
  } else if (dimensions.emotionalStability.score <= 40) {
    // Pontuação baixa = maior sensibilidade emocional
    insights.push({
      title: '⚠️ Sensibilidade Emocional — Ponto de Atenção',
      content: `A sensibilidade emocional (estabilidade: ${dimensions.emotionalStability.score}%) indica maior reatividade ao estresse e variações de humor. Recomenda-se: buscar ambientes de trabalho com menos pressão crônica, desenvolver práticas de regulação emocional, e considerar mentoria ou coaching para fortalecer a resiliência. Alta sensibilidade não é fraqueza — é um sinal para cuidar de si com mais atenção.`,
    });
  }

  // ── Comunicação ─────────────────────────────────────────────────────────────
  if (dimensions.extraversion.score >= 70) {
    insights.push({
      title: '📢 Comunicadora Natural',
      content: `A extroversão (${dimensions.extraversion.score}%) indica excelente capacidade de comunicação e networking. Confortável em apresentações, negociações e interações sociais. Ideal para funções em vendas, marketing, relações públicas ou qualquer posição que exija comunicação frequente e presença de marca.`,
    });
  } else if (dimensions.extraversion.score <= 40) {
    insights.push({
      title: '🎧 Liderança Reflexiva e Profunda',
      content: `A introversão (${100 - dimensions.extraversion.score}% de preferência por recolhimento) indica preferência por comunicação profunda e reflexiva. Excelente em trabalho focado, análise e comunicação escrita. Ideal para funções em análise, pesquisa, desenvolvimento técnico ou posições que permitam trabalho independente. Liderança silenciosa é igualmente poderosa.`,
    });
  }

  // ── Adaptabilidade ──────────────────────────────────────────────────────────
  const adaptabilityScore = (dimensions.openness.score + dimensions.emotionalStability.score) / 2;
  if (adaptabilityScore >= 70) {
    insights.push({
      title: '🔄 Altamente Adaptável',
      content: `A combinação de abertura (${dimensions.openness.score}%) e estabilidade emocional (${dimensions.emotionalStability.score}%) indica excelente adaptabilidade. Lida bem com mudanças e novas situações. Ideal para ambientes dinâmicos, startups ou posições que exigem flexibilidade constante.`,
    });
  }

  // ── Desenvolvimento de Carreira ─────────────────────────────────────────────
  const careerGrowthScore =
    (dimensions.conscientiousness.score + dimensions.openness.score + dimensions.agreeableness.score) / 3;
  if (careerGrowthScore >= 75) {
    insights.push({
      title: '📈 Alto Potencial de Desenvolvimento',
      content: `A combinação de conscienciosidade, abertura e agradabilidade indica alto potencial para crescimento de carreira. Há capacidade de aprender, colaborar e executar com qualidade. Recomenda-se buscar programas de desenvolvimento, mentoria executiva ou posições de maior responsabilidade.`,
    });
  }

  // ── Áreas de Desenvolvimento ────────────────────────────────────────────────
  const weaknesses: string[] = [];
  if (dimensions.conscientiousness.score < 50) {
    weaknesses.push(`organização e planejamento (conscienciosidade: ${dimensions.conscientiousness.score}%)`);
  }
  if (dimensions.emotionalStability.score < 50) {
    // Baixa estabilidade = alta sensibilidade emocional
    weaknesses.push(`gestão do estresse e regulação emocional (estabilidade: ${dimensions.emotionalStability.score}%)`);
  }
  if (dimensions.agreeableness.score < 50) {
    weaknesses.push(`colaboração e gestão de relacionamentos (agradabilidade: ${dimensions.agreeableness.score}%)`);
  }
  if (dimensions.extraversion.score < 30) {
    weaknesses.push(`visibilidade e networking (extroversão: ${dimensions.extraversion.score}%)`);
  }

  if (weaknesses.length > 0) {
    insights.push({
      title: '🎓 Áreas de Desenvolvimento Profissional',
      content: `Recomenda-se investir em: ${weaknesses.join(', ')}. Treinamentos, coaching ou mentoria nessas áreas podem potencializar a carreira e aumentar a efetividade profissional.`,
    });
  }

  // ── Estilo de Trabalho ──────────────────────────────────────────────────────
  let workStyle = 'Estilo de trabalho: ';
  if (dimensions.conscientiousness.score >= 70 && dimensions.openness.score >= 70) {
    workStyle += 'inovador e estruturado — combina criatividade com execução disciplinada.';
  } else if (dimensions.conscientiousness.score >= 70) {
    workStyle += 'estruturado e focado — prefere planejamento e execução metódica.';
  } else if (dimensions.openness.score >= 70) {
    workStyle += 'criativo e exploratório — prefere liberdade para experimentar novas abordagens.';
  } else if (dimensions.extraversion.score >= 70) {
    workStyle += 'colaborativo e social — prospera em ambientes com muita interação.';
  } else {
    workStyle += 'reflexivo e independente — prefere trabalho focado com autonomia.';
  }

  insights.push({
    title: '💼 Estilo de Trabalho',
    content: workStyle,
  });

  return insights;
}
