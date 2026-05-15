# BAFAR Aliados — Command Center (Corporativo)

Dashboard ejecutivo para la dirección de Grupo BAFAR. Muestra el ecosistema completo de micro PyMEs conectadas a la plataforma BAFAR Aliados.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5174](http://localhost:5174) en tu navegador.

## Build para producción

```bash
npm run build
```

## Estructura

```
bafar-corporativo/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── index.css
│   └── App.jsx           # Command Center completo
└── README.md
```

## Secciones

1. **Vista General** — KPIs hero, evolución de ventas 12M, ventas por marca, regiones, segmentos, alertas
2. **Comercial** — Ticket, frecuencia, productos más pedidos, programa BAFAR Puntos con ROI
3. **Red de Aliados** — Ciclo de vida, funnel de conversión, top aliados, segmentación por actividad
4. **BAFAR Academy** — Métricas de impacto, correlación Academy → Ventas, ROI educativo

## Tecnologías

- React 18
- Vite 5
- Lucide React (iconos)
- DM Sans (tipografía via Google Fonts)

---

*Diseñado por Profit Solutions · profitsolutions.mx*
