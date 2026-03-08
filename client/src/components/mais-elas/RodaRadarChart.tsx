import { useEffect, useRef } from "react";
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RodaRadarChartProps {
  scores: { label: string; score: number | null }[];
  size?: number;
  showLegend?: boolean;
  compareScores?: { label: string; score: number | null }[];
  compareName?: string;
  profileName?: string;
}

export function RodaRadarChart({
  scores,
  size = 400,
  showLegend = false,
  compareScores,
  compareName,
  profileName = "Perfil",
}: RodaRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = scores.map((s) => s.label);
    const data = scores.map((s) => s.score ?? 0);

    const datasets = [
      {
        label: profileName,
        data,
        backgroundColor: "rgba(45, 106, 79, 0.2)",
        borderColor: "rgba(45, 106, 79, 0.9)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgba(45, 106, 79, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(45, 106, 79, 1)",
        pointRadius: 5,
      },
    ];

    if (compareScores) {
      datasets.push({
        label: compareName ?? "Média do Grupo",
        data: compareScores.map((s) => s.score ?? 0),
        backgroundColor: "rgba(181, 131, 10, 0.15)",
        borderColor: "rgba(181, 131, 10, 0.8)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(181, 131, 10, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(181, 131, 10, 1)",
        pointRadius: 4,
      });
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "radar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: showLegend,
            position: "bottom",
            labels: {
              font: { size: 12, family: "Inter" },
              color: "#2d3748",
              padding: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}/10`,
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              font: { size: 10 },
              color: "#718096",
              backdropColor: "transparent",
            },
            grid: { color: "rgba(0,0,0,0.08)" },
            angleLines: { color: "rgba(0,0,0,0.1)" },
            pointLabels: {
              font: { size: 11, weight: 600 as const, family: "Inter" },
              color: "#2d3748",
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [scores, compareScores, profileName, compareName, showLegend]);

  return (
    <div style={{ width: size, height: size, maxWidth: "100%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
