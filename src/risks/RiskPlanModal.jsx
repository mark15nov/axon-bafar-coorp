import React, { useState, useMemo } from 'react';
import {
  X, Download, ChevronDown, ChevronRight, Shield, Globe2, Zap, LineChart,
  GraduationCap, ShieldAlert, Calendar, User, DollarSign, Target, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, FileText, Activity, Sparkles, Sliders,
} from 'lucide-react';
import { RISK_PLANS, totalsPlan, findPlanByTitle } from './riskPlans.js';
import { generateRiskPlanPDF } from './pdfGenerator.js';
import { AGENT_PALETTE } from '../agents/data.js';

const C = {
  bg: '#f5f6f8',
  surface: '#f3f4f6',
  card: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#d1d5db',
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  red: '#e63946',
  redSoft: '#fef2f3',
  green: '#16a34a',
  greenSoft: '#f0fdf4',
  amber: '#d97706',
  amberSoft: '#fffbeb',
  blue: '#2563eb',
};

const AGENT_ICONS = {
  centinela: Shield,
  atlas: Globe2,
  mercurio: Zap,
  vega: LineChart,
  socrates: GraduationCap,
  coyote: ShieldAlert,
};

const STATUS_STYLE = {
  'En curso':  { bg: '#fffbeb', color: C.amber, dot: C.amber },
  'Aprobado':  { bg: '#f0fdf4', color: C.green, dot: C.green },
  'En diseño': { bg: '#eff6ff', color: C.blue,  dot: C.blue },
  'Backlog':   { bg: '#f3f4f6', color: C.textMuted, dot: C.textDim },
};

function fmtMXN(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString('es-MX')}`;
}

/* ────────────────────────────────────────────────────────────────── */
/*  WHAT-IF SIMULATOR                                                  */
/* ────────────────────────────────────────────────────────────────── */
function WhatIfSimulator({ plan }) {
  const [ejecucion, setEjecucion] = useState(75); // % del plan ejecutado
  const [agente, setAgente] = useState(85); // % de autonomía del agente IA

  const impactoBase = plan.escenarios.find(e => e.nombre === 'Esperado')?.impactoMXN || 0;
  const factorPlan = ejecucion / 75; // 75% es la base "esperado"
  const factorAgente = 0.7 + 0.6 * (agente / 100); // agente al 100% da 1.3× boost
  const impactoSim = impactoBase * factorPlan * factorAgente;
  const roiSim = (impactoSim / plan.inversionTotalMXN);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: 12,
      padding: 16,
      color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sliders size={14} color="#facc15" />
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>Simulador what-if</div>
      </div>

      {/* Slider ejecución */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10.5, color: '#cbd5e1' }}>
          <span>Si ejecutamos el plan al…</span>
          <span style={{ color: 'white', fontWeight: 700 }}>{ejecucion}%</span>
        </div>
        <input type="range" min="20" max="100" value={ejecucion} onChange={e => setEjecucion(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#facc15' }} />
      </div>

      {/* Slider agente */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10.5, color: '#cbd5e1' }}>
          <span>Autonomía del agente {plan.agentId}…</span>
          <span style={{ color: 'white', fontWeight: 700 }}>{agente}%</span>
        </div>
        <input type="range" min="20" max="100" value={agente} onChange={e => setAgente(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#facc15' }} />
      </div>

      {/* Resultado */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 8,
        padding: 12,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>VALOR ESPERADO</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: impactoSim > 0 ? '#22c55e' : '#fca5a5' }}>
              {impactoSim > 0 ? '+' : ''}{fmtMXN(impactoSim)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>ROI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#facc15' }}>{roiSim.toFixed(1)}×</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  PLAN DETAIL EXPANDIDO                                              */
/* ────────────────────────────────────────────────────────────────── */
function PlanDetail({ plan }) {
  const AgentIcon = AGENT_ICONS[plan.agentId] || Sparkles;
  const palette = AGENT_PALETTE[plan.agentId] || { hue: C.red, soft: C.redSoft };

  const handleDownload = () => {
    try {
      generateRiskPlanPDF(plan);
    } catch (e) {
      alert('Error generando PDF: ' + e.message);
    }
  };

  return (
    <div style={{ background: C.surface, padding: 20, borderTop: `1px solid ${C.border}` }}>
      {/* Objetivo + métricas grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 800, color: C.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
            <Target size={11} /> Objetivo estratégico
          </div>
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55, fontWeight: 500 }}>{plan.objetivo}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Metric label="Exposición" value={fmtMXN(plan.exposureMXN)} accent={C.red} />
          <Metric label="Inversión total" value={fmtMXN(plan.inversionTotalMXN)} />
          <Metric label="ROI proyectado" value={`${plan.roiProyectado.toFixed(1)}×`} accent={C.green} />
          <Metric label="Ventana" value={`${plan.ventanaDias}d`} accent={C.amber} />
        </div>
      </div>

      {/* Agente asignado banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          background: `radial-gradient(circle, ${palette.hue}55 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'relative',
          width: 44, height: 44, borderRadius: 10,
          background: `${palette.hue}30`,
          border: `1px solid ${palette.hue}60`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AgentIcon size={22} color={palette.hue} strokeWidth={2.2} />
        </div>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#facc15', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 3 }}>
            ⚡ Ejecución asistida por agente IA
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3, textTransform: 'capitalize' }}>{plan.agentId} · {plan.agentReason.slice(0, 110)}</div>
          <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.45 }}>
            {plan.agentReason.slice(110)}
          </div>
        </div>
      </div>

      {/* Tabla de acciones */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: '-0.2px' }}>Plan de acciones · {plan.acciones.length} entregables</div>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>
            Inversión <b style={{ color: C.text }}>{fmtMXN(plan.inversionTotalMXN)}</b>
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '24px 2.4fr 1.1fr 0.8fr 0.7fr 0.7fr 0.8fr',
            padding: '10px 14px', background: C.text, color: 'white',
            fontSize: 9, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
            gap: 10,
          }}>
            <span>#</span>
            <span>Acción · KPI</span>
            <span>Owner</span>
            <span>Apoya</span>
            <span>Fecha</span>
            <span style={{ textAlign: 'right' }}>Costo</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </div>
          {plan.acciones.map((a, i) => {
            const ss = STATUS_STYLE[a.status] || STATUS_STYLE.Backlog;
            return (
              <div key={a.id} style={{
                display: 'grid', gridTemplateColumns: '24px 2.4fr 1.1fr 0.8fr 0.7fr 0.7fr 0.8fr',
                padding: '12px 14px',
                borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                fontSize: 11.5,
                alignItems: 'center',
                background: i % 2 === 0 ? C.card : '#fafafa',
                gap: 10,
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.textDim }}>{a.id}</span>
                <div>
                  <div style={{ fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{a.accion}</div>
                  <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>
                    <b style={{ color: C.green, fontWeight: 800 }}>KPI:</b> {a.kpi}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.text }}>
                  <User size={10} color={C.textMuted} />
                  <span>{a.owner}</span>
                </div>
                <div style={{ fontSize: 10.5, color: C.textMuted, fontWeight: 600, textTransform: 'capitalize' }}>
                  {a.soporte === '—' ? '—' : a.soporte}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text }}>
                  <Calendar size={10} color={C.textMuted} />
                  <span>{a.fecha.slice(5).replace('-', '/')}</span>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: C.text }}>
                  {fmtMXN(a.costoMXN)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: ss.bg, color: ss.color,
                    padding: '3px 8px', borderRadius: 4,
                    fontSize: 9, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: ss.dot }} />
                    {a.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escenarios + Simulador */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 8 }}>Escenarios de impacto</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {plan.escenarios.map((esc, i) => {
              const color = esc.color === 'green' ? C.green : (esc.color === 'red' ? C.red : C.amber);
              const bg = esc.color === 'green' ? C.greenSoft : (esc.color === 'red' ? C.redSoft : C.amberSoft);
              return (
                <div key={i} style={{
                  background: bg, border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`,
                  borderRadius: 8, padding: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: color, letterSpacing: 0.5, textTransform: 'uppercase' }}>{esc.nombre}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}>{esc.prob}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: color, letterSpacing: '-0.5px' }}>
                    {esc.impactoMXN > 0 ? '+' : ''}{fmtMXN(Math.abs(esc.impactoMXN))}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.text, marginTop: 4, lineHeight: 1.45 }}>{esc.resumen}</div>
                </div>
              );
            })}
          </div>
        </div>
        <WhatIfSimulator plan={plan} />
      </div>

      {/* Timeline hitos + Riesgos ejecución */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Activity size={13} color={C.red} />
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Hitos clave</div>
          </div>
          <div style={{ position: 'relative', paddingLeft: 16 }}>
            <div style={{ position: 'absolute', left: 4, top: 6, bottom: 6, width: 2, background: C.border }} />
            {plan.hitos.map((h, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{ position: 'absolute', left: -16, top: 2, width: 10, height: 10, borderRadius: '50%', background: C.red, border: `2px solid ${C.card}`, boxShadow: `0 0 0 2px ${C.red}40` }} />
                <div style={{ fontSize: 10.5, fontWeight: 800, color: C.red, letterSpacing: 0.3 }}>{h.fecha}</div>
                <div style={{ fontSize: 11.5, color: C.text, marginTop: 1 }}>{h.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <AlertTriangle size={13} color={C.amber} />
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Riesgos de ejecución</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.riesgosEjecucion.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: C.amberSoft, color: C.amber,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, flexShrink: 0,
                }}>!</div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón PDF */}
      <button onClick={handleDownload} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%',
        padding: '14px 20px',
        background: C.text, color: 'white',
        border: 'none', borderRadius: 10,
        fontSize: 12.5, fontWeight: 800, letterSpacing: 0.3,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(17,24,39,0.18)',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; }}
        onMouseLeave={e => { e.currentTarget.style.background = C.text; }}
      >
        <Download size={14} />
        Descargar plan completo en PDF
        <FileText size={14} style={{ opacity: 0.6 }} />
      </button>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div style={{ background: C.card, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: accent || C.text, letterSpacing: '-0.4px' }}>{value}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  RISK CARD (expandible)                                             */
/* ────────────────────────────────────────────────────────────────── */
function RiskCard({ risk, plan, expanded, onToggle }) {
  const nivelStyle = (n) => {
    if (n === 'CRÍTICO') return { bg: C.redSoft, border: C.red, text: C.red };
    if (n === 'ALTO')    return { bg: C.amberSoft, border: C.amber, text: C.amber };
    return { bg: C.surface, border: C.borderLight, text: C.textMuted };
  };
  const ns = nivelStyle(risk.nivel);
  const tonoColor = (tono) => tono === 'red' ? C.red : tono === 'amber' ? C.amber : C.text;
  const AgentIcon = plan ? (AGENT_ICONS[plan.agentId] || Sparkles) : null;
  const palette = plan ? (AGENT_PALETTE[plan.agentId] || { hue: C.red }) : null;

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${ns.border}`,
      borderRadius: 12,
      background: C.card,
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <button onClick={onToggle} style={{
        width: '100%',
        padding: '16px 20px',
        background: 'transparent', border: 'none', textAlign: 'left',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: ns.text, background: ns.bg, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.6 }}>{risk.nivel}</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>Prob: <b style={{ color: C.text }}>{risk.probabilidad}</b> · Impacto: <b style={{ color: C.text }}>{risk.impacto}</b></span>
              {plan && AgentIcon && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 9, fontWeight: 800, color: palette.hue,
                  background: `${palette.hue}15`,
                  padding: '3px 7px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase',
                  border: `1px solid ${palette.hue}30`,
                }}>
                  <AgentIcon size={10} />
                  Agente: {plan.agentId}
                </span>
              )}
              {plan && (
                <span style={{
                  fontSize: 9, fontWeight: 800, color: C.green,
                  background: C.greenSoft, padding: '3px 7px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase',
                }}>ROI {plan.roiProyectado.toFixed(1)}× · {plan.acciones.length} acciones</span>
              )}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 6, lineHeight: 1.3, color: C.text }}>{risk.titulo}</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55 }}>{risk.desc}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: ns.text, lineHeight: 1 }}>{risk.severity}</div>
              <div style={{ fontSize: 8.5, color: C.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>severity</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: expanded ? ns.bg : C.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {expanded ? <ChevronDown size={16} color={ns.text} /> : <ChevronRight size={16} color={C.textMuted} />}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {risk.metricas.map((m, j) => (
            <div key={j} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 100,
            }}>
              <div style={{ fontSize: 8.5, color: C.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: tonoColor(m.tono) }}>{m.valor}</div>
            </div>
          ))}
          {!expanded && plan && (
            <div style={{
              marginLeft: 'auto',
              fontSize: 10, color: palette.hue, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 0',
            }}>
              Ver plan de mitigación
              <ChevronRight size={12} />
            </div>
          )}
        </div>
      </button>
      {expanded && plan && <PlanDetail plan={plan} />}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  MODAL PRINCIPAL                                                    */
/* ────────────────────────────────────────────────────────────────── */
export default function RiskPlanModal({ onClose, periodoLabel, riesgoData }) {
  const [generated, setGenerated] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => setGenerated(true), 700);
    return () => clearTimeout(t);
  }, []);

  // Mapear cada riesgo del array existente con su plan
  const enriched = useMemo(() => {
    return riesgoData.map((r, idx) => {
      // Match por título
      const plan = findPlanByTitle(r.titulo) || RISK_PLANS[idx % RISK_PLANS.length];
      return { ...r, idx, plan };
    });
  }, [riesgoData]);

  const totales = useMemo(() => totalsPlan(), []);
  const probMax = Math.max(...riesgoData.map(r => r.severity));

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(17,24,39,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
      animation: 'fadeUp 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 16,
        width: '100%', maxWidth: 1200, maxHeight: '94vh',
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${C.border}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          background: `linear-gradient(135deg, ${C.red} 0%, #8b0a1f 100%)`,
          color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.20)', padding: '4px 10px', borderRadius: 5, letterSpacing: 0.6 }}>⚠ ANÁLISIS DE RIESGO</span>
              <span style={{ fontSize: 10, opacity: 0.85 }}>{periodoLabel}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9.5, fontWeight: 700, background: 'rgba(0,0,0,0.20)', padding: '4px 8px', borderRadius: 5, letterSpacing: 0.4 }}>
                <Sparkles size={10} color="#facc15" />
                6 PLANES IA-ASISTIDOS
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' }}>Riesgos · Planes · Acciones · ROI</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Click en cada riesgo para ver su plan de mitigación, asignación de agente IA y descargar PDF.</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: 'inherit', position: 'relative',
          }}><X size={18} /></button>
        </div>

        {!generated ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: C.red, animation: `pulse 1.4s ease infinite ${d}s` }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
              Cargando planes · cruzando con agentes IA · calculando ROI…
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Resumen ejecutivo */}
            <div style={{
              padding: '20px 28px',
              background: 'linear-gradient(180deg, #fafafa 0%, white 100%)',
              borderBottom: `1px solid ${C.border}`,
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16,
            }}>
              <SummaryStat label="Score riesgo" value={`${probMax}/100`} accent={C.red} sub="Alto — requiere acción" />
              <SummaryStat label="Exposición total" value={fmtMXN(totales.exposure)} accent={C.text} sub="escenario adverso" />
              <SummaryStat label="Inversión planes" value={fmtMXN(totales.inversion)} accent={C.text} sub={`${totales.acciones} acciones`} />
              <SummaryStat label="ROI promedio" value={`${totales.roiPromedio.toFixed(1)}×`} accent={C.green} sub="ponderado" />
              <SummaryStat label="Agentes IA" value="6 / 6" accent={C.blue} sub="asistiendo planes" />
            </div>

            {/* Cards de riesgo */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enriched.map((r, i) => (
                <RiskCard key={i}
                  risk={r}
                  plan={r.plan}
                  expanded={expandedId === i}
                  onToggle={() => setExpandedId(expandedId === i ? null : i)}
                />
              ))}
            </div>

            {/* Bottom line */}
            <div style={{
              margin: '0 24px 24px',
              background: `linear-gradient(135deg, ${C.text} 0%, #1f2937 100%)`,
              color: 'white',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>Bottom line · ejecutivo</div>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>
                  Invirtiendo <b style={{ color: '#facc15' }}>{fmtMXN(totales.inversion)}</b> en los 6 planes ahora, BAFAR protege <b style={{ color: '#fca5a5' }}>{fmtMXN(totales.exposure)}</b> de revenue expuesto.
                  Con la asistencia de los 6 agentes IA, el ROI promedio proyectado es <b style={{ color: '#22c55e' }}>{totales.roiPromedio.toFixed(1)}×</b>.
                </div>
              </div>
              <button onClick={() => {
                // Descargar TODOS los planes (cada uno en su PDF)
                enriched.forEach(r => { if (r.plan) setTimeout(() => generateRiskPlanPDF(r.plan), 50); });
              }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#facc15', color: '#0f172a',
                border: 'none', borderRadius: 10,
                padding: '12px 18px', fontSize: 12, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>
                <Download size={14} />
                Descargar los 6 PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent, sub }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: C.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: '-0.4px' }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}
