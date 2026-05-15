import React from 'react';
import { Sparkles } from 'lucide-react';
import { AGENT_PALETTE } from './data.js';

/*
 * AgentBadge — indicador always-on en el header
 * Click para saltar al tab de Agentes.
 */
export function AgentBadge({ state, onClick }) {
  const active = state.agents.filter(a => !a.paused).length;
  const total = state.agents.length;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 10,
      padding: '6px 10px 6px 8px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: 'rgba(250,204,21,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={12} color="#facc15" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Agentes IA</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
          {active}/{total}
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'bf-pulse 1.4s ease-in-out infinite' }} />
        </span>
      </div>
      {/* Mini orbit */}
      <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
        {state.agents.slice(0, 6).map(a => {
          const p = AGENT_PALETTE[a.id];
          return <span key={a.id} title={a.name} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: p.hue,
            opacity: a.paused ? 0.3 : 1,
            boxShadow: a.paused ? 'none' : `0 0 4px ${p.hue}`,
          }} />;
        })}
      </div>
    </button>
  );
}

/*
 * AgentInsightCard — tarjeta embebible en otros tabs.
 * Recibe state del engine, agentId y muestra el último evento + acción siguiente.
 */
export function AgentInsightCard({ state, agentId, label }) {
  const agent = state.agents.find(a => a.id === agentId);
  if (!agent) return null;
  const palette = AGENT_PALETTE[agentId];
  const task = agent.taskPool[agent.taskIndex];
  const recent = state.feed.find(e => e.agentId === agentId);

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${palette.hue}30`,
      borderLeft: `3px solid ${palette.hue}`,
      borderRadius: 10,
      padding: '12px 14px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 120, height: 120,
        background: `radial-gradient(circle, ${palette.hue}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: palette.hue, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Agente {agent.name}
            </span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'bf-pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600 }}>en vivo</span>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', lineHeight: 1.35 }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
            {recent?.text || task.step}
          </div>
        </div>
        <div style={{
          fontSize: 18, fontWeight: 800,
          color: palette.hue, letterSpacing: '-0.4px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {agent.today.actions}
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>hoy</div>
        </div>
      </div>
    </div>
  );
}
