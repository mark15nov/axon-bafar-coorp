import React, { useState, useMemo, useEffect } from 'react';
import AgentsTab from './agents/AgentsTab.jsx';
import { AgentBadge, AgentInsightCard } from './agents/AgentBadge.jsx';
import { useAgentEngine } from './agents/useAgentEngine.js';
import RiskPlanModal from './risks/RiskPlanModal.jsx';

/*
 * ═══════════════════════════════════════════════════════════════
 *  BAFAR ALIADOS — COMMAND CENTER (CORPORATIVO)
 *  Dashboard ejecutivo para la dirección de Grupo BAFAR
 *  Muestra el ecosistema completo de micro PyMEs conectadas
 * ═══════════════════════════════════════════════════════════════
 */

// ── Paleta corporativa bright ──────────────────────────────────
const C = {
  bg: '#f5f6f8',
  surface: '#f3f4f6',
  card: '#ffffff',
  cardHover: '#f9fafb',
  border: '#e5e7eb',
  borderLight: '#d1d5db',
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  red: '#e63946',
  redGlow: 'rgba(230,57,70,0.10)',
  redSoft: '#fef2f3',
  green: '#16a34a',
  greenGlow: 'rgba(22,163,74,0.10)',
  greenSoft: '#f0fdf4',
  amber: '#d97706',
  amberGlow: 'rgba(217,119,6,0.10)',
  blue: '#2563eb',
  blueGlow: 'rgba(37,99,235,0.10)',
  accent: '#e63946',
};

// ── Datos simulados ────────────────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
// 2026: Ene-May reales (alineados a DATOS_PERIODO), Jun-Dic proyectados
const VENTAS_MENSUALES = [7.8, 8.9, 9.8, 10.2, 10.4, 10.8, 11.2, 11.6, 11.9, 12.3, 12.6, 13.0];
const ALIADOS_MENSUALES = [2410, 2580, 2780, 2960, 3247, 3420, 3580, 3740, 3890, 4040, 4180, 4320];
const RETENCION_MENSUAL = [88, 89, 90, 91, 92, 92, 92, 93, 93, 93, 94, 94];

// ── Periodos seleccionables (Ene-May 2026 + YTD) ───────────────
const PERIODOS = [
  { id: 'ene', label: 'Enero',    short: 'Ene', mesIdx: 0 },
  { id: 'feb', label: 'Febrero',  short: 'Feb', mesIdx: 1 },
  { id: 'mar', label: 'Marzo',    short: 'Mar', mesIdx: 2 },
  { id: 'abr', label: 'Abril',    short: 'Abr', mesIdx: 3 },
  { id: 'may', label: 'Mayo',     short: 'May', mesIdx: 4, current: true },
  { id: 'ytd', label: 'YTD 2026', short: 'YTD', mesIdx: null },
];

// Datos por periodo: ventas en M MXN del mes, puntos en M emitidos del mes,
// vsMA = % vs mismo mes año anterior
const DATOS_PERIODO = {
  ene: { aliados: 2410, ventas: 7.8,  pedidos: 8200,  ticket: 1980, retencion: 88, puntos: 1.62,
         vsMA: { aliados: 22, ventas: 19, pedidos: 12, ticket: 4,  retencion: 8,  puntos: 28 },
         nuevosAliados: 280, frecuencia: 3.4, conversion: 28, npsAliados: 54,
         activos: 2148, riesgo: 142, inactivos: 120, ventaAnterior: 4.0 },
  feb: { aliados: 2580, ventas: 8.9,  pedidos: 9100,  ticket: 2050, retencion: 89, puntos: 1.85,
         vsMA: { aliados: 25, ventas: 22, pedidos: 14, ticket: 5,  retencion: 10, puntos: 31 },
         nuevosAliados: 310, frecuencia: 3.5, conversion: 30, npsAliados: 62,
         activos: 2305, riesgo: 155, inactivos: 120, ventaAnterior: 4.3 },
  mar: { aliados: 2780, ventas: 9.8,  pedidos: 10200, ticket: 2150, retencion: 90, puntos: 2.18,
         vsMA: { aliados: 27, ventas: 26, pedidos: 16, ticket: 6,  retencion: 11, puntos: 34 },
         nuevosAliados: 345, frecuencia: 3.6, conversion: 31, npsAliados: 71,
         activos: 2495, riesgo: 168, inactivos: 117, ventaAnterior: 4.6 },
  abr: { aliados: 2960, ventas: 10.2, pedidos: 11400, ticket: 2240, retencion: 91, puntos: 2.51,
         vsMA: { aliados: 28, ventas: 30, pedidos: 17, ticket: 7,  retencion: 12, puntos: 37 },
         nuevosAliados: 380, frecuencia: 3.7, conversion: 33, npsAliados: 79,
         activos: 2660, riesgo: 170, inactivos: 130, ventaAnterior: 4.7 },
  may: { aliados: 3247, ventas: 10.4, pedidos: 12840, ticket: 2340, retencion: 92, puntos: 2.84,
         vsMA: { aliados: 28, ventas: 34, pedidos: 19, ticket: 8,  retencion: 14, puntos: 41 },
         nuevosAliados: 410, frecuencia: 3.8, conversion: 34, npsAliados: 87,
         activos: 2890, riesgo: 173, inactivos: 184, ventaAnterior: 4.2 },
  ytd: { aliados: 3247, ventas: 47.1, pedidos: 51740, ticket: 2176, retencion: 90, puntos: 11.0,
         vsMA: { aliados: 28, ventas: 28, pedidos: 16, ticket: 6,  retencion: 11, puntos: 34 },
         nuevosAliados: 1725, frecuencia: 3.6, conversion: 31, npsAliados: 71,
         activos: 2890, riesgo: 173, inactivos: 184, ventaAnterior: 21.8 },
};

// Factor de escala vs Mayo (mes pico) — para escalar breakdowns proporcionalmente
const SCALE = (periodId) => DATOS_PERIODO[periodId].ventas / DATOS_PERIODO.may.ventas;

// Marcas con estacionalidad por mes (seasonal) y delta vs. MA variable
const MARCAS = [
  { nombre: 'BAFAR Carnes', ventas: 38.2, color: C.red,
    seasonal: { ene: 1.04, feb: 1.02, mar: 0.99, abr: 0.98, may: 1.00, ytd: 1.01 },
    deltas:   { ene: 11,   feb: 13,   mar: 14,   abr: 15,   may: 16,   ytd: 14 } },
  { nombre: 'SABORI',       ventas: 22.8, color: C.amber,
    seasonal: { ene: 0.88, feb: 0.93, mar: 1.00, abr: 1.06, may: 1.10, ytd: 1.00 },
    deltas:   { ene: 16,   feb: 19,   mar: 22,   abr: 24,   may: 26,   ytd: 22 } },
  { nombre: 'BURR',         ventas: 18.4, color: C.blue,
    seasonal: { ene: 0.94, feb: 0.96, mar: 1.00, abr: 1.04, may: 1.06, ytd: 1.00 },
    deltas:   { ene: 4,    feb: 6,    mar: 8,    abr: 10,   may: 11,   ytd: 8 } },
  { nombre: 'MONTECILLO',   ventas: 16.9, color: C.green,
    seasonal: { ene: 0.96, feb: 0.98, mar: 1.00, abr: 1.02, may: 1.04, ytd: 1.00 },
    deltas:   { ene: 14,   feb: 16,   mar: 18,   abr: 19,   may: 20,   ytd: 18 } },
  { nombre: 'LA CHONA',     ventas: 13.2, color: '#a78bfa',
    seasonal: { ene: 1.12, feb: 1.06, mar: 1.00, abr: 0.95, may: 0.88, ytd: 1.00 },
    deltas:   { ene: 9,    feb: 7,    mar: 5,    abr: 3,    may: 2,    ytd: 5 } },
  { nombre: 'CAPERUCITA',   ventas: 10.5, color: '#f472b6',
    seasonal: { ene: 0.78, feb: 0.88, mar: 1.00, abr: 1.12, may: 1.22, ytd: 1.00 },
    deltas:   { ene: 6,    feb: 9,    mar: 12,   abr: 16,   may: 19,   ytd: 12 } },
];

const REGIONES = [
  { nombre: 'Chihuahua', aliados: 820, ventas: 28.4, vsMA: 18 },
  { nombre: 'Monterrey', aliados: 640, ventas: 22.1, vsMA: 32 },
  { nombre: 'CDMX', aliados: 510, ventas: 18.6, vsMA: 45 },
  { nombre: 'Guadalajara', aliados: 380, ventas: 14.2, vsMA: 28 },
  { nombre: 'Hermosillo', aliados: 320, ventas: 11.8, vsMA: 15 },
  { nombre: 'Tijuana', aliados: 286, ventas: 10.4, vsMA: 22 },
  { nombre: 'Puebla', aliados: 248, ventas: 8.9, vsMA: 19 },
  { nombre: 'León', aliados: 215, ventas: 7.6, vsMA: 24 },
  { nombre: 'Querétaro', aliados: 198, ventas: 6.8, vsMA: 31 },
  { nombre: 'Mérida', aliados: 176, ventas: 6.2, vsMA: 27 },
];

// 32 estados de la República Mexicana — cartograma (col, row)
// aliados = socios activos al cierre de Mayo 2026 (suma ≈ 3,247)
// vsMA / vsMA_aliados = % vs mismo mes año anterior
const ESTADOS_MX = [
  { abbr: 'BC',   nombre: 'Baja California',     ventas: 12.4, vsMA: 22, aliados: 198, vsMA_aliados: 24, col: 0, row: 1 },
  { abbr: 'BCS',  nombre: 'Baja California Sur', ventas: 3.2,  vsMA: 8,  aliados: 32,  vsMA_aliados: 12, col: 0, row: 3 },
  { abbr: 'SON',  nombre: 'Sonora',              ventas: 11.8, vsMA: 15, aliados: 168, vsMA_aliados: 18, col: 1, row: 1 },
  { abbr: 'CHIH', nombre: 'Chihuahua',           ventas: 28.4, vsMA: 18, aliados: 612, vsMA_aliados: 16, col: 2, row: 1 },
  { abbr: 'COAH', nombre: 'Coahuila',            ventas: 9.4,  vsMA: 25, aliados: 124, vsMA_aliados: 28, col: 3, row: 1 },
  { abbr: 'NL',   nombre: 'Nuevo León',          ventas: 22.1, vsMA: 32, aliados: 388, vsMA_aliados: 34, col: 4, row: 1 },
  { abbr: 'TAM',  nombre: 'Tamaulipas',          ventas: 6.8,  vsMA: 14, aliados: 82,  vsMA_aliados: 16, col: 5, row: 1 },
  { abbr: 'SIN',  nombre: 'Sinaloa',             ventas: 7.2,  vsMA: 19, aliados: 96,  vsMA_aliados: 21, col: 1, row: 2 },
  { abbr: 'DGO',  nombre: 'Durango',             ventas: 4.8,  vsMA: 12, aliados: 52,  vsMA_aliados: 14, col: 2, row: 2 },
  { abbr: 'ZAC',  nombre: 'Zacatecas',           ventas: 3.4,  vsMA: 9,  aliados: 36,  vsMA_aliados: 11, col: 3, row: 2 },
  { abbr: 'SLP',  nombre: 'San Luis Potosí',     ventas: 5.6,  vsMA: 16, aliados: 64,  vsMA_aliados: 18, col: 4, row: 2 },
  { abbr: 'NAY',  nombre: 'Nayarit',             ventas: 2.8,  vsMA: 11, aliados: 28,  vsMA_aliados: 13, col: 1, row: 3 },
  { abbr: 'JAL',  nombre: 'Jalisco',             ventas: 14.2, vsMA: 28, aliados: 248, vsMA_aliados: 30, col: 2, row: 3 },
  { abbr: 'AGS',  nombre: 'Aguascalientes',      ventas: 3.6,  vsMA: 14, aliados: 38,  vsMA_aliados: 16, col: 3, row: 3 },
  { abbr: 'GTO',  nombre: 'Guanajuato',          ventas: 8.4,  vsMA: 22, aliados: 118, vsMA_aliados: 24, col: 4, row: 3 },
  { abbr: 'QRO',  nombre: 'Querétaro',           ventas: 6.8,  vsMA: 31, aliados: 78,  vsMA_aliados: 33, col: 5, row: 3 },
  { abbr: 'HGO',  nombre: 'Hidalgo',             ventas: 3.1,  vsMA: 13, aliados: 34,  vsMA_aliados: 15, col: 6, row: 3 },
  { abbr: 'COL',  nombre: 'Colima',              ventas: 1.8,  vsMA: 9,  aliados: 18,  vsMA_aliados: 11, col: 1, row: 4 },
  { abbr: 'MICH', nombre: 'Michoacán',           ventas: 4.6,  vsMA: 11, aliados: 56,  vsMA_aliados: 13, col: 2, row: 4 },
  { abbr: 'MEX',  nombre: 'Estado de México',    ventas: 16.4, vsMA: 38, aliados: 220, vsMA_aliados: 40, col: 3, row: 4 },
  { abbr: 'CDMX', nombre: 'Ciudad de México',    ventas: 18.6, vsMA: 45, aliados: 358, vsMA_aliados: 47, col: 4, row: 4 },
  { abbr: 'TLAX', nombre: 'Tlaxcala',            ventas: 1.4,  vsMA: 8,  aliados: 14,  vsMA_aliados: 10, col: 5, row: 4 },
  { abbr: 'PUE',  nombre: 'Puebla',              ventas: 8.9,  vsMA: 19, aliados: 96,  vsMA_aliados: 21, col: 6, row: 4 },
  { abbr: 'VER',  nombre: 'Veracruz',            ventas: 5.4,  vsMA: 16, aliados: 64,  vsMA_aliados: 18, col: 7, row: 4 },
  { abbr: 'GRO',  nombre: 'Guerrero',            ventas: 2.6,  vsMA: 9,  aliados: 24,  vsMA_aliados: 11, col: 3, row: 5 },
  { abbr: 'MOR',  nombre: 'Morelos',             ventas: 2.2,  vsMA: 13, aliados: 22,  vsMA_aliados: 15, col: 4, row: 5 },
  { abbr: 'OAX',  nombre: 'Oaxaca',              ventas: 3.8,  vsMA: 12, aliados: 38,  vsMA_aliados: 14, col: 5, row: 5 },
  { abbr: 'TAB',  nombre: 'Tabasco',             ventas: 2.4,  vsMA: 14, aliados: 24,  vsMA_aliados: 16, col: 7, row: 5 },
  { abbr: 'CHIS', nombre: 'Chiapas',             ventas: 3.2,  vsMA: 11, aliados: 30,  vsMA_aliados: 13, col: 6, row: 6 },
  { abbr: 'CAMP', nombre: 'Campeche',            ventas: 1.6,  vsMA: 8,  aliados: 14,  vsMA_aliados: 10, col: 8, row: 5 },
  { abbr: 'YUC',  nombre: 'Yucatán',             ventas: 4.2,  vsMA: 17, aliados: 52,  vsMA_aliados: 19, col: 9, row: 4 },
  { abbr: 'QROO', nombre: 'Quintana Roo',        ventas: 5.8,  vsMA: 24, aliados: 64,  vsMA_aliados: 26, col: 10, row: 5 },
];

// ── Cruces multidimensionales (heatmaps) ───────────────────────
const CRUCES_PRESETS = {
  'tipo-marca': {
    title: 'Tipo de restaurante × Marca',
    subtitle: 'Distribución de compras (MDP) — quién compra qué',
    unit: 'M',
    formatter: (v) => `$${v.toFixed(2)}M`,
    rows: ['Hamburgueserías', 'Pizzerías', 'Food Trucks', 'Hot dogs / Snacks', 'Cocinas / Otros'],
    cols: ['BAFAR Carnes', 'SABORI', 'BURR', 'MONTECILLO', 'LA CHONA', 'CAPERUCITA'],
    data: [
      [2.84, 0.42, 0.18, 0.32, 0.12, 0.45],
      [0.18, 1.92, 1.65, 0.08, 0.10, 0.22],
      [0.78, 0.18, 0.05, 0.42, 0.28, 0.32],
      [0.14, 0.05, 0.02, 0.08, 0.62, 0.42],
      [0.32, 0.45, 0.12, 0.48, 0.18, 0.22],
    ],
    insights: [
      { headline: 'Hamburgueserías son el motor de BAFAR Carnes', detail: '$2.84M/mes — 61% del gasto total del segmento y 28% de toda la marca' },
      { headline: 'Pizzerías concentran 88% en SABORI + BURR', detail: 'SABORI $1.92M y BURR $1.65M = $3.57M de los $4.05M totales del segmento' },
      { headline: 'LA CHONA es 100% propiedad de Hot Dogs', detail: '$620K/mes (47% del segmento) — riesgo de canibalización si esa categoría cae' },
    ],
  },
  'estado-tipo': {
    title: 'Top Estados × Tipo de restaurante',
    subtitle: 'Composición del mix por estado — socios activos',
    unit: '',
    formatter: (v) => `${Math.round(v)}`,
    rows: ['Chihuahua', 'Nuevo León', 'CDMX', 'Estado de México', 'Jalisco', 'Baja California', 'Sonora'],
    cols: ['Hamburgueserías', 'Pizzerías', 'Food Trucks', 'Hot dogs', 'Cocinas'],
    data: [
      [284, 124,  98,  68,  38],
      [168,  92,  56,  48,  24],
      [142, 118,  42,  28,  28],
      [ 92,  56,  38,  22,  12],
      [ 96,  64,  48,  24,  16],
      [ 72,  52,  36,  24,  14],
      [ 64,  38,  28,  22,  16],
    ],
    insights: [
      { headline: 'CHIH es 46% hamburgueserías (284 / 612)', detail: 'Mercado maduro de carne molida — explica liderazgo en BAFAR Carnes' },
      { headline: 'CDMX inclina a Pizzerías y Food Trucks', detail: '160 unidades (45% de la red local) — oportunidad SABORI/BURR' },
      { headline: 'NL concentra cocinas industriales', detail: 'NL tiene 1.6× más cocinas/otros que el promedio nacional' },
    ],
  },
  'tipo-antiguedad': {
    title: 'Tipo de restaurante × Antigüedad de aliado',
    subtitle: 'Madurez del aliado por segmento (meses en la red)',
    unit: '',
    formatter: (v) => `${Math.round(v)}`,
    rows: ['Hamburgueserías', 'Pizzerías', 'Food Trucks', 'Hot dogs / Snacks', 'Cocinas / Otros'],
    cols: ['<3m', '3–6m', '6–12m', '>12m'],
    data: [
      [180, 240, 380, 440],
      [ 90, 150, 220, 320],
      [120, 140, 130, 130],
      [ 60,  80, 110, 160],
      [ 38,  48,  78, 133],
    ],
    insights: [
      { headline: '70% de aliados Hamburgueserías son veteranos (>6m)', detail: 'Indicador clave de lealtad y previsibilidad de revenue' },
      { headline: 'Food Trucks tienen distribución plana — alta rotación', detail: '120 nuevos cada trimestre vs 130 veteranos → churn elevado' },
      { headline: 'Pizzerías muestran funnel sano de incorporación', detail: '+50% mes a mes en conversión a "veterano" — segmento más estable' },
    ],
  },
  'marca-tamano': {
    title: 'Marca × Tamaño de aliado',
    subtitle: '¿Qué marca prefieren los power users vs los pequeños? — MDP',
    unit: 'M',
    formatter: (v) => `$${v.toFixed(2)}M`,
    rows: ['BAFAR Carnes', 'SABORI', 'BURR', 'MONTECILLO', 'LA CHONA', 'CAPERUCITA'],
    cols: ['Pequeño <$2K', 'Medio $2-5K', 'Grande $5-10K', 'Power >$10K'],
    data: [
      [1.12, 2.84, 3.96, 2.48],
      [0.62, 1.48, 1.92, 1.18],
      [0.42, 0.96, 1.42, 0.85],
      [0.48, 1.05, 1.32, 0.75],
      [0.35, 0.62, 0.48, 0.18],
      [0.28, 0.42, 0.32, 0.12],
    ],
    insights: [
      { headline: 'Power users prefieren BAFAR Carnes 2.5× más que pequeños', detail: '$2.48M de 820 aliados power = ROI premium' },
      { headline: 'LA CHONA y CAPERUCITA pierden tracción al subir tamaño', detail: 'Power users casi no compran estas marcas — riesgo de plateau' },
      { headline: 'Segmento "Medio" es la masa crítica', detail: '$7.37M (49% del total) — foco de retención prioritario' },
    ],
  },
  'estado-marca': {
    title: 'Top Estados × Marca',
    subtitle: 'Preferencia regional de marca — MDP',
    unit: 'M',
    formatter: (v) => `$${v.toFixed(2)}M`,
    rows: ['Chihuahua', 'Nuevo León', 'CDMX', 'Estado de México', 'Jalisco', 'Baja California'],
    cols: ['BAFAR C.', 'SABORI', 'BURR', 'MONTE.', 'CHONA', 'CAPER.'],
    data: [
      [10.84, 4.62, 3.85, 4.18, 2.65, 2.26],
      [ 7.92, 4.18, 3.42, 3.10, 1.85, 1.63],
      [ 5.86, 3.92, 3.12, 2.84, 1.68, 1.18],
      [ 5.24, 3.48, 2.92, 2.45, 1.24, 1.07],
      [ 4.68, 2.94, 2.54, 1.95, 0.95, 1.14],
      [ 4.12, 2.42, 1.95, 1.78, 1.22, 0.91],
    ],
    insights: [
      { headline: 'CHIH es el único estado donde 6/6 marcas crecen >+15%', detail: 'Penetración cruzada perfecta — modelo a replicar' },
      { headline: 'LA CHONA underperforma en CDMX y JAL', detail: '8% vs 14% nacional — replanteo de portfolio urbano' },
      { headline: 'BC tiene la mejor diversificación', detail: 'Coeficiente de Gini = 0.18 (más equitativo del país)' },
    ],
  },
};

// ── Análisis de Riesgo: ¿Cómo puede fallar BAFAR Aliados? ──────
const RIESGO_DATA = [
  {
    nivel: 'CRÍTICO',
    titulo: 'Concentración geográfica',
    desc: 'CHIH + NL + CDMX generan 57.5% del revenue ($69.1M de $120M anual). Si CHIH cae 20%, la red pierde $5.7M (4.7%). Sin estrategia de diversificación regional madura.',
    metricas: [
      { label: 'Top-3 estados', valor: '57.5%', tono: 'red' },
      { label: 'Exposición CHIH', valor: '$28.4M', tono: 'red' },
      { label: 'Caída -20% CHIH', valor: '-$5.7M', tono: 'red' },
    ],
    probabilidad: 'Media',
    impacto: 'Alto',
    severity: 95,
  },
  {
    nivel: 'CRÍTICO',
    titulo: 'Dependencia de Power Users',
    desc: '820 aliados (25% de la red) generan $48.5M (40% del revenue). Pérdida del top 100 = -$12.4M anuales. El programa de retención cubre solo 38% de este segmento.',
    metricas: [
      { label: 'Power users', valor: '820', tono: 'amber' },
      { label: '% Revenue', valor: '40%', tono: 'red' },
      { label: 'Pérdida top-100', valor: '-$12.4M', tono: 'red' },
    ],
    probabilidad: 'Baja',
    impacto: 'Crítico',
    severity: 88,
  },
  {
    nivel: 'ALTO',
    titulo: 'Churn estacional acelerado',
    desc: '184 aliados inactivos (>60d) — patrón creciente desde Feb 2026 (+38% en 90 días). Probabilidad de churn estimada: 38% en próximos 60d. Costo de reposición: $2,400 × 184 = $441K.',
    metricas: [
      { label: 'Inactivos', valor: '184', tono: 'red' },
      { label: 'Δ vs Feb', valor: '+38%', tono: 'red' },
      { label: 'Costo reposición', valor: '$441K', tono: 'amber' },
    ],
    probabilidad: 'Alta',
    impacto: 'Medio',
    severity: 78,
  },
  {
    nivel: 'ALTO',
    titulo: 'Concentración de marca',
    desc: 'BAFAR Carnes = 32% de ventas ($38.2M). Bajada de 5pp en demanda → -$4.8M. Falla en supply chain de carne molida pone en riesgo 4,820 pedidos/mes (38% del volumen).',
    metricas: [
      { label: 'BAFAR Carnes', valor: '32%', tono: 'amber' },
      { label: '-5pp = pérdida', valor: '-$4.8M', tono: 'red' },
      { label: 'Pedidos en riesgo', valor: '4,820', tono: 'amber' },
    ],
    probabilidad: 'Baja',
    impacto: 'Alto',
    severity: 72,
  },
  {
    nivel: 'MEDIO',
    titulo: 'Saturación en mercado núcleo',
    desc: 'CHIH alcanzó 612 aliados — penetración estimada 78% del TAM local. Crecimiento marginal: +18% vs +45% en CDMX y +32% en NL. Costo de adquisición creciente 2.4× vs 2025.',
    metricas: [
      { label: 'Penetración CHIH', valor: '78%', tono: 'amber' },
      { label: 'Δ vs CDMX', valor: '-27pp', tono: 'amber' },
      { label: 'CAC vs 2025', valor: '×2.4', tono: 'red' },
    ],
    probabilidad: 'Alta',
    impacto: 'Medio',
    severity: 65,
  },
  {
    nivel: 'MEDIO',
    titulo: 'Adopción digital incompleta',
    desc: 'Solo 74% de aliados activos en BAFAR Academy. Los 838 no-usuarios generan 26% menos revenue por aliado ($1,720 vs $2,340). Gap de productividad estimado: $1.4M/mes no capturado.',
    metricas: [
      { label: 'Sin Academy', valor: '838', tono: 'amber' },
      { label: 'Δ ticket', valor: '-26%', tono: 'amber' },
      { label: 'Revenue no capturado', valor: '$1.4M/mes', tono: 'red' },
    ],
    probabilidad: 'Media',
    impacto: 'Medio',
    severity: 58,
  },
];

const SEGMENTOS = [
  { tipo: 'Hamburgueserías', aliados: 1240, ticketProm: 2180, retencion: 94, icon: '🍔' },
  { tipo: 'Pizzerías', aliados: 780, ticketProm: 3420, retencion: 91, icon: '🍕' },
  { tipo: 'Food Trucks', aliados: 520, ticketProm: 1650, retencion: 88, icon: '🚚' },
  { tipo: 'Hot dogs / Snacks', aliados: 410, ticketProm: 980, retencion: 85, icon: '🌭' },
  { tipo: 'Cocinas / Otros', aliados: 297, ticketProm: 2840, retencion: 90, icon: '🍳' },
];

const TOP_ALIADOS = [
  { nombre: 'Burger Lab', ciudad: 'Chihuahua', compras: 48200, puntos: 12400, meses: 11 },
  { nombre: 'Pizzería Don Memo', ciudad: 'Chihuahua', compras: 42800, puntos: 8900, meses: 10 },
  { nombre: 'El Truck Loco', ciudad: 'Monterrey', compras: 38400, puntos: 7200, meses: 8 },
  { nombre: 'Wings Factory', ciudad: 'CDMX', compras: 35600, puntos: 6800, meses: 7 },
  { nombre: 'La Parrillada', ciudad: 'Guadalajara', compras: 31200, puntos: 5400, meses: 9 },
];

const ACADEMY_STATS = [
  { video: 'Costeo de recetas en 5 min', vistas: 8420, completado: 78, categoria: 'Rentabilidad' },
  { video: 'La hamburguesa perfecta', vistas: 6840, completado: 92, categoria: 'Cocina' },
  { video: '10 reglas de marketing local', vistas: 5210, completado: 65, categoria: 'Marketing' },
  { video: 'Cómo fijar precios de menú', vistas: 4890, completado: 71, categoria: 'Rentabilidad' },
  { video: 'Pizza estilo NY paso a paso', vistas: 4120, completado: 88, categoria: 'Cocina' },
];

// ── Componente auxiliar: Mini spark line ────────────────────────
function Sparkline({ data, color = C.green, width = 80, height = 28 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length-1)/(data.length-1)*width} cy={height - ((data[data.length-1]-min)/range)*(height-4)-2} r="3" fill={color} />
    </svg>
  );
}

// ── Componente auxiliar: Barra horizontal ──────────────────────
function HBar({ pct, color, height = 6 }) {
  return (
    <div style={{ width: '100%', height, background: C.border, borderRadius: height/2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height/2, transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }} />
    </div>
  );
}

// ── Hook: animar números (tween cubic ease-out) ────────────────
function useAnimatedNumber(target, duration = 700) {
  const [value, setValue] = React.useState(target);
  React.useEffect(() => {
    let raf;
    const from = value;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

// ── Fila de marca con animación ───────────────────────────────
function MarcaRow({ m, maxVentas, top }) {
  const animVentas = useAnimatedNumber(m.ventasPeriodo);
  const animPct = useAnimatedNumber((m.ventasPeriodo / maxVentas) * 100);
  const animDelta = useAnimatedNumber(m.delta);
  return (
    <div style={{
      position: 'absolute',
      top, left: 0, right: 0,
      transition: 'top 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{m.nombre}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, width: 60, textAlign: 'right' }}>${animVentas.toFixed(1)}M</span>
          <span style={{ fontSize: 12, color: C.green, fontWeight: 700, width: 50, textAlign: 'right' }}>+{animDelta.toFixed(0)}%</span>
        </div>
      </div>
      <HBar pct={animPct} color={m.color} />
    </div>
  );
}

// ── SVG paths reales de la República Mexicana (32 estados) ────
const MX_GEO_VIEW = { w: 900, h: 540 };
const MX_GEO = {
  'CDMX': 'M544.3,381.8L545.1,384.7L547.8,386.7L548.2,389.5L547.3,393.6L545,394.3L539.1,392L536.8,388L543.3,379.5L544.3,381.8Z',
  'GRO': 'M504.9,399.8L508.1,402L506.3,405.4L507.9,406.5L507.9,408.9L508.8,408.1L509.7,409.2L509.1,411.2L511.2,412.7L517.1,408.6L517.7,406.7L519,406.3L520.6,407.7L525.4,405.4L526.7,402.7L528.5,403.4L527.8,401.4L529.6,403.2L533.3,403.2L537,410L542.9,410.1L544.9,412.7L545.2,415.9L547,416L546.7,417.6L549.8,418.2L550.2,421.2L553.8,421.6L551.7,422.5L556.4,424.5L559.6,422.9L562.1,423.2L562.3,427.1L560.4,428.9L560.6,430.8L561.3,432.8L563.6,433.4L564.9,435.4L566.1,440.9L565.1,442.4L568.3,444L567.8,446.6L573.6,448.8L570.8,451L571.9,453.3L570.9,456.4L567.4,457.8L568.3,461.1L563.1,462.2L564.4,464.9L563,466.7L558.9,468.4L552.8,461.9L549.2,462.5L534.4,458.5L528.6,458.1L519.5,452.2L490.7,442.6L486.8,438.2L475,431.8L470,425.5L464.2,423L461.5,424.4L460.6,423L460.9,418.3L465.9,417.1L469,414.9L468.5,408.1L471.4,406.3L475.1,406.4L478.8,409.5L484.8,407.9L492.2,408.5L494.6,410.6L495.8,409.4L498,409.8L502.1,413.3L503.5,411.5L499.3,408.7L498.1,400.3L499.2,399.2L500.4,401.1L502.9,398.6L504.9,399.8Z',
  'MEX': 'M523.4,361.1L527.1,363.9L532.8,363.7L534.7,368.1L533.6,371L536.6,372.5L536.2,374.5L540.8,371.4L542.8,367.7L544.9,368.8L545.9,368L545.8,369.2L546.9,366.6L548.2,367.7L548.2,369.1L546.8,369.6L548,371L546.2,372L547.5,373.6L550.2,371.3L555.6,372.4L554.9,373L557.7,374.8L554.6,380.5L556.6,383.9L555.8,386.8L556.8,395L552.3,397.3L549,393.8L547.3,393.6L547.8,386.7L545.1,384.7L543.3,379.5L542.4,381.9L541.2,381.6L540.2,384.4L537,387.3L539.1,392L538.2,397L535.1,398.9L533.3,403.2L529.6,403.2L527.8,401.4L528.5,403.4L526.7,402.7L525.4,405.4L520.6,407.7L519,406.3L517.7,406.7L517.1,408.6L511.2,412.7L509.1,411.2L509.7,409.2L508.8,408.1L507.9,408.9L507.9,406.5L506.3,405.4L508.1,402L502.9,398.6L504.8,397.3L505.2,395.3L508.4,393.9L511.1,385.7L514.3,383.5L512.4,377.6L512.5,376.6L515.5,375.8L515.9,372.6L517.1,372.2L515.4,367L521.6,366.7L520.2,361.9L521.7,362.5L521.9,360.7L523.4,361.1Z',
  'MOR': 'M545,394.3L545.9,393.3L549,393.8L552.3,397.3L556.7,395.2L553.4,402.6L554.4,402.7L554.7,410.6L551.8,408.6L544.9,413.7L542.9,410.1L537,410L533.3,403.2L535.1,398.9L538.2,397L538.7,392.2L545,394.3Z',
  'SIN': 'M289.6,177.4L293.3,178.3L297.1,177.5L296.1,180.9L298.5,180.9L298.4,182L299.8,181.9L302.2,184.9L302,186.9L300.1,188.1L303.4,191.2L302,193.6L306.3,200.2L308.3,201.8L314.4,201.2L315.4,202.7L318.2,201.7L320.1,202.6L322,205.5L321.5,207.6L327.9,212.1L327.8,213.2L330.4,213.7L330.2,215.6L324.9,217.5L325.3,220.6L323.8,221.4L324.9,223.8L323.9,223.7L326.2,226.1L326,231.2L331.5,236.3L331.4,237.5L333.3,237.6L337.5,241.8L339.6,246.1L341.3,246.9L340.3,248.6L342.6,252L346.8,251.6L349.4,249.7L352.5,250.6L355.5,253.8L356.7,258.6L359,259.8L358.1,261.2L360.5,262.5L357.9,262.3L357.7,264.2L359.2,266.9L359.6,272L361.8,270.4L362.9,271.9L364.8,275.6L364,276.8L366.4,279.5L366.3,283.1L373.2,284.7L370.2,288.1L371,290.2L369.6,294.5L371.9,298.2L371.1,300.4L365.9,298.2L364.8,301.4L360.2,294.9L345.1,282.1L342.3,276.4L334.7,269.3L332.4,264.1L324.2,257.1L302.3,242.1L296,232L290.1,225.7L274.5,220.6L269.3,215.8L264.5,215.4L263.1,206.9L267.4,197.9L269.7,196.2L271.7,197.4L275,194.6L278.4,194.5L279.6,192.7L277.5,192.5L278.6,190.6L283.9,189.6L283.9,188.1L290.8,179L288.7,178.7L289.6,177.4Z',
  'BC': 'M106.5,141L108,146L107.3,150.4L104,148.6L102.7,149.1L105.7,145.2L105.2,143.3L106.5,141Z M169.5,132.8L173.2,135.1L169.5,132.8Z M152.4,121.5L152.8,122.9L152.4,121.5Z M152.7,109.1L156.1,111.6L157.3,113.7L156.8,115.7L161.9,116.2L161.9,120.6L163.9,122.6L163.5,124.4L153.1,116.4L150.6,113L151.1,109.5L152.7,109.1Z M22,119.4L24.1,123.7L24.1,126.2L22.3,127.5L21.2,122.9L20,122.2L20,119.9L22,119.4Z M119.2,48L121.8,51.3L118,49.9L117.7,47.7L119.2,48Z M66.4,27.1L119.9,23.1L117.4,29.2L114,29.8L113.3,33.1L110.9,36L113,37.8L113.2,44.8L117.6,47.6L118,53L116.2,56.1L115.3,65.6L117.4,68.6L116.8,69.7L119.9,71.5L120.5,79.7L122.2,83.3L121.3,91.5L124.9,97.8L128.2,99.9L128.9,102.9L133.8,103.9L149.3,116.4L148.8,118.2L151.2,121.1L151.5,125.6L152.7,127.1L155.1,125.4L157.2,129.5L160.3,128.6L163.8,137.5L170.8,139.3L170,143.6L172.4,145.9L171.9,150.5L173,151.2L133.9,151.2L137.8,145.4L136.1,144.2L138.2,138.8L137.6,137.2L135.1,135.7L134.5,133.4L132.1,133.3L130.1,131.4L128.4,127.6L123.1,124.5L122.2,121.4L120,121.1L113.6,114.3L107.1,112.4L104.2,109.4L93.3,103.6L93.3,99.7L90.3,98.2L90.5,89.3L87.6,86.1L85,87L83.9,84.2L83.8,75.7L77.9,70.7L75.9,70.4L76.8,65.7L71.6,58.6L66.4,54.3L67.5,53.9L67.5,51.7L65.3,49.4L67.7,49.8L68.1,46.4L61.2,42.1L60.1,36.4L57.3,35.3L54.6,29.4L54.7,28.1L66.4,27.1Z',
  'SON': 'M178.7,131.4L178.7,133L177.4,132.9L177.1,131.5L178.7,131.4Z M185.8,117.9L188.3,123.7L185.4,130.9L177.9,127.4L180.5,125.5L180.8,119.5L185.8,117.9Z M121.1,49.2L123.1,49.3L121.1,49.2Z M117.4,29.2L218.9,60.7L281.8,60.8L277.9,64.3L280.5,64.5L279.4,66.1L283.8,69.6L280.6,69.7L280.6,72.4L276.9,72.3L276.6,76.9L278.8,78.2L278.6,80L284,81.8L284.3,84.2L286,84.3L284.7,85.6L285.5,87.7L287.6,89.2L285.5,88.8L285.1,101.5L287.7,102.5L287.7,104.1L284.5,104.6L285.6,106.1L284.6,106.5L284.9,110.8L282.9,111.4L284.2,115.7L282.5,116.8L282.1,119.7L283.4,120.6L282.5,121.5L283.2,127.2L284.9,130.5L286.5,131.1L289.3,141.2L282,143.9L273.2,143.8L274.3,150.7L278.8,155.6L277.6,156.4L278,158.2L281.6,159.2L282.3,162.1L284.6,163.6L286.3,169.7L284.3,171.9L286,177.4L290.8,179L283.9,188.1L283.9,189.6L278.6,190.6L277.5,192.5L279.6,192.7L278.4,194.5L275,194.6L271.7,197.4L269.7,196.2L268.2,196.8L268,192.2L263.9,187.6L254.2,186.2L248.5,176.6L240.2,174.4L235.2,170.7L231.7,169.8L231.3,157.2L233.9,155.5L225.6,152.5L223.4,154.1L224.8,153.9L224.1,155.6L221.4,152.4L219.1,152.9L216.1,151.4L208.4,141.3L201.6,138.8L200.1,135.1L195.1,130.7L196.4,129.9L189,124.9L189.3,121L187.5,119.2L187.2,115.5L182.8,114.9L183.5,111L178,104.8L175.7,99.9L173.5,99.2L173.3,92.1L170.4,89.6L170.2,85.5L164.5,78.9L163.2,74.9L164,71.1L163.1,68.2L164.1,69.9L165,67.8L163.8,64.6L149.7,60.9L149.2,56.7L143.5,53.6L140,52.6L140.7,54.5L138.8,56.4L135.4,56.4L124.4,49.8L114.7,46.2L113.2,44.8L113,37.8L110.9,36L113.3,33.1L114,29.8L117.4,29.2Z',
  'BCS': 'M253.5,255.7L251.5,255.7L249.9,249.6L253.5,255.7Z M238.4,245.4L240.2,247L238.6,248.9L237.3,246L238.4,245.4Z M237.4,243.8L238.2,244.8L237.4,243.8Z M228.9,229.8L232.5,232.3L233.8,235.9L232.2,236.3L230.3,234.1L228.7,231.9L228.9,229.8Z M229.4,224.4L228.2,225L229.4,224.4Z M227.1,213.4L227.4,216.6L226.2,215.3L227.1,213.4Z M220,213.3L220.5,214.5L219.6,214.6L220,213.3Z M219.3,203.6L219.1,206.5L218,205.6L215.4,210.7L214.7,210.3L216.1,204.4L219.3,203.6Z M191.6,171.6L192.2,173.5L190.8,171.9L191.6,171.6Z M195.3,166.6L195.3,166.6Z M107.1,154.3L107.6,155.3L107.1,154.3Z M205.7,190.4L208.7,191.5L208.2,194.3L210.2,196.3L212.2,203.4L211.2,206.4L212.7,211.8L214.8,213L217.8,218.4L220.5,218.7L223.4,228.7L229.4,235.8L230.2,237.9L228,243L229.7,250.3L233.1,254.2L237.2,255.1L239.8,254.9L238.8,251.3L241.7,250.5L243.3,253L247.8,255.5L248.4,258.5L252.7,258.2L252.9,262.3L256.2,265.3L256.5,269.3L262.5,271.9L264,276.4L262.8,281.5L250.9,290.4L249,290.5L246.7,288.5L243.7,279.2L237.9,270.9L231.8,268L220.4,257.4L214.2,253.6L205.1,249.8L201.5,251.4L191,244.7L189,242.1L190.1,241.2L188.8,238.9L185.5,238.3L189.6,227.6L191,212.3L188.5,205.9L185.4,203.6L182.7,198.9L180.2,199.2L175.3,196.9L156.5,183.8L152.7,184.1L150.9,186.4L146.7,183.8L145.5,180.9L142.9,178.9L139.4,179.1L135.9,175.3L127.7,173.6L126.2,172.2L125.7,167.3L112.3,158.9L110.1,155.4L125.8,157.4L131.5,154.9L133.9,151.2L173,151.2L172.8,155L174.7,157.9L177.6,160.7L184,163.4L188.3,171.5L187.9,172.7L195,175.8L193.5,179.4L196.4,182.4L198.6,181.2L205.6,186.6L205.7,190.4Z',
  'ZAC': 'M476.1,239.4L479.9,239.8L483.1,237.7L486.9,239L490.2,243.8L493.5,245.1L495.1,244L497.8,244.7L499.4,247.3L493.9,252.2L492.2,250.7L492.7,248.1L490.6,254.2L486.5,255.5L487.2,262L471.4,274.8L461.9,277.4L460.7,277.2L460,274.8L458.8,274.9L457.4,280.7L459.4,283.4L458.2,285.7L460,290.6L466.7,296.5L469.2,296.3L468.7,298.8L470.1,299.2L470.7,301.4L474.6,300.2L479.1,294L482.9,294.8L482.1,295.8L483.3,296.2L484.6,300.3L483.9,301.8L482.2,301.7L482,304.4L480.6,304.3L481.8,306L481.1,306.9L483.6,308.4L483.5,314.2L477.8,319.3L476.9,316.4L474.7,316.6L472,313.7L464.6,310.6L465.3,308.2L464.2,306L461.1,306.2L460.9,304.7L458.4,304L456.8,301.7L456.5,303.6L452.5,304.6L451,306.2L447.1,306.2L447.8,307.9L446.4,311.3L441.7,317.9L442.1,319.6L445,321.7L443.4,323.1L444.5,325.1L448.1,326.8L447.8,331.3L446.7,332.1L445.5,330.8L440.5,335.7L436.8,334.1L435.4,337.7L436.5,338.6L434.7,339.8L432.4,338.7L428.7,340.1L426.8,337.5L421.9,337.7L420.7,333.6L418.7,334L418.5,332.9L424.3,331.6L423.5,329.2L422.2,330.6L419.1,328.6L419.5,326.2L423,325.6L424.3,321.2L422.6,319.5L425.3,319.2L430.5,314.4L432.9,315L432.6,314.2L435.1,313.7L435.2,312.4L433.9,312.2L436,310.7L435.2,308.9L436.7,308.1L435.4,306.2L432.1,306.4L433.5,303.7L430.4,302.9L428.2,304.1L428.5,306.5L430,306L430,307.4L427,308.3L425.9,311L419.5,311.2L422.6,302.3L421.5,298.9L418.4,298.5L417.2,299L415.2,304.8L414.7,309.6L413,305.1L414.6,302.9L414.9,298.5L417.1,297.5L417.6,294.6L413.4,293.8L410.2,294L409,295.3L410.5,296L411.7,299.3L410.8,299.6L412.8,300.8L410.3,304.2L408.4,304.5L409.6,301.5L408.8,299.7L405.7,300.4L406.5,303.5L405.3,302.7L403,304.8L401.5,303.6L404.9,293L408.8,293.2L406.2,287.5L409.2,274.4L415.1,269.6L416.1,270.3L416.8,268.6L415,268.5L415.9,260.8L414.4,259.6L420.2,255.8L420.8,256.8L422.9,254.4L422.7,252.1L425.6,251.1L426.7,248.1L431.2,247.7L435.4,248.9L436.9,247.2L440.8,248.2L441.1,247.3L442.7,249.4L444.8,249.6L452.2,248.2L449.9,235.3L447,234.2L448.2,232.5L447.1,230.9L453.1,232.7L452.7,229.5L457.2,229.3L469.4,232.2L471.4,236.1L476.1,237.1L475.9,238.4L475,238.1L476.1,239.4Z',
  'DGO': 'M358.5,184.7L362.7,187.6L362.2,186.6L363.5,186.1L365.5,188.8L367.5,188.8L367,187L368.9,190.7L371,191.7L373.2,191.3L376.6,193L381,191.4L382.3,194.1L386.6,191.7L389,191.7L395.4,196.3L397.4,194.3L399.2,189.1L403.2,185.8L402.4,183.8L403.5,182.7L404.8,184.4L420.2,186L428,189.2L431,197.8L428.6,201.7L428.9,213L424.7,218.1L429,222.6L425.5,222.5L424.4,225.2L431,231.1L431.1,233.6L435.5,237.4L442,239.7L447.1,230.9L448.2,232.5L447,234.2L449.9,235.3L452.2,248.2L444.8,249.6L442.7,249.4L441.1,247.3L440.8,248.2L436.9,247.2L435.4,248.9L431.2,247.7L426.7,248.1L425.6,251.1L422.7,252.1L422.9,254.4L420.8,256.8L420.2,255.8L414.4,259.6L415.9,260.8L415,268.5L416.8,268.6L416.1,270.3L415.1,269.6L409.2,274.4L406.3,283.5L406.2,287.5L408.8,293.2L404.9,293L403.1,296.5L403.9,297.9L402.2,299.6L402.9,301.3L397.2,304.8L394.6,301.6L393.2,301.6L392.8,298.8L390.3,298.7L389.8,296.7L387.6,296.5L384.1,300.6L381.8,296.3L386.7,294.1L386.4,292.4L384.1,291.2L383.7,287.6L375,288.6L374.1,285L372.5,283.8L368.7,284.3L366.3,283.1L366.4,279.5L364,276.8L364.8,275.6L362.9,271.9L361.8,270.4L359.6,272L359.1,271L357.9,262.3L360.5,262.5L358.1,261.2L359,259.8L356.7,258.6L356.6,255.8L354.6,252.5L349.4,249.7L346.8,251.6L342.6,252L340.3,248.6L341.3,246.9L339.6,246.1L337.5,241.8L333.3,237.6L331.4,237.5L331.5,236.3L326,231.2L326.2,226.1L323.9,223.7L324.9,223.8L323.8,221.4L325.3,220.6L324.9,217.5L330.2,215.6L329.7,214.7L332.2,215.2L332.9,217.2L338.9,217.5L344.1,212.5L341.6,213.9L341.8,206.8L344.3,206.3L344.9,200L348.9,196.4L350.7,187.7L353.1,186.2L351.8,184.6L353.9,184.9L355.4,182.6L358.5,184.7Z',
  'CHIH': 'M333.1,48.5L342.3,48.5L346.3,49.9L350.7,56.7L357.9,59.9L373.1,73.6L383.6,78.3L386.6,81.5L387.6,86.3L392.3,92.1L392.4,98.9L396.2,105.6L400.5,109.3L405.3,111L406.5,113.4L409.9,115.4L416.8,116.9L418.6,119.1L423.1,119.8L426.3,122.9L428.7,122.8L429.8,124L423,134.6L421.9,133.9L412.9,152L414.3,152.4L413.9,153.6L412.5,153.2L412,155.7L413.6,155.9L412.7,156.7L414.2,158.3L414.9,163.5L414.3,169.9L415.5,170.3L417.9,177.8L415,181.2L419.1,185.8L411.1,184.4L409.7,185.4L404.8,184.4L403.5,182.7L402.4,183.8L403.2,185.8L399.2,189.1L397.4,194.3L395.4,196.3L389,191.7L386.6,191.7L382.3,194.1L381,191.4L376.6,193L373.2,191.3L371,191.7L368.9,190.7L367,187L367.5,188.8L365.5,188.8L363.5,186.1L362.2,186.6L362.7,187.6L355.4,182.6L353.9,184.9L351.8,184.6L353.1,186.2L350.7,187.7L348.9,196.4L344.9,200L344.3,206.3L341.8,206.8L341.6,213.9L344.1,212.5L338.9,217.5L332.9,217.2L332.2,215.2L329.7,214.7L330.4,213.7L327.8,213.2L327.9,212.1L321.5,207.6L322,205.5L320.1,202.6L318.2,201.7L315.4,202.7L314.4,201.2L308.3,201.8L306.3,200.2L302,193.6L303.4,191.2L300.1,188.1L302,186.9L302.2,184.9L299.8,181.9L298.4,182L298.5,180.9L296.1,180.9L297.1,177.5L293.3,178.3L289.6,177.4L288.7,178.7L286,177.4L284.3,171.9L286.3,169.7L284.6,163.6L282.3,162.1L281.6,159.2L278,158.2L277.6,156.4L278.8,155.6L274.3,150.7L273.2,143.8L282,143.9L289.3,141.2L286.5,131.1L284.9,130.5L283.2,127.2L282.5,121.5L283.4,120.6L282.1,119.7L282.5,116.8L284.2,115.7L282.9,111.4L284.9,110.8L284.6,106.5L285.6,106.1L284.5,104.6L287.7,104.1L287.7,102.5L285.1,101.5L285.5,88.8L287.6,89.2L285.5,87.7L284.7,85.6L286,84.3L284.3,84.2L284,81.8L278.6,80L278.8,78.2L276.6,76.9L276.9,72.3L280.6,72.4L280.6,69.7L283.8,69.6L279.4,66.1L280.5,64.5L277.9,64.3L278.5,63.3L280.2,63.3L281.8,60.8L296.7,60.7L296.7,48.5L333.1,48.5Z',
  'COL': 'M119.7,412.9L120.8,412.9L119,413.7L119.7,412.9Z M221.2,399.6L223.1,401.3L222.2,403.4L219.5,401L221.2,399.6Z M421.3,381.7L424.9,386.4L423.9,392.5L424.8,396.5L422.6,399L421.3,398.5L420.8,401.5L418.1,404.2L411.7,399.3L401.9,395L402.6,393.3L401.4,392.5L399,393.2L392.2,390.8L394.9,391.5L396.8,388.5L397.6,389.3L400.1,387.7L407.6,386.9L409.3,382.1L415.8,384.4L421.3,381.7Z',
  'NAY': 'M350.5,331.3L349.8,332.5L349.1,331.8L350.5,331.3Z M344.9,327.9L346.9,328.8L346.2,329.9L343.2,328.6L344.9,327.9Z M338.9,322.5L342.1,323.4L342.2,326.4L339.5,324.9L338.9,322.5Z M338.4,320.2L338.8,321.3L338.4,320.2Z M383.7,287.6L384.1,291.2L386.4,292.4L386.7,294.1L381.8,296.3L384.1,300.6L387.6,296.5L389.8,296.7L390.3,298.7L392.8,298.8L393.2,301.6L394.6,301.6L397.2,304.8L400.9,302.7L403,304.2L401.1,314.8L405.7,314.5L405.6,318.2L407.4,319.8L413.1,320.4L413.9,322.3L413,325.3L418.5,329.7L415.9,334.5L405,336.5L404.4,340.7L405.4,342.4L403,345.4L401.1,345.6L400.8,347.1L403.3,347.2L404,352L403.2,349.8L396.2,343.7L392.5,342.8L391.1,340.9L388.3,340.8L384.7,343.7L381.4,343.4L376.2,350.2L373.9,347.7L373,348.5L369.7,347.5L375.3,340.3L377.3,339.9L377.3,331.5L378.7,329.2L377.4,327L371.7,324.1L366.5,314.8L365.8,306.2L363.2,299.5L364.8,301.4L365.9,298.2L369.3,300.1L371.8,299.9L369.6,293.1L371,290.2L370.2,288.1L372.7,286.3L372.6,285L374.1,285L375,288.6L383.7,287.6Z',
  'MICH': 'M466.7,359.1L467.6,363.2L469.7,362.3L473.6,363.2L475.4,360.2L479.9,359.6L480,361.1L482.6,361.7L482.5,363.1L481,363L481.5,367.2L486.9,368.2L487.7,365.8L488.8,366.8L492.1,366.2L493.2,368.3L492.3,369.7L496.9,370.2L497.2,369L499.3,370.8L503.2,368.8L505.2,369.4L505,370.5L509.7,368.7L509.2,364.9L510.8,361.6L510,360.6L514.6,362.9L513.1,364.5L516.4,368.3L516,370.7L517.1,372.2L515.9,372.6L515.5,375.8L512.5,376.6L514.3,383.5L511.1,385.7L508.4,393.9L505.2,395.3L504.8,397.3L500.4,401.1L499.2,399.2L498.1,400.3L499.3,408.7L503.5,411.5L502.1,413.3L498,409.8L495.8,409.4L494.6,410.6L492.2,408.5L484.8,407.9L478.8,409.5L475.1,406.4L471.4,406.3L468.5,408.1L469,414.9L465.9,417.1L460.9,418.3L460.2,421.1L461.5,424.4L460,425L424.8,413.8L418.1,404.2L420.8,401.5L420.7,399.2L422.6,399L425,396.1L429.1,396.3L432,394.9L434.7,397.5L438.3,394.1L437.6,392L444.8,388.6L447,389.8L450.5,383.8L449.4,381.2L445.8,382L445.8,379.3L443.7,377.6L443,374.5L445,373.5L445.4,371.2L439.4,368.5L437.7,369.5L436.7,368.5L437.2,364.7L441.5,364.1L443.1,365.6L443,364.7L446.8,363.8L446.8,362.3L448.7,361.1L453.5,359.2L462.6,358L466.7,359.1Z',
  'JAL': 'M413,305.1L414.7,309.6L415.2,304.8L417.2,299L418.4,298.5L421.5,298.9L422.6,302.3L419.5,311.2L425.9,311L427,308.3L430,307.4L430,306L428.5,306.5L428.2,304.1L430.4,302.9L433.5,303.7L432.1,306.4L435.4,306.2L436.7,308.1L435.2,308.9L436,310.7L433.9,312.2L435.2,312.4L435.1,313.7L432.6,314.2L432.9,315L430.5,314.4L425.3,319.2L422.6,319.5L424.3,321.2L423,325.6L419.3,326.9L419.1,328.6L422.2,330.6L423.5,329.2L424.3,331.6L420.1,332.1L418.5,332.9L418.7,334L420.7,333.6L421.9,337.7L426.8,337.5L428.7,340.1L432.4,338.7L436.1,339.3L435.4,337.7L436.8,334.1L440.5,335.7L445.5,330.8L446.7,332.1L447.8,331.3L448.1,326.8L444.5,325.1L443.4,323.1L446.5,320.9L450.2,321.1L456.4,324.4L461.4,322.1L464.2,318.1L469.7,316.6L468,315.3L469,313.3L472,313.7L474.7,316.6L476.9,316.4L478.5,319.6L476.5,320.1L477.3,321.3L475,326.9L476.9,329.9L474,330.6L474.9,333.2L471.5,334.3L470.2,338.4L468.7,338.7L467,342.5L463.1,345.9L463.5,348.4L466.6,352L462.6,358L453.5,359.2L448.7,361.1L446.8,362.3L446.8,363.8L443,364.7L443.1,365.6L441.5,364.1L437.2,364.7L436.7,368.5L437.7,369.5L439.4,368.5L445.4,371.2L445,373.5L443,374.5L443.7,377.6L445.8,379.3L445.8,382L449.4,381.2L450.5,383.8L447,389.8L444.8,388.6L437.6,392L438.3,394.1L434.7,397.5L432,394.9L424.8,396.5L423.9,392.5L424.9,386.4L421.3,381.7L415.8,384.4L409.3,382.1L407.6,386.9L400.1,387.7L397.6,389.3L396.8,388.5L394.9,391.5L389,389.2L389.5,387.9L388.5,387.2L387,387.8L382.9,385L381.4,380.4L376.7,377.1L370.1,368.1L368.6,362.1L364.9,357.3L367.1,355.6L376.8,353.3L377.5,351.6L376.2,350.2L379.1,347.6L380,344.5L382.5,343.1L384.7,343.7L388.3,340.8L391.1,340.9L392.5,342.8L396.2,343.7L403.2,349.8L404,352L403.3,347.2L400.8,347.1L401.1,345.6L403,345.4L405.4,342.4L404.4,340.7L405,336.5L415.9,334.5L418.5,329.7L413,325.3L413.9,322.3L413.1,320.4L407.4,319.8L405.6,318.2L405.7,314.5L401.1,314.8L401,311.1L403,304.8L405.3,302.7L406.5,303.5L405.7,300.4L408.8,299.7L409.6,301.5L408.4,304.5L412,302.4L412.8,300.8L410.8,299.6L411.7,299.3L410.5,296L409,295.3L410.2,294L416.9,294.3L417.1,297.5L414.9,298.5L414.6,302.9L413,305.1Z',
  'CHIS': 'M741.8,425.4L742.7,428.8L741.6,430L746.4,433.1L745.7,437.8L752.5,439.7L753.5,441.5L752.4,441.7L752.3,444L754.4,445.5L756.4,445L756.8,447.1L760.6,449.8L762.1,452.5L764.4,453.5L765,452.7L766.1,454.8L769.2,455.3L771.8,457.4L774.1,461.4L773.5,462.9L779.6,465.5L780.3,467.8L778.7,470.2L779.1,475L744,475L731.1,497.1L735.1,502.3L732.7,504.5L731.8,508.3L732.8,513.3L730.6,516.9L700.6,488.1L690.6,480.6L681.5,476.4L679.5,472.2L681.6,469.5L678.7,464.5L686.2,445.4L688.6,443.2L691.6,442.9L694.6,439.3L696.5,434.9L699.8,431.8L699,428.9L700,429.1L700.3,424.6L702,423.2L707.1,425.8L706.5,427.6L708.5,427L709.3,428.2L708,430.3L708.4,433L711.1,436.8L714.1,436.8L714.5,438.1L713.5,438.5L715.4,438.6L716.3,440.6L722.6,434.3L727.2,433.1L727.2,430.8L729.3,431.1L732.1,428.5L733.2,429.1L734.8,426.1L737.1,424.8L738.3,426.5L741.8,425.4Z',
  'TAB': 'M727.8,410.2L732,410.3L732.4,418.5L733.8,420.2L735.6,420.1L737.7,422.3L746.6,426.2L747.3,420.1L749.9,418.1L749.9,419.2L758,423.4L764.2,423.8L764.3,443.1L752,443.1L753.5,441.5L752.5,439.7L745.7,437.8L746.4,433.1L741.6,430L742.7,428.8L741.8,425.4L738.3,426.5L737.1,424.8L734.8,426.1L733.2,429.1L732.1,428.5L729.3,431.1L727.2,430.8L727.2,433.1L722.6,434.3L716.3,440.6L715.4,438.6L713.5,438.5L714.5,438.1L714.1,436.8L711.1,436.8L708.4,433L708,430.3L709.3,428.2L708.5,427L706.5,427.6L707.1,425.8L702,423.2L700.3,424.6L700,429.1L699,428.9L699.8,431.8L696.5,434.9L693.1,441.3L690.7,439.4L692.7,435.1L688.6,431.1L683.8,429L683,426.8L680.2,426.3L680.8,423.1L678.9,417L698.9,411L712.2,410.7L716.4,408.5L718.1,405.9L724,405.1L725.5,409.5L727.8,410.2Z',
  'OAX': 'M611.1,405.6L615.7,407.2L622.2,418.3L632.7,419.2L633.6,424.1L631,430.8L636.2,435.8L642.3,433.9L648.8,429.8L650.2,432.1L647.7,433.2L653.2,439.8L658.3,441.4L657.4,444.6L686,446.2L678.7,464.5L681.6,469.5L679.7,473.3L682.5,477L667.8,471.8L651.5,471.9L646.1,474.6L643.5,477.7L634.5,479.8L621.7,485.7L613.1,486.3L605,484.2L595.3,479.1L579.5,477.4L567.7,470.6L558.9,468.4L564.4,464.9L563.1,462.2L568.3,461.1L567.4,457.8L570.9,456.4L571.9,453.3L570.8,451L573.6,448.8L567.8,446.6L568.3,444L565.1,442.4L566.1,440.9L564.9,435.4L563.6,433.4L561.3,432.8L560.6,430.8L560.4,428.9L562.3,426.4L566.7,424.7L568.2,425.8L569.7,423.6L573,422.9L576.5,425.2L578.8,425L582,422.1L580.1,420.9L578.6,423.5L578.1,422.2L579,420.9L577.6,418.7L579.4,415L583.5,415.1L583.3,417.9L585.9,421.5L588,422L589.8,419.9L596.5,417.3L599.9,418.5L601.6,416.4L604.9,416.2L607.7,412.1L609.3,412.8L609.6,409.2L608.4,408.3L609.6,404.6L611.1,405.6Z',
  'GTO': 'M486.5,319.1L488,320.7L492.9,320.8L496.9,323.2L496.3,324.5L502.9,327.5L507,326.5L507.3,323.2L512,322.6L514.7,323.6L517.9,327.1L520.7,327L521.1,328.8L525.6,327.8L525.1,331.6L526.1,333.3L528.4,333.2L527.9,334.9L524.2,337L519.9,335.4L519,340.9L517.9,340.5L517,343.1L512.4,342.1L510.5,344.3L506.7,343.2L504.4,345.9L504.6,348.4L503.4,349L506.3,352.3L506.3,356.9L510.8,361.6L509.2,364.9L509.7,368.7L505,370.5L505.2,369.4L503.5,369.3L504.4,368.7L499.3,370.8L497.2,369L496.9,370.2L493.8,369.4L493.5,370.3L492.3,369.7L493.2,368.3L492.1,366.2L488.8,366.8L487.7,365.8L486.9,368.2L481.5,367.2L481,363L482.5,363.1L482.6,361.7L480,361.1L479.9,359.6L475.4,360.2L473.6,363.2L469.7,362.3L467.6,363.2L466.7,359.1L462.6,358L466.6,352L463.5,348.4L463.1,345.9L467,342.5L468.7,338.7L470.2,338.4L471.5,334.3L474.9,333.2L474,330.6L476.9,329.9L475,326.9L477.3,321.3L476.5,320.1L482.5,318.5L486.5,319.1Z',
  'AGS': 'M458.4,304L460.9,304.7L461.1,306.2L464.2,306L465.3,308.2L464.6,310.6L468.9,313L468,315.3L469.7,316.6L464.2,318.1L461.4,322.1L456.4,324.4L450.2,321.1L448.1,320.4L445,321.7L442.1,319.6L442.4,316.1L447.8,307.9L447.1,306.2L451,306.2L452.5,304.6L456.5,303.6L456.8,301.7L458.4,304Z',
  'QRO': 'M541.6,323.1L543.2,325.1L544.2,331.4L543,332.3L545.2,333.6L545.2,336.9L540.1,338.5L538.3,337.3L536.1,338.5L536.8,340L535.7,343.2L531.8,348.4L533.1,350.5L524.2,353.7L523.4,361.1L521.9,360.7L521.7,362.5L520.2,361.9L521.6,366.7L519.6,366.3L517.5,367.6L514.1,366.4L513.1,364.5L514.6,362.9L509.1,360.1L506.3,356.9L506.3,352.3L503.4,349L504.6,348.4L504.4,345.9L506.7,343.2L510.5,344.3L512.4,342.1L517,343.1L517.9,340.5L519,340.9L519.9,335.4L524.2,337L527.9,334.9L528.4,333.2L526.1,333.3L525.1,331.6L526.4,325.6L528.8,325.8L531.7,329.6L535.4,329.6L536.5,326.4L538.4,326.8L541.6,323.1Z',
  'SLP': 'M503.2,248.9L502.4,253.7L503.7,253.7L502.9,255.1L505.5,256L504.6,264.1L507.5,268.6L506.2,271.5L507.1,273.1L506.1,272.6L505.5,275.5L507.2,277L506.5,281.7L510.5,282.6L509.4,279.8L511.2,279.9L512,278.6L513.6,278.9L513.4,280.2L516.7,280.7L516.4,283.6L519,285.3L516.5,287.6L516.6,289.2L518.4,289.2L518.8,291.8L516.8,293.4L519,294.4L522.7,293.8L524.8,296.3L528.2,295.6L532.8,297.4L531.9,293.9L533.7,294L534.7,296.1L537.8,296.9L540.4,302.9L551.6,304.5L555.6,303.1L555.3,304L558,304L565,307.5L564.7,309L562.1,310.6L560.4,315.2L558.1,315.2L560.3,316.1L559.1,316L559,317.9L561.5,320.5L556.4,324.1L559.4,327.7L560.2,330.7L555.3,332L557.6,333.3L556.5,336.3L551.5,336.9L549.9,336.4L548.2,332.8L543.9,333.1L543,332.3L544.2,331.4L543.2,325.1L541.6,323.1L538.4,326.8L536.5,326.4L535.4,329.6L533,329.9L528.8,325.8L526.4,325.6L524.5,328.7L521.1,328.8L520.7,327L517.9,327.1L514.7,323.6L512,322.6L507.3,323.2L507,326.5L502.9,327.5L496.3,324.5L496.9,323.2L492.9,320.8L488,320.7L483.7,318.6L478.9,319.3L481.3,316.6L480.7,316L483.5,314.2L483.6,308.4L481.1,306.9L481.8,306L480.6,304.3L482,304.4L482.2,301.7L483.9,301.8L484.6,300.3L483.3,296.2L482.1,295.8L482.9,294.8L479.1,294L474.6,300.2L470.7,301.4L470.1,299.2L468.7,298.8L469.2,296.3L466.7,296.5L460,290.6L458.2,285.7L459.4,283.4L457.2,278.3L458.8,274.9L460,274.8L460.7,277.2L461.9,277.4L471.4,274.8L487.2,262L486.5,255.5L490.6,254.2L492.7,248.1L492.2,250.7L493.9,252.2L500.2,246.5L503.2,248.9Z',
  'TLAX': 'M572.8,376.6L572.7,378.2L577,380L577.6,383.2L579.4,382L583.9,385.9L583.5,387.3L577.6,387.8L577.9,389.5L575.8,391.1L573,389.3L569.3,392.7L565.1,391L560.1,384L556.1,382.9L554.6,380.5L558.1,378.3L563.5,379L564.9,376L569.5,377.4L571.1,377.4L572.2,375.8L572.8,376.6Z',
  'PUE': 'M580.6,346.3L581.6,346.7L580.7,351L586.3,355.2L583.5,357.3L581.1,356.2L580.2,358.1L582.1,359.7L582.6,358.9L582.6,360.1L580.4,360.8L580.9,363.2L584.1,363.7L585.1,366.3L587.6,364.7L588.9,361.7L590.7,361.7L596.9,364.1L597.2,365.2L592.8,371.8L592.8,377.4L589.6,378.6L589.4,380.9L591.6,382.4L590.4,383.9L591.2,385.4L593.8,385.2L595.6,387.2L599.8,386.9L601.4,388L599.5,390.2L600,391.9L595.7,390.9L593.9,392.9L593.3,395.6L594.3,397.8L591.4,401.3L591.7,404.1L597.1,406.6L598.8,410.1L603.7,407.8L605.3,409.3L606.5,408.8L606.9,411.1L608.4,412L604.9,416.2L601.6,416.4L599.9,418.5L596.5,417.3L592.6,418.5L588.3,422L585.9,421.5L583.3,417.9L583.5,415.1L579.4,415L577.6,418.7L579,420.9L578.1,422.2L578.6,423.5L580.1,420.9L582,422.1L578.8,425L576.5,425.2L573,422.9L569.7,423.6L568.2,425.8L566.7,424.7L562.3,426.4L562.1,423.2L559.6,422.9L556.4,424.5L551.7,422.5L553.8,421.6L550.2,421.2L549.8,418.2L546.7,417.6L547,416L545.2,415.9L544.9,413.7L551.8,408.6L554.7,410.6L554.4,402.7L553.4,402.6L556.8,395L556.1,382.9L559.1,383.1L565.1,391L569.3,392.7L573,389.3L575.8,391.1L577.9,389.5L577.6,387.8L583.5,387.3L583.9,385.9L579.4,382L577.6,383.2L577,380L572.7,378.2L572.2,375.8L571.1,377.4L567.4,377.2L566.9,376.1L568.6,374.8L565.3,372.4L569.3,369.2L569,367.2L571.2,364.5L568.6,361.4L566.8,362.6L566.1,361.3L570.4,359.3L576.3,352.5L577.1,345.8L580.6,346.3Z',
  'HGO': 'M561.2,331L559.1,334.1L561.1,334.5L562.4,336.8L565.8,336.2L566.2,337.6L567.7,337.2L569.8,339L566.7,344.9L567.1,347L564.5,346.8L564.5,344.9L562.3,345.4L561.6,348.1L558.9,349.7L562.3,348.1L560.4,350.9L560.8,352.5L557.6,355L559,358.5L561.4,359.4L569.2,354L572,350.1L574.3,354.4L570.4,359.3L566.1,361.3L566.8,362.6L568.6,361.4L571.2,364.5L569,367.2L569.3,369.2L565.3,372.4L568.5,375.4L564.9,376L563.5,379L555.8,379.1L557.7,374.8L554.9,373L555.6,372.4L550.2,371.3L547.5,373.6L546.2,372L548,371L546.8,369.6L548.2,369.1L548.2,367.7L546.9,366.6L545.8,369.2L545.9,368L544.9,368.8L542.8,367.7L540.8,371.4L536.2,374.5L536.6,372.5L533.6,371L534.7,368.1L532.8,363.7L527.1,363.9L523.4,361.2L524.2,353.7L533.1,350.5L531.8,348.4L535.7,343.2L536.8,340L536.1,338.5L538.3,337.3L540.1,338.5L545.2,336.9L545.2,333.6L548.2,332.8L549.9,336.4L554.9,336.9L555.3,335.8L557.3,335.8L557.6,333.3L555.3,332L561.2,331Z',
  'VER': 'M574.7,305.1L573.8,306.1L576.7,308.1L579.7,307L581.8,314.9L585.7,320.4L592,326.1L589.6,335L596.1,350.2L616,372.6L620.1,386.8L624.8,390.3L626.5,393.8L629,394.2L629.8,398.2L631.9,400.1L641,403.3L650.4,403.5L654.6,407.3L660.3,408.1L667.3,418.1L678.9,417L680.8,423.1L680.2,426.3L683,426.8L683.8,429L688.6,431.1L692.7,435.1L690.7,439.4L693.1,441.3L691.6,442.9L688.6,443.2L686,446.2L657.4,444.6L658.3,441.4L653.2,439.8L647.7,433.2L650.2,432.1L648.8,429.8L639.1,435.4L636.2,435.8L633.5,433.4L634.3,432.9L631,430.8L633.6,424.1L632.7,419.2L622.2,418.3L615.7,407.2L609.6,404.6L608.4,408.3L609.6,409.2L609.3,412.8L606.9,411.1L606.5,408.8L602.3,407.7L598.8,410.1L597.1,406.6L591.7,404.1L591.4,401.3L594.3,397.8L593.3,395.6L593.9,392.9L595.7,390.9L600,391.9L599.5,390.2L601.4,388L599.8,386.9L595.6,387.2L593.8,385.2L591.2,385.4L590.4,383.9L591.6,382.4L589.4,380.9L589.6,378.6L592.8,377.4L592.8,371.8L596.9,364.1L588.9,361.7L587.6,364.7L585.1,366.3L584.1,363.7L580.9,363.2L580.4,360.8L582.6,360.1L582.6,358.9L582.1,359.7L580.2,358.1L581.1,356.2L583.5,357.3L586.3,355.2L580.7,351L581.6,346.7L580,346L577.1,345.8L576,349L576.7,351.5L574.3,354.4L572,350.1L569.2,354L561.4,359.4L559.3,359L557.6,355L560.8,352.5L560.4,350.9L562.3,348.1L558.9,349.7L561.6,348.1L561.8,345.8L564.5,344.9L564.5,346.8L567.1,347L566.7,344.9L569.8,339L567.7,337.2L566.2,337.6L565.8,336.2L562.4,336.8L561.1,334.5L559.1,334.1L561.2,331L556.4,324.1L561.5,320.5L559,317.9L559.1,316L560.3,316.1L558.1,315.2L560.4,315.2L562.1,310.6L564.7,309L565,307.5L558,304L555.3,304L555.6,303.1L561.8,302.4L564.2,303.6L565.2,301.5L568.6,301.5L571,304.2L574.7,305.1Z',
  'NL': 'M523.8,157.5L526.9,159.9L521.6,163.5L521.7,165L526.1,166.5L526.4,170.5L529.1,176.6L525.9,181.4L528.3,181.2L530.9,183L528.8,187.3L535.9,189.3L535,196L539.6,198.7L541.3,198.5L542.3,203.9L546.1,202.7L549.4,206.4L551.5,204.2L558,205L558.1,219.4L562.1,219.4L562.4,220.5L548.5,230.7L546.1,230.7L545.7,229.4L542.2,231.4L542.4,234.9L541.1,236.4L541.8,238.8L538.7,238L534.5,240L533.1,242.4L526.8,244.8L527.2,246.7L529.4,246.1L530.7,249.1L528.9,256.6L532,258.9L534.3,263.5L533.3,263.1L529.9,266.4L523.3,266L520.6,271.9L521.7,276.7L517.4,276.2L515.6,277.8L517.4,278.7L516.7,280.7L513.4,280.2L513.6,278.9L512,278.6L511.2,279.9L509.4,279.8L510.5,282.6L506.5,281.7L507.2,277L505.5,275.5L506.1,272.6L507.1,273.1L506.2,271.5L507.5,268.6L504.6,264.1L505.5,256L502.9,255.1L503.7,253.7L502.4,253.7L503.2,248.9L500.2,246.5L499.4,247.3L497.8,244.7L497.1,237.2L499.8,234.9L497.2,232.8L497.8,228.2L500.3,226.3L503.5,225.8L510.5,227.6L510.7,226.6L513.3,226.8L512.7,224.3L506.8,223.5L507.3,221.5L503,218.7L504.9,218.2L500.8,217.3L498.3,215.3L496.2,210.5L496.9,207L495,206.7L494.7,203.5L486.8,195.5L499.1,185.6L500.8,188.9L504.9,183.6L504.9,177.1L500.6,175.4L497.8,177.1L496.9,173.1L501.2,169.3L508.2,167.7L510,159.8L514.4,156.7L519.6,161.7L523.8,157.5Z',
  'COAH': 'M495.7,116.4L501,121.1L502,125.7L504.7,128.8L506.1,133.3L510.4,137.6L509.6,138.2L511.7,143.8L521.4,151.7L523.8,157.5L519.6,161.7L514.4,156.7L510,159.8L508.2,167.7L501.2,169.3L496.9,173.1L497.8,177.1L500.6,175.4L504.9,177.1L504.9,183.6L500.8,188.9L499.1,185.6L486.8,195.5L494.7,203.5L495,206.7L496.9,207L496.2,210.5L498.3,215.3L500.8,217.3L504.9,218.2L503,218.7L507.3,221.5L506.8,223.5L512.7,224.3L513.3,226.8L510.7,226.6L510.5,227.6L503.5,225.8L497.8,228.2L497.2,232.8L499.8,234.9L497.1,237.2L497.8,244.7L495.1,244L493.5,245.1L490.2,243.8L486.9,239L483.1,237.7L479.9,239.8L475.5,239.2L476.1,237.1L471.4,236.1L469.4,232.2L457.2,229.3L452.7,229.5L453.1,232.7L447.1,230.9L442,239.7L435.5,237.4L431.1,233.6L431,231.1L424.4,225.2L425.5,222.5L429,222.6L424.7,218.1L428.9,213L428.6,201.7L431,197.8L428,189.2L419.1,185.8L415,181.2L417.9,177.8L415.5,170.3L414.3,169.9L414.9,163.5L414.2,158.3L412.7,156.7L413.6,155.9L412,155.7L412.5,153.2L413.9,153.6L414.3,152.4L412.9,152L414.6,148.2L421.9,133.9L423,134.6L429.8,124L434.9,124.5L438.1,119.3L441.7,118L440.8,117.2L441.4,114.5L442.5,114.3L443.3,109.9L446.5,104.5L451.3,102.8L454.8,103.4L456,100.5L463.9,102.7L465.8,101.9L473.2,103.4L476.8,103.2L477.6,102L477.8,103.4L481.6,103.2L482.7,106.5L484.2,106.4L484.3,108.5L485.5,107.1L485.5,109.9L490.7,111.5L492.3,114.2L495.7,116.4Z',
  'TAM': 'M533.2,171L534.7,171.6L535.1,173.5L534.6,177.9L539.4,182.6L544.5,194.8L552,195.6L555.8,199.1L561.3,199.4L568.6,204.1L579.2,203.9L583.7,205L588.7,209.5L590.9,209.9L590.8,208.1L593.1,206.8L597,206.8L596.3,213.6L587,231.5L582.5,246.8L580.2,289.8L577.7,299.2L579.7,307L577.9,308.5L573.8,306.1L574.7,305.1L568.8,302.7L568.6,301.5L565.2,301.5L564.2,303.6L561.8,302.4L551.6,304.5L540.4,302.9L537.8,296.9L534.7,296.1L533.7,294L531.9,293.9L532.8,297.4L528.2,295.6L524.8,296.3L522.7,293.8L519,294.4L516.8,293.4L518.8,291.8L518.4,289.2L516.6,289.2L516.5,287.6L519,285.3L516.4,283.6L517.4,278.7L515.6,277.8L517.4,276.2L521.7,276.7L520.6,271.9L523.3,266L529.9,266.4L533.3,263.1L534.3,263.5L532,258.9L528.9,256.6L530.7,249.1L529.4,246.1L527.2,246.7L526.8,244.8L533.1,242.4L534.5,240L538.7,238L541.8,238.8L541.1,236.4L542.4,234.9L542.2,231.4L545.7,229.4L546.1,230.7L548.5,230.7L562.4,220.5L562.1,219.4L558.1,219.4L558,205L551.5,204.2L549.4,206.4L546.1,202.7L542.3,203.9L541.3,198.5L535.6,196.9L535.9,189.3L528.8,187.3L530.9,183L528.3,181.2L525.9,181.4L529.1,176.6L526.4,170.5L526.1,166.5L521.7,165L521.6,163.5L526.9,159.9L531.6,161.7L532.8,163L532.4,164.9L533.7,165.4L532.1,169.8L533.2,171Z',
  'YUC': 'M849.1,325.8L858,328L858,341.3L852.3,350.7L841.6,360.8L834.2,361.6L831.2,363.2L831.6,364.5L826.6,366L826.3,368.1L824.1,368.2L820.6,373.8L817.5,374.5L816.9,376L818.3,376.4L814.8,376.5L815.2,379.8L814.1,379.8L814.3,378.3L812.2,378.3L810.2,380.6L805.5,376.6L805.3,374.6L803.9,374.5L802.2,371.8L802,368.5L797.9,363.6L796.7,364.7L795.4,361.6L794.4,361.6L795.5,360.6L790.9,355.2L789.2,356.9L786,356.6L784.7,355.7L784.7,353.6L780.6,353.3L780.1,345.4L781.2,342.2L788.5,337.1L800.1,333L822.1,330.5L829,327L838.8,326L841.8,324.3L849.1,325.8Z M798.4,297.6L802.3,300.4L800.9,304L797.5,301.1L798.4,297.6Z',
  'CAMP': 'M780.7,348.1L780.6,353.3L784.7,353.6L784.7,355.7L786,356.6L789.2,356.9L790.9,355.2L795.5,360.6L794.4,361.6L795.4,361.6L796.7,364.7L797.9,363.6L802,368.5L802.2,371.8L803.9,374.5L805.3,374.6L805.5,376.6L814.2,384.1L814.9,412.3L814.3,418.8L812.8,418.8L812.7,420.5L814.3,420.5L813.8,422.2L812.6,422.2L812.6,424L814.1,424L814.1,427.7L764.2,427.7L764.2,423.8L758,423.4L749.9,419.2L749.9,418.1L747.3,420.1L746.6,426.2L737.7,422.3L735.6,420.1L733.8,420.2L732.4,418.5L732,410.3L725.5,409.5L724,405.1L737,403.7L740.7,406.1L741,404.7L750.4,401.3L770.3,387.4L773.1,375L778.9,369.5L777.7,366.8L777.4,354.9L780.1,345.4L780.7,348.1Z',
  'QROO': 'M862.7,412.3L863.7,410.3L862.7,412.3Z M865.1,402.7L865.8,405.2L865.1,402.7Z M879.8,353.1L872.8,361L872,357.3L874.5,353.5L879.8,353.1Z M877.9,335.5L877.9,336.9L879.5,337.5L875.9,345.4L865.8,355.3L861,362.3L859.5,367.3L860.7,370.9L859.7,370.1L858.9,373.7L852.4,377.5L854.3,382L855.8,380.6L858.2,380.9L860.3,378.4L861.4,379.3L860.6,382.8L858.3,384.8L857.5,384L855.2,385.4L853.9,389.2L855.4,390.6L857.7,387.4L860.4,387.1L857.9,390.2L853.1,403.5L849.6,417.5L848,418.9L844.5,418.4L844.5,411.5L838.6,411.4L838.6,409.9L832.4,409.3L828.9,416.2L826.4,417.8L825.9,421.1L821.4,425.5L817.4,422.8L812.6,424L814.3,420.5L812.7,420.5L812.8,418.8L814.3,418.8L814.9,412.3L814.2,384.1L810.2,380.6L812.2,378.3L814.3,378.3L814.1,379.8L815.2,379.8L814.8,376.5L818.3,376.4L816.9,376L817.5,374.5L820.6,373.8L824.1,368.2L826.3,368.1L826.6,366L831.6,364.5L831.2,363.2L834.2,361.6L841.6,360.8L852.3,350.7L858,341.3L858,328L866.4,329.6L869.5,328.5L869,326.2L870.2,325.3L873.2,326.4L876.6,334.4L878,330.2L877.9,335.5Z M869.5,325.2L867.2,326.8L861.8,327.3L863.4,325.9L865.2,326.6L869.5,325.2Z',
};

// ── Mapa de México (SVG real) ──────────────────────────────────
function MapaMexico({ scale = 1, aliadosScale = 1, periodoLabel = '' }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...ESTADOS_MX.map(e => e.ventas)) * scale;

  const colorFor = (v) => {
    const t = Math.pow(v / max, 0.7);
    const r = Math.round(254 + (230 - 254) * t);
    const g = Math.round(226 + (57  - 226) * t);
    const b = Math.round(226 + (70  - 226) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg
        viewBox={`0 0 ${MX_GEO_VIEW.w} ${MX_GEO_VIEW.h}`}
        style={{ width: '100%', maxWidth: 900, height: 'auto', display: 'block' }}
      >
        {ESTADOS_MX.map(s => {
          const d = MX_GEO[s.abbr];
          if (!d) return null;
          const isHovered = hovered?.abbr === s.abbr;
          const ventasPeriodo = s.ventas * scale;
          return (
            <path
              key={s.abbr}
              d={d}
              fill={colorFor(ventasPeriodo)}
              stroke={isHovered ? C.text : '#ffffff'}
              strokeWidth={isHovered ? 1.6 : 0.6}
              style={{ cursor: 'pointer', transition: 'fill 0.15s, stroke-width 0.15s' }}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {periodoLabel && (
        <div style={{ position: 'absolute', top: 8, right: 16, fontSize: 10, color: C.textMuted, background: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
          {periodoLabel}
        </div>
      )}

      {hovered && (
        <div style={{
          position: 'absolute',
          top: 16, left: 16,
          background: C.text, color: 'white',
          padding: '14px 18px', borderRadius: 10,
          fontSize: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          pointerEvents: 'none',
          minWidth: 220,
        }}>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>{hovered.abbr}</div>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>{hovered.nombre}</div>

          {/* VENTAS */}
          <div style={{ fontSize: 9.5, color: '#9ca3af', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Ventas</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>${(hovered.ventas * scale).toFixed(1)}M</span>
            <span style={{ fontSize: 11, color: '#7ee787', fontWeight: 700 }}>+{hovered.vsMA}% vs. MA</span>
          </div>

          {/* SOCIOS */}
          <div style={{ fontSize: 9.5, color: '#9ca3af', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Socios</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{Math.round(hovered.aliados * aliadosScale).toLocaleString('es-MX')}</span>
            <span style={{ fontSize: 11, color: '#7ee787', fontWeight: 700 }}>+{hovered.vsMA_aliados}% vs. MA</span>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 8, right: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: C.textMuted, background: 'rgba(255,255,255,0.85)', padding: '6px 10px', borderRadius: 6 }}>
        <span>Menor</span>
        <div style={{ width: 120, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${colorFor(0)}, ${colorFor(max)})` }} />
        <span>Mayor</span>
      </div>
    </div>
  );
}

// ── Tabla de 32 estados rankeados ──────────────────────────────
function TablaEstados({ scale = 1, aliadosScale = 1 }) {
  const [sortKey, setSortKey] = useState('ventas');
  const [sortDir, setSortDir] = useState('desc');

  // Total nacional (no depende del orden)
  const totalVentasNac = ESTADOS_MX.reduce((acc, s) => acc + s.ventas * scale, 0);
  const totalSocios = ESTADOS_MX.reduce((acc, s) => acc + Math.round(s.aliados * aliadosScale), 0);

  // Función para obtener el valor a ordenar
  const getSortValue = (s) => {
    const v = s.ventas * scale;
    const sc = Math.max(Math.round(s.aliados * aliadosScale), 1);
    switch (sortKey) {
      case 'estado':   return s.nombre.toLowerCase();
      case 'ventas':   return v;
      case 'socios':   return sc;
      case 'vps':      return (v * 1000) / sc;
      case 'share':    return v / totalVentasNac;
      default:         return v;
    }
  };

  const sorted = [...ESTADOS_MX].sort((a, b) => {
    const va = getSortValue(a), vb = getSortValue(b);
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      // Default a desc para numéricas, asc para texto
      setSortDir(key === 'estado' ? 'asc' : 'desc');
    }
  };

  const cols = '56px 1.6fr 1.3fr 1.2fr 1.1fr 90px';
  const medalBg = ['#fbbf24', '#9ca3af', '#c0793b'];

  const SortableTh = ({ children, sortKeyName, align = 'left' }) => {
    const active = sortKey === sortKeyName;
    return (
      <button
        type="button"
        onClick={() => handleSort(sortKeyName)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 9.5, fontWeight: 700,
          color: active ? C.text : C.textDim,
          textTransform: 'uppercase',
          letterSpacing: 0.7,
          textAlign: align,
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'),
          gap: 4,
          width: '100%',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
        onMouseLeave={e => { e.currentTarget.style.color = active ? C.text : C.textDim; }}
      >
        <span>{children}</span>
        <span style={{
          fontSize: 8,
          color: active ? C.red : C.textDim,
          opacity: active ? 1 : 0.4,
          transition: 'transform 0.15s',
        }}>
          {active ? (sortDir === 'desc' ? '▼' : '▲') : '⇅'}
        </span>
      </button>
    );
  };

  return (
    <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      {/* HEADER */}
      <div style={{
        display: 'grid', gridTemplateColumns: cols, gap: 16,
        padding: '14px 18px',
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center' }}>Rank</div>
        <SortableTh sortKeyName="estado">Estado</SortableTh>
        <SortableTh sortKeyName="ventas" align="right">Ventas</SortableTh>
        <SortableTh sortKeyName="socios" align="right">Socios</SortableTh>
        <SortableTh sortKeyName="vps" align="right">Venta / socio</SortableTh>
        <SortableTh sortKeyName="share" align="right">% nacional</SortableTh>
      </div>

      {/* ROWS */}
      <div style={{ maxHeight: 480, overflowY: 'auto' }}>
        {sorted.map((s, i) => {
          const ventasP = s.ventas * scale;
          const sociosP = Math.round(s.aliados * aliadosScale);
          const ventaPorSocio = sociosP > 0 ? (ventasP * 1000) / sociosP : 0; // K MXN por socio
          const share = (ventasP / totalVentasNac) * 100;
          // El podio (medallas) sólo cuando se ordena por ventas descendente (vista natural)
          const isPodium = i < 3 && sortKey === 'ventas' && sortDir === 'desc';
          return (
            <div key={s.abbr} style={{
              display: 'grid', gridTemplateColumns: cols, gap: 16,
              padding: '14px 18px',
              alignItems: 'center',
              borderBottom: i < sorted.length-1 ? `1px solid ${C.border}` : 'none',
              background: isPodium ? `${C.amber}06` : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isPodium) e.currentTarget.style.background = C.surface; }}
            onMouseLeave={e => { if (!isPodium) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* RANK badge */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                background: isPodium ? medalBg[i] : C.surface,
                color: isPodium ? 'white' : C.textDim,
                border: isPodium ? 'none' : `1px solid ${C.border}`,
                margin: '0 auto',
              }}>{i + 1}</div>

              {/* ESTADO */}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>{s.nombre}</div>
                <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: 0.8, marginTop: 2 }}>{s.abbr}</div>
              </div>

              {/* VENTAS */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>${ventasP.toFixed(1)}M</div>
                <div style={{ fontSize: 10.5, color: C.green, fontWeight: 700, marginTop: 2 }}>↑ +{s.vsMA}% vs. MA</div>
              </div>

              {/* SOCIOS */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{sociosP.toLocaleString('es-MX')}</div>
                <div style={{ fontSize: 10.5, color: C.green, fontWeight: 700, marginTop: 2 }}>↑ +{s.vsMA_aliados}% vs. MA</div>
              </div>

              {/* VENTA / SOCIO */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>${ventaPorSocio.toFixed(1)}K</div>
                <div style={{ fontSize: 9.5, color: C.textMuted, marginTop: 2 }}>promedio</div>
              </div>

              {/* % NACIONAL */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12, fontWeight: 800,
                  background: isPodium ? C.redSoft : C.surface,
                  color: isPodium ? C.red : C.text,
                  border: `1px solid ${isPodium ? C.red + '30' : C.border}`,
                }}>{share.toFixed(1)}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER TOTALES */}
      <div style={{
        display: 'grid', gridTemplateColumns: cols, gap: 16,
        padding: '14px 18px',
        background: C.surface,
        borderTop: `2px solid ${C.border}`,
        alignItems: 'center',
      }}>
        <div />
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total nacional</div>
        <div style={{ fontSize: 13, fontWeight: 800, textAlign: 'right' }}>${totalVentasNac.toFixed(1)}M</div>
        <div style={{ fontSize: 13, fontWeight: 800, textAlign: 'right' }}>{totalSocios.toLocaleString('es-MX')}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textAlign: 'right' }}>${(totalVentasNac * 1000 / totalSocios).toFixed(1)}K</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textAlign: 'right' }}>100%</div>
      </div>
    </div>
  );
}

// ── Modal de CRUCES (heatmap multidimensional) ─────────────────
function CrucesModal({ onClose, periodoLabel }) {
  const [presetId, setPresetId] = useState('tipo-marca');
  const [hovered, setHovered] = useState(null);
  const preset = CRUCES_PRESETS[presetId];

  // Calcular max y min para escala de color
  const flat = preset.data.flat();
  const maxV = Math.max(...flat);
  const minV = Math.min(...flat);

  const cellColor = (v) => {
    const t = Math.pow((v - minV) / Math.max(maxV - minV, 0.0001), 0.6);
    const r = Math.round(254 + (230 - 254) * t);
    const g = Math.round(226 + (57  - 226) * t);
    const b = Math.round(226 + (70  - 226) * t);
    return `rgb(${r},${g},${b})`;
  };

  // Totales por fila y columna
  const rowTotals = preset.data.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = preset.cols.map((_, c) => preset.data.reduce((sum, row) => sum + row[c], 0));
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(17,24,39,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 32,
      animation: 'fadeUp 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 16,
        width: '100%', maxWidth: 1200, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${C.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.text, background: `${C.amber}20`, padding: '3px 8px', borderRadius: 5, letterSpacing: 0.6 }}>CRUCES</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>{periodoLabel}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>{preset.title}</div>
            <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>{preset.subtitle}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${C.border}`,
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
            fontSize: 18, color: C.textMuted, lineHeight: 1, fontFamily: 'inherit',
          }}>×</button>
        </div>

        {/* Selector de preset */}
        <div style={{ padding: '14px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(CRUCES_PRESETS).map(([id, p]) => (
            <button key={id} onClick={() => setPresetId(id)} style={{
              padding: '8px 14px',
              fontSize: 11.5, fontWeight: 700,
              background: presetId === id ? C.text : C.card,
              color: presetId === id ? 'white' : C.text,
              border: `1px solid ${presetId === id ? C.text : C.border}`,
              borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>{p.title}</button>
          ))}
        </div>

        {/* Body — heatmap + insights */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          {/* Heatmap */}
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'transparent' }} />
                    {preset.cols.map((c, i) => (
                      <th key={i} style={{
                        fontSize: 10, fontWeight: 700, color: C.textDim,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        padding: '6px 4px', textAlign: 'center', verticalAlign: 'bottom',
                        minWidth: 80,
                      }}>{c}</th>
                    ))}
                    <th style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 4px', textAlign: 'right', minWidth: 70 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preset.rows.map((rowLabel, r) => (
                    <tr key={r}>
                      <td style={{
                        fontSize: 11.5, fontWeight: 700, color: C.text,
                        padding: '0 12px 0 0', textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}>{rowLabel}</td>
                      {preset.data[r].map((v, c) => {
                        const isHovered = hovered?.r === r && hovered?.c === c;
                        const t = (v - minV) / Math.max(maxV - minV, 0.0001);
                        return (
                          <td key={c}
                            onMouseEnter={() => setHovered({ r, c, v })}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                              background: cellColor(v),
                              padding: '14px 8px',
                              borderRadius: 6,
                              textAlign: 'center',
                              fontSize: 12.5, fontWeight: 800,
                              color: t > 0.45 ? 'white' : C.text,
                              cursor: 'pointer',
                              border: isHovered ? `2px solid ${C.text}` : '2px solid transparent',
                              transition: 'border 0.15s',
                            }}>
                            {preset.formatter(v)}
                          </td>
                        );
                      })}
                      <td style={{ fontSize: 12, fontWeight: 800, padding: '0 4px 0 12px', textAlign: 'right', color: C.text }}>
                        {preset.formatter(rowTotals[r])}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ fontSize: 10, fontWeight: 700, color: C.textDim, padding: '12px 12px 0 0', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</td>
                    {colTotals.map((t, c) => (
                      <td key={c} style={{ fontSize: 11.5, fontWeight: 800, padding: '12px 4px 0', textAlign: 'center', color: C.text }}>
                        {preset.formatter(t)}
                      </td>
                    ))}
                    <td style={{ fontSize: 12, fontWeight: 800, padding: '12px 4px 0 12px', textAlign: 'right', color: C.red }}>
                      {preset.formatter(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 10, color: C.textMuted }}>
              <span>Menor</span>
              <div style={{ width: 200, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${cellColor(minV)}, ${cellColor(maxV)})` }} />
              <span>Mayor</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700 }}>
                {hovered ? `${preset.rows[hovered.r]} × ${preset.cols[hovered.c]} = ${preset.formatter(hovered.v)}` : 'Pasa el cursor sobre una celda'}
              </span>
            </div>
          </div>

          {/* Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              Insights ejecutivos
            </div>
            {preset.insights.map((ins, i) => (
              <div key={i} style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.red}`,
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.35 }}>{ins.headline}</div>
                <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.55 }}>{ins.detail}</div>
              </div>
            ))}
            <div style={{
              background: `linear-gradient(135deg, ${C.text} 0%, #1f2937 100%)`,
              color: 'white',
              borderRadius: 10,
              padding: '14px 16px',
              marginTop: 4,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Acción sugerida</div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>Compartir este cruce con el equipo comercial para diseñar campañas verticales por segmento.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal de Análisis de Riesgo ────────────────────────────────
function RiesgoModal({ onClose, periodoLabel }) {
  const [generated, setGenerated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGenerated(true), 900);
    return () => clearTimeout(t);
  }, []);

  const totalExposicion = 24.7; // M MXN expuestos
  const probMax = Math.max(...RIESGO_DATA.map(r => r.severity));

  const tonoColor = (tono) => tono === 'red' ? C.red : tono === 'amber' ? C.amber : C.text;
  const nivelStyle = (n) => {
    if (n === 'CRÍTICO') return { bg: C.redSoft, border: C.red, text: C.red };
    if (n === 'ALTO')    return { bg: `${C.amber}15`, border: C.amber, text: C.amber };
    return { bg: C.surface, border: C.borderLight, text: C.textMuted };
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(17,24,39,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 32,
      animation: 'fadeUp 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 16,
        width: '100%', maxWidth: 1080, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${C.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: `linear-gradient(135deg, ${C.red} 0%, #8b0a1f 100%)`,
          color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 5, letterSpacing: 0.6 }}>⚠ ANÁLISIS DE RIESGO</span>
              <span style={{ fontSize: 10, opacity: 0.85 }}>{periodoLabel}</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.3px' }}>DÓNDE ESTÁN LOS PRINCIPALES RIESGOS</div>
            <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4 }}>6 vectores de riesgo identificados — soportados con métricas reales del periodo</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
            fontSize: 18, color: 'white', lineHeight: 1, fontFamily: 'inherit',
          }}>×</button>
        </div>

        {/* AI thinking state */}
        {!generated ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, animation: 'pulse 1.4s ease infinite' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, animation: 'pulse 1.4s ease infinite 0.2s' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, animation: 'pulse 1.4s ease infinite 0.4s' }} />
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>Cruzando 32 estados × 5 segmentos × 6 marcas · evaluando 12 vectores de falla…</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Resumen ejecutivo */}
            <div style={{
              padding: '18px 24px',
              background: C.surface,
              borderBottom: `1px solid ${C.border}`,
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 9.5, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Score riesgo global</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.red }}>{probMax}/100</div>
                <div style={{ fontSize: 10.5, color: C.textMuted }}>Alto — requiere acción</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Vectores críticos</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.red }}>2</div>
                <div style={{ fontSize: 10.5, color: C.textMuted }}>de 6 identificados</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Exposición revenue</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>${totalExposicion}M</div>
                <div style={{ fontSize: 10.5, color: C.textMuted }}>en escenario adverso</div>
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Ventana crítica</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.amber }}>90 días</div>
                <div style={{ fontSize: 10.5, color: C.textMuted }}>para mitigar churn</div>
              </div>
            </div>

            {/* Cards de riesgo */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {RIESGO_DATA.map((r, i) => {
                const ns = nivelStyle(r.nivel);
                return (
                  <div key={i} style={{
                    border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${ns.border}`,
                    borderRadius: 10,
                    padding: '16px 20px',
                    background: C.card,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: ns.text, background: ns.bg, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.6 }}>{r.nivel}</span>
                          <span style={{ fontSize: 10, color: C.textMuted }}>Probabilidad: <b style={{ color: C.text }}>{r.probabilidad}</b> · Impacto: <b style={{ color: C.text }}>{r.impacto}</b></span>
                        </div>
                        <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>{r.titulo}</div>
                        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55 }}>{r.desc}</div>
                      </div>
                      <div style={{ minWidth: 50, textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: ns.text, lineHeight: 1 }}>{r.severity}</div>
                        <div style={{ fontSize: 8.5, color: C.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>severity</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {r.metricas.map((m, j) => (
                        <div key={j} style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: '8px 12px',
                          display: 'flex', flexDirection: 'column', gap: 2,
                          minWidth: 110,
                        }}>
                          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: tonoColor(m.tono) }}>{m.valor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom line */}
            <div style={{
              margin: '0 24px 24px',
              background: `linear-gradient(135deg, ${C.text} 0%, #1f2937 100%)`,
              color: 'white',
              borderRadius: 12,
              padding: '18px 22px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>Bottom line</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                La red Aliados tiene <b style={{ color: '#fca5a5' }}>$24.7M expuestos</b> en escenario adverso (20% del revenue anual).
                Los 2 vectores críticos (concentración geográfica + dependencia de power users) explican <b style={{ color: '#fca5a5' }}>$18.1M</b> de esa exposición.
                Diversificar CDMX/MTY + blindar top-100 aliados es la prioridad #1 para los próximos 90 días.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD PRINCIPAL ────────────────────────────────────────
export default function BafarCorporativo() {
  const [tab, setTab] = useState('overview');
  const [animReady, setAnimReady] = useState(false);
  const engine = useAgentEngine();
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapView, setMapView] = useState('mapa');
  const [periodId, setPeriodId] = useState('may');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [npsOpen, setNpsOpen] = useState(false);
  const [showCrucesModal, setShowCrucesModal] = useState(false);
  const [showRiesgoModal, setShowRiesgoModal] = useState(false);

  useEffect(() => {
    if (!periodOpen) return;
    const close = () => setPeriodOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [periodOpen]);

  useEffect(() => {
    if (!npsOpen) return;
    const close = () => setNpsOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [npsOpen]);

  const periodoActual = PERIODOS.find(p => p.id === periodId);
  const D = DATOS_PERIODO[periodId];
  const scale = SCALE(periodId);
  const aliadosScale = DATOS_PERIODO[periodId].aliados / DATOS_PERIODO.may.aliados;
  const isYTD = periodId === 'ytd';
  const periodoLabel = isYTD ? 'YTD 2026 (Ene-May)' : `${periodoActual.label} 2026`;

  useEffect(() => {
    const t = setTimeout(() => setAnimReady(true), 100);
    return () => clearTimeout(t);
  }, []);


  return (
    <div style={{ fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif', background: C.bg, minHeight: '100vh', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        * { box-sizing: border-box; }
        .bf-corp-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 16px;
          transition: border-color 0.2s;
        }
        .bf-corp-card:hover { border-color: ${C.borderLight}; }
        .bf-tab-corp { background: transparent; border: none; padding: 12px 16px; font-size: 12.5px; color: ${C.textMuted}; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; letter-spacing: 0.2px; transition: all 0.15s; }
        .bf-tab-corp:hover { color: ${C.text}; }
        .bf-tab-corp-active { color: ${C.text} !important; border-bottom-color: ${C.red} !important; font-weight: 600 !important; }
        .bf-glow-red { box-shadow: 0 0 40px ${C.redGlow}, 0 0 80px ${C.redGlow}; }
        .bf-fade-up { opacity: 0; transform: translateY(12px); animation: fadeUp 0.5s ease forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .bf-live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.green}; animation: pulse 2s ease infinite; }
        @keyframes bf-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.15); } }
        @keyframes bf-blink { 50% { opacity: 0; } }
        @keyframes bf-slide-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      {/* ═══ HEADER STICKY (HEADER + TABS + PERIODO) ═══ */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: C.card, boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, background: C.card }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/bafar LOGO.png" alt="BAFAR" style={{ height: 40, width: 'auto', display: 'block' }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
              BAFAR Aliados
              <span style={{ fontSize: 10, fontWeight: 600, background: C.redGlow, color: C.red, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5, border: `1px solid rgba(230,57,70,0.25)` }}>COMMAND CENTER</span>
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Panel ejecutivo · Datos en tiempo real</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AgentBadge state={engine.state} onClick={() => setTab('agentes')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.green }}>
            <div className="bf-live-dot" />
            En vivo · {periodoLabel}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: C.textMuted }}>DIR</div>
        </div>
      </header>

      {/* ═══ TABS ═══ */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '0 32px', display: 'flex', gap: 4, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'overview', label: 'Vista General' },
            { id: 'comercial', label: 'Comercial' },
            { id: 'aliados', label: 'Red de Aliados' },
            { id: 'academy', label: 'BAFAR Academy' },
            { id: 'agentes', label: 'Agentes IA', live: true },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`bf-tab-corp ${tab === t.id ? 'bf-tab-corp-active' : ''}`}
              style={t.live ? { display: 'inline-flex', alignItems: 'center', gap: 6 } : undefined}>
              {t.label}
              {t.live && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, animation: 'pulse 1.6s ease infinite', boxShadow: `0 0 6px ${C.green}` }} />}
            </button>
          ))}
        </div>
        {/* Selector de periodo (dropdown) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', position: 'relative' }}>
          <span style={{ fontSize: 10, color: C.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 }}>Periodo</span>
          <button
            onClick={(e) => { e.stopPropagation(); setPeriodOpen(v => !v); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
              background: isYTD ? C.red : C.card,
              color: isYTD ? 'white' : C.text,
              border: `1px solid ${isYTD ? C.red : C.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              minWidth: 160,
              justifyContent: 'space-between',
              transition: 'all 0.15s',
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {periodoActual.label} {!isYTD && '2026'}
              {periodoActual.current && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />}
            </span>
            <span style={{ fontSize: 10, opacity: 0.7, transition: 'transform 0.2s', transform: periodOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
          {periodOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                minWidth: 180,
                padding: 4,
                zIndex: 50,
              }}>
              {PERIODOS.map(p => {
                const active = periodId === p.id;
                const isYtdOpt = p.id === 'ytd';
                return (
                  <button key={p.id} onClick={() => { setPeriodId(p.id); setPeriodOpen(false); }} style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    background: active ? C.surface : 'transparent',
                    color: active && isYtdOpt ? C.red : C.text,
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    borderTop: isYtdOpt ? `1px solid ${C.border}` : 'none',
                    marginTop: isYtdOpt ? 4 : 0,
                    paddingTop: isYtdOpt ? 12 : 10,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.label} {!isYtdOpt && '2026'}
                      {p.current && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />}
                    </span>
                    {active && <span style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      </div>

      <main style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto' }}>

        {/* ═══════════════════════════════════════════════ */}
        {/*  TAB: AGENTES IA                                */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === 'agentes' && <AgentsTab engine={engine} />}

        {/* ═══════════════════════════════════════════════ */}
        {/*  TAB: VISTA GENERAL                             */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div>
            {/* HERO KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Aliados activos', value: D.aliados.toLocaleString('es-MX'), delta: `+${D.vsMA.aliados}%`, up: true, color: C.blue },
                { label: isYTD ? 'Ventas red YTD' : 'Ventas del mes', value: `$${D.ventas.toFixed(1)}M`, delta: `+${D.vsMA.ventas}%`, up: true, color: C.green },
                { label: isYTD ? 'Pedidos YTD' : 'Pedidos del mes', value: D.pedidos.toLocaleString('es-MX'), delta: `+${D.vsMA.pedidos}%`, up: true, color: C.amber },
                { label: 'Ticket promedio', value: `$${D.ticket.toLocaleString('es-MX')}`, delta: `+${D.vsMA.ticket}%`, up: true, color: C.red },
                { label: 'Retención 12M', value: `${D.retencion}%`, delta: `+${D.vsMA.retencion}pp`, up: true, color: C.green },
                { label: isYTD ? 'Puntos emitidos YTD' : 'Puntos emitidos', value: `${D.puntos.toFixed(2)}M`, delta: `+${D.vsMA.puntos}%`, up: true, color: C.amber },
              ].map((kpi, i) => (
                <div key={i} className="bf-corp-card bf-fade-up" style={{ padding: '18px 16px', animationDelay: `${i*60}ms` }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{kpi.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>{kpi.value}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: kpi.up ? C.green : C.red, lineHeight: 1 }}>
                      {kpi.delta}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, lineHeight: 1 }}>vs. MA</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* GRÁFICA EVOLUCIÓN VENTAS */}
              <div className="bf-corp-card bf-fade-up" style={{ padding: 24, animationDelay: '200ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Evolución de ventas red Aliados</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Millones MXN · últimos 12 meses · destacado: {isYTD ? 'YTD 2026 (Ene-May)' : periodoActual.label + ' 2026'}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>
                    +{D.vsMA.ventas}% vs. MA
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, paddingBottom: 28, position: 'relative' }}>
                  {/* Banda divisoria Real | Forecast */}
                  <div style={{ position: 'absolute', top: 0, left: `${(5/12)*100}%`, transform: 'translateX(-50%)', height: 'calc(100% - 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}>
                    <div style={{ flex: 1, borderLeft: `1px dashed ${C.borderLight}` }} />
                    <div style={{ position: 'absolute', top: -4, background: C.card, padding: '0 6px', fontSize: 8.5, fontWeight: 700, color: C.textDim, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      Real │ Forecast
                    </div>
                  </div>
                  {VENTAS_MENSUALES.map((v, i) => {
                    const max = Math.max(...VENTAS_MENSUALES);
                    const h = (v / max) * 100;
                    // Ene=0, Feb=1, Mar=2, Abr=3, May=4 (idx 5-11 = Jun-Dic forecast)
                    const periodMap = { 0: 'ene', 1: 'feb', 2: 'mar', 3: 'abr', 4: 'may' };
                    const isInYTD = isYTD && i <= 4;
                    const isSelected = !isYTD && periodMap[i] === periodId;
                    const isProjected = i >= 5;
                    const highlighted = isSelected || isInYTD;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: highlighted ? C.text : C.textDim, marginBottom: 4 }}>${v.toFixed(1)}M{isProjected && <span style={{ color: C.textDim, fontWeight: 400 }}> *</span>}</div>
                        <div style={{
                          width: '100%', height: `${h}%`,
                          background: isProjected
                            ? `repeating-linear-gradient(45deg, ${C.border}, ${C.border} 4px, ${C.surface} 4px, ${C.surface} 8px)`
                            : (highlighted ? `linear-gradient(180deg, ${C.red} 0%, ${C.red}80 100%)` : `linear-gradient(180deg, ${C.border} 0%, ${C.border}60 100%)`),
                          opacity: isProjected ? 0.55 : 1,
                          borderRadius: '6px 6px 0 0',
                          border: isProjected ? `1px dashed ${C.borderLight}` : 'none',
                          boxShadow: isSelected ? `0 0 20px ${C.redGlow}` : 'none',
                          transition: 'all 0.4s ease',
                        }} />
                        <div style={{ position: 'absolute', bottom: -22, fontSize: 10, color: isProjected ? C.textDim : (highlighted ? C.text : C.textDim), fontWeight: highlighted ? 700 : 400, fontStyle: isProjected ? 'italic' : 'normal' }}>{MESES[i]}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div style={{ width: 14, height: 8, borderRadius: 2, background: C.border, opacity: 0.4, border: `1px dashed ${C.borderLight}` }} />
                  <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: 0.3 }}>* Jun–Dic: Forecast estimado con la tendencia actual</span>
                </div>
              </div>

              {/* VENTAS POR MARCA */}
              <div className="bf-corp-card bf-fade-up" style={{ padding: 24, animationDelay: '260ms' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Ventas por marca</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 14 }}>{isYTD ? 'Acumulado YTD 2026' : `${periodoActual.label} 2026`} · MDP</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, width: 60, textAlign: 'right' }}>Ventas</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, width: 50, textAlign: 'right' }}>vs. MA</span>
                </div>
                {(() => {
                  const marcasPeriodo = MARCAS.map(m => ({
                    ...m,
                    ventasPeriodo: m.ventas * scale * (m.seasonal[periodId] ?? 1),
                    delta: m.deltas[periodId] ?? 0,
                  })).sort((a, b) => b.ventasPeriodo - a.ventasPeriodo);
                  const maxVentas = marcasPeriodo[0].ventasPeriodo;
                  const rowHeight = 40;
                  return (
                    <div style={{ position: 'relative', height: marcasPeriodo.length * rowHeight - 10 }}>
                      {marcasPeriodo.map((m, i) => (
                        <MarcaRow key={m.nombre} m={m} maxVentas={maxVentas} top={i * rowHeight} />
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {/* REGIONES */}
              <div className="bf-corp-card bf-fade-up" style={{ padding: 24, animationDelay: '320ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Top 10 por región</div>
                  <button onClick={() => { setMapView('mapa'); setShowMapModal(true); }} style={{
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    padding: '6px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
                  >VER POR REGIÓN</button>
                </div>
                {REGIONES.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < REGIONES.length-1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: i < 3 ? C.amber : C.textDim, width: 16 }}>{i+1}</span>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.nombre}</div>
                        <div style={{ fontSize: 10.5, color: C.textMuted }}>{Math.round(r.aliados * (D.aliados / DATOS_PERIODO.may.aliados))} aliados</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>${(r.ventas * scale).toFixed(1)}M</div>
                      <div style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>+{r.vsMA}% vs. MA</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* COLUMNA MEDIA: SEGMENTOS + INSIGHTS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* SEGMENTOS — altura ajustada al contenido */}
                <div className="bf-corp-card bf-fade-up" style={{ padding: 24, animationDelay: '380ms' }}>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Por segmento</div>
                  </div>
                  {SEGMENTOS.map((s, i) => {
                    const aliadosPeriodo = Math.round(s.aliados * (D.aliados / DATOS_PERIODO.may.aliados));
                    const ticketPeriodo = Math.round(s.ticketProm * (D.ticket / DATOS_PERIODO.may.ticket));
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < SEGMENTOS.length-1 ? `1px solid ${C.border}` : 'none' }}>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.tipo}</div>
                          <div style={{ fontSize: 10.5, color: C.textMuted }}>{aliadosPeriodo.toLocaleString('es-MX')} aliados</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700 }}>${ticketPeriodo.toLocaleString('es-MX')}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>ticket prom</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* INSIGHTS — Cruces + Análisis de Riesgo */}
                <div className="bf-corp-card bf-fade-up" style={{ padding: 20, animationDelay: '420ms' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Inteligencia ejecutiva</div>
                      <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 2 }}>Análisis avanzados de la red</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.amber, background: `${C.amber}15`, padding: '3px 8px', borderRadius: 5, letterSpacing: 0.5 }}>BETA</span>
                  </div>

                  <button
                    onClick={() => setShowCrucesModal(true)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: `linear-gradient(135deg, ${C.text} 0%, #1f2937 100%)`,
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 10,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(17,24,39,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, marginBottom: 2 }}>CRUCES</div>
                      <div style={{ fontSize: 10.5, opacity: 0.7, fontWeight: 500 }}>Estado × Tipo × Marca × Antigüedad</div>
                    </div>
                    <span style={{ fontSize: 18 }}>→</span>
                  </button>

                  <button
                    onClick={() => setShowRiesgoModal(true)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: `linear-gradient(135deg, ${C.red} 0%, #8b0a1f 100%)`,
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 18px ${C.redGlow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, marginBottom: 2 }}>ANÁLISIS DE RIESGO</div>
                      <div style={{ fontSize: 10.5, opacity: 0.9, fontWeight: 500 }}>Anticipación de riesgos</div>
                    </div>
                    <span style={{ fontSize: 18 }}>⚠</span>
                  </button>
                </div>
              </div>

              {/* ALERTAS + AGENTES EN VIVO */}
              <div className="bf-corp-card bf-fade-up" style={{ padding: 24, animationDelay: '440ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Alertas · agentes actuando</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Cada alerta tiene un agente IA ya trabajándola</div>
                  </div>
                  <button onClick={() => setTab('agentes')} style={{
                    background: 'transparent', border: `1px solid ${C.border}`, color: C.text,
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Ver flota →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <AgentInsightCard state={engine.state} agentId="centinela" label="184 aliados sin pedido >30d · Centinela los está reenganchando" />
                  <AgentInsightCard state={engine.state} agentId="atlas" label="CDMX crece +45% — Atlas mapeando 358 leads del cluster" />
                  <AgentInsightCard state={engine.state} agentId="mercurio" label="Test ganador: Caperucita 2× Puntos · escalando a 100%" />
                  <AgentInsightCard state={engine.state} agentId="socrates" label='"Costeo de recetas" viral · +22% ticket en aliados que vieron' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/*  TAB: COMERCIAL                                 */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === 'comercial' && (
          <div className="bf-fade-up">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Desempeño Comercial</h1>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Métricas de conversión, ticket y frecuencia de compra de la red Aliados</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <AgentInsightCard state={engine.state} agentId="mercurio" label="Mercurio · optimizando pricing y multiplicadores de Puntos" />
              <AgentInsightCard state={engine.state} agentId="vega" label="Vega · forecast por marca, supply ya ajustado" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Ticket promedio', value: `$${D.ticket.toLocaleString('es-MX')}`, sub: `+${D.vsMA.ticket}% vs. MA`, color: C.blue },
                { label: 'Frecuencia compra', value: `${D.frecuencia}x`, sub: isYTD ? 'pedidos/aliado al mes (avg YTD)' : 'pedidos por aliado al mes', color: C.green },
                { label: 'Conversión puntos', value: `${D.conversion}%`, sub: isYTD ? 'aliados canjearon YTD' : 'aliados canjearon este mes', color: C.amber },
                { label: isYTD ? 'Nuevos aliados YTD' : 'Nuevos aliados / mes', value: D.nuevosAliados.toLocaleString('es-MX'), sub: `+${D.vsMA.aliados}% vs. MA`, color: C.red },
              ].map((m, i) => (
                <div key={i} className="bf-corp-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>{m.value}</div>
                  <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* PRODUCTOS MÁS PEDIDOS */}
              <div className="bf-corp-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Productos más pedidos</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 14 }}>Ranking por volumen (unidades vendidas) · {isYTD ? 'YTD 2026' : periodoActual.label + ' 2026'}</div>

                {/* Header columnas */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, marginBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>Producto</div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase', width: 80, textAlign: 'right' }}>Unidades</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase', width: 70, textAlign: 'right' }}>Ventas</div>
                  </div>
                </div>

                {[
                  { producto: 'Carne molida de res', marca: 'BAFAR Carnes', unidades: 4820, precio: 380, pct: 100 },
                  { producto: 'Hamburguesa 150g',    marca: 'BAFAR Carnes', unidades: 3940, precio: 290, pct: 82 },
                  { producto: 'Queso mozzarella rallado', marca: 'SABORI',  unidades: 3680, precio: 245, pct: 76 },
                  { producto: 'Pepperoni rebanado',  marca: 'BURR',         unidades: 3210, precio: 320, pct: 67 },
                  { producto: 'Pechuga de pollo',    marca: 'MONTECILLO',   unidades: 2840, precio: 260, pct: 59 },
                  { producto: 'Salchicha tipo viena', marca: 'LA CHONA',    unidades: 2120, precio: 145, pct: 44 },
                  { producto: 'Tocino ahumado',      marca: 'CAPERUCITA',   unidades: 1890, precio: 195, pct: 39 },
                ].map((p, i) => {
                  const factor = D.pedidos / DATOS_PERIODO.may.pedidos;
                  const unidadesPeriodo = Math.round(p.unidades * factor);
                  const ventasPeriodo = (unidadesPeriodo * p.precio) / 1000; // K MXN
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, width: 16 }}>{i+1}</span>
                          <div>
                            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.producto}</span>
                            <span style={{ fontSize: 10.5, color: C.textMuted, marginLeft: 8 }}>{p.marca}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, width: 80, textAlign: 'right' }}>
                            {unidadesPeriodo.toLocaleString('es-MX')}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.green, width: 70, textAlign: 'right' }}>
                            ${ventasPeriodo >= 1000 ? `${(ventasPeriodo/1000).toFixed(1)}M` : `${Math.round(ventasPeriodo)}K`}
                          </span>
                        </div>
                      </div>
                      <HBar pct={p.pct} color={C.red} height={4} />
                    </div>
                  );
                })}
              </div>

              {/* BAFAR PUNTOS */}
              <div className="bf-corp-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Programa BAFAR Puntos</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 18 }}>Métricas del programa de lealtad</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: C.surface, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.amber, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Puntos emitidos</div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{D.puntos.toFixed(2)}M</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{isYTD ? 'YTD 2026 (Ene-May)' : periodoActual.label + ' 2026'}</div>
                  </div>
                  <div style={{ background: C.surface, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.green, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Puntos canjeados</div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{(D.puntos * 0.394).toFixed(2)}M</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>tasa canje: 39.4%</div>
                  </div>
                </div>

                <div style={{ background: C.surface, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Impacto en comportamiento de compra</div>
                  {[
                    { label: 'Aliados con puntos compran', value: '2.4x más', color: C.green },
                    { label: 'Ticket promedio con puntos', value: '+38%', color: C.amber },
                    { label: 'Retención aliados con puntos', value: '96%', color: C.blue },
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{stat.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: `${C.amber}10`, borderRadius: 12, padding: 14, border: `1px solid ${C.amber}25` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginBottom: 4 }}>Insight clave</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>El 96% de los aliados con saldo activo de puntos reordenan dentro de los 30 días. El programa de lealtad es el principal driver de retención.</div>
                </div>
              </div>
            </div>

            {/* ═══ DESEMPEÑO POR CANAL DE COMPRA ═══ */}
            {(() => {
              // Mix de canales por periodo — la migración hacia CEDIS y envío va creciendo
              const SHARE_PERIODO = {
                ene: { tienda: 0.40, cedis: 0.40, envio: 0.20 },
                feb: { tienda: 0.38, cedis: 0.42, envio: 0.20 },
                mar: { tienda: 0.36, cedis: 0.43, envio: 0.21 },
                abr: { tienda: 0.34, cedis: 0.45, envio: 0.21 },
                may: { tienda: 0.32, cedis: 0.46, envio: 0.22 },
                ytd: { tienda: 0.36, cedis: 0.44, envio: 0.20 },
              };
              // Costos por pedido — eficiencia mejorando mes a mes
              const COSTO_PERIODO = {
                ene: { tienda: 42, cedis: 24, envio: 112 },
                feb: { tienda: 40, cedis: 22, envio: 108 },
                mar: { tienda: 38, cedis: 20, envio: 102 },
                abr: { tienda: 36, cedis: 19, envio:  98 },
                may: { tienda: 35, cedis: 18, envio:  95 },
                ytd: { tienda: 38, cedis: 21, envio: 103 },
              };
              // Margen bruto base por canal (más alto en pickup que en envío)
              const MARGEN_BRUTO = { tienda: 0.30, cedis: 0.31, envio: 0.26 };

              const CANALES = [
                { id: 'tienda', nombre: 'Tienda física',         color: C.blue,
                  desc: '120 tiendas BAFAR a nivel nacional',     subEtiqueta: 'Pickup en sucursal' },
                { id: 'cedis',  nombre: 'Centro de distribución', color: C.green,
                  desc: '18 CEDIS estratégicos · alto volumen',   subEtiqueta: 'Pickup en CEDIS' },
                { id: 'envio',  nombre: 'Envío a restaurante',    color: C.amber,
                  desc: 'Última milla · flota propia + terceros', subEtiqueta: 'Entrega en sitio' },
              ];
              const totalPedidos = D.pedidos;
              const totalVentas = D.ventas; // M MXN
              const ticket = D.ticket;
              const sharesP = SHARE_PERIODO[periodId];
              const costosP = COSTO_PERIODO[periodId];
              const canalesData = CANALES.map(c => {
                const share = sharesP[c.id];
                const costoUnit = costosP[c.id];
                const pedidos = Math.round(totalPedidos * share);
                const ventas = (pedidos * ticket) / 1_000_000; // M MXN
                const costoLogistica = (pedidos * costoUnit) / 1_000_000; // M MXN
                const margenBruto = ventas * MARGEN_BRUTO[c.id];
                const utilidad = margenBruto - costoLogistica;
                const margenPct = (utilidad / ventas) * 100;
                return { ...c, share, costoUnit, pedidos, ventas, costoLogistica, utilidad, margenPct, ticket };
              });
              const maxMargen = Math.max(...canalesData.map(c => c.margenPct));
              const minMargen = Math.min(...canalesData.map(c => c.margenPct));
              const mejorCanal = canalesData.reduce((a, b) => a.margenPct > b.margenPct ? a : b);
              const peorCanal = canalesData.reduce((a, b) => a.margenPct < b.margenPct ? a : b);
              const utilidadTotal = canalesData.reduce((s, c) => s + c.utilidad, 0);

              return (
                <div className="bf-corp-card" style={{ padding: 28, marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>Desempeño por canal de compra</div>
                      <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 4 }}>
                        ¿Dónde recogen los aliados? · Rentabilidad estimada · {isYTD ? 'YTD 2026' : periodoActual.label + ' 2026'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Utilidad total estimada</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.green, marginTop: 2 }}>${utilidadTotal.toFixed(2)}M</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>margen consolidado {((utilidadTotal/totalVentas)*100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* TRES CANALES */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
                    {canalesData.map(c => {
                      const isMejor = c.id === mejorCanal.id;
                      const isPeor = c.id === peorCanal.id;
                      return (
                        <div key={c.id} style={{
                          background: C.card,
                          border: `1px solid ${isMejor ? C.green : (isPeor ? C.amber : C.border)}`,
                          borderRadius: 12,
                          padding: 18,
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          {/* Barra de color superior */}
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: c.color }} />

                          {/* Badge MEJOR/PEOR */}
                          {isMejor && (
                            <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, fontWeight: 800, color: C.green, background: C.greenSoft, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5, border: `1px solid ${C.green}30` }}>
                              MÁS RENTABLE
                            </div>
                          )}
                          {isPeor && (
                            <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, fontWeight: 800, color: C.amber, background: `${C.amber}15`, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5, border: `1px solid ${C.amber}40` }}>
                              MENOR MARGEN
                            </div>
                          )}

                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>{c.subEtiqueta}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{c.nombre}</div>
                            <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 16 }}>{c.desc}</div>
                          </div>

                          {/* Métricas */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                            <div>
                              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textDim, letterSpacing: 0.5, textTransform: 'uppercase' }}>Pedidos</div>
                              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{c.pedidos.toLocaleString('es-MX')}</div>
                              <div style={{ fontSize: 10, color: C.textMuted }}>{(c.share*100).toFixed(0)}% del volumen</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textDim, letterSpacing: 0.5, textTransform: 'uppercase' }}>Ventas</div>
                              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>${c.ventas.toFixed(2)}M</div>
                              <div style={{ fontSize: 10, color: C.textMuted }}>ticket ${c.ticket.toLocaleString('es-MX')}</div>
                            </div>
                          </div>

                          {/* Bloque rentabilidad */}
                          <div style={{ background: C.surface, borderRadius: 8, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>Costo logístico/pedido</span>
                              <span style={{ fontSize: 11, fontWeight: 700 }}>${c.costoUnit}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>Costo total mes</span>
                              <span style={{ fontSize: 11, fontWeight: 700 }}>${(c.costoLogistica*1000).toFixed(0)}K</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                              <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Margen estimado</span>
                              <span style={{ fontSize: 16, fontWeight: 800, color: isMejor ? C.green : (isPeor ? C.amber : C.text) }}>
                                {c.margenPct.toFixed(1)}%
                              </span>
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <div style={{ width: '100%', height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                  width: `${(c.margenPct / maxMargen) * 100}%`,
                                  height: '100%',
                                  background: isMejor ? C.green : (isPeor ? C.amber : C.blue),
                                  transition: 'width 0.4s ease',
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DISTRIBUCIÓN DE PEDIDOS — barra apilada */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Distribución de pedidos del periodo</div>
                    <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                      {canalesData.map(c => (
                        <div key={c.id} style={{
                          width: `${c.share*100}%`,
                          background: c.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 11, fontWeight: 800,
                          transition: 'width 0.4s ease',
                        }}>
                          {c.nombre} · {(c.share*100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INSIGHT INFERIOR */}
                  <div style={{
                    background: `linear-gradient(135deg, ${C.green}10 0%, ${C.greenSoft} 100%)`,
                    border: `1px solid ${C.green}30`,
                    borderRadius: 12,
                    padding: '14px 18px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.green, letterSpacing: 0.6, marginBottom: 4 }}>OPORTUNIDAD DE OPTIMIZACIÓN</div>
                    <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
                      <b>{mejorCanal.nombre}</b> tiene el mejor margen ({mejorCanal.margenPct.toFixed(1)}%) vs <b>{peorCanal.nombre}</b> ({peorCanal.margenPct.toFixed(1)}%).
                      Migrar 10% del volumen de {peorCanal.nombre.toLowerCase()} a {mejorCanal.nombre.toLowerCase()} liberaría
                      ~<b style={{ color: C.green }}>${((peorCanal.pedidos * 0.10 * (peorCanal.costoUnit - mejorCanal.costoUnit))/1000).toFixed(0)}K</b> mensuales en costo logístico.
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/*  TAB: RED DE ALIADOS                            */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === 'aliados' && (
          <div className="bf-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Red de Aliados</h1>
                <p style={{ fontSize: 16, color: C.textMuted, marginTop: 6, fontWeight: 500 }}>
                  {D.aliados.toLocaleString('es-MX')} micro restauranteros suscritos · {isYTD ? 'YTD 2026' : periodoActual.label + ' 2026'}
                </p>
              </div>

              {/* SOCIOS EN LÍNEA EN ESTE MOMENTO */}
              <div className="bf-corp-card" style={{
                padding: '14px 20px',
                background: `linear-gradient(135deg, ${C.greenSoft} 0%, ${C.card} 100%)`,
                border: `1px solid ${C.green}30`,
                display: 'flex', alignItems: 'center', gap: 14,
                minWidth: 260,
              }}>
                <div style={{ position: 'relative', width: 12, height: 12 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green }} />
                  <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: C.green, opacity: 0.3, animation: 'pulse 2s ease infinite' }} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.3px', lineHeight: 1 }}>
                    {Math.round(D.activos * 0.687).toLocaleString('es-MX')}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.textMuted, fontWeight: 600, marginTop: 4 }}>socios en línea en este momento</div>
                  <div style={{ fontSize: 10, color: C.green, fontWeight: 700, marginTop: 2, letterSpacing: 0.3 }}>↗ alimentando data en vivo</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <AgentInsightCard state={engine.state} agentId="centinela" label="Centinela · evitando churn en aliados de alto valor" />
              <AgentInsightCard state={engine.state} agentId="atlas" label="Atlas · abriendo clusters subatendidos" />
              <AgentInsightCard state={engine.state} agentId="coyote" label="Coyote · vigilando transacciones anómalas" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Activos (pedido <30d)', value: D.activos.toLocaleString('es-MX'), pct: `${Math.round(D.activos/D.aliados*1000)/10}%`, color: C.green },
                { label: 'En riesgo (30-60d)', value: D.riesgo.toLocaleString('es-MX'), pct: `${Math.round(D.riesgo/D.aliados*1000)/10}%`, color: C.amber },
                { label: 'Inactivos (>60d)', value: D.inactivos.toLocaleString('es-MX'), pct: `${Math.round(D.inactivos/D.aliados*1000)/10}%`, color: C.red },
                { label: isYTD ? 'Nuevos YTD' : 'Nuevos este mes', value: D.nuevosAliados.toLocaleString('es-MX'), pct: '', color: C.blue },
                (() => {
                  const nps = D.npsAliados;
                  let etiqueta, color;
                  if (nps >= 85)      { etiqueta = 'Excelente';   color = C.green; }
                  else if (nps >= 70) { etiqueta = 'Muy bueno';   color = C.green; }
                  else if (nps >= 50) { etiqueta = 'Bueno';       color = C.amber; }
                  else if (nps >= 30) { etiqueta = 'Por mejorar'; color = C.amber; }
                  else                { etiqueta = 'Crítico';     color = C.red; }
                  return { label: 'NPS aliados', value: `${nps}`, pct: etiqueta, color, isNps: true };
                })(),
              ].map((s, i) => (
                <div key={i} className="bf-corp-card" style={{ padding: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{s.label}</div>
                    {s.isNps && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setNpsOpen(v => !v); }}
                        style={{
                          fontSize: 9, fontWeight: 800,
                          color: C.textMuted,
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          padding: '3px 8px',
                          borderRadius: 5,
                          letterSpacing: 0.6,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
                      >VER ESCALA</button>
                    )}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px' }}>{s.value}</div>
                  {s.pct && <div style={{ fontSize: 15, color: s.color, fontWeight: 600, marginTop: 6 }}>{s.pct}</div>}

                  {/* Popover de escala NPS */}
                  {s.isNps && npsOpen && (() => {
                    const escalaNps = [
                      { min: 85, label: 'Excelente',   color: C.green },
                      { min: 70, label: 'Muy bueno',   color: C.green },
                      { min: 50, label: 'Bueno',       color: C.amber },
                      { min: 30, label: 'Por mejorar', color: C.amber },
                      { min: 0,  label: 'Crítico',     color: C.red },
                    ];
                    return (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          right: 0,
                          background: C.card,
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                          padding: 14,
                          minWidth: 220,
                          zIndex: 50,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>Escala NPS</div>
                          <button onClick={() => setNpsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: C.textMuted, padding: 0, fontFamily: 'inherit', lineHeight: 1 }}>×</button>
                        </div>
                        {escalaNps.map((e, idx) => {
                          const next = escalaNps[idx-1];
                          const rango = next ? `${e.min}–${next.min - 1}` : (e.min === 0 ? '< 30' : `${e.min}+`);
                          const activa = D.npsAliados >= e.min && (!next || D.npsAliados < next.min);
                          return (
                            <div key={idx} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              fontSize: 11.5, padding: '5px 8px', borderRadius: 5,
                              fontWeight: activa ? 700 : 500,
                              color: activa ? e.color : C.text,
                              background: activa ? `${e.color}10` : 'transparent',
                              marginBottom: 2,
                            }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.color, opacity: activa ? 1 : 0.4 }} />
                                {e.label}
                                {activa && <span style={{ fontSize: 9, color: e.color, fontWeight: 800, letterSpacing: 0.4 }}>← actual</span>}
                              </span>
                              <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, color: C.textMuted }}>{rango}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
              {/* LIFECYCLE FUNNEL */}
              {(() => {
                const escala = D.aliados / DATOS_PERIODO.may.aliados;
                const etapas = [
                  { etapa: 'Registrados',                       desc: 'Aliados que se registraron en la plataforma',  total: Math.round(4200 * escala), color: C.textMuted },
                  { etapa: 'Primer pedido',                     desc: 'Hicieron su primer pedido en menos de 7 días', total: Math.round(3680 * escala), color: C.blue },
                  { etapa: 'Segundo pedido',                    desc: 'Segundo pedido dentro de los 30 días',         total: Math.round(3100 * escala), color: C.amber },
                  { etapa: 'Aliado recurrente',                 desc: '3 o más pedidos completados',                  total: D.activos,                  color: C.green },
                  { etapa: 'Power user',                        desc: 'Compras mensuales > $5,000 MXN',               total: Math.round(820 * scale),    color: C.red },
                ];
                const base = etapas[0].total;
                return (
                  <div className="bf-corp-card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>Ciclo de vida del aliado</div>
                        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>
                          Embudo de conversión · número de aliados en cada etapa · {isYTD ? 'YTD 2026' : periodoActual.label + ' 2026'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 20 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Conversión total</div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: C.green, marginTop: 2 }}>
                            {Math.round((etapas[etapas.length-1].total / base) * 100)}%
                          </div>
                          <div style={{ fontSize: 10.5, color: C.textMuted }}>de registro a power user</div>
                        </div>
                      </div>
                    </div>

                    {/* Header de columnas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '38px 1.6fr 2.5fr 120px 110px 110px', gap: 14, paddingBottom: 10, marginBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>#</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>Etapa</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>Visualización</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'right' }}>Aliados</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'right' }}>% del total</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'right' }}>Drop vs ant.</div>
                    </div>

                    {etapas.map((f, i) => {
                      const pctTotal = (f.total / base) * 100;
                      const prev = i > 0 ? etapas[i-1].total : null;
                      const dropAbs = prev !== null ? f.total - prev : null;
                      const dropPct = prev !== null ? ((f.total - prev) / prev) * 100 : null;
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '38px 1.6fr 2.5fr 120px 110px 110px', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i < etapas.length-1 ? `1px solid ${C.border}` : 'none' }}>
                          {/* # */}
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: f.color, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800,
                          }}>{i + 1}</div>

                          {/* Etapa */}
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{f.etapa}</div>
                            <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>{f.desc}</div>
                          </div>

                          {/* Barra */}
                          <div>
                            <HBar pct={pctTotal} color={f.color} height={14} />
                          </div>

                          {/* Aliados */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{f.total.toLocaleString('es-MX')}</div>
                            <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 3 }}>aliados</div>
                          </div>

                          {/* % del total */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: f.color }}>{pctTotal.toFixed(0)}%</div>
                            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{i === 0 ? 'base' : 'de registrados'}</div>
                          </div>

                          {/* Drop vs anterior */}
                          <div style={{ textAlign: 'right' }}>
                            {prev !== null ? (
                              <>
                                <div style={{ fontSize: 14, fontWeight: 700, color: dropPct < -50 ? C.red : (dropPct < -20 ? C.amber : C.green) }}>
                                  {dropPct.toFixed(0)}%
                                </div>
                                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>
                                  {dropAbs.toLocaleString('es-MX')} aliados
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: 12, color: C.textDim, fontStyle: 'italic' }}>—</div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Insight inferior */}
                    <div style={{
                      marginTop: 18,
                      background: C.surface,
                      borderRadius: 10,
                      padding: '12px 16px',
                      fontSize: 12.5,
                      color: C.text,
                      lineHeight: 1.5,
                      display: 'flex', gap: 12, alignItems: 'center',
                    }}>
                      <div style={{ width: 6, height: 38, borderRadius: 3, background: C.red, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 700, color: C.red, marginRight: 4 }}>Mayor fuga:</span>
                        del 3er pedido a power user — caen <b>{Math.round(((etapas[3].total - etapas[4].total) / etapas[3].total) * 100)}%</b> de los aliados recurrentes ({(etapas[3].total - etapas[4].total).toLocaleString('es-MX')} aliados no escalan a {'>'}$5K/mes). Oportunidad clara para programa de upgrade.
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/*  TAB: BAFAR ACADEMY                             */}
        {/* ═══════════════════════════════════════════════ */}
        {tab === 'academy' && (
          <div className="bf-fade-up">
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>BAFAR Academy — Métricas</h1>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Impacto de la plataforma educativa · {isYTD ? 'YTD 2026 (Ene-May)' : periodoActual.label + ' 2026'}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <AgentInsightCard state={engine.state} agentId="socrates" label="Sócrates · curador IA · recomienda el video correcto al aliado correcto" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Videos publicados', value: `${({ ene: 38, feb: 40, mar: 42, abr: 45, may: 47, ytd: 47 })[periodId]}`, color: C.red },
                { label: isYTD ? 'Vistas YTD' : 'Vistas del mes', value: `${({ ene: 11.4, feb: 13.8, mar: 17.2, abr: 21.4, may: 20.4, ytd: 84.2 })[periodId].toFixed(1)}K`, color: C.blue },
                { label: 'Tasa completado', value: `${({ ene: 71, feb: 72, mar: 73, abr: 73, may: 74, ytd: 73 })[periodId]}%`, color: C.green },
                { label: 'Aliados que han visto ≥1', value: Math.round(2410 * (D.aliados/DATOS_PERIODO.may.aliados)).toLocaleString('es-MX'), color: C.amber },
              ].map((m, i) => (
                <div key={i} className="bf-corp-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
              {/* TOP VIDEOS */}
              <div className="bf-corp-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Videos con mayor impacto</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 18 }}>Ranking por vistas y completado</div>

                {ACADEMY_STATS.map((v, i) => {
                  const vistasPeriodo = Math.round(v.vistas * scale);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < ACADEMY_STATS.length-1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>{v.video}</div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 10.5, color: C.textMuted }}>
                          <span>{vistasPeriodo.toLocaleString('es-MX')} vistas</span>
                          <span style={{ color: C.green }}>{v.completado}% completado</span>
                          <span style={{ color: C.textDim }}>{v.categoria}</span>
                        </div>
                      </div>
                      <div style={{ width: 48, textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? C.amber : C.text }}>#{i+1}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* INSIGHT DE IMPACTO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="bf-corp-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Correlación Academy → Ventas</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 20 }}>Impacto medido en comportamiento de compra</div>

                  {[
                    { label: 'Aliados que ven videos compran', value: '+22%', desc: 'más que los que no ven', color: C.green },
                    { label: 'Video "Costeo de recetas"', value: '+31%', desc: 'aumento en margen reportado', color: C.amber },
                    { label: 'Video "La hamburguesa perfecta"', value: '+18%', desc: 'aumento en compra de carne BAFAR', color: C.red },
                  ].map((ins, i) => (
                    <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 16, marginBottom: i < 2 ? 10 : 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{ins.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 24, fontWeight: 800, color: ins.color }}>{ins.value}</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>{ins.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: `linear-gradient(135deg, ${C.red} 0%, #8b0a1f 100%)`, borderRadius: 16, padding: 24, color: 'white' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>BAFAR Academy no es un costo. Es una inversión con ROI medible.</div>
                  <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>Cada aliado que ve al menos 3 videos genera en promedio $4,200 adicionales en compras mensuales vs los que no participan. Con {Math.round(2410 * (D.aliados/DATOS_PERIODO.may.aliados)).toLocaleString('es-MX')} aliados activos en Academy, el impacto estimado es de ${(Math.round(2410 * (D.aliados/DATOS_PERIODO.may.aliados)) * 4200 * 12 / 1e6).toFixed(1)}M anuales en ventas incrementales.</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: C.textDim, background: C.card }}>
        <span>BAFAR Aliados · Command Center v1.0 · Uso exclusivo dirección ejecutiva</span>
        <span>Powered by AXON B2B</span>
      </footer>

      {/* ═══ MODAL: VER POR REGIÓN ═══ */}
      {showMapModal && (
        <div
          onClick={() => setShowMapModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(17,24,39,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 32,
            animation: 'fadeUp 0.2s ease',
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.card,
              borderRadius: 16,
              width: '100%', maxWidth: 1120, maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              border: `1px solid ${C.border}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}>
            {/* Header del modal */}
            <div style={{
              padding: '18px 24px',
              borderBottom: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>Ventas por estado · República Mexicana</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>32 estados · {periodoLabel} · vs. Mismo Año anterior</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Toggle MAPA / TABLA */}
                <div style={{
                  display: 'flex',
                  background: C.surface,
                  borderRadius: 8,
                  padding: 3,
                  border: `1px solid ${C.border}`,
                }}>
                  {['mapa', 'tabla'].map(v => (
                    <button key={v} onClick={() => setMapView(v)} style={{
                      padding: '6px 16px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      background: mapView === v ? C.card : 'transparent',
                      color: mapView === v ? C.text : C.textMuted,
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: mapView === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}>{v}</button>
                  ))}
                </div>
                <button onClick={() => setShowMapModal(false)} style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  width: 32, height: 32,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 18,
                  color: C.textMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit',
                  lineHeight: 1,
                }}>×</button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div style={{ flex: 1, overflow: 'auto', padding: 24, background: C.bg }}>
              {mapView === 'mapa'
                ? <MapaMexico scale={scale} aliadosScale={aliadosScale} periodoLabel={periodoLabel} />
                : <TablaEstados scale={scale} aliadosScale={aliadosScale} />}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: CRUCES ═══ */}
      {showCrucesModal && <CrucesModal onClose={() => setShowCrucesModal(false)} periodoLabel={periodoLabel} />}

      {/* ═══ MODAL: ANÁLISIS DE RIESGO + PLANES ═══ */}
      {showRiesgoModal && <RiskPlanModal onClose={() => setShowRiesgoModal(false)} periodoLabel={periodoLabel} riesgoData={RIESGO_DATA} />}
    </div>
  );
}
