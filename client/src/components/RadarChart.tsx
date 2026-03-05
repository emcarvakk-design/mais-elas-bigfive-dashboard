import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { BigFiveProfile } from '@/lib/bigfive';

interface BigFiveRadarChartProps {
  profile: BigFiveProfile;
}

const DIMENSION_COLORS: Record<string, string> = {
  openness: '#6366f1',
  conscientiousness: '#f59e0b',
  extraversion: '#10b981',
  agreeableness: '#ec4899',
  emotionalStability: '#3b82f6',
};

export function BigFiveRadarChart({ profile }: BigFiveRadarChartProps) {
  const { dimensions } = profile;

  const data = [
    {
      dimension: 'Abertura',
      score: Math.round(dimensions.openness.score),
      fullMark: 100,
    },
    {
      dimension: 'Conscienciosidade',
      score: Math.round(dimensions.conscientiousness.score),
      fullMark: 100,
    },
    {
      dimension: 'Extroversão',
      score: Math.round(dimensions.extraversion.score),
      fullMark: 100,
    },
    {
      dimension: 'Agradabilidade',
      score: Math.round(dimensions.agreeableness.score),
      fullMark: 100,
    },
    {
      dimension: 'Est. Emocional',
      score: Math.round(dimensions.emotionalStability.score),
      fullMark: 100,
    },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { dimension: string; score: number } }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold text-foreground">{d.dimension}</p>
          <p className="text-primary">{d.score}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickCount={5}
          />
          <Radar
            name={profile.name}
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 4 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
