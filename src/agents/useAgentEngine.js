import { useEffect, useReducer, useRef } from 'react';
import { AGENTS, EVENT_TEMPLATES } from './data.js';

/*
 * useAgentEngine — Motor de simulación en vivo (con sub-pasos)
 *
 * Cada agente tiene un taskPool. Cada tarea tiene una secuencia de subSteps.
 * El motor avanza el progreso del sub-paso actual de cada agente. Al llegar
 * a 1, emite un evento detallado al feed (con payload si aplica) y avanza al
 * siguiente sub-paso. Al completar todos los sub-pasos de una tarea, salta a
 * la siguiente tarea del pool.
 *
 * Diseñado para "verse real": pausas naturales en el kind=wait, payloads
 * visibles, timestamps por sub-paso.
 */

const TICK_MS = 700;

const HASH_ID = () => Math.random().toString(36).slice(2, 9);

const initState = () => ({
  heartbeat: 0,
  agents: AGENTS.map(a => ({
    ...a,
    status: 'executing',
    taskIndex: 0,
    subStepIndex: 0,
    subStepProgress: 0,
    reasoningIndex: 0,
    paused: false,
    activityLog: seedActivityLog(a),
  })),
  feed: seedFeed(),
});

function seedActivityLog(agent) {
  // Pre-poblar con 2-3 entradas viejas para que el log no esté vacío al cargar
  const now = Date.now();
  const taskHist = agent.taskPool[0]?.subSteps?.slice(0, 2) ?? [];
  return taskHist.map((s, i) => ({
    id: HASH_ID(),
    kind: s.kind,
    text: s.text,
    meta: s.meta,
    payload: s.payload,
    ts: now - (taskHist.length - i) * 24000,
    taskAliado: agent.taskPool[0]?.aliado,
  }));
}

function seedFeed() {
  const now = Date.now();
  return [
    { id: HASH_ID(), agentId: 'mercurio', tone: 'success', text: 'Test #142 ganó: lift +14% · escalando a 100% de hamburgueserías', ts: now - 12000 },
    { id: HASH_ID(), agentId: 'centinela', tone: 'success', text: '"El Tacazo MTY" reactivado · $2,400 MXN recuperados', ts: now - 28000 },
    { id: HASH_ID(), agentId: 'vega', tone: 'info', text: 'Forecast actualizado: Junio nacional $11.2M ±4%', ts: now - 41000 },
    { id: HASH_ID(), agentId: 'atlas', tone: 'info', text: 'Nuevo cluster identificado: Pachuca-Tulancingo · 38 leads', ts: now - 58000 },
    { id: HASH_ID(), agentId: 'coyote', tone: 'warn', text: 'Anomalía detectada · 7 transacciones congeladas', ts: now - 76000 },
    { id: HASH_ID(), agentId: 'socrates', tone: 'success', text: '142 aliados recibieron recomendación personalizada', ts: now - 94000 },
  ];
}

/* Tone por kind del sub-paso */
function toneForKind(kind) {
  switch (kind) {
    case 'think':   return 'info';
    case 'decide':  return 'info';
    case 'send':    return 'info';
    case 'wait':    return 'info';
    case 'receive': return 'success';
    case 'act':     return 'info';
    case 'outcome': return 'success';
    default:        return 'info';
  }
}

/* Cuánto tarda cada tipo de sub-paso (en segundos, ajustado por cycleSec del agente) */
function durationForKind(kind, cycleSec) {
  const base = cycleSec / 6; // ~6 sub-pasos por ciclo en promedio
  switch (kind) {
    case 'think':   return base * 0.8;
    case 'decide':  return base * 0.6;
    case 'send':    return base * 1.0;
    case 'wait':    return base * 1.8; // pausa larga "esperando"
    case 'receive': return base * 1.0;
    case 'act':     return base * 0.8;
    case 'outcome': return base * 1.0;
    default:        return base;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const agents = state.agents.map(a => {
        if (a.paused) return a;
        const task = a.taskPool[a.taskIndex];
        const sub = task.subSteps[a.subStepIndex];
        const dur = durationForKind(sub.kind, a.cycleSec);
        const stepPerTick = (TICK_MS / 1000) / dur;
        const nextProgress = a.subStepProgress + stepPerTick;
        const reasoningTick = (state.heartbeat % 6 === 0)
          ? (a.reasoningIndex + 1) % a.reasoning.length
          : a.reasoningIndex;
        return { ...a, subStepProgress: nextProgress, reasoningIndex: reasoningTick };
      });
      return { ...state, heartbeat: state.heartbeat + 1, agents };
    }

    case 'COMPLETE_SUBSTEP': {
      const { agentId, activityEntry, feedEvent, completedTask, valueGain } = action;
      const agents = state.agents.map(a => {
        if (a.id !== agentId) return a;
        const task = a.taskPool[a.taskIndex];
        const isLast = a.subStepIndex >= task.subSteps.length - 1;
        const nextTaskIdx = isLast ? (a.taskIndex + 1) % a.taskPool.length : a.taskIndex;
        const nextSubIdx = isLast ? 0 : a.subStepIndex + 1;
        const activityLog = [activityEntry, ...a.activityLog].slice(0, 14);
        return {
          ...a,
          activityLog,
          taskIndex: nextTaskIdx,
          subStepIndex: nextSubIdx,
          subStepProgress: 0,
          today: {
            ...a.today,
            actions: a.today.actions + (completedTask ? 1 : 0),
            success: a.today.success + ((completedTask && feedEvent?.tone === 'success') ? 1 : 0),
            valueMXN: a.today.valueMXN + (completedTask ? valueGain : 0),
          },
        };
      });
      const feed = feedEvent ? [feedEvent, ...state.feed].slice(0, 30) : state.feed;
      return { ...state, agents, feed };
    }

    case 'TOGGLE_PAUSE': {
      const agents = state.agents.map(a =>
        a.id === action.agentId ? { ...a, paused: !a.paused } : a
      );
      return { ...state, agents };
    }
    case 'PAUSE_ALL': {
      const agents = state.agents.map(a => ({ ...a, paused: action.value }));
      return { ...state, agents };
    }
    case 'CLEAR_FEED': {
      return { ...state, feed: [] };
    }
    default:
      return state;
  }
}

function pickTemplate(agentId) {
  const pool = EVENT_TEMPLATES[agentId] || [];
  return pool[Math.floor(Math.random() * pool.length)] || { tone: 'info', text: 'Ciclo completado' };
}

function fillTemplate(tpl, task) {
  const n = Math.floor(20 + Math.random() * 60);
  return tpl
    .replace('{aliado}', task?.aliado ?? 'Aliado')
    .replace('{valor}', task ? formatValor(task.valor) : '0')
    .replace('{n}', String(n));
}

function formatValor(v) {
  if (typeof v !== 'number') return '0';
  if (v >= 1000) return v.toLocaleString('es-MX');
  return v.toString();
}

export function useAgentEngine() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
      const current = stateRef.current;
      current.agents.forEach(a => {
        if (a.paused) return;
        if (a.subStepProgress >= 1) {
          const task = a.taskPool[a.taskIndex];
          const sub = task.subSteps[a.subStepIndex];
          const isLast = a.subStepIndex >= task.subSteps.length - 1;

          const activityEntry = {
            id: HASH_ID(),
            kind: sub.kind,
            text: sub.text,
            meta: sub.meta,
            payload: sub.payload,
            ts: Date.now(),
            taskAliado: task.aliado,
          };

          // Emitir evento al feed para sub-pasos clave (send, receive, outcome)
          // o cuando completa la tarea
          let feedEvent = null;
          let completedTask = false;
          let valueGain = 0;

          if (sub.kind === 'send' || sub.kind === 'receive' || sub.kind === 'outcome' || isLast) {
            const tpl = pickTemplate(a.id);
            let text;
            if (sub.kind === 'outcome' || isLast) {
              text = `${task.aliado} · ${sub.text.slice(0, 80)}`;
            } else {
              text = fillTemplate(tpl.text, task);
            }
            feedEvent = {
              id: HASH_ID(),
              agentId: a.id,
              tone: sub.kind === 'outcome' ? 'success' : (sub.kind === 'send' ? 'info' : toneForKind(sub.kind)),
              text,
              ts: Date.now(),
            };
          }

          if (isLast) {
            completedTask = true;
            const v = task.valor || 0;
            valueGain = (a.id === 'centinela') ? v
                       : (a.id === 'mercurio') ? Math.round(v * 100)
                       : (a.id === 'coyote') ? v
                       : (a.id === 'atlas') ? Math.round(v * 1000)
                       : (a.id === 'socrates') ? Math.round(v * 600)
                       : 0;
          }

          dispatch({
            type: 'COMPLETE_SUBSTEP',
            agentId: a.id,
            activityEntry,
            feedEvent,
            completedTask,
            valueGain,
          });
        }
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return {
    state,
    togglePause: (agentId) => dispatch({ type: 'TOGGLE_PAUSE', agentId }),
    pauseAll: (value) => dispatch({ type: 'PAUSE_ALL', value }),
    clearFeed: () => dispatch({ type: 'CLEAR_FEED' }),
  };
}

/* Helpers de presentación ─────────────────────────────────────────── */
export function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5) return 'ahora';
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  return `${h}h`;
}

export function formatMXN(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
