"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartRow = {
  name: string;
  carburante: number;
  interventi: number;
  documenti: number;
  km: number;
};

type ReportChartsProps = {
  data: ChartRow[];
};

function formatEuro(value: number) {
  return `€ ${value.toFixed(2)}`;
}

function formatKm(value: number) {
  return `${value.toLocaleString("it-IT")} km`;
}

export default function ReportCharts({ data }: ReportChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      <div className="border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
          COSTI PER VEICOLO
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatEuro(Number(value))} />
              <Bar dataKey="carburante" name="Carburante" />
              <Bar dataKey="interventi" name="Interventi" />
              <Bar dataKey="documenti" name="Documenti" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
          KM PER VEICOLO
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatKm(Number(value))} />
              <Bar dataKey="km" name="Km" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}