import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export const DonationsChart = ({ amount }: { amount: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Total donado"],
        datasets: [
          {
            data: [amount],
            backgroundColor: ["#4caf50"]
          }
        ]
      }
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [amount]);

  return <canvas ref={canvasRef} />;
};
