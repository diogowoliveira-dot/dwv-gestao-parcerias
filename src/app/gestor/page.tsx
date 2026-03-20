"use client";

import { useState } from "react";
import Link from "next/link";
import {
  executivos,
  gestor,
  getCorretoresTotal,
  getCorretoresAtivos,
  getCorretoresNovos,
  getImobiliariasNaoIntegradas,
  getImobiliariasNovas,
  getTotalEventosParticipantes,
  getSemaforoColor,
  getPctAtingimento,
  gerarAlertas,
  type Executivo,
} from "@/lib/parcerias-mock-data";
import SimuladorMetasPropostas from "@/components/parcerias/SimuladorMetas";
import PeriodoPicker from "@/components/parcerias/PeriodoPicker";

const SEMAFORO = {
  verde: { bg: "#00CC44", text: "#00CC44", bar: "#00CC44" },
  amarelo: { bg: "#FFCC00", text: "#FFCC00", bar: "#FFCC00" },
  vermelho: { bg: "#CC0000", text: "#CC0000", bar: "#CC0000" },
};

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-10">
      <span className="material-symbols-outlined text-[#CC0000] text-xl">
        {icon}
      </span>
      <h2 className="text-[#CC0000] text-sm font-bold uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[#1A1A1A] ml-3" />
    </div>
  );
}

function MetaCard({
  label,
  atual,
  meta,
}: {
  label: string;
  atual: number;
  meta: number;
}) {
  const pct = getPctAtingimento(atual, meta);
  const semaforo = getSemaforoColor(atual, meta);
  const cor = SEMAFORO[semaforo];

  return (
    <div className="bg-[#111111] border-2 border-[#CC0000] rounded-lg p-5 flex flex-col gap-3">
      <span className="text-[#CC0000] text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{atual}</span>
        <span className="text-[#555555] text-lg font-medium">/ {meta}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[5px] bg-[#222222] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pct, 100)}%`,
              backgroundColor: cor.bar,
            }}
          />
        </div>
        <span
          className="text-sm font-bold min-w-[42px] text-right"
          style={{ color: cor.text }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  valor,
  colorOverride,
  sublabel,
}: {
  label: string;
  valor: string | number;
  colorOverride?: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
      <span
        className="text-2xl font-bold"
        style={{ color: colorOverride || "#FFFFFF" }}
      >
        {valor}
      </span>
      {sublabel && (
        <span className="text-[#999999] text-xs">{sublabel}</span>
      )}
    </div>
  );
}

function getDefaultDates() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const p = (n: number) => n.toString().padStart(2, "0");
  const inicio = `${ano}-${p(mes + 1)}-01`;
  const fim = `${ano}-${p(mes + 1)}-${p(hoje.getDate())}`;
  return { inicio, fim };
}

export default function GestorDashboard() {
  const defaults = getDefaultDates();
  const [dataInicio, setDataInicio] = useState(defaults.inicio);
  const [dataFim, setDataFim] = useState(defaults.fim);

  const equipe = executivos.filter((e) =>
    gestor.executivos.includes(e.id)
  );

  const totalPropostas = equipe.reduce((s, e) => s + e.propostas.total, 0);
  const totalAceitas = equipe.reduce((s, e) => s + e.propostas.aceitas, 0);
  const totalRecusadas = equipe.reduce((s, e) => s + e.propostas.recusadas, 0);
  const totalEmAberto = equipe.reduce((s, e) => s + e.propostas.emAberto, 0);
  const totalCorretores = equipe.reduce((s, e) => s + getCorretoresTotal(e), 0);
  const totalCorretoresAtivos = equipe.reduce(
    (s, e) => s + getCorretoresAtivos(e),
    0
  );
  const totalCorretoresNovos = equipe.reduce(
    (s, e) => s + getCorretoresNovos(e),
    0
  );
  const totalImobiliarias = equipe.reduce(
    (s, e) => s + e.imobiliarias.length,
    0
  );
  const totalNaoIntegradas = equipe.reduce(
    (s, e) => s + getImobiliariasNaoIntegradas(e),
    0
  );
  const totalNovasImob = equipe.reduce(
    (s, e) => s + getImobiliariasNovas(e),
    0
  );
  const totalAcessos = equipe.reduce((s, e) => s + e.acessosProdutos, 0);
  const totalVisitas = equipe.reduce((s, e) => s + e.visitas.realizadas, 0);
  const totalAlcancados = equipe.reduce(
    (s, e) => s + e.visitas.corretoresAlcancados,
    0
  );
  const totalEventos = equipe.reduce((s, e) => s + e.eventos.length, 0);
  const totalParticipantes = equipe.reduce(
    (s, e) => s + getTotalEventosParticipantes(e),
    0
  );

  const ranking = [...equipe].sort(
    (a, b) => b.propostas.total - a.propostas.total
  );

  const alertas = gerarAlertas(equipe);

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#CC0000] font-extrabold text-lg tracking-tight">
              DWV
            </span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#666666] text-sm">
              Gestão de Parcerias
            </span>
          </div>
          <PeriodoPicker
            dataInicio={dataInicio}
            dataFim={dataFim}
            onChange={(inicio, fim) => {
              setDataInicio(inicio);
              setDataFim(fim);
            }}
          />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pb-20">
        <div className="flex items-center gap-5 py-8 border-b border-[#1A1A1A]">
          <div className="w-16 h-16 rounded-full bg-[#CC0000]/10 border-2 border-[#CC0000] flex items-center justify-center">
            <span className="text-[#CC0000] font-bold text-xl">
              {gestor.iniciais}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{gestor.nome}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00CC44]/10 text-[#00CC44] border border-[#00CC44]/20">
                {gestor.status}
              </span>
              <div className="flex items-center gap-1.5 bg-[#CC0000]/10 border border-[#CC0000]/25 rounded-full px-3 py-1">
                <span className="material-symbols-outlined text-[#CC0000] text-sm">groups</span>
                <span className="text-white text-sm font-bold">{equipe.length}</span>
                <span className="text-[#CCCCCC] text-xs">executivos</span>
              </div>
            </div>
            <p className="text-[#CCCCCC] text-sm mt-1">{gestor.cargo}</p>
          </div>
        </div>

        <SectionHeader title="Metas da Equipe" icon="flag" />
        <div className="grid grid-cols-3 gap-4">
          <MetaCard label="Propostas da Equipe" atual={totalPropostas} meta={gestor.meta.propostas} />
          <MetaCard label="Corretores Ativos" atual={totalCorretoresAtivos} meta={gestor.meta.corretoresAtivos} />
          <MetaCard label="Imobiliárias na Equipe" atual={totalImobiliarias} meta={gestor.meta.imobiliarias} />
        </div>

        <SectionHeader title="Consolidado da Equipe" icon="monitoring" />
        <div className="grid grid-cols-2 gap-4">

          {/* BLOCO: IMOBILIÁRIAS */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#CC0000] text-lg">apartment</span>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">Imobiliárias</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Na Carteira</span>
                <span className="text-3xl font-bold text-white">{totalImobiliarias}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Novas</span>
                <span className="text-3xl font-bold text-[#00CC44]">+{totalNovasImob}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Não Integradas</span>
                <span className="text-3xl font-bold" style={{ color: totalNaoIntegradas > 0 ? "#FFCC00" : "#FFFFFF" }}>{totalNaoIntegradas}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-[#999999] text-xs">Taxa de integração</span>
                <span className="text-white text-sm font-bold">
                  {totalImobiliarias > 0 ? Math.round(((totalImobiliarias - totalNaoIntegradas) / totalImobiliarias) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* BLOCO: CORRETORES */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#CC0000] text-lg">groups</span>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">Corretores</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Na Carteira</span>
                <span className="text-3xl font-bold text-white">{totalCorretores}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Ativos</span>
                <span className="text-3xl font-bold" style={{ color: SEMAFORO[getSemaforoColor(totalCorretoresAtivos, gestor.meta.corretoresAtivos)].text }}>
                  {totalCorretoresAtivos}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Novos</span>
                <span className="text-3xl font-bold text-[#00CC44]">+{totalCorretoresNovos}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-[#999999] text-xs">Taxa de engajamento</span>
                <span className="text-white text-sm font-bold">
                  {totalCorretores > 0 ? Math.round((totalCorretoresAtivos / totalCorretores) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* BLOCO: PROPOSTAS */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#CC0000] text-lg">description</span>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">Propostas</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Geradas</span>
                <span className="text-3xl font-bold text-white">{totalPropostas}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Aceitas</span>
                <span className="text-3xl font-bold text-[#00CC44]">{totalAceitas}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Recusadas</span>
                <span className="text-3xl font-bold text-[#CC0000]">{totalRecusadas}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Em Aberto</span>
                <span className="text-3xl font-bold text-[#FFCC00]">{totalEmAberto}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-[#999999] text-xs">Taxa de aprovação</span>
                <span className="text-white text-sm font-bold">
                  {totalPropostas > 0 ? Math.round((totalAceitas / totalPropostas) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* BLOCO: ENGAJAMENTO */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#CC0000] text-lg">trending_up</span>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">Engajamento</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Acessos</span>
                <span className="text-3xl font-bold text-white">{totalAcessos}</span>
                <span className="text-[#999999] text-xs">aos produtos</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Visitas</span>
                <span className="text-3xl font-bold text-white">{totalVisitas}</span>
                <span className="text-[#999999] text-xs">{totalAlcancados} corretores</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#888888] text-xs font-medium uppercase tracking-wider">Eventos</span>
                <span className="text-3xl font-bold text-white">{totalEventos}</span>
                <span className="text-[#999999] text-xs">{totalParticipantes} participantes</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-[#999999] text-xs">Média corretores por visita</span>
                <span className="text-white text-sm font-bold">
                  {totalVisitas > 0 ? (totalAlcancados / totalVisitas).toFixed(1) : "0"}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10">
          <SimuladorMetasPropostas
            metaPropostas={gestor.meta.propostas}
            propostasAtuais={totalPropostas}
            corretoresNaCarteira={totalCorretores}
            corretoresAtivos={totalCorretoresAtivos}
          />
        </div>

        <SectionHeader title="Ranking dos Executivos" icon="leaderboard" />
        <div className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                <th className="text-center text-[#888888] text-xs font-medium uppercase tracking-wider px-3 py-3 w-12">#</th>
                <th className="text-left text-[#888888] text-xs font-medium uppercase tracking-wider px-4 py-3">Executivo</th>
                <th className="text-center text-[#888888] text-xs font-medium uppercase tracking-wider px-3 py-3">Propostas</th>
                <th className="text-center text-[#888888] text-xs font-medium uppercase tracking-wider px-3 py-3">Corretores Ativos</th>
                <th className="text-center text-[#888888] text-xs font-medium uppercase tracking-wider px-3 py-3">Imobiliárias</th>
                <th className="text-left text-[#888888] text-xs font-medium uppercase tracking-wider px-4 py-3 w-52">Meta Propostas</th>
                <th className="text-center text-[#888888] text-xs font-medium uppercase tracking-wider px-3 py-3 w-20">Ação</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((exec, i) => {
                const pct = getPctAtingimento(exec.propostas.total, exec.meta.propostas);
                const semaforo = getSemaforoColor(exec.propostas.total, exec.meta.propostas);
                const cor = SEMAFORO[semaforo];
                const corretoresAtivos = getCorretoresAtivos(exec);

                return (
                  <tr key={exec.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-4 text-center">
                      <span className={`text-sm font-bold ${i === 0 ? "text-[#FFCC00]" : i === 1 ? "text-[#C0C0C0]" : i === 2 ? "text-[#CD7F32]" : "text-[#555555]"}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border"
                          style={{
                            backgroundColor: `${cor.bg}10`,
                            borderColor: `${cor.bg}30`,
                            color: cor.text,
                          }}
                        >
                          {exec.iniciais}
                        </div>
                        <div>
                          <span className="text-white font-medium text-sm">{exec.nome}</span>
                          <span className="block text-[#999999] text-xs">
                            {exec.imobiliarias.length} imob · {getCorretoresTotal(exec)} corretores
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="text-lg font-bold" style={{ color: cor.text }}>{exec.propostas.total}</span>
                    </td>
                    <td className="px-3 py-4 text-center text-white font-medium">{corretoresAtivos}</td>
                    <td className="px-3 py-4 text-center text-white font-medium">{exec.imobiliarias.length}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-[5px] bg-[#222222] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor: cor.bar,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold min-w-[36px] text-right" style={{ color: cor.text }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <Link
                        href={`/executivo?id=${exec.id}&gestor=true`}
                        className="inline-flex items-center gap-1 text-[#888888] hover:text-[#CC0000] transition-colors text-xs font-medium"
                      >
                        ver
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <SectionHeader title="Alertas Automáticos" icon="warning" />
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`bg-[#111111] border rounded-lg p-4 flex items-start gap-3 ${
                alerta.tipo === "critico"
                  ? "border-[#CC0000]/40"
                  : "border-[#FFCC00]/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alerta.tipo === "critico"
                    ? "bg-[#CC0000] animate-pulse"
                    : "bg-[#FFCC00]"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      alerta.tipo === "critico"
                        ? "bg-[#CC0000]/10 text-[#CC0000]"
                        : "bg-[#FFCC00]/10 text-[#FFCC00]"
                    }`}
                  >
                    {alerta.tipo === "critico" ? "Crítico" : "Atenção"}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">{alerta.titulo}</p>
                <p className="text-[#AAAAAA] text-xs mt-0.5">{alerta.descricao}</p>
              </div>
            </div>
          ))}
          {alertas.length === 0 && (
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-[#00CC44] text-3xl mb-2">
                check_circle
              </span>
              <p className="text-[#888888] text-sm">
                Nenhum alerta no período selecionado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
