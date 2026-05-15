/*
 * RIESGOS BAFAR — Planes de mitigación accionables
 * Para cada riesgo: acciones concretas, owners, fechas, costos, KPIs,
 * agente IA asignado y escenarios best/expected/worst.
 *
 * Los IDs (riskId) deben coincidir con los del array RIESGO_DATA de App.jsx
 * para que el modal pueda hacer el match.
 */

export const RISK_PLANS = [
  {
    riskId: 'concentracion-geo',
    riskTitle: 'Concentración geográfica',
    agentId: 'atlas',
    agentReason: 'Atlas mapea diariamente clusters subatendidos fuera del top-3, generando leads pre-calificados para abrir mercados nuevos y diluir la concentración.',
    exposureMXN: 5700000,
    ventanaDias: 180,
    inversionTotalMXN: 1820000,
    roiProyectado: 3.1,
    objetivo: 'Reducir % revenue de top-3 estados de 57.5% a 48% en 12 meses, abriendo 3 nuevas regiones core.',
    acciones: [
      { id: 1, accion: 'Roadshow comercial en Bajío (GTO + QRO + AGS)',         owner: 'Dir. Comercial · Roberto M.', soporte: 'Atlas',     fecha: '2026-06-15', costoMXN: 480000, kpi: '+180 aliados · ARR +$3.2M', status: 'En curso' },
      { id: 2, accion: 'Apertura CEDIS satélite en Tijuana (frontera norte)',   owner: 'Dir. Operaciones · Mauricio C.', soporte: 'Vega',    fecha: '2026-07-30', costoMXN: 620000, kpi: 'Reducir lead time 3d → 1d',       status: 'Aprobado' },
      { id: 3, accion: 'Campaña SABORI focalizada en Puebla + Veracruz',        owner: 'Brand Manager · Ana López',   soporte: 'Mercurio', fecha: '2026-06-30', costoMXN: 240000, kpi: '+80 aliados pizzerías',           status: 'Aprobado' },
      { id: 4, accion: 'Programa de financiamiento aliados Quintana Roo',       owner: 'CFO · Mario G.',              soporte: 'Atlas',     fecha: '2026-08-15', costoMXN: 380000, kpi: '+40 aliados turismo',             status: 'En diseño' },
      { id: 5, accion: 'Diversificar marca dominante en CHIH (subir SABORI mix)', owner: 'Dir. Comercial CHIH · Karla L.', soporte: 'Mercurio', fecha: '2026-07-15', costoMXN: 100000, kpi: 'SABORI mix CHIH 8% → 14%',     status: 'En curso' },
    ],
    escenarios: [
      { nombre: 'Mejor caso', prob: '20%', impactoMXN: 4200000, color: 'green', resumen: 'Bajío explota, 280 aliados nuevos en 12m, top-3 cae a 44%' },
      { nombre: 'Esperado',   prob: '60%', impactoMXN: 1800000, color: 'amber', resumen: 'Plan ejecuta al 75%, top-3 baja a 50%, ARR +$2.4M' },
      { nombre: 'Peor caso',  prob: '20%', impactoMXN: -1200000, color: 'red',  resumen: 'Roadshow tarda, top-3 sube a 60% si CHIH crece, costo no recuperado' },
    ],
    hitos: [
      { fecha: '2026-06', label: 'Roadshow Bajío Sprint-1' },
      { fecha: '2026-07', label: 'Apertura Tijuana · primer pedido' },
      { fecha: '2026-09', label: 'KPI checkpoint · 50% del objetivo' },
      { fecha: '2027-05', label: 'Cierre · validar 48% top-3' },
    ],
    riesgosEjecucion: [
      'SAT regional puede saturarse · plan de contratación 8 vendedores adicionales',
      'Bajío tiene 2 competidores fuertes · diferenciación vía BAFAR Puntos crítica',
      'CEDIS Tijuana requiere permisos municipales · 60d ventana',
    ],
  },
  {
    riskId: 'power-users',
    riskTitle: 'Dependencia de Power Users',
    agentId: 'centinela',
    agentReason: 'Centinela monitorea diariamente a los top 820 aliados con modelo de propensión a churn. Activa secuencia de retención al primer indicio de baja en frecuencia.',
    exposureMXN: 12400000,
    ventanaDias: 90,
    inversionTotalMXN: 940000,
    roiProyectado: 13.2,
    objetivo: 'Blindar top-100 aliados con programa de cuenta clave, reducir churn anual del segmento de 11% a <5%.',
    acciones: [
      { id: 1, accion: 'Programa "BAFAR Elite" · KAM dedicado al top-100',       owner: 'Dir. Comercial · Roberto M.', soporte: 'Centinela', fecha: '2026-06-01', costoMXN: 520000, kpi: 'NPS top-100 ≥ 85',           status: 'En curso' },
      { id: 2, accion: 'Beneficios exclusivos: precio congelado 6m + Puntos 1.5×', owner: 'Pricing · Sofía R.',         soporte: 'Mercurio',  fecha: '2026-06-15', costoMXN: 180000, kpi: 'Retención top-100 ≥ 96%',    status: 'Aprobado' },
      { id: 3, accion: 'Visitas trimestrales + diagnóstico operativo gratuito',   owner: 'SAT Senior · 4 reps',         soporte: 'Sócrates',  fecha: '2026-07-01', costoMXN: 140000, kpi: '4 visitas/aliado/año',       status: 'En diseño' },
      { id: 4, accion: 'Dashboard analytics personalizado para cada Elite',       owner: 'CTO · Jorge V.',              soporte: 'Vega',      fecha: '2026-08-01', costoMXN: 100000, kpi: '80% uso mensual',             status: 'Backlog' },
    ],
    escenarios: [
      { nombre: 'Mejor caso', prob: '30%', impactoMXN: 9800000, color: 'green', resumen: 'Top-100 retención 98%, programa escala a top-300' },
      { nombre: 'Esperado',   prob: '55%', impactoMXN: 6200000, color: 'amber', resumen: 'Churn baja a 5%, $6.2M protegidos' },
      { nombre: 'Peor caso',  prob: '15%', impactoMXN: -240000, color: 'red',  resumen: 'Programa no engancha, percibido como descuento, costo sin retorno' },
    ],
    hitos: [
      { fecha: '2026-06', label: 'Selección top-100 + onboarding KAMs' },
      { fecha: '2026-09', label: 'Primer ciclo de visitas completado' },
      { fecha: '2026-12', label: 'Medición NPS post-programa' },
      { fecha: '2027-03', label: 'Decisión escalar a top-300' },
    ],
    riesgosEjecucion: [
      'Top-100 puede percibir el KAM como vendedor agresivo · entrenamiento crítico',
      'Costo de Puntos 1.5× requiere validación financiera trimestral',
      'Competencia puede igualar precios congelados · diferenciación en servicio',
    ],
  },
  {
    riskId: 'churn-estacional',
    riskTitle: 'Churn estacional acelerado',
    agentId: 'centinela',
    agentReason: 'Centinela ejecuta secuencias de reenganche personalizadas en los 184 aliados inactivos detectados. WhatsApp + cupón dinámico + escalamiento SAT con 6h de ventana.',
    exposureMXN: 441000,
    ventanaDias: 60,
    inversionTotalMXN: 280000,
    roiProyectado: 1.6,
    objetivo: 'Recuperar 60% de los 184 aliados inactivos (110 aliados) en 60 días, recortando exposición a $176K.',
    acciones: [
      { id: 1, accion: 'Activar Centinela en modo agresivo (autonomía 0.85)',     owner: 'Head of Data · Diego P.',     soporte: 'Centinela', fecha: '2026-06-01', costoMXN: 0,       kpi: '184 aliados contactados en 7d', status: 'Aprobado' },
      { id: 2, accion: 'Bolsa de cupones recovery ($2,400 promedio por aliado)',  owner: 'Pricing · Sofía R.',          soporte: 'Mercurio',  fecha: '2026-06-01', costoMXN: 180000, kpi: 'Costo recuperación <$1,600',     status: 'Aprobado' },
      { id: 3, accion: 'Refuerzo SAT con 4 reps temporales para escalación',      owner: 'Dir. Comercial · Roberto M.', soporte: '—',         fecha: '2026-06-10', costoMXN: 80000,  kpi: '95% llamadas en 24h',            status: 'En curso' },
      { id: 4, accion: 'Análisis post-mortem causas churn (cruzar con Sócrates)', owner: 'Head of Data · Diego P.',     soporte: 'Sócrates',  fecha: '2026-08-01', costoMXN: 20000,  kpi: 'Top-5 causas documentadas',      status: 'Backlog' },
    ],
    escenarios: [
      { nombre: 'Mejor caso', prob: '25%', impactoMXN: 380000, color: 'green', resumen: 'Recuperación 75% (138 aliados), insight de causa raíz' },
      { nombre: 'Esperado',   prob: '55%', impactoMXN: 220000, color: 'amber', resumen: 'Recuperación 55%, costo ROI 1.6×' },
      { nombre: 'Peor caso',  prob: '20%', impactoMXN: -80000, color: 'red',   resumen: 'Recuperación 30%, costo de cupones supera lift' },
    ],
    hitos: [
      { fecha: '2026-06-07', label: '100% contactados' },
      { fecha: '2026-06-30', label: 'Primer 30% recuperado' },
      { fecha: '2026-07-30', label: 'Cierre de campaña · medición final' },
    ],
    riesgosEjecucion: [
      'Cupones pueden canibalizar margen si se usan en aliados que iban a volver solos',
      'Centinela debe distinguir entre churn temporal vs definitivo · modelo XGBoost crítico',
      'Reps temporales requieren onboarding rápido · materiales listos',
    ],
  },
  {
    riskId: 'concentracion-marca',
    riskTitle: 'Concentración de marca',
    agentId: 'vega',
    agentReason: 'Vega pronostica demanda por marca con 8 semanas de horizonte. Detecta cualquier desviación que ponga en riesgo el supply chain de BAFAR Carnes.',
    exposureMXN: 4800000,
    ventanaDias: 120,
    inversionTotalMXN: 1240000,
    roiProyectado: 3.9,
    objetivo: 'Diversificar mix de ventas para que ninguna marca represente más de 28% del total (vs 32% actual de BAFAR Carnes).',
    acciones: [
      { id: 1, accion: 'Campaña cross-sell SABORI + MONTECILLO en cohort BAFAR Carnes', owner: 'Brand Manager · Ana López',   soporte: 'Mercurio',  fecha: '2026-06-15', costoMXN: 420000, kpi: '+18% mix SABORI en cohort',  status: 'En curso' },
      { id: 2, accion: 'Backup supply chain · proveedor alterno de carne molida',       owner: 'Dir. Operaciones · Mauricio C.', soporte: 'Vega',     fecha: '2026-07-30', costoMXN: 580000, kpi: 'Capacidad redundante 30%',   status: 'En diseño' },
      { id: 3, accion: 'Bundle BAFAR Carnes + LA CHONA + CAPERUCITA · descuento 8%',    owner: 'Pricing · Sofía R.',          soporte: 'Mercurio',  fecha: '2026-06-30', costoMXN: 160000, kpi: '+12% volumen LA CHONA',     status: 'Aprobado' },
      { id: 4, accion: 'Lanzamiento BURR en 200 pizzerías de CDMX',                     owner: 'Brand Manager · Ana López',   soporte: 'Atlas',     fecha: '2026-08-15', costoMXN: 80000,  kpi: 'BURR mix CDMX 6% → 10%',     status: 'Backlog' },
    ],
    escenarios: [
      { nombre: 'Mejor caso', prob: '25%', impactoMXN: 5400000, color: 'green', resumen: 'Diversificación exitosa, BAFAR Carnes baja a 26% del mix' },
      { nombre: 'Esperado',   prob: '55%', impactoMXN: 2800000, color: 'amber', resumen: 'Mix BAFAR Carnes a 30%, supply chain blindado' },
      { nombre: 'Peor caso',  prob: '20%', impactoMXN: -180000, color: 'red',   resumen: 'Cross-sell no engancha, costo de campaña sin retorno' },
    ],
    hitos: [
      { fecha: '2026-06', label: 'Lanzamiento campaña cross-sell' },
      { fecha: '2026-07', label: 'Contrato supply backup firmado' },
      { fecha: '2026-09', label: 'Primera medición mix · target 30%' },
      { fecha: '2027-02', label: 'Cierre · validar 28%' },
    ],
    riesgosEjecucion: [
      'Cross-sell puede percibirse como push agresivo · tono crítico',
      'Proveedor backup requiere QA exhaustivo · 90d de validación',
      'BURR es marca premium · entrenar SAT en value prop',
    ],
  },
  {
    riskId: 'saturacion-chih',
    riskTitle: 'Saturación en mercado núcleo',
    agentId: 'mercurio',
    agentReason: 'Mercurio aplica pricing dinámico y promos micro-segmentadas en CHIH para extraer más valor del aliado existente vs incurrir en CAC creciente.',
    exposureMXN: 1800000,
    ventanaDias: 365,
    inversionTotalMXN: 480000,
    roiProyectado: 3.8,
    objetivo: 'Defender posición en CHIH con upsell del aliado existente. Crecer revenue/aliado CHIH 18% sin necesidad de adquirir nuevos.',
    acciones: [
      { id: 1, accion: 'Programa BAFAR Elite CHIH · ticket promedio +25%',          owner: 'Dir. Comercial CHIH · Karla L.', soporte: 'Centinela', fecha: '2026-06-30', costoMXN: 220000, kpi: 'Ticket prom 2,180 → 2,725', status: 'En curso' },
      { id: 2, accion: 'Pricing dinámico off-peak en carne molida',                  owner: 'Pricing · Sofía R.',           soporte: 'Mercurio',  fecha: '2026-07-15', costoMXN: 60000,  kpi: '+18% volumen off-peak',     status: 'Aprobado' },
      { id: 3, accion: 'Reducir CAC con referidos: aliado trae aliado',              owner: 'Brand Manager · Ana López',    soporte: '—',         fecha: '2026-08-01', costoMXN: 140000, kpi: 'CAC vs 2025 ×1.4 (vs ×2.4)', status: 'En diseño' },
      { id: 4, accion: 'Educación financiera CHIH · curso Academy específico',       owner: 'Academy · Lucia R.',           soporte: 'Sócrates',  fecha: '2026-09-01', costoMXN: 60000,  kpi: '70% completan curso',       status: 'Backlog' },
    ],
    escenarios: [
      { nombre: 'Mejor caso', prob: '30%', impactoMXN: 2400000, color: 'green', resumen: 'Revenue/aliado +28%, sin nuevos aliados, margen +9pp' },
      { nombre: 'Esperado',   prob: '50%', impactoMXN: 1100000, color: 'amber', resumen: 'Revenue/aliado +15%, CAC controlado' },
      { nombre: 'Peor caso',  prob: '20%', impactoMXN: -120000, color: 'red',   resumen: 'Aliados saturados rechazan upsell, churn local' },
    ],
    hitos: [
      { fecha: '2026-07', label: 'Programa Elite CHIH activo' },
      { fecha: '2026-09', label: 'Primer corte · 50% del objetivo' },
      { fecha: '2027-02', label: 'CAC y ticket validados anual' },
    ],
    riesgosEjecucion: [
      'Programa de referidos puede generar fraude · Coyote en alerta',
      'Pricing dinámico requiere comunicación clara · evitar percepción de abuso',
      'CHIH es mercado emocional · cuidar marca local',
    ],
  },
  {
    riskId: 'adopcion-academy',
    riskTitle: 'Adopción digital incompleta',
    agentId: 'socrates',
    agentReason: 'Sócrates personaliza recomendaciones de Academy según el gap operativo de cada aliado, activando push + WhatsApp con CTA gamificado.',
    exposureMXN: 1400000,
    ventanaDias: 180,
    inversionTotalMXN: 320000,
    roiProyectado: 4.4,
    objetivo: 'Subir adopción Academy de 74% a 92% en 6 meses. Cada punto = +$78K MXN de revenue mensual por mejora de ticket.',
    acciones: [
      { id: 1, accion: 'Gamificación: 500 Puntos por primer video completado',         owner: 'Academy · Lucia R.',          soporte: 'Sócrates',  fecha: '2026-06-15', costoMXN: 120000, kpi: '+440 aliados nuevos activos',  status: 'Aprobado' },
      { id: 2, accion: 'Push notif segmentado por gap operativo (Sócrates auto)',      owner: 'Head of Data · Diego P.',     soporte: 'Sócrates',  fecha: '2026-06-01', costoMXN: 0,       kpi: '70% open rate',                status: 'En curso' },
      { id: 3, accion: 'Embajadores Academy · top-20 aliados graban testimonio',       owner: 'Brand Manager · Ana López',   soporte: '—',         fecha: '2026-07-15', costoMXN: 60000,  kpi: '20 videos publicados',          status: 'En diseño' },
      { id: 4, accion: 'Certificaciones · "Aliado BAFAR Pro" tras 10 cursos',          owner: 'Academy · Lucia R.',          soporte: 'Sócrates',  fecha: '2026-08-15', costoMXN: 140000, kpi: '180 certificaciones',           status: 'Backlog' },
    ],
    escenarios: [
      { nombre: 'Mejor caso', prob: '25%', impactoMXN: 2200000, color: 'green', resumen: 'Adopción 95%, ticket promedio sube 12pp, ARR +$2.2M' },
      { nombre: 'Esperado',   prob: '60%', impactoMXN: 980000,  color: 'amber', resumen: 'Adopción 90%, ARR +$980K' },
      { nombre: 'Peor caso',  prob: '15%', impactoMXN: -40000,  color: 'red',   resumen: 'Adopción se estanca en 80%, gamificación no engancha' },
    ],
    hitos: [
      { fecha: '2026-06', label: 'Gamificación activa · medición arranque' },
      { fecha: '2026-09', label: 'Adopción 85% · primera meta' },
      { fecha: '2026-12', label: 'Cierre · validar 92%' },
    ],
    riesgosEjecucion: [
      'Puntos por video pueden canibalizar Puntos por compra',
      'Embajadores requieren guion sin parecer comercial · Curaduría editorial',
      'Certificaciones deben tener valor real · alianza con Cámaras locales',
    ],
  },
];

/* Helper para buscar plan por título (matching laxo) */
export function findPlanByTitle(titulo) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const t = norm(titulo);
  return RISK_PLANS.find(p => norm(p.riskTitle) === t);
}

/* Helper: total agregado del plan completo */
export function totalsPlan() {
  return {
    exposure: RISK_PLANS.reduce((s, p) => s + p.exposureMXN, 0),
    inversion: RISK_PLANS.reduce((s, p) => s + p.inversionTotalMXN, 0),
    acciones: RISK_PLANS.reduce((s, p) => s + p.acciones.length, 0),
    roiPromedio: RISK_PLANS.reduce((s, p) => s + p.roiProyectado, 0) / RISK_PLANS.length,
  };
}
