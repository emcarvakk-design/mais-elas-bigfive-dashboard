/**
 * Pirâmide dos Níveis Neurológicos de Dilts
 * Reproduz fielmente a imagem de referência usando SVG puro.
 *
 * Geometria:
 *  - viewBox: 0 0 400 340
 *  - Ápice: (200, 0)
 *  - Base: y=340, largura total 400
 *  - 6 fatias horizontais de altura igual (~56.7px cada)
 */
export default function DiltsPyramid() {
  const W = 400;   // largura total do viewBox
  const H = 340;   // altura total do viewBox
  const apex = { x: W / 2, y: 0 };
  const n = 6;
  const sliceH = H / n;

  // Cores do topo para a base (igual à imagem de referência)
  const colors = [
    '#b8cdd6', // ESPIRITUALIDADE — cinza-azulado claro
    '#8ecfd4', // IDENTIDADE — azul-claro
    '#5bbfc5', // VALORES E CRENÇAS — ciano médio
    '#00adb5', // HABILIDADES — ciano vibrante
    '#008fa0', // COMPORTAMENTO — azul-ciano escuro
    '#006d82', // AMBIENTE — azul-petróleo escuro
  ];

  const labels = [
    'ESPIRITUALIDADE',
    'IDENTIDADE',
    'VALORES E CRENÇAS',
    'HABILIDADES',
    'COMPORTAMENTO',
    'AMBIENTE',
  ];

  /**
   * Para cada fatia i (0 = topo, 5 = base):
   *  - y_top = i * sliceH
   *  - y_bot = (i+1) * sliceH
   *  - A pirâmide tem lados retos do ápice até os cantos da base.
   *    x_left(y)  = apex.x - (y / H) * (W / 2)
   *    x_right(y) = apex.x + (y / H) * (W / 2)
   */
  const xLeft = (y: number) => apex.x - (y / H) * (W / 2);
  const xRight = (y: number) => apex.x + (y / H) * (W / 2);

  const slices = labels.map((label, i) => {
    const yTop = i * sliceH;
    const yBot = (i + 1) * sliceH;

    // Quatro vértices do trapézio (ou triângulo no topo)
    const points =
      i === 0
        ? `${apex.x},${yTop} ${xRight(yBot)},${yBot} ${xLeft(yBot)},${yBot}`
        : `${xLeft(yTop)},${yTop} ${xRight(yTop)},${yTop} ${xRight(yBot)},${yBot} ${xLeft(yBot)},${yBot}`;

    const midY = (yTop + yBot) / 2 + (i === 0 ? 10 : 0);
    const textColor = i <= 1 ? '#1f2937' : '#ffffff';
    const fontSize = i === 0 ? 11 : 13;

    return { label, color: colors[i], points, midY, textColor, fontSize };
  });

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        Base Conceitual — Níveis Neurológicos
      </h3>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-xs sm:max-w-sm drop-shadow-md"
        aria-label="Pirâmide dos Níveis Neurológicos de Dilts"
      >
        {slices.map((s, i) => (
          <g key={s.label}>
            {/* Fatia colorida */}
            <polygon
              points={s.points}
              fill={s.color}
              stroke="white"
              strokeWidth={i === 0 ? 0 : 1.5}
            />
            {/* Rótulo centralizado */}
            <text
              x={W / 2}
              y={s.midY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={s.textColor}
              fontSize={s.fontSize}
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              letterSpacing="2"
            >
              {s.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        O Big Five mapeia principalmente os níveis de <strong>Habilidades</strong> e{' '}
        <strong>Comportamento</strong>, com reflexos em <strong>Valores e Crenças</strong> e{' '}
        <strong>Identidade</strong>.
      </p>
    </div>
  );
}
