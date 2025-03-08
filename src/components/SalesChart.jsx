import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function SalesChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: "Average Sale Price ($)",
        data: data.map((d) => d.avgSalePrice),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        borderWidth: 2,
      },
      {
        label: "Median Sale Price ($)",
        data: data.map((d) => d.medSalePrice),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.1)",
        borderWidth: 2,
      },
      {
        label: "Home Sale Count",
        data: data.map((d) => d.homeSaleCount),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        borderWidth: 2,
      },
    ],
  };

  return <Line data={chartData} />;
}
