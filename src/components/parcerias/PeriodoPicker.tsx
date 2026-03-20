"use client";

import { useState, useRef, useEffect } from "react";

// ============================================
// TYPES
// ============================================
interface PeriodoPickerProps {
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;    // YYYY-MM-DD
  onChange: (inicio: string, fim: string) => void;
}

type PresetKey = "mes_atual" | "mes_anterior" | "7d" | "15d" | "30d" | "90d" | "trimestre" | "semestre" | "ano" | "custom";

interface Preset {
  key: PresetKey;
  label: string;
  icon: string;
  getRange: () => [string, string];
}

// ============================================
// HELPERS
// ============================================
function pad(n: number) { return n.toString().padStart(2, "0"); }

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function formatShortBR(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
}

function diffDays(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================
// PRESETS
// ============================================
function getPresets(): Preset[] {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  return [
    {
      key: "mes_atual",
      label: "Mês atual",
      icon: "today",
      getRange: () => {
        const inicio = new Date(ano, mes, 1);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "mes_anterior",
      label: "Mês anterior",
      icon: "event",
      getRange: () => {
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 0);
        return [toYMD(inicio), toYMD(fim)];
      },
    },
    {
      key: "7d",
      label: "Últimos 7 dias",
      icon: "date_range",
      getRange: () => {
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 7);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "15d",
      label: "Últimos 15 dias",
      icon: "date_range",
      getRange: () => {
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 15);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "30d",
      label: "Últimos 30 dias",
      icon: "date_range",
      getRange: () => {
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 30);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "90d",
      label: "Últimos 90 dias",
      icon: "calendar_month",
      getRange: () => {
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 90);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "trimestre",
      label: "Trimestre atual",
      icon: "calendar_view_month",
      getRange: () => {
        const qStart = Math.floor(mes / 3) * 3;
        const inicio = new Date(ano, qStart, 1);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "semestre",
      label: "Semestre atual",
      icon: "calendar_view_month",
      getRange: () => {
        const sStart = mes < 6 ? 0 : 6;
        const inicio = new Date(ano, sStart, 1);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
    {
      key: "ano",
      label: "Ano atual",
      icon: "calendar_today",
      getRange: () => {
        const inicio = new Date(ano, 0, 1);
        return [toYMD(inicio), toYMD(hoje)];
      },
    },
  ];
}

// ============================================
// DATE INPUT FIELD
// ============================================
function DateField({
  label,
  value,
  onChange,
  max,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: string;
  min?: string;
}) {
  const [y, m, d] = value.split("-");

  const handleDayChange = (newDay: string) => {
    const day = Math.max(1, Math.min(31, parseInt(newDay) || 1));
    onChange(`${y}-${m}-${pad(day)}`);
  };

  const handleMonthChange = (newMonth: string) => {
    const month = Math.max(1, Math.min(12, parseInt(newMonth) || 1));
    onChange(`${y}-${pad(month)}-${d}`);
  };

  const handleYearChange = (newYear: string) => {
    const year = Math.max(2020, Math.min(2030, parseInt(newYear) || 2026));
    onChange(`${year}-${m}-${d}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {/* DIA */}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={d}
            onChange={(e) => handleDayChange(e.target.value)}
            className="w-10 bg-[#0A0A0A] border border-[#333333] rounded text-center text-white text-sm font-bold py-2 focus:outline-none focus:border-[#CC0000] transition-colors"
            placeholder="DD"
          />
          <span className="absolute -bottom-3.5 left-0 right-0 text-center text-[8px] text-[#555555] uppercase">dia</span>
        </div>
        <span className="text-[#333333] text-lg font-light">/</span>
        {/* MÊS */}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={m}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-10 bg-[#0A0A0A] border border-[#333333] rounded text-center text-white text-sm font-bold py-2 focus:outline-none focus:border-[#CC0000] transition-colors"
            placeholder="MM"
          />
          <span className="absolute -bottom-3.5 left-0 right-0 text-center text-[8px] text-[#555555] uppercase">mês</span>
        </div>
        <span className="text-[#333333] text-lg font-light">/</span>
        {/* ANO */}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={y}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-14 bg-[#0A0A0A] border border-[#333333] rounded text-center text-white text-sm font-bold py-2 focus:outline-none focus:border-[#CC0000] transition-colors"
            placeholder="AAAA"
          />
          <span className="absolute -bottom-3.5 left-0 right-0 text-center text-[8px] text-[#555555] uppercase">ano</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function PeriodoPicker({ dataInicio, dataFim, onChange }: PeriodoPickerProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey>("mes_atual");
  const [tmpInicio, setTmpInicio] = useState(dataInicio);
  const [tmpFim, setTmpFim] = useState(dataFim);
  const panelRef = useRef<HTMLDivElement>(null);

  const presets = getPresets();
  const dias = diffDays(dataInicio, dataFim);

  // Sync tmp with actual
  useEffect(() => {
    setTmpInicio(dataInicio);
    setTmpFim(dataFim);
  }, [dataInicio, dataFim]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handlePreset = (preset: Preset) => {
    const [inicio, fim] = preset.getRange();
    setActivePreset(preset.key);
    setTmpInicio(inicio);
    setTmpFim(fim);
    onChange(inicio, fim);
  };

  const handleApplyCustom = () => {
    setActivePreset("custom");
    onChange(tmpInicio, tmpFim);
    setOpen(false);
  };

  const activeLabel = activePreset === "custom"
    ? "Personalizado"
    : presets.find((p) => p.key === activePreset)?.label || "Período";

  return (
    <div className="relative" ref={panelRef}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-medium transition-all duration-200 ${
          open
            ? "bg-[#CC0000]/10 border-[#CC0000]/40 text-white"
            : "bg-[#111111] border-[#333333] text-[#AAAAAA] hover:border-[#555555] hover:text-white"
        }`}
      >
        <span className="material-symbols-outlined text-sm text-[#CC0000]">
          calendar_month
        </span>
        <span className="font-bold">{formatShortBR(dataInicio)}</span>
        <span className="text-[#444444]">—</span>
        <span className="font-bold">{formatShortBR(dataFim)}</span>
        <span className="text-[#555555] text-[10px] ml-1">
          ({dias}d)
        </span>
        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {/* DROPDOWN PANEL */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[100] w-[520px] bg-[#0D0D0D] border border-[#222222] rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-3 border-b border-[#1A1A1A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#CC0000] text-base">
                date_range
              </span>
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                Período do Relatório
              </span>
            </div>
            <span className="text-[#333333] text-[10px]">
              {activeLabel}
            </span>
          </div>

          <div className="flex">
            {/* LEFT: PRESETS */}
            <div className="w-[200px] border-r border-[#1A1A1A] py-2">
              <div className="px-3 pb-1.5">
                <span className="text-[#444444] text-[9px] font-bold uppercase tracking-widest">
                  Atalhos
                </span>
              </div>
              <div className="space-y-0.5 px-1">
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePreset(preset)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all duration-150 ${
                      activePreset === preset.key
                        ? "bg-[#CC0000]/10 text-white font-semibold"
                        : "text-[#888888] hover:bg-[#1A1A1A] hover:text-white"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${
                        activePreset === preset.key ? "text-[#CC0000]" : "text-[#555555]"
                      }`}
                    >
                      {preset.icon}
                    </span>
                    {preset.label}
                    {activePreset === preset.key && (
                      <span className="material-symbols-outlined text-[#CC0000] text-sm ml-auto">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: CUSTOM DATE INPUTS */}
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[#555555] text-sm">
                  edit_calendar
                </span>
                <span className="text-[#666666] text-[10px] font-bold uppercase tracking-widest">
                  Personalizar Período
                </span>
              </div>

              <div className="flex items-end gap-5 mb-6">
                <DateField
                  label="Data Início"
                  value={tmpInicio}
                  onChange={setTmpInicio}
                />
                <div className="pb-2">
                  <span className="material-symbols-outlined text-[#333333] text-lg">
                    arrow_forward
                  </span>
                </div>
                <DateField
                  label="Data Fim"
                  value={tmpFim}
                  onChange={setTmpFim}
                />
              </div>

              {/* PREVIEW */}
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#CC0000] text-sm">
                      schedule
                    </span>
                    <span className="text-[#888888] text-[11px]">Intervalo selecionado</span>
                  </div>
                  <span className="text-white text-xs font-bold">
                    {formatDateBR(tmpInicio)} — {formatDateBR(tmpFim)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[#555555] text-[11px]">Duração</span>
                  <span className="text-[#FFCC00] text-xs font-bold">
                    {diffDays(tmpInicio, tmpFim)} dias
                  </span>
                </div>
              </div>

              {/* APPLY BUTTON */}
              <button
                onClick={handleApplyCustom}
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Aplicar Período
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
