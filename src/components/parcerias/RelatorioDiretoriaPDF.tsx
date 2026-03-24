"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  executivos,
  gestor,
  getCorretoresTotal,
  getCorretoresAtivos,
  getCorretoresNovos,
  getImobiliariasNaoIntegradas,
  getImobiliariasNovas,
  getTotalEventosParticipantes,
  getPctAtingimento,
  type Executivo,
} from "@/lib/parcerias-mock-data";

// ============================================
// CORES DWV
// ============================================
const DWV = {
  red: [204, 0, 0] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  darkGray: [17, 17, 17] as [number, number, number],
  midGray: [34, 34, 34] as [number, number, number],
  lightGray: [136, 136, 136] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [0, 204, 68] as [number, number, number],
  yellow: [255, 204, 0] as [number, number, number],
};

function semaforoCor(pct: number): [number, number, number] {
  if (pct >= 80) return DWV.green;
  if (pct >= 60) return DWV.yellow;
  return DWV.red;
}

// ============================================
// GERADOR DE PDF
// ============================================
export function gerarRelatorioDiretoria(dataInicio: string, dataFim: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  // Altura segura (footer ocupa 12mm)
  const safeBottom = pageH - 20;

  const equipe = executivos.filter((e) => gestor.executivos.includes(e.id));
  const totalPropostas = equipe.reduce((s, e) => s + e.propostas.total, 0);
  const totalAceitas = equipe.reduce((s, e) => s + e.propostas.aceitas, 0);
  const totalRecusadas = equipe.reduce((s, e) => s + e.propostas.recusadas, 0);
  const totalEmAberto = equipe.reduce((s, e) => s + e.propostas.emAberto, 0);
  const totalCorretores = equipe.reduce((s, e) => s + getCorretoresTotal(e), 0);
  const totalCorretoresAtivos = equipe.reduce((s, e) => s + getCorretoresAtivos(e), 0);
  const totalCorretoresNovos = equipe.reduce((s, e) => s + getCorretoresNovos(e), 0);
  const totalImobiliarias = equipe.reduce((s, e) => s + e.imobiliarias.length, 0);
  const totalNovasImob = equipe.reduce((s, e) => s + getImobiliariasNovas(e), 0);
  const totalNaoIntegradas = equipe.reduce((s, e) => s + getImobiliariasNaoIntegradas(e), 0);
  const totalAcessos = equipe.reduce((s, e) => s + e.acessosProdutos, 0);
  const totalVisitas = equipe.reduce((s, e) => s + e.visitas.realizadas, 0);
  const totalAlcancados = equipe.reduce((s, e) => s + e.visitas.corretoresAlcancados, 0);
  const totalEventos = equipe.reduce((s, e) => s + e.eventos.length, 0);
  const totalParticipantes = equipe.reduce((s, e) => s + getTotalEventosParticipantes(e), 0);
  const totalAcoes = equipe.reduce(
    (s, e) =>
      s +
      e.acoes.compartilhamentos +
      e.acoes.chamadasWhatsApp +
      e.acoes.participacoesEventos +
      e.acoes.integracoesImovel +
      e.acoes.solicitacoesTabela +
      e.acoes.propostasCriadas +
      e.acoes.solicitacoesAutorizacao +
      e.acoes.pontuacoes,
    0
  );
  const pctMetaPropostas = getPctAtingimento(totalPropostas, gestor.meta.propostas);
  const taxaAceite = totalPropostas > 0 ? Math.round((totalAceitas / totalPropostas) * 100) : 0;
  const taxaRecusa = totalPropostas > 0 ? Math.round((totalRecusadas / totalPropostas) * 100) : 0;
  const taxaEngajamento = totalCorretores > 0 ? Math.round((totalCorretoresAtivos / totalCorretores) * 100) : 0;

  const ranking = [...equipe].sort((a, b) => b.propostas.total - a.propostas.total);

  const formatDate = (d: string) => {
    const [ano, mes, dia] = d.split("-");
    return `${dia}/${mes}/${ano}`;
  };
  const periodoLabel = `${formatDate(dataInicio)} a ${formatDate(dataFim)}`;

  // ——————————————————————————————————————
  // HELPERS DE DESENHO
  // ——————————————————————————————————————
  function newPage() {
    doc.addPage();
    // Pintar fundo preto imediatamente
    doc.setFillColor(...DWV.black);
    doc.rect(0, 0, pageW, pageH, "F");
    y = 18;
  }

  function checkPageBreak(needed: number) {
    if (y + needed > safeBottom) {
      newPage();
    }
  }

  function sectionTitle(title: string) {
    checkPageBreak(20);
    y += 6;
    doc.setFillColor(...DWV.red);
    doc.rect(margin, y, 3, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DWV.white);
    doc.text(title.toUpperCase(), margin + 6, y + 6);
    doc.setDrawColor(34, 34, 34);
    doc.line(margin, y + 10, pageW - margin, y + 10);
    y += 16;
  }

  function kpiBox(
    x: number,
    w: number,
    label: string,
    valor: string,
    cor: [number, number, number] = DWV.white,
    sublabel?: string
  ) {
    doc.setFillColor(22, 22, 22);
    doc.roundedRect(x, y, w, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DWV.lightGray);
    doc.text(label.toUpperCase(), x + 4, y + 6);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...cor);
    doc.text(valor, x + 4, y + 15);
    if (sublabel) {
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(153, 153, 153);
      doc.text(sublabel, x + 4, y + 19);
    }
  }

  function kpiRow(items: { label: string; valor: string; cor?: [number, number, number]; sub?: string }[]) {
    checkPageBreak(24);
    const gap = 3;
    const w = (contentW - gap * (items.length - 1)) / items.length;
    items.forEach((item, i) => {
      kpiBox(margin + i * (w + gap), w, item.label, item.valor, item.cor || DWV.white, item.sub);
    });
    y += 24;
  }

  // ============================================
  // PÁGINA 1 — CAPA
  // ============================================
  doc.setFillColor(...DWV.black);
  doc.rect(0, 0, pageW, pageH, "F");

  // Barra vermelha topo
  doc.setFillColor(...DWV.red);
  doc.rect(0, 0, pageW, 4, "F");

  // Logo
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.red);
  doc.text("DWV", margin, 45);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DWV.lightGray);
  doc.text("|  Gestão de Parcerias", margin + 38, 45);

  // Linha separadora
  doc.setDrawColor(...DWV.red);
  doc.setLineWidth(0.5);
  doc.line(margin, 52, pageW - margin, 52);

  // Título
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.white);
  doc.text("Relatório para Diretoria", margin, 72);

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DWV.lightGray);
  doc.text("Canal de Parcerias — Performance da Equipe", margin, 82);

  // Info do período
  doc.setFillColor(22, 22, 22);
  doc.roundedRect(margin, 95, contentW, 28, 3, 3, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DWV.lightGray);
  doc.text("PERÍODO", margin + 8, 105);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.white);
  doc.text(periodoLabel, margin + 8, 114);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DWV.lightGray);
  doc.text("GESTOR RESPONSÁVEL", margin + 90, 105);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.white);
  doc.text(gestor.nome, margin + 90, 114);

  // Meta highlight
  doc.setFillColor(22, 22, 22);
  doc.roundedRect(margin, 132, contentW, 36, 3, 3, "F");

  const metaCorBg = pctMetaPropostas >= 80 ? DWV.green : pctMetaPropostas >= 60 ? DWV.yellow : DWV.red;
  doc.setFillColor(...metaCorBg);
  doc.roundedRect(margin, 132, 4, 36, 2, 0, "F");
  doc.rect(margin + 2, 132, 2, 36, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DWV.lightGray);
  doc.text("META DE PROPOSTAS DO PERÍODO", margin + 10, 143);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.white);
  doc.text(`${totalPropostas}`, margin + 10, 158);

  // Medir largura do número com o font correto (28pt bold)
  const numWidth = doc.getTextWidth(`${totalPropostas}`);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`/ ${gestor.meta.propostas}`, margin + 10 + numWidth + 3, 158);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...metaCorBg);
  doc.text(`${pctMetaPropostas}%`, pageW - margin - 10, 155, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DWV.lightGray);
  const statusMeta = pctMetaPropostas >= 100 ? "META ATINGIDA" : pctMetaPropostas >= 80 ? "META PRÓXIMA" : pctMetaPropostas >= 60 ? "EM ANDAMENTO" : "ABAIXO DA META";
  doc.text(statusMeta, pageW - margin - 10, 162, { align: "right" });

  // Resumo executivo em cards
  y = 180;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.red);
  doc.text("RESUMO EXECUTIVO", margin, y);
  y += 6;

  kpiRow([
    { label: "Propostas Geradas", valor: `${totalPropostas}` },
    { label: "Aceitas", valor: `${totalAceitas}`, cor: DWV.green },
    { label: "Recusadas", valor: `${totalRecusadas}`, cor: DWV.red },
    { label: "Em Aberto", valor: `${totalEmAberto}`, cor: DWV.yellow },
  ]);

  kpiRow([
    { label: "Taxa de Aceite", valor: `${taxaAceite}%`, cor: taxaAceite >= 50 ? DWV.green : DWV.yellow },
    { label: "Taxa de Recusa", valor: `${taxaRecusa}%`, cor: taxaRecusa <= 20 ? DWV.green : DWV.red },
    { label: "Corretores Engajados", valor: `${totalCorretoresAtivos}`, sub: `de ${totalCorretores} (${taxaEngajamento}%)` },
    { label: "Ações Realizadas", valor: `${totalAcoes}` },
  ]);

  // ============================================
  // PÁGINA 2 — RANKING + PERFORMANCE POR EXECUTIVO
  // ============================================
  newPage();

  sectionTitle("Ranking de Propostas — Executivos");

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Executivo", "Propostas", "Meta", "% Ating.", "Aceitas", "Recusadas", "Taxa Aceite"]],
    body: ranking.map((exec, i) => {
      const pct = getPctAtingimento(exec.propostas.total, exec.meta.propostas);
      const taxa = exec.propostas.total > 0 ? Math.round((exec.propostas.aceitas / exec.propostas.total) * 100) : 0;
      return [
        `${i + 1}`,
        exec.nome,
        `${exec.propostas.total}`,
        `${exec.meta.propostas}`,
        `${pct}%`,
        `${exec.propostas.aceitas}`,
        `${exec.propostas.recusadas}`,
        `${taxa}%`,
      ];
    }),
    styles: {
      fillColor: [17, 17, 17],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 3,
      lineColor: [34, 34, 34],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [204, 0, 0] as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [22, 22, 22],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      2: { halign: "center", fontStyle: "bold" },
      3: { halign: "center" },
      4: { halign: "center", fontStyle: "bold" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const val = parseInt(data.cell.text[0]);
        if (val >= 80) data.cell.styles.textColor = [0, 204, 68];
        else if (val >= 60) data.cell.styles.textColor = [255, 204, 0];
        else data.cell.styles.textColor = [204, 0, 0];
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ============================================
  // PERFORMANCE INDIVIDUAL POR EXECUTIVO
  // ============================================
  sectionTitle("Performance Individual — Carteira");

  const CARD_H = 56; // Altura total do card incluindo margem

  ranking.forEach((exec) => {
    const totalCorr = getCorretoresTotal(exec);
    const ativos = getCorretoresAtivos(exec);
    const novos = getCorretoresNovos(exec);
    const novasImob = getImobiliariasNovas(exec);
    const pctPropostas = getPctAtingimento(exec.propostas.total, exec.meta.propostas);
    const pctCorretores = getPctAtingimento(ativos, exec.meta.corretoresAtivos);
    const participantes = getTotalEventosParticipantes(exec);
    const totalAcoesExec =
      exec.acoes.compartilhamentos +
      exec.acoes.chamadasWhatsApp +
      exec.acoes.participacoesEventos +
      exec.acoes.integracoesImovel +
      exec.acoes.solicitacoesTabela +
      exec.acoes.propostasCriadas +
      exec.acoes.solicitacoesAutorizacao +
      exec.acoes.pontuacoes;

    // Checar se o card COMPLETO cabe na página
    checkPageBreak(CARD_H);

    const cardTop = y;
    const cardInnerH = 50;

    // Card background
    doc.setFillColor(22, 22, 22);
    doc.roundedRect(margin, cardTop, contentW, cardInnerH, 2, 2, "F");

    // Colored left bar based on performance
    const corBarra = semaforoCor(pctPropostas);
    doc.setFillColor(...corBarra);
    doc.roundedRect(margin, cardTop, 3, cardInnerH, 1, 0, "F");
    doc.rect(margin + 1.5, cardTop, 1.5, cardInnerH, "F");

    // Name (font 10 bold)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DWV.white);
    doc.text(exec.nome, margin + 8, cardTop + 7);

    // Badge de percentual — posicionar APÓS medir com o font correto
    const nameWidth = doc.getTextWidth(exec.nome);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...corBarra);
    doc.text(`  ·  ${pctPropostas}% da meta`, margin + 8 + nameWidth, cardTop + 7);

    // Row 1: Propostas (y offset = +14)
    const r1y = cardTop + 14;
    const colW = (contentW - 16) / 5;

    const cols = [
      { label: "PROPOSTAS", valor: `${exec.propostas.total}/${exec.meta.propostas}`, cor: semaforoCor(pctPropostas) },
      { label: "ACEITAS", valor: `${exec.propostas.aceitas}`, cor: DWV.green },
      { label: "RECUSADAS", valor: `${exec.propostas.recusadas}`, cor: DWV.red },
      { label: "EM ABERTO", valor: `${exec.propostas.emAberto}`, cor: DWV.yellow },
      { label: "AÇÕES", valor: `${totalAcoesExec}`, cor: DWV.white },
    ];

    cols.forEach((col, ci) => {
      const cx = margin + 8 + ci * colW;
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DWV.lightGray);
      doc.text(col.label, cx, r1y);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...col.cor);
      doc.text(`${col.valor}`, cx, r1y + 6);
    });

    // Row 2: Carteira (y offset = +28)
    const r2y = cardTop + 28;
    const cols2 = [
      { label: "CORRETORES", valor: `${ativos}/${totalCorr}`, cor: semaforoCor(pctCorretores) },
      { label: "META ATIVOS", valor: `${exec.meta.corretoresAtivos}`, cor: DWV.white },
      { label: "NOVOS CORR.", valor: `+${novos}`, cor: DWV.green },
      { label: "IMOBILIÁRIAS", valor: `${exec.imobiliarias.length}`, cor: DWV.white },
      { label: "NOVAS IMOB.", valor: `+${novasImob}`, cor: DWV.green },
    ];

    cols2.forEach((col, ci) => {
      const cx = margin + 8 + ci * colW;
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DWV.lightGray);
      doc.text(col.label, cx, r2y);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...col.cor);
      doc.text(`${col.valor}`, cx, r2y + 6);
    });

    // Row 3: Engajamento (y offset = +42)
    const r3y = cardTop + 42;
    const cols3 = [
      { label: "VISITAS", valor: `${exec.visitas.realizadas}`, cor: DWV.white },
      { label: "CORR. ALCANÇADOS", valor: `${exec.visitas.corretoresAlcancados}`, cor: DWV.white },
      { label: "EVENTOS", valor: `${exec.eventos.length}`, cor: DWV.white },
      { label: "PARTICIPANTES", valor: `${participantes}`, cor: DWV.white },
      { label: "ACESSOS", valor: `${exec.acessosProdutos}`, cor: DWV.white },
    ];

    cols3.forEach((col, ci) => {
      const cx = margin + 8 + ci * colW;
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DWV.lightGray);
      doc.text(col.label, cx, r3y);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...col.cor);
      doc.text(`${col.valor}`, cx, r3y + 5);
    });

    y = cardTop + CARD_H;
  });

  // ============================================
  // SEÇÃO FINAL — CARTEIRA CONSOLIDADA
  // ============================================
  checkPageBreak(70);
  sectionTitle("Visão Consolidada — Carteira da Equipe");

  kpiRow([
    { label: "Imobiliárias", valor: `${totalImobiliarias}`, sub: `${totalNovasImob} novas | ${totalNaoIntegradas} não integradas` },
    { label: "Corretores", valor: `${totalCorretores}`, sub: `${totalCorretoresAtivos} ativos | ${totalCorretoresNovos} novos` },
    { label: "Engajamento", valor: `${taxaEngajamento}%`, cor: taxaEngajamento >= 70 ? DWV.green : taxaEngajamento >= 40 ? DWV.yellow : DWV.red, sub: `Meta: ${gestor.meta.corretoresAtivos} ativos` },
    { label: "Visitas + Eventos", valor: `${totalVisitas + totalEventos}`, sub: `${totalAlcancados + totalParticipantes} corretores impactados` },
  ]);

  y += 4;

  // Tabela de crescimento de carteira
  checkPageBreak(50);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DWV.lightGray);
  doc.text("CRESCIMENTO DA CARTEIRA POR EXECUTIVO", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Executivo", "Imob.", "Novas Imob.", "Corretores", "Novos Corr.", "Ativos", "Meta Ativos", "% Engaj."]],
    body: ranking.map((exec) => {
      const totalCorr = getCorretoresTotal(exec);
      const ativos = getCorretoresAtivos(exec);
      const novos = getCorretoresNovos(exec);
      const novasImob = getImobiliariasNovas(exec);
      const eng = totalCorr > 0 ? Math.round((ativos / totalCorr) * 100) : 0;
      return [
        exec.nome,
        `${exec.imobiliarias.length}`,
        `+${novasImob}`,
        `${totalCorr}`,
        `+${novos}`,
        `${ativos}`,
        `${exec.meta.corretoresAtivos}`,
        `${eng}%`,
      ];
    }),
    styles: {
      fillColor: [17, 17, 17],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 3,
      lineColor: [34, 34, 34],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [204, 0, 0] as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [22, 22, 22],
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center", fontStyle: "bold" },
      6: { halign: "center" },
      7: { halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 2 || data.column.index === 4) {
          data.cell.styles.textColor = [0, 204, 68];
        }
        if (data.column.index === 7) {
          const val = parseInt(data.cell.text[0]);
          if (val >= 70) data.cell.styles.textColor = [0, 204, 68];
          else if (val >= 40) data.cell.styles.textColor = [255, 204, 0];
          else data.cell.styles.textColor = [204, 0, 0];
        }
      }
    },
  });

  // Footer em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...DWV.darkGray);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setFontSize(7);
    doc.setTextColor(...DWV.lightGray);
    doc.text("DWV — Gestão de Parcerias | Relatório para Diretoria", margin, pageH - 5);
    doc.text(`Página ${i} de ${totalPages}`, pageW - margin, pageH - 5, { align: "right" });
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, pageW / 2, pageH - 5, { align: "center" });
  }

  // Download
  doc.save(`DWV_Relatorio_Diretoria_${dataInicio}_${dataFim}.pdf`);
}
