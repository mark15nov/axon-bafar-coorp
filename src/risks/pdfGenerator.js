import { jsPDF } from 'jspdf';

/*
 * pdfGenerator — Genera un PDF formal del plan de mitigación de un riesgo.
 * Diseño corporativo: hoja A4, márgenes consistentes, paleta BAFAR.
 *
 * Implementación manual (sin jspdf-autotable) para tener control total
 * y no agregar otra dependencia. Las tablas se dibujan con líneas y rect.
 */

const PALETTE = {
  red: [230, 57, 70],
  text: [17, 24, 39],
  muted: [107, 114, 128],
  dim: [156, 163, 175],
  border: [229, 231, 235],
  amber: [217, 119, 6],
  green: [22, 163, 74],
  surface: [243, 244, 246],
};

const MONO = 'courier';

function fmtMXN(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M MXN`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K MXN`;
  return `$${v.toLocaleString('es-MX')} MXN`;
}

function setColor(doc, kind, rgb) {
  if (kind === 'text') doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  if (kind === 'fill') doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  if (kind === 'draw') doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

export function generateRiskPlanPDF(plan, opts = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48; // margen
  const W = pageW - M * 2;

  let y = M;

  // ══════════ HEADER ROJO ══════════
  setColor(doc, 'fill', PALETTE.red);
  doc.rect(0, 0, pageW, 92, 'F');
  setColor(doc, 'text', [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BAFAR ALIADOS · COMMAND CENTER', M, 36);
  doc.setFontSize(20);
  doc.text('Plan de Mitigación de Riesgo', M, 62);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado por agente IA · ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`, M, 80);

  // Folio en esquina derecha
  doc.setFontSize(8);
  doc.text(`Folio: BAFAR-RISK-${String(plan.riskId).toUpperCase().slice(0, 12)}-${Math.floor(Math.random() * 9000) + 1000}`, pageW - M, 80, { align: 'right' });

  y = 122;

  // ══════════ TÍTULO DEL RIESGO ══════════
  setColor(doc, 'text', PALETTE.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(plan.riskTitle, M, y);
  y += 18;

  setColor(doc, 'text', PALETTE.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Agente IA asignado: ${plan.agentId.toUpperCase()} · ventana de ejecución: ${plan.ventanaDias} días`, M, y);
  y += 22;

  // ══════════ TARJETAS DE MÉTRICAS ══════════
  const kpiW = (W - 18) / 4;
  const kpis = [
    { label: 'Exposición', value: fmtMXN(plan.exposureMXN), color: PALETTE.red },
    { label: 'Inversión total', value: fmtMXN(plan.inversionTotalMXN), color: PALETTE.text },
    { label: 'ROI proyectado', value: `${plan.roiProyectado.toFixed(1)}×`, color: PALETTE.green },
    { label: '# Acciones', value: `${plan.acciones.length}`, color: PALETTE.text },
  ];
  kpis.forEach((k, i) => {
    const x = M + i * (kpiW + 6);
    setColor(doc, 'draw', PALETTE.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, kpiW, 56, 6, 6, 'S');
    setColor(doc, 'text', PALETTE.muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(k.label.toUpperCase(), x + 10, y + 16);
    setColor(doc, 'text', k.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(k.value, x + 10, y + 38);
  });
  y += 76;

  // ══════════ OBJETIVO ══════════
  setColor(doc, 'fill', PALETTE.surface);
  doc.roundedRect(M, y, W, 60, 6, 6, 'F');
  setColor(doc, 'text', PALETTE.muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OBJETIVO ESTRATÉGICO', M + 14, y + 16);
  setColor(doc, 'text', PALETTE.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const objLines = doc.splitTextToSize(plan.objetivo, W - 28);
  doc.text(objLines, M + 14, y + 32);
  y += 76;

  // ══════════ AGENTE IA ASIGNADO ══════════
  setColor(doc, 'fill', [254, 242, 243]);
  doc.roundedRect(M, y, W, 56, 6, 6, 'F');
  setColor(doc, 'text', PALETTE.red);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`⚡ EJECUCIÓN ASISTIDA POR AGENTE IA · ${plan.agentId.toUpperCase()}`, M + 14, y + 16);
  setColor(doc, 'text', PALETTE.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const agentLines = doc.splitTextToSize(plan.agentReason, W - 28);
  doc.text(agentLines, M + 14, y + 32);
  y += 72;

  // ══════════ TABLA DE ACCIONES ══════════
  if (y > pageH - 200) { doc.addPage(); y = M; }

  setColor(doc, 'text', PALETTE.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Plan de acciones', M, y);
  y += 16;

  // Header tabla
  setColor(doc, 'fill', PALETTE.text);
  doc.rect(M, y, W, 22, 'F');
  setColor(doc, 'text', [255, 255, 255]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const cols = [
    { label: '#',          x: M + 8,        w: 18 },
    { label: 'ACCIÓN',     x: M + 28,       w: 170 },
    { label: 'OWNER',      x: M + 202,      w: 100 },
    { label: 'AGENTE',     x: M + 306,      w: 48 },
    { label: 'FECHA',      x: M + 356,      w: 44 },
    { label: 'COSTO',      x: M + 432,      w: 0,  align: 'right' },
    { label: 'STATUS',     x: M + W - 2,    w: 0,  align: 'right' },
  ];
  cols.forEach(c => doc.text(c.label, c.x, y + 14, c.align === 'right' ? { align: 'right' } : undefined));
  y += 22;

  // Filas
  plan.acciones.forEach((a, i) => {
    const bg = i % 2 === 0 ? [255, 255, 255] : PALETTE.surface;
    setColor(doc, 'fill', bg);
    const rowH = 38;
    doc.rect(M, y, W, rowH, 'F');
    setColor(doc, 'draw', PALETTE.border);
    doc.setLineWidth(0.3);
    doc.line(M, y + rowH, M + W, y + rowH);

    setColor(doc, 'text', PALETTE.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(String(a.id), cols[0].x, y + 14);
    const accionLines = doc.splitTextToSize(a.accion, cols[1].w);
    doc.text(accionLines.slice(0, 2), cols[1].x, y + 14);
    // KPI debajo del acción
    setColor(doc, 'text', PALETTE.muted);
    doc.setFontSize(7);
    doc.text(`KPI: ${a.kpi}`, cols[1].x, y + 32);

    setColor(doc, 'text', PALETTE.text);
    doc.setFontSize(8);
    const ownerLines = doc.splitTextToSize(a.owner, cols[2].w);
    doc.text(ownerLines.slice(0, 2), cols[2].x, y + 14);

    doc.text(a.soporte || '—', cols[3].x, y + 14);
    doc.text(a.fecha.slice(5), cols[4].x, y + 14); // MM-DD
    doc.text(fmtMXN(a.costoMXN), cols[5].x, y + 14, { align: 'right' });

    // Status badge
    const statusColors = {
      'En curso':  PALETTE.amber,
      'Aprobado':  PALETTE.green,
      'En diseño': PALETTE.dim,
      'Backlog':   PALETTE.dim,
    };
    const sc = statusColors[a.status] || PALETTE.muted;
    setColor(doc, 'text', sc);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(a.status.toUpperCase(), M + W - 8, y + 14, { align: 'right' });

    y += rowH;

    if (y > pageH - 80 && i < plan.acciones.length - 1) {
      doc.addPage();
      y = M;
    }
  });

  y += 16;

  // ══════════ ESCENARIOS ══════════
  if (y > pageH - 200) { doc.addPage(); y = M; }
  setColor(doc, 'text', PALETTE.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Escenarios de impacto', M, y);
  y += 16;

  const escW = (W - 12) / 3;
  plan.escenarios.forEach((esc, i) => {
    const color = esc.color === 'green' ? PALETTE.green : (esc.color === 'red' ? PALETTE.red : PALETTE.amber);
    const x = M + i * (escW + 6);

    setColor(doc, 'fill', [color[0], color[1], color[2]]);
    doc.roundedRect(x, y, escW, 88, 6, 6, 'F');
    setColor(doc, 'text', [255, 255, 255]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${esc.nombre.toUpperCase()} · ${esc.prob}`, x + 12, y + 18);

    doc.setFontSize(15);
    doc.text(fmtMXN(Math.abs(esc.impactoMXN)), x + 12, y + 42);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(esc.impactoMXN < 0 ? 'pérdida potencial' : 'valor recuperado', x + 12, y + 54);

    doc.setFontSize(7.5);
    const resLines = doc.splitTextToSize(esc.resumen, escW - 24);
    doc.text(resLines.slice(0, 2), x + 12, y + 70);
  });
  y += 104;

  // ══════════ HITOS ══════════
  if (y > pageH - 200) { doc.addPage(); y = M; }
  setColor(doc, 'text', PALETTE.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Hitos clave', M, y);
  y += 14;

  plan.hitos.forEach((h) => {
    setColor(doc, 'fill', PALETTE.red);
    doc.circle(M + 6, y + 4, 3, 'F');
    setColor(doc, 'text', PALETTE.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(h.fecha, M + 18, y + 7);
    setColor(doc, 'text', PALETTE.text);
    doc.setFont('helvetica', 'normal');
    doc.text(h.label, M + 70, y + 7);
    y += 16;
  });

  y += 12;

  // ══════════ RIESGOS DE EJECUCIÓN ══════════
  if (y > pageH - 160) { doc.addPage(); y = M; }
  setColor(doc, 'text', PALETTE.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Riesgos de ejecución a vigilar', M, y);
  y += 14;

  plan.riesgosEjecucion.forEach((r) => {
    setColor(doc, 'text', PALETTE.amber);
    doc.setFontSize(10);
    doc.text('!', M + 4, y + 10);
    setColor(doc, 'text', PALETTE.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(r, W - 32);
    doc.text(lines, M + 16, y + 10);
    y += lines.length * 11 + 6;
  });

  // ══════════ FOOTER ══════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setColor(doc, 'fill', PALETTE.surface);
    doc.rect(0, pageH - 32, pageW, 32, 'F');
    setColor(doc, 'text', PALETTE.muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('BAFAR Aliados · Command Center · Documento confidencial · Generado por Agent Operations Center', M, pageH - 14);
    doc.text(`Pág. ${p} de ${totalPages}`, pageW - M, pageH - 14, { align: 'right' });
  }

  // ══════════ SAVE ══════════
  const filename = `BAFAR-PlanMitigacion-${plan.riskId}.pdf`;
  doc.save(filename);
  return filename;
}
