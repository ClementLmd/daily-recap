import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ProgressEntry } from "../../store/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ProgressGraphProps {
  progress: ProgressEntry[];
}

export default function ProgressGraph({ progress }: ProgressGraphProps) {
  // Sort progress by date
  const sortedProgress = [...progress].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Calculate cumulative totals
  let runningTotal = 0;
  const cumulativeData = sortedProgress.map((entry) => {
    runningTotal += entry.value;
    return {
      date: new Date(entry.date).toLocaleDateString(),
      total: runningTotal,
      daily: entry.value,
    };
  });

  const lineChartData = {
    labels: cumulativeData.map((d) => d.date),
    datasets: [
      {
        label: "Total Progress",
        data: cumulativeData.map((d) => d.total),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: cumulativeData.map((d) => d.date),
    datasets: [
      {
        label: "Daily Progress",
        data: cumulativeData.map((d) => d.daily),
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Progress Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Progress</h3>
        <Line data={lineChartData} options={options} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress</h3>
        <Bar data={barChartData} options={options} />
      </div>
    </div>
  );
}
