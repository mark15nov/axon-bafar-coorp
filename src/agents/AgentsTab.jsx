import React, { useState, useMemo } from 'react';
import {
  Shield, Globe2, Zap, LineChart, GraduationCap, ShieldAlert,
  Play, Pause, Activity, ChevronRight, Sparkles, Cpu, Network,
  Brain, AlertTriangle, CheckCircle2, Info, Radio, MessageCircle,
  Send, Clock, ArrowDownToLine, Mail, FileText, FlaskConical,
  ShieldCheck, TrendingUp, Users, MousePointerClick,
} from 'lucide-react';
import { AGENT_PALETTE } from './data.js';
import { timeAgo, formatMXN, formatTime } from './useAgentEngine.js';

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
  green: '#16a34a',
  amber: '#d97706',
  blue: '#2563eb',
};

const ICONS = {
  centinela: Shield,
  atlas: Globe2,
  mercurio: Zap,
  vega: LineChart,
  socrates: GraduationCap,
  coyote: ShieldAlert,
};

const TONE = {
  success: { color: C.green, bg: '#f0fdf4', icon: CheckCircle2 },
  info:    { color: C.blue,  bg: '#eff6ff', icon: Info },
  warn:    { color: C.amber, bg: '#fffbeb', icon: AlertTriangle },
};

const KIND_META = {
  think:   { label: 'PENSANDO',   icon: Brain,             color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
  decide:  { label: 'DECISIÓN',   icon: Sparkles,          color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  send:    { label: 'ENVÍO',      icon: Send,              color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  wait:    { label: 'ESPERANDO',  icon: Clock,             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  receive: { label: 'RESPUESTA',  icon: ArrowDownToLine,   color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  act:     { label: 'EJECUCIÓN',  icon: MousePointerClick, color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  outcome: { label: 'RESULTADO',  icon: TrendingUp,        color: '#22c55e', bg: 'rgba(34,197,94,0.14)' },
};

/* ────────────────────────────────────────────────────────────────── */
/*  Mission Header                                                     */
/* ────────────────────────────────────────────────────────────────── */
function MissionHeader({ state, onPauseAll }) {
  const allPaused = state.agents.every(a => a.paused);
  const totalToday = state.agents.reduce((s, a) => s + a.today.actions, 0);
  const totalValue = state.agents.reduce((s, a) => s + a.today.valueMXN, 0);
  const activeAgents = state.agents.filter(a => !a.paused).length;

  return (
    <div style={{
      background: `linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)`,
      borderRadius: 20,
      padding: '28px 32px',
      color: 'white',
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '32px 32px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 320, height: 320,
        background: 'radial-gradient(circle, rgba(230,57,70,0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#facc15" />
            </div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>BAFAR · Agent Operations Center</div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.8px', lineHeight: 1.15 }}>
            6 agentes de IA trabajando<br />por toda la red BAFAR · <span style={{ color: '#facc15' }}>24/7</span>
          </h1>
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 14, lineHeight: 1.55, maxWidth: 560 }}>
            Cada agente tiene una misión específica, decide en tiempo real y reporta su impacto al instante. Aquí ves <strong style={{ color: 'white' }}>en vivo</strong>, paso a paso, qué piensa, qué decide, qué envía y qué le contesta el mundo.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <button onClick={() => onPauseAll(!allPaused)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: allPaused ? '#facc15' : 'rgba(255,255,255,0.10)',
              color: allPaused ? '#0f172a' : 'white',
              border: `1px solid ${allPaused ? '#facc15' : 'rgba(255,255,255,0.18)'}`,
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
            {allPaused ? <Play size={14} /> : <Pause size={14} />}
            {allPaused ? 'Reanudar flota' : 'Pausar flota'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8' }}>
            <Radio size={12} color={allPaused ? '#facc15' : '#22c55e'} style={{ animation: allPaused ? 'none' : 'bf-pulse 1.6s ease-in-out infinite' }} />
            {allPaused ? 'Flota en pausa' : `${activeAgents} agentes en operación`}
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        marginTop: 24, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.10)',
      }}>
        <KpiBlock label="Agentes activos" value={`${activeAgents}/6`} accent="#22c55e" />
        <KpiBlock label="Acciones hoy" value={totalToday.toLocaleString('es-MX')} accent="#facc15" />
        <KpiBlock label="Valor generado hoy" value={formatMXN(totalValue)} accent="#e63946" />
        <KpiBlock label="Precisión promedio" value={`${Math.round(state.agents.reduce((s,a)=>s+a.accuracy,0)/state.agents.length)}%`} accent="#60a5fa" />
      </div>
    </div>
  );
}

function KpiBlock({ label, value, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span>{value}</span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 12px ${accent}`, animation: 'bf-pulse 1.6s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Agent Card                                                         */
/* ────────────────────────────────────────────────────────────────── */
function AgentCard({ agent, selected, onSelect, onTogglePause }) {
  const Icon = ICONS[agent.id];
  const palette = AGENT_PALETTE[agent.id];
  const task = agent.taskPool[agent.taskIndex];
  const sub = task.subSteps[agent.subStepIndex];
  const kindMeta = KIND_META[sub.kind];
  const progress = Math.min(1, agent.subStepProgress);
  // progreso global = % de sub-pasos completados + el actual
  const globalProgress = (agent.subStepIndex + progress) / task.subSteps.length;

  return (
    <button onClick={() => onSelect(agent.id)}
      style={{
        textAlign: 'left',
        background: C.card,
        border: `1px solid ${selected ? palette.hue : C.border}`,
        borderRadius: 14,
        padding: 16,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected ? `0 0 0 3px ${palette.glow}` : 'none',
        transition: 'all 0.18s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = C.borderLight; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: '100%', background: palette.hue, opacity: selected ? 1 : 0.4 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: palette.soft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${palette.hue}25`,
          }}>
            <Icon size={20} color={palette.hue} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>{agent.name}</div>
            <div style={{ fontSize: 10.5, color: C.textMuted, fontWeight: 600 }}>{agent.role}</div>
          </div>
        </div>

        <span onClick={(e) => { e.stopPropagation(); onTogglePause(agent.id); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 8px',
            borderRadius: 6,
            background: agent.paused ? C.surface : `${palette.hue}10`,
            color: agent.paused ? C.textMuted : palette.hue,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4,
            cursor: 'pointer', userSelect: 'none',
          }}>
          {agent.paused ? <><Pause size={9} /> Pausado</> : <><Activity size={9} /> Operando</>}
        </span>
      </div>

      {/* Estado actual */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{
            fontSize: 8.5, fontWeight: 800, color: kindMeta.color, background: kindMeta.bg,
            padding: '2px 6px', borderRadius: 4, letterSpacing: 0.6,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <kindMeta.icon size={9} />
            {kindMeta.label}
          </span>
          <span style={{ fontSize: 10, color: C.textDim }}>
            Paso {agent.subStepIndex + 1}/{task.subSteps.length}
          </span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, lineHeight: 1.35, minHeight: 32 }}>
          {sub.text}
        </div>
        <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>Sobre: {task.aliado}</div>
      </div>

      {/* Progress de la tarea (multi-sub-paso) */}
      <div style={{ position: 'relative', height: 4, borderRadius: 4, background: C.surface, overflow: 'hidden', marginBottom: 12, display: 'flex', gap: 2 }}>
        {task.subSteps.map((s, i) => {
          const isDone = i < agent.subStepIndex;
          const isCurrent = i === agent.subStepIndex;
          return (
            <div key={i} style={{ flex: 1, height: '100%', background: C.surface, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', inset: 0,
                width: isDone ? '100%' : (isCurrent ? `${progress * 100}%` : '0%'),
                background: palette.hue,
                boxShadow: isCurrent ? `0 0 8px ${palette.glow}` : 'none',
                transition: 'width 0.7s linear',
              }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <MiniKpi label="Acciones" value={agent.today.actions} />
        <MiniKpi label="Éxito" value={`${Math.round(100 * agent.today.success / Math.max(1, agent.today.actions))}%`} />
        <MiniKpi label="Valor hoy" value={formatMXN(agent.today.valueMXN)} accent={palette.hue} />
      </div>
    </button>
  );
}

function MiniKpi({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: accent || C.text, letterSpacing: '-0.3px' }}>{value}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Payload preview (lo que el agente envió/recibió)                   */
/* ────────────────────────────────────────────────────────────────── */
function PayloadPreview({ payload }) {
  if (!payload) return null;
  if (payload.type === 'whatsapp' || payload.type === 'reply') {
    const incoming = payload.type === 'reply';
    return (
      <div style={{
        background: incoming ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${incoming ? 'rgba(34,197,94,0.30)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 10, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>
          <MessageCircle size={11} color={incoming ? '#22c55e' : '#60a5fa'} />
          {incoming ? `Respuesta de ${payload.from}` : `${payload.channel}`}
          {payload.to && <span style={{ color: '#cbd5e1' }}>· {payload.to}</span>}
        </div>
        <div style={{
          background: incoming ? '#dcfce7' : 'white',
          color: '#0f172a',
          borderRadius: 12,
          padding: '10px 12px',
          fontSize: 12,
          lineHeight: 1.5,
          maxWidth: '95%',
          alignSelf: incoming ? 'flex-start' : 'flex-end',
          border: incoming ? '1px solid #86efac' : '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          whiteSpace: 'pre-wrap',
        }}>
          {payload.body}
        </div>
      </div>
    );
  }
  if (payload.type === 'crm' || payload.type === 'plan' || payload.type === 'alert' || payload.type === 'fraud' || payload.type === 'forecast' || payload.type === 'feed') {
    const Icon = payload.type === 'fraud' ? ShieldCheck : (payload.type === 'forecast' ? TrendingUp : (payload.type === 'feed' ? FileText : Mail));
    return (
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, padding: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6, marginBottom: 8 }}>
          <Icon size={11} color="#60a5fa" />
          {payload.channel}
        </div>
        <div style={{ fontSize: 11.5, color: '#e2e8f0', lineHeight: 1.55, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          {payload.body}
        </div>
      </div>
    );
  }
  if (payload.type === 'experiment') {
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6, marginBottom: 8 }}>
          <FlaskConical size={11} color="#facc15" />
          {payload.channel}
        </div>
        {payload.variants && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: 'rgba(148,163,184,0.10)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.4 }}>VARIANTE A</div>
              <div style={{ fontSize: 11.5, color: '#cbd5e1' }}>{payload.variants.A}</div>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.14)', borderRadius: 6, padding: '8px 10px', border: '1px solid rgba(34,197,94,0.4)' }}>
              <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 700, letterSpacing: 0.4 }}>VARIANTE B · GANADORA</div>
              <div style={{ fontSize: 11.5, color: 'white' }}>{payload.variants.B}</div>
            </div>
          </div>
        )}
        {payload.metrics && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(payload.metrics).map(([k, v]) => (
              <span key={k} style={{ fontSize: 10.5, color: '#cbd5e1', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 4 }}>
                <b style={{ color: 'white' }}>{v}</b> <span style={{ color: '#94a3b8' }}>{k}</span>
              </span>
            ))}
          </div>
        )}
        {payload.body && (
          <div style={{ fontSize: 11.5, color: '#cbd5e1', marginTop: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{payload.body}</div>
        )}
      </div>
    );
  }
  if (payload.type === 'leads') {
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6, marginBottom: 8 }}>
          <Users size={11} color="#60a5fa" />
          {payload.channel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {payload.leads.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 6,
              fontSize: 11,
            }}>
              <span style={{ color: l.score ? 'white' : '#94a3b8', fontWeight: l.score ? 600 : 500 }}>{l.nombre}</span>
              <span style={{ display: 'flex', gap: 8, color: '#94a3b8', fontSize: 10 }}>
                {l.ciudad && <span>{l.ciudad}</span>}
                {l.tipo && <span style={{ color: '#cbd5e1' }}>· {l.tipo}</span>}
                {l.score > 0 && <span style={{ color: '#facc15', fontWeight: 700 }}>★ {l.score}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Activity Log                                                       */
/* ────────────────────────────────────────────────────────────────── */
function ActivityLog({ agent, palette }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.30)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: 12,
      maxHeight: 280, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {agent.activityLog.length === 0 && (
        <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: 20 }}>
          Esperando primer evento…
        </div>
      )}
      {agent.activityLog.map((entry, i) => {
        const km = KIND_META[entry.kind];
        return (
          <div key={entry.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', opacity: i === 0 ? 1 : Math.max(0.45, 1 - i * 0.08), animation: i === 0 ? 'bf-slide-in 0.35s ease' : 'none' }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: km.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${km.color}40`,
            }}>
              <km.icon size={11} color={km.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: km.color, letterSpacing: 0.5 }}>{km.label}</span>
                <span style={{ fontSize: 9, color: '#64748b', fontFamily: 'ui-monospace, monospace' }}>{formatTime(entry.ts)}</span>
                {entry.taskAliado && <span style={{ fontSize: 9, color: '#94a3b8' }}>· {entry.taskAliado}</span>}
              </div>
              <div style={{ fontSize: 11.5, color: '#e2e8f0', lineHeight: 1.45 }}>{entry.text}</div>
              {entry.meta && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>{entry.meta}</div>}
              {entry.payload && i < 3 && (
                <div style={{ marginTop: 8 }}>
                  <PayloadPreview payload={entry.payload} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Agent Console (mega-view)                                          */
/* ────────────────────────────────────────────────────────────────── */
function AgentConsole({ agent }) {
  const palette = AGENT_PALETTE[agent.id];
  const Icon = ICONS[agent.id];
  const task = agent.taskPool[agent.taskIndex];
  const sub = task.subSteps[agent.subStepIndex];
  const kindMeta = KIND_META[sub.kind];

  const visibleReasoning = useMemo(() => {
    const out = [];
    const total = agent.reasoning.length;
    for (let i = 0; i <= agent.reasoningIndex; i++) {
      out.push({ idx: i, text: agent.reasoning[i % total], done: i < agent.reasoningIndex });
    }
    return out.slice(-5);
  }, [agent.reasoning, agent.reasoningIndex]);

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 16,
      padding: 24,
      color: '#e2e8f0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -100, right: -100, width: 320, height: 320,
        background: `radial-gradient(circle, ${palette.hue}55 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${palette.hue}25`,
            border: `1px solid ${palette.hue}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={22} color={palette.hue} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px' }}>{agent.name}</div>
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5 }}>{agent.codename}</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{agent.role} · Autonomía {Math.round(agent.autonomy * 100)}% · Precisión {agent.accuracy}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: agent.paused ? '#facc15' : '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: agent.paused ? '#facc15' : '#22c55e', boxShadow: `0 0 8px ${agent.paused ? '#facc15' : '#22c55e'}`, animation: agent.paused ? 'none' : 'bf-pulse 1.4s ease-in-out infinite' }} />
          {agent.paused ? 'En pausa' : 'En vivo'}
        </div>
      </div>

      {/* Tarea en curso · banner */}
      <div style={{
        position: 'relative',
        background: `${palette.hue}12`,
        border: `1px solid ${palette.hue}30`,
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: palette.hue, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: 800, marginBottom: 3 }}>Tarea en curso · paso {agent.subStepIndex + 1} de {task.subSteps.length}</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white' }}>{task.aliado}</div>
          <div style={{ fontSize: 11, color: '#cbd5e1' }}>{task.ciudad} · {task.actionLabel}</div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: kindMeta.bg, color: kindMeta.color,
          padding: '5px 9px', borderRadius: 6,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
        }}>
          <kindMeta.icon size={11} />
          {kindMeta.label}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
        {/* Razonamiento del modelo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Brain size={12} color="#94a3b8" />
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Razonamiento del modelo</div>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.30)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10.5,
            lineHeight: 1.6,
            minHeight: 160,
          }}>
            {visibleReasoning.map((r) => (
              <div key={r.idx} style={{
                color: r.done ? '#64748b' : '#e2e8f0',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                marginBottom: 4,
                opacity: r.done ? 0.5 : 1,
              }}>
                <span style={{ color: palette.hue, flexShrink: 0 }}>&gt;</span>
                <span>{r.text}{!r.done && <Caret color={palette.hue} />}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, marginBottom: 6 }}>Capacidades</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {agent.capabilities.map((cap, i) => (
                <div key={i} style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ChevronRight size={10} color={palette.hue} />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad detallada con payloads */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={12} color="#94a3b8" />
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>Actividad detallada · qué hizo, qué envió, qué le contestaron</div>
            </div>
            <div style={{ fontSize: 9.5, color: '#64748b', fontFamily: 'ui-monospace, monospace' }}>{agent.activityLog.length} eventos</div>
          </div>
          <ActivityLog agent={agent} palette={palette} />
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={11} /> Fuentes
        </div>
        {agent.dataSources.map((ds, i) => (
          <span key={i} style={{ fontSize: 10.5, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.06)' }}>
            {ds}
          </span>
        ))}
      </div>
    </div>
  );
}

function Caret({ color }) {
  return <span style={{ display: 'inline-block', width: 6, height: 11, marginLeft: 2, background: color, verticalAlign: 'baseline', animation: 'bf-blink 1s steps(2) infinite' }} />;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Live Feed                                                          */
/* ────────────────────────────────────────────────────────────────── */
function LiveFeed({ feed }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18,
      height: '100%', display: 'flex', flexDirection: 'column', minHeight: 360,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={16} color={C.text} strokeWidth={2.2} />
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' }}>Stream de acciones</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.green, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'bf-pulse 1.4s ease-in-out infinite' }} />
          en vivo
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
        {feed.map((ev) => {
          const palette = AGENT_PALETTE[ev.agentId];
          const Icon = ICONS[ev.agentId];
          const tone = TONE[ev.tone] || TONE.info;
          return (
            <div key={ev.id} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, borderRadius: 10,
              background: tone.bg, border: `1px solid ${tone.color}20`,
              animation: 'bf-slide-in 0.4s ease',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: palette.soft, border: `1px solid ${palette.hue}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={13} color={palette.hue} strokeWidth={2.4} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{ev.text}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: palette.hue, textTransform: 'capitalize' }}>{ev.agentId}</span>
                  <span>·</span>
                  <span>hace {timeAgo(ev.ts)}</span>
                </div>
              </div>
              <tone.icon size={13} color={tone.color} style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Network diagram                                                    */
/* ────────────────────────────────────────────────────────────────── */
function AgentNetwork({ state, selectedId, onSelect }) {
  const w = 520, h = 260, cx = w / 2, cy = h / 2, r = 95;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18,
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 4 }}>Red de agentes</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>Comunicación entre módulos · click para abrir consola</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 220, display: 'block' }}>
        <defs>
          <radialGradient id="hub-glow">
            <stop offset="0%" stopColor="#e63946" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="60" fill="url(#hub-glow)" />
        <circle cx={cx} cy={cy} r="26" fill="#0f172a" />
        <circle cx={cx} cy={cy} r="26" fill="none" stroke="#e63946" strokeWidth="1.2" strokeDasharray="3 3">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="22s" repeatCount="indefinite" />
        </circle>
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="9" fontWeight="800" fill="white" letterSpacing="0.5">BAFAR</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fontWeight="700" fill="#facc15" letterSpacing="0.5">AGENT HUB</text>

        {state.agents.map((a, i) => {
          const angle = (i / state.agents.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const palette = AGENT_PALETTE[a.id];
          const isSelected = selectedId === a.id;
          return (
            <g key={a.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(a.id)}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={palette.hue} strokeOpacity={a.paused ? 0.15 : 0.4} strokeWidth={isSelected ? 1.6 : 1} strokeDasharray={a.paused ? '4 4' : '0'} />
              {!a.paused && (
                <circle r="2.4" fill={palette.hue}>
                  <animate attributeName="cx" values={`${cx};${x}`} dur={`${a.cycleSec / 3}s`} repeatCount="indefinite" />
                  <animate attributeName="cy" values={`${cy};${y}`} dur={`${a.cycleSec / 3}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur={`${a.cycleSec / 3}s`} repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={isSelected ? 18 : 15} fill={palette.hue} fillOpacity={a.paused ? 0.35 : 1} />
              {isSelected && <circle cx={x} cy={y} r="22" fill="none" stroke={palette.hue} strokeWidth="1.5" strokeOpacity="0.45" />}
              <text x={x} y={y + 3} textAnchor="middle" fontSize="9" fontWeight="800" fill="white">{a.name[0]}</text>
              <text x={x} y={y + 30} textAnchor="middle" fontSize="9" fontWeight="700" fill={C.text}>{a.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  TAB principal                                                      */
/* ────────────────────────────────────────────────────────────────── */
export default function AgentsTab({ engine }) {
  const { state, togglePause, pauseAll } = engine;
  const [selectedId, setSelectedId] = useState('centinela');
  const selected = state.agents.find(a => a.id === selectedId) || state.agents[0];

  return (
    <div className="bf-fade-up">
      <MissionHeader state={state} onPauseAll={pauseAll} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
        {state.agents.map(a => (
          <AgentCard key={a.id} agent={a} selected={selectedId === a.id} onSelect={setSelectedId} onTogglePause={togglePause} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14, marginBottom: 18 }}>
        <AgentConsole agent={selected} />
        <LiveFeed feed={state.feed} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <AgentNetwork state={state} selectedId={selectedId} onSelect={setSelectedId} />
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 4 }}>Cómo lo va a usar Dirección</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 14 }}>Esto es lo que cambia operativamente cuando los agentes están vivos:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { num: '1', title: 'Decisiones que antes tomaban semanas, ahora en minutos', desc: 'Cada agente prioriza sin esperar reunión.' },
              { num: '2', title: 'Cero aliado abandonado en silencio', desc: 'Centinela detecta y actúa antes del día 30.' },
              { num: '3', title: 'Precios y promos se auto-optimizan', desc: 'Mercurio corre el experimento, escala el ganador, descarta el perdedor.' },
              { num: '4', title: 'Supply chain se ajusta solo', desc: 'Vega avisa a planta con 8 semanas de anticipación.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: '#fef2f3', color: C.red,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>{item.num}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
