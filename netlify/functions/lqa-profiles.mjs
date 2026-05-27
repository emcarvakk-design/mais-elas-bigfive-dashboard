/**
 * Netlify Function: lqa-profiles
 * Serve os dados pré-processados pelo motor LQA (lqa_resultados.json)
 * O JSON é copiado para a pasta public durante o build e servido como estático.
 * Esta function serve como proxy com CORS para o frontend.
 */

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // O lqa_resultados.json é copiado para dist/public durante o build
    // Aqui fazemos fetch do próprio site para obtê-lo
    const siteUrl = process.env.URL || 'https://reliable-strudel-dea19d.netlify.app';
    const resp = await fetch(`${siteUrl}/lqa_resultados.json`);
    
    if (!resp.ok) {
      throw new Error(`Falha ao carregar resultados: ${resp.status}`);
    }
    
    const data = await resp.json();
    
    // Transformar o formato {id: {respondente, classificacao}} para array
    const profiles = Object.entries(data).map(([id, value]) => ({
      id,
      ...value.respondente,
      classificacao: value.classificacao
    }));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ respondentes: profiles, total: profiles.length })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, respondentes: [], total: 0 })
    };
  }
};
