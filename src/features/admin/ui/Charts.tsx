import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

interface Series {
  color: string;
  label: string;
  values: number[];
}

interface ChartProps {
  labels: string[];
  series?: Series[];
  values: number[];
}

const gridColor = "rgba(139, 154, 176, 0.18)";
const mutedText = "#62728b";

export function LineChart({ values, labels, series }: ChartProps) {
  const datasets = series ?? [{ color: "#1454c8", label: "Cases", values }];
  const data = {
    labels,
    datasets: datasets.map((item) => ({
      backgroundColor: `${item.color}16`,
      borderColor: item.color,
      borderWidth: 2,
      data: item.values,
      fill: true,
      label: item.label,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: item.color,
      pointBorderWidth: 2,
      pointRadius: 3,
      tension: 0.36,
    })),
  };
  const options: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: datasets.length > 1, labels: { boxHeight: 8, boxWidth: 8, color: mutedText, usePointStyle: true } },
      tooltip: { backgroundColor: "#07183f", padding: 12, titleColor: "#ffffff", bodyColor: "#dce6f5", displayColors: true },
    },
    responsive: true,
    scales: {
      x: { border: { display: false }, grid: { display: false }, ticks: { color: mutedText, font: { size: 11, weight: 600 } } },
      y: { border: { display: false }, grid: { color: gridColor }, ticks: { color: mutedText, font: { size: 11, weight: 600 }, precision: 0 } },
    },
  };

  return (
    <div className="h-[260px] w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export function BarChart({ values, labels, series }: ChartProps) {
  const datasets = series ?? [{ color: "#1454c8", label: "Cases", values }];
  const data = {
    labels,
    datasets: datasets.map((item) => ({
      backgroundColor: item.color,
      borderRadius: 8,
      borderSkipped: false,
      data: item.values,
      label: item.label,
      maxBarThickness: 40,
    })),
  };
  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: datasets.length > 1, labels: { boxHeight: 8, boxWidth: 8, color: mutedText, usePointStyle: true } },
      tooltip: { backgroundColor: "#07183f", padding: 12, titleColor: "#ffffff", bodyColor: "#dce6f5" },
    },
    responsive: true,
    scales: {
      x: { border: { display: false }, grid: { display: false }, ticks: { color: mutedText, font: { size: 11, weight: 600 } } },
      y: { border: { display: false }, grid: { color: gridColor }, ticks: { color: mutedText, font: { size: 11, weight: 600 }, precision: 0 } },
    },
  };

  return (
    <div className="h-[260px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
}

export function DonutChart() {
  const data = {
    labels: ["Residence", "Business", "Office", "Stock", "CPV"],
    datasets: [
      {
        backgroundColor: ["#1454c8", "#4f5bea", "#12a5b8", "#07883a", "#b77900"],
        borderColor: "#ffffff",
        borderWidth: 4,
        data: [34, 22, 22, 13, 9],
        hoverOffset: 4,
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    cutout: "66%",
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { boxHeight: 9, boxWidth: 9, color: mutedText, font: { size: 12, weight: 600 }, usePointStyle: true } },
      tooltip: { backgroundColor: "#07183f", callbacks: { label: (item) => `${item.label}: ${item.parsed}%` }, padding: 12 },
    },
    responsive: true,
  };

  return (
    <div className="h-[250px] w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}
