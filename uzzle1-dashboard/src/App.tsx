import { useEffect, useState } from "react";
import { getCashflow } from "./api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    getCashflow("2026-02").then(setData);
  }, []);

  if (!data) return <div>Carregando dados financeiros...</div>;

  const chartData = [
    { name: "Entradas", valor: data.inflows_in_cents / 100 },
    { name: "Saídas", valor: data.outflows_in_cents / 100 },
    { name: "Saldo", valor: data.closing_balance_in_cents / 100 },
  ];

  return (
    <div style={{ padding: 40 }}>
      <h1>Uzzle Dashboard</h1>

      <h2>
        Saldo Final: R$ {(data.closing_balance_in_cents / 100).toFixed(2)}
      </h2>

      <div style={{ width: 700, height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
