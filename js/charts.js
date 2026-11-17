// Gráficos de linha e coluna (Chart.js). As cores vêm das variáveis do CSS,
// então claro e escuro funcionam sem duplicar nada.

import { fmtPct, fmtInt, fmtDate } from './util.js?v=202611162315';

const live = new Set();
export function destroyCharts() { for (const c of live) c.destroy(); live.clear(); }

const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

function base() {
  const ink3 = css('--ink-3');
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: css('--ink'), titleColor: css('--bg'), bodyColor: css('--bg'),
        padding: 10, cornerRadius: 8, displayColors: true, boxWidth: 8, boxHeight: 8, usePointStyle: true,
        titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: css('--line-2') }, ticks: { color: ink3, font: { family: 'Inter', size: 11 }, maxRotation: 0, autoSkipPadding: 8 } },
      y: { grid: { color: css('--grid'), lineWidth: 1 }, border: { display: false }, ticks: { color: ink3, font: { family: 'Inter', size: 11 }, maxTicksLimit: 5 } },
    },
  };
}

function make(canvas, cfg) {
  if (!window.Chart || !canvas) return null;
  const c = new window.Chart(canvas, cfg);
  live.add(c);
  return c;
}

const withAlpha = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function weeklyVolume(canvas, weeks, goal) {
  const series = css('--series');
  const o = base();
  o.scales.y.beginAtZero = true;
  o.scales.y.ticks.callback = (v) => fmtInt(v);
  o.plugins.tooltip.callbacks = {
    title: (it) => `Semana ${weeks[it[0].dataIndex].n} · a partir de ${fmtDate(weeks[it[0].dataIndex].start)}${weeks[it[0].dataIndex].current ? ' (em andamento)' : ''}`,
    label: (it) => it.datasetIndex === 0 ? ` Questões: ${fmtInt(it.raw)}` : ` Meta: ${fmtInt(it.raw)}`,
  };
  return make(canvas, {
    type: 'bar',
    data: {
      labels: weeks.map((w) => w.label),
      datasets: [
        { type: 'bar', data: weeks.map((w) => w.q), backgroundColor: weeks.map((w) => (w.current ? withAlpha(series, 0.4) : series)), borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'start', maxBarThickness: 24, order: 2 },
        { type: 'line', data: weeks.map(() => goal), borderColor: css('--gold-mark'), borderWidth: 2, pointRadius: 0, pointHoverRadius: 0, order: 1 },
      ],
    },
    options: o,
  });
}

export function weeklyAccuracy(canvas, weeks) {
  const series = css('--series');
  const pts = weeks.map((w) => (w.q ? Math.round(w.acc * 1000) / 10 : null));
  const vals = pts.filter((v) => v != null);
  const o = base();
  o.scales.y.suggestedMin = Math.max(0, Math.floor((Math.min(...vals) - 5) / 10) * 10);
  o.scales.y.suggestedMax = Math.min(100, Math.ceil((Math.max(...vals) + 5) / 10) * 10);
  o.scales.y.ticks.callback = (v) => `${v}%`;
  o.plugins.tooltip.callbacks = {
    title: (it) => `Semana ${weeks[it[0].dataIndex].n}`,
    label: (it) => ` Acerto: ${fmtPct(weeks[it.dataIndex].acc, 1)} em ${fmtInt(weeks[it.dataIndex].q)} questões`,
  };
  return make(canvas, {
    type: 'line',
    data: {
      labels: weeks.map((w) => w.label),
      datasets: [{ data: pts, borderColor: series, backgroundColor: css('--series-soft'), fill: 'origin', borderWidth: 2, tension: 0.25, spanGaps: true,
        pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: series, pointBorderColor: css('--surface'), pointBorderWidth: 2 }],
    },
    options: o,
  });
}

export function assessmentsChart(canvas, list, useScore) {
  const series = css('--series');
  const o = base();
  const data = list.map((a) => (useScore ? a.score : Math.round(a.pct * 100)));
  o.scales.y.suggestedMin = Math.floor((Math.min(...data) - (useScore ? 10 : 8)) / 5) * 5;
  o.scales.y.suggestedMax = Math.ceil((Math.max(...data) + (useScore ? 10 : 8)) / 5) * 5;
  o.scales.y.ticks.callback = (v) => (useScore ? v : `${v}%`);
  o.plugins.tooltip.callbacks = {
    title: (it) => `${list[it[0].dataIndex].kind} · ${list[it[0].dataIndex].name}`,
    label: (it) => { const a = list[it.dataIndex]; return ` ${fmtDate(a.date)}: ${fmtPct(a.pct)}${a.score ? ` · nota ${a.score}` : ''}`; },
  };
  return make(canvas, {
    type: 'line',
    data: {
      labels: list.map((a) => fmtDate(a.date)),
      datasets: [{ data, borderColor: series, borderWidth: 2, tension: 0, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: series, pointBorderColor: css('--surface'), pointBorderWidth: 2 }],
    },
    options: o,
  });
}
