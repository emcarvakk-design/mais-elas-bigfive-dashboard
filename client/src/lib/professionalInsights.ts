import { BigFiveProfile } from './bigfive';

export interface ProfessionalInsight {
  title: string;
  content: string;
}

export function generateProfessionalInsights(profile: BigFiveProfile): ProfessionalInsight[] {
  const { dimensions } = profile;
  const insights: ProfessionalInsight[] = [];

  // Análise de Liderança
  const leadershipScore = (dimensions.conscientiousness.score + dimensions.extraversion.score + dimensions.agreeableness.score) / 3;
  if (leadershipScore >= 70) {
    insights.push({
      title: '🎯 Potencial de Liderança',
      content: `Com alta conscienciosidade (${dimensions.conscientiousness.score}%), ${dimensions.extraversion.score >= 60 ? 'boa comunicação' : 'capacidade de foco'} e agradabilidade (${dimensions.agreeableness.score}%), você tem forte potencial para posições de liderança. Sua combinação de organização e empatia permite gerenciar equipes efetivamente. Recomenda-se buscar oportunidades de liderança em projetos ou equipes.`,
    });
  }

  // Análise de Inovação e Criatividade
  if (dimensions.openness.score >= 75) {
    insights.push({
      title: '💡 Forte Potencial Criativo e Inovador',
      content: `Sua abertura à experiência (${dimensions.openness.score}%) indica forte capacidade criativa e disposição para inovação. Você é ideal para funções que exigem pensamento criativo, resolução de problemas complexos e adaptação a mudanças. Considere carreiras em P&D, estratégia, design ou empreendedorismo.`,
    });
  }

  // Análise de Execução e Confiabilidade
  if (dimensions.conscientiousness.score >= 80) {
    insights.push({
      title: '⚡ Executora Confiável e Focada',
      content: `Sua conscienciosidade muito elevada (${dimensions.conscientiousness.score}%) indica excelente capacidade de execução e confiabilidade. Você é ideal para projetos críticos, posições que exigem atenção aos detalhes e cumprimento de prazos. Atenção: gerenciar perfeccionismo para evitar burnout.`,
    });
  }

  // Análise de Colaboração
  if (dimensions.agreeableness.score >= 70) {
    insights.push({
      title: '🤝 Excelente Colaboradora e Empática',
      content: `Sua agradabilidade (${dimensions.agreeableness.score}%) indica forte capacidade de colaboração e empatia. Você trabalha bem em equipes, é confiável e busca harmonia. Ideal para funções que exigem trabalho em equipe, mentoria ou suporte. Desenvolva assertividade para equilibrar colaboração com limites pessoais.`,
    });
  }

  // Análise de Estabilidade Emocional
  if (dimensions.emotionalStability.score >= 75) {
    insights.push({
      title: '🧘 Estabilidade Emocional Elevada',
      content: `Sua estabilidade emocional (${dimensions.emotionalStability.score}%) indica excelente capacidade de lidar com pressão e estresse. Você mantém calma em situações desafiadoras e tem boa resiliência. Ideal para posições de alta pressão, gestão de crises ou ambientes dinâmicos.`,
    });
  } else if (dimensions.emotionalStability.score <= 50) {
    insights.push({
      title: '⚠️ Sensibilidade Emocional',
      content: `Sua sensibilidade emocional (${dimensions.emotionalStability.score}%) indica que você é mais reativo a estresse. Recomenda-se: buscar ambientes de trabalho com menos pressão, desenvolver técnicas de gestão de estresse, considerar mentoria ou coaching para desenvolver resiliência.`,
    });
  }

  // Análise de Comunicação
  if (dimensions.extraversion.score >= 70) {
    insights.push({
      title: '📢 Comunicadora Natural',
      content: `Sua extroversão (${dimensions.extraversion.score}%) indica excelente capacidade de comunicação e networking. Você é confortável em apresentações, negociações e interações sociais. Ideal para funções em vendas, marketing, relações públicas ou qualquer posição que exija comunicação frequente.`,
    });
  } else if (dimensions.extraversion.score <= 40) {
    insights.push({
      title: '🎧 Comunicadora Reflexiva',
      content: `Sua introversão (${100 - dimensions.extraversion.score}%) indica preferência por comunicação profunda e reflexiva. Você é excelente em trabalho focado, análise e comunicação escrita. Ideal para funções em análise, pesquisa, desenvolvimento técnico ou qualquer posição que permita trabalho independente.`,
    });
  }

  // Análise de Adaptabilidade
  const adaptabilityScore = (dimensions.openness.score + dimensions.emotionalStability.score) / 2;
  if (adaptabilityScore >= 70) {
    insights.push({
      title: '🔄 Altamente Adaptável',
      content: `Sua combinação de abertura (${dimensions.openness.score}%) e estabilidade emocional (${dimensions.emotionalStability.score}%) indica excelente adaptabilidade. Você lida bem com mudanças e novas situações. Ideal para ambientes dinâmicos, startups ou posições que exigem flexibilidade.`,
    });
  }

  // Análise de Desenvolvimento de Carreira
  const careerGrowthScore = (dimensions.conscientiousness.score + dimensions.openness.score + dimensions.agreeableness.score) / 3;
  if (careerGrowthScore >= 75) {
    insights.push({
      title: '📈 Alto Potencial de Desenvolvimento',
      content: `Sua combinação de conscienciosidade, abertura e agradabilidade indica alto potencial para desenvolvimento de carreira. Você tem capacidade de aprender, colaborar e executar. Recomenda-se buscar programas de desenvolvimento, mentoria executiva ou posições de maior responsabilidade.`,
    });
  }

  // Análise de Áreas de Desenvolvimento
  const weaknesses: string[] = [];
  if (dimensions.conscientiousness.score < 50) {
    weaknesses.push(`organização e planejamento (conscienciosidade: ${dimensions.conscientiousness.score}%)`);
  }
  if (dimensions.emotionalStability.score < 50) {
    weaknesses.push(`gestão de estresse e resiliência emocional (estabilidade: ${dimensions.emotionalStability.score}%)`);
  }
  if (dimensions.agreeableness.score < 50) {
    weaknesses.push(`colaboração e empatia (agradabilidade: ${dimensions.agreeableness.score}%)`);
  }
  if (dimensions.extraversion.score < 30) {
    weaknesses.push(`comunicação e networking (extroversão: ${dimensions.extraversion.score}%)`);
  }

  if (weaknesses.length > 0) {
    insights.push({
      title: '🎓 Áreas de Desenvolvimento Profissional',
      content: `Recomenda-se desenvolver: ${weaknesses.join(', ')}. Investir em treinamentos, coaching ou mentoria nessas áreas pode potencializar sua carreira e aumentar sua efetividade profissional.`,
    });
  }

  // Análise de Estilo de Trabalho
  let workStyle = 'Seu estilo de trabalho é ';
  if (dimensions.conscientiousness.score >= 70 && dimensions.openness.score >= 70) {
    workStyle += 'inovador e estruturado — você combina criatividade com execução disciplinada.';
  } else if (dimensions.conscientiousness.score >= 70) {
    workStyle += 'estruturado e focado — você prefere planejamento e execução metódica.';
  } else if (dimensions.openness.score >= 70) {
    workStyle += 'criativo e exploratório — você prefere liberdade para experimentar novas abordagens.';
  } else if (dimensions.extraversion.score >= 70) {
    workStyle += 'colaborativo e social — você prospera em ambientes com muita interação.';
  } else {
    workStyle += 'reflexivo e independente — você prefere trabalho focado com autonomia.';
  }

  insights.push({
    title: '💼 Estilo de Trabalho',
    content: workStyle,
  });

  return insights;
}

export function generateCareerRecommendations(profile: BigFiveProfile): string[] {
  const { dimensions } = profile;
  const recommendations: string[] = [];

  // Recomendações baseadas em conscienciosidade
  if (dimensions.conscientiousness.score >= 85) {
    recommendations.push(
      'Gerenciar perfeccionismo: defina limites realistas para evitar esgotamento. Delegue tarefas quando apropriado.'
    );
  }

  // Recomendações baseadas em abertura
  if (dimensions.openness.score >= 80 && dimensions.conscientiousness.score < 70) {
    recommendations.push(
      'Desenvolver disciplina: combine sua criatividade com melhor organização para transformar ideias em resultados concretos.'
    );
  }

  // Recomendações baseadas em extroversão
  if (dimensions.extraversion.score >= 75 && dimensions.emotionalStability.score < 60) {
    recommendations.push(
      'Equilibrar energia social: reserve tempo para reflexão e recuperação para manter equilíbrio emocional.'
    );
  }

  // Recomendações baseadas em agradabilidade
  if (dimensions.agreeableness.score >= 75) {
    recommendations.push(
      'Desenvolver assertividade: aprenda a dizer "não" e estabeleça limites profissionais claros para proteger seu bem-estar.'
    );
  }

  // Recomendações baseadas em estabilidade emocional
  if (dimensions.emotionalStability.score < 50) {
    recommendations.push(
      'Investir em bem-estar: desenvolva técnicas de gestão de estresse, considere mentoria ou coaching para aumentar resiliência.'
    );
  }

  // Recomendações de carreira
  if (dimensions.conscientiousness.score >= 75 && dimensions.extraversion.score >= 60) {
    recommendations.push(
      'Buscar posições de liderança: sua combinação de organização e comunicação é ideal para gerenciamento de equipes.'
    );
  }

  if (dimensions.openness.score >= 75 && dimensions.conscientiousness.score >= 70) {
    recommendations.push(
      'Explorar inovação: considere funções em estratégia, P&D ou empreendedorismo onde sua criatividade e execução são valorizadas.'
    );
  }

  if (dimensions.agreeableness.score >= 70 && dimensions.extraversion.score >= 60) {
    recommendations.push(
      'Considerar funções de relacionamento: vendas, recursos humanos, ou qualquer posição que exija empatia e colaboração.'
    );
  }

  return recommendations;
}
