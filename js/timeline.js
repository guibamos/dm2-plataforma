// Timeline com zoom: dados (modelo da mentoria + datas do aluno) e desenho.
// Datas internas em "dias" (inteiros, UTC) para as contas ficarem simples.

import { esc } from './util.js?v=202611162334';

export const D = (s) => Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5);
export const ISO = (d) => new Date(d * 864e5).toISOString().slice(0, 10);
const S = (d) => new Date(d * 864e5);
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const fmtD = (d, y = true) => { const x = S(d); return `${x.getUTCDate()} ${MES[x.getUTCMonth()]}${y ? ' ' + x.getUTCFullYear() : ''}`; };
export const dow = (d) => DOW[S(d).getUTCDay()];
const todayD = () => { const n = new Date(); return D(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`); };

// ---------------- Modelo da mentoria (dias contados a partir do início) ----------------
// Programa de 3 meses das ideias iniciais. Editável pelo admin.
export function defaultTemplate() {
  const t = [{ id: 'aula-anki', off: 1, title: 'Aula: como usar o Anki (gravada)', text: 'Fica na aba Aulas.', kind: 'aula' }];
  for (let w = 0; w < 4; w++) t.push({ id: `ind1-${w}`, off: 1 + w * 7, title: 'Individual · 50 min', text: 'Mês 1: um encontro por semana.', kind: 'ind', h: '20h' });
  for (let w = 0; w < 4; w++) t.push({ id: `ind2-${w}`, off: 29 + w * 14, title: 'Individual · 30 min', text: 'Meses 2 e 3: a cada duas semanas.', kind: 'ind', h: '20h' });
  for (let w = 0; w < 7; w++) t.push({ id: `grupo-${w}`, off: 10 + w * 14, title: 'Encontro em grupo', text: 'A gravação vai para Aulas.', kind: 'grupo', h: '20h' });
  t.push({ id: 'aula-anki-vivo', off: 38, title: 'Aula ao vivo: Anki', text: 'Em grupo, no mês 2.', kind: 'aula', h: '20h' });
  for (let w = 0; w < 13; w++) t.push({ id: `check-${w}`, off: 6 + w * 7, title: 'Check-in da semana', text: 'Conferir o painel e as metas da semana seguinte.', kind: 'check' });
  t.push({ id: 'fim-programa', off: 91, title: 'Fim do programa de 3 meses', text: 'A partir daqui: acompanhamento mensal, sessão avulsa ou seguir sozinho.', kind: 'aula' });
  return t;
}

export const LANES = [
  { id: 'marcos', label: 'Marcos', color: 'var(--tl-marco)', min: 0, rows: 2 },
  { id: 'processo', label: 'Processo', color: 'var(--tl-proc)', min: 2, rows: 4 },
  { id: 'simulados', label: 'Simulados', color: 'var(--tl-sim)', min: 2, rows: 3 },
  { id: 'mentoria', label: 'Mentoria', color: 'var(--tl-ment)', min: 5, rows: 3, summarize: true },
];

const GUIDE_OF = { wdoms: 'inscricao', intealth: 'inscricao', traducao: 'inscricao', video: 'inscricao', credenciais: 'inscricao', fsmb: 'custos', prometric: 'custos', resultado: 'provas' };

// ---------------- Timeline de um aluno ----------------
// data: store.student(id); tpl: modelo; st: { done: [], overrides: {} }
export function buildStudent(data, tpl, st = {}) {
  const s = data.settings;
  const start = D(s.startDate);
  const today = todayD();
  const hasDate = !!s.examDate;
  const exam = hasDate ? D(s.examDate) : Math.max(start + 200, today + 120); // sem data: previsão
  const isS1 = s.exam === 'Step 1';
  const done = new Set(st.done || []);
  const ov = st.overrides || {};
  const prep = exam - start;
  const sub = (a, b) => ({ a: start + Math.round(prep * a), b: start + Math.round(prep * b) });
  const phases = [
    { id: 'prova', label: `${s.exam}${hasDate ? '' : ' · sem data'}`, a: start, b: exam, c: isS1 ? 'var(--tl-p1)' : 'var(--tl-p2)', dashed: !hasDate,
      subs: isS1 ? [{ label: 'Base e Anki', ...sub(0, 0.25) }, { label: '1ª passada do UWorld', ...sub(0.25, 0.7) }, { label: 'Simulados e revisão', ...sub(0.7, 1) }]
        : [{ label: 'Base clínica', ...sub(0, 0.3) }, { label: 'UWorld CK', ...sub(0.3, 0.75) }, { label: 'Simulados e revisão', ...sub(0.75, 1) }] },
  ];
  // Próximas etapas: só a sequência, sem datas combinadas.
  const nexts = isS1 ? [['Step 2 CK', 'var(--tl-p2)', 170], ['Inglês e certificação', 'var(--tl-p3)', 80], ['Aplicação e Match', 'var(--tl-p4)', 300]] : [['Inglês e certificação', 'var(--tl-p3)', 80], ['Aplicação e Match', 'var(--tl-p4)', 300]];
  let cur = exam + 14;
  nexts.forEach(([label, c, len], i) => { phases.push({ id: `prox-${i}`, label: `${label} · a combinar`, a: cur, b: cur + len, c, dashed: true, subs: [] }); cur += len + 14; });

  const E = [];
  const add = (lane, id, d, title, text, extra = {}) => {
    const dd = ov[id] ? D(ov[id]) : d;
    E.push({ lane, id, d: dd, title, text, edited: !!ov[id], ...extra });
  };
  add('marcos', 'inicio', start, 'Início da mentoria', 'Combinado de metas e configuração do acompanhamento.', { m: 1 });
  add('marcos', 'prova', exam, hasDate ? s.exam : `${s.exam} (previsão)`, hasDate ? 'Dia da prova.' : 'Ainda sem data marcada. A posição é só uma previsão.', { m: 1, est: !hasDate });
  phases.slice(1).forEach((p) => add('marcos', `m-${p.id}`, p.b, p.label.replace(' · a combinar', ''), 'Próxima etapa. A data é combinada na mentoria.', { m: 1, est: true }));

  const proc = [
    ['wdoms', start + 1, 'Conferir a faculdade no WDOMS', 'Ver as Sponsor Notes do seu ano de formatura.'],
    ['intealth', start + 2, 'Criar a conta no MyIntealth', 'Escolher ECFMG, não EPIC. US$110.'],
    ['traducao', start + 9, 'Tradução juramentada', 'Diploma e histórico, antes de enviar.'],
    ['video', start + 11, 'Verificação de identidade por vídeo', 'Cerca de 5 minutos, com o passaporte.'],
    ['credenciais', start + 45, 'Credenciais verificadas', 'Previsão. Pode levar de dias a semanas.'],
    ['fsmb', exam - 100, `Pagar o ${s.exam} no FSMB`, `Escolher o período de 3 meses. ${isS1 ? 'US$905' : 'US$930'} no Brasil.`],
    ['prometric', exam - 98, 'Marcar a data na Prometric', 'Remarcar com 46 dias ou mais de antecedência é grátis.'],
    ['resultado', exam + 21, `Resultado do ${s.exam}`, 'Previsão: algumas semanas depois da prova.'],
  ];
  proc.forEach(([id, d, t, x]) => add('processo', id, d, t, x, { guide: GUIDE_OF[id], est: !hasDate && ['fsmb', 'prometric', 'resultado'].includes(id), check: true }));

  data.assessments.forEach((a, i) => add('simulados', `sim-${i}`, D(a.date), `${a.kind} ${a.name}`, `${Math.round(a.pct * 100)}% de acerto.`, { status: 'done', guide: 'simulados' }));
  const last = data.assessments.length ? D(data.assessments[data.assessments.length - 1].date) : -1e9;
  [[60, isS1 ? 'NBME (CBSSA)' : 'NBME (CCSSA)'], [40, isS1 ? 'NBME (CBSSA)' : 'NBME (CCSSA)'], [25, 'UWSA'], [12, 'Free 120']].forEach(([b, t], i) => {
    const d = exam - b; if (d > Math.max(today, last + 5)) add('simulados', `simp-${i}`, d, `${t} (planejado)`, 'Planejado. Registre o resultado no acompanhamento.', { est: true, guide: 'simulados' });
  });

  tpl.forEach((x) => add('mentoria', x.id, start + x.off, x.title, x.text, { kind: x.kind, h: x.h, min: x.kind === 'check' ? 16 : undefined }));

  // Status: feito / próximo / atrasado
  E.forEach((e) => {
    if (e.status) return;
    if (e.lane === 'processo') e.status = done.has(e.id) ? 'done' : e.d < today ? 'late' : 'next';
    else if (e.lane === 'mentoria') e.status = e.d < today ? 'done' : 'next';
    else if (e.lane === 'marcos') e.status = e.d < today ? 'done' : 'next';
    else e.status = 'next';
  });
  return { phases, events: E, start, today, a: start - 20, b: cur + 30, lanes: LANES, startLabel: start };
}

// Modelo geral (admin): aluno exemplo que começa na próxima segunda, sem data de prova.
export function buildModel(tpl) {
  const t = todayD(); let start = t; while (S(start).getUTCDay() !== 1) start++;
  const fake = { settings: { exam: 'Step 1', startDate: ISO(start), examDate: null }, assessments: [] };
  const m = buildStudent(fake, tpl, {});
  m.events.forEach((e) => { e.status = 'next'; });
  m.model = true;
  return m;
}

// Visão da turma (admin): uma faixa por aluno.
export function buildTurma(rows) {
  const today = todayD();
  const lanes = rows.map(({ u, data }) => {
    const s = data.settings; const a = D(s.startDate); const has = !!s.examDate; const b = has ? D(s.examDate) : Math.max(a + 200, today + 120);
    return { id: `a-${u.id}`, label: u.name, color: s.exam === 'Step 1' ? 'var(--tl-p1)' : 'var(--tl-p2)', bar: { a, b, label: `${s.exam}${has ? ' · ' + fmtD(b) : ' · sem data'}`, dashed: !has, href: `#aluno-${u.id}` } };
  });
  const as = lanes.map((l) => l.bar.a), bs = lanes.map((l) => l.bar.b);
  return { phases: [], events: [], lanes, today, a: Math.min(...as) - 20, b: Math.max(...bs) + 40, turma: true };
}

// ---------------- Desenho ----------------
// opts: { onSelect(e), height, title }
export function mountTimeline(root, model, opts = {}) {
  const st = { t0: model.a, t1: model.b, on: Object.fromEntries((model.lanes || []).map((l) => [l.id, true])), sel: null, listScope: 'mes' };
  const mobile = () => root.clientWidth < 700;
  // Começa mostrando "hoje" com algum contexto, exceto no modelo e na turma.
  if (!model.model && !model.turma) { const c = Math.min(Math.max(model.today, model.a + 60), model.b - 60); setRange(c - 75, c + 105, false, true); }

  root.innerHTML = `
    <div class="tlx-bar"><div class="tlx-crumb"></div>
      <div class="tlx-ctrl"><button data-z="out" title="Afastar">−</button><button data-z="in" title="Aproximar">+</button><span class="tlx-sep"></span>
        <button data-p="all">Tudo</button><button data-p="year">Ano</button><button data-p="month">Mês</button><button data-p="week">Semana</button><span class="tlx-sep"></span><button data-p="today">Hoje</button></div></div>
    ${model.turma ? '' : `<div class="tlx-toggles">${model.lanes.map((l) => `<span class="tlx-lt" data-lane="${l.id}"><i style="background:${l.color}"></i>${l.label}</span>`).join('')}
      <span class="tlx-legend"><i class="st done"></i>feito <i class="st next"></i>próximo <i class="st late"></i>atrasado <i class="st est"></i>previsão</span></div>`}
    <div class="tlx-view"></div>
    <div class="tlx-below"><span class="tlx-scale"></span><div class="tlx-mini"></div><span class="tlx-hint"><kbd>roda</kbd> aproxima · <kbd>arrastar</kbd> anda no tempo · clique num item para ver o detalhe</span></div>
    <div class="tlx-list"></div>`;
  const view = root.querySelector('.tlx-view');
  const W = () => view.clientWidth || 1;
  const ppd = () => W() / (st.t1 - st.t0);
  const X = (d) => ((d - st.t0) / (st.t1 - st.t0)) * W();

  function setRange(a, b, anim, silent) {
    const span = Math.max(5, Math.min(model.b - model.a, b - a)); const c = (a + b) / 2;
    a = c - span / 2; b = c + span / 2;
    if (a < model.a) { b += model.a - a; a = model.a; }
    if (b > model.b) { a -= b - model.b; b = model.b; }
    if (!anim) { st.t0 = a; st.t1 = b; if (!silent) render(); return; }
    const s0 = st.t0, s1 = st.t1, T = performance.now();
    const step = (now) => { const k = Math.min(1, (now - T) / 260), e = 1 - Math.pow(1 - k, 3); st.t0 = s0 + (a - s0) * e; st.t1 = s1 + (b - s1) * e; render(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const zoom = (f, at) => { const c = at ?? (st.t0 + st.t1) / 2; setRange(c - (c - st.t0) * f, c + (st.t1 - c) * f); };

  function ticks() {
    const p = ppd(), out = [];
    const ymd = (y, m) => D(`${y}-${String(m + 1).padStart(2, '0')}-01`);
    if (p < 7) {
      const stepM = p < 0.5 ? 3 : 1; const x = S(st.t0); let y = x.getUTCFullYear(), m = Math.floor(x.getUTCMonth() / stepM) * stepM;
      while (ymd(y, m) < st.t1) {
        out.push({ d: ymd(y, m), l: m === 0 ? (stepM === 3 ? String(y) : `${MES[m]} ${y}`) : MES[m], major: m === 0 });
        m += stepM; if (m > 11) { m -= 12; y++; }
      }
    }
    else if (p < 46) { let d = Math.floor(st.t0); while (S(d).getUTCDay() !== 1) d++; for (; d < st.t1; d += 7) { const x = S(d); out.push({ d, l: `${x.getUTCDate()} ${MES[x.getUTCMonth()]}`, major: x.getUTCDate() <= 7 }); } }
    else { for (let d = Math.floor(st.t0); d < st.t1; d++) { const x = S(d); out.push({ d, l: `${DOW[x.getUTCDay()]} ${x.getUTCDate()}`, major: x.getUTCDay() === 1 }); } }
    return out;
  }

  function crumb() {
    const c = (st.t0 + st.t1) / 2, span = st.t1 - st.t0, p = ppd();
    let where = 'Visão geral', det = '';
    if (model.turma) { where = 'Turma'; det = `${model.lanes.length} alunos`; }
    else if (span < 500 && model.phases.length) {
      const ph = model.phases.find((x) => c >= x.a && c <= x.b) || model.phases[0];
      const sb = (ph.subs || []).find((x) => c >= x.a && c <= x.b);
      where = ph.label; det = [sb && sb.label, c >= model.start && span < 120 ? `semana ${Math.floor((c - model.start) / 7) + 1} da mentoria` : ''].filter(Boolean).join(' · ');
    }
    root.querySelector('.tlx-crumb').innerHTML = `<span class="k">Você está em</span><span class="ph">${esc(where)}</span><span class="sub">${esc(det)}</span><span class="rng">${fmtD(Math.round(st.t0))} – ${fmtD(Math.round(st.t1))}</span>`;
    root.querySelector('.tlx-scale').textContent = p < 0.5 ? 'Vendo anos' : p < 7 ? 'Vendo meses' : p < 46 ? 'Vendo semanas' : 'Vendo dias';
    root.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('on', (b.dataset.p === 'all' && span > 700) || (b.dataset.p === 'year' && span > 200 && span <= 700) || (b.dataset.p === 'month' && span > 20 && span <= 200) || (b.dataset.p === 'week' && span <= 20)));
  }

  function place(list, maxRows) {
    const ends = Array(maxRows).fill(-1e9);
    return list.map((e) => { const x = X(e.d), w = Math.min(260, 16 + e.title.length * 6.4); const r = ends.findIndex((end) => end < x - 4); if (r >= 0) ends[r] = x + w; return { e, x, row: r }; });
  }

  function render() {
    if (mobile()) { view.hidden = true; root.querySelector('.tlx-below').hidden = true; root.querySelector('.tlx-ctrl').hidden = true; renderList(); return; }
    view.hidden = false; root.querySelector('.tlx-below').hidden = false; root.querySelector('.tlx-ctrl').hidden = false; root.querySelector('.tlx-list').innerHTML = '';
    const p = ppd(); const tk = ticks();
    const grid = tk.map((t) => `<div class="tlx-grid ${t.major ? 'major' : ''}" style="left:${X(t.d)}px"></div>`).join('');
    let html = '';
    if (model.phases.length) {
      html += `<div class="tlx-lane" style="height:84px"><span class="tlx-lh"><i style="background:var(--tl-p1)"></i>Fases</span>${grid}${model.phases.map((ph) => {
        const x1 = X(ph.a), x2 = X(ph.b); if (x2 < 0 || x1 > W()) return ''; const vis = Math.min(x2, W()) - Math.max(x1, 0), pad = Math.max(0, -x1);
        return `<div class="tlx-phase ${ph.dashed ? 'dashed' : ''}" data-ph="${ph.id}" style="left:${x1}px;width:${x2 - x1}px;top:30px;--c:${ph.c};padding-left:${10 + pad}px">${vis > 70 ? esc(ph.label) : ''}${vis > 300 && !ph.dashed ? `<span class="d">${fmtD(ph.a, false)} – ${fmtD(ph.b)}</span>` : ''}</div>`
          + (p > 0.35 ? (ph.subs || []).map((sb) => { const a = X(sb.a), b = X(sb.b); if (b < 0 || a > W()) return ''; const sv = Math.min(b, W()) - Math.max(a, 0); return `<div class="tlx-phase sub ${ph.dashed ? 'dashed' : ''}" data-ph="${ph.id}" style="left:${a}px;width:${b - a - 2}px;top:58px;--c:${ph.c};padding-left:${10 + Math.max(0, -a)}px">${sv > 90 ? esc(sb.label) : ''}</div>`; }).join('') : '');
      }).join('')}</div>`;
    }
    for (const lane of model.lanes) {
      if (!model.turma && !st.on[lane.id]) continue;
      if (lane.bar) { // turma
        const b = lane.bar, x1 = X(b.a), x2 = X(b.b), pad = Math.max(0, -x1);
        html += `<div class="tlx-lane" style="height:44px"><span class="tlx-lh"><i style="background:${lane.color}"></i>${esc(lane.label)}</span>${grid}
          <a class="tlx-phase ${b.dashed ? 'dashed' : ''}" href="${b.href}" style="left:${x1}px;width:${x2 - x1}px;top:12px;--c:${lane.color};padding-left:${170 + pad}px">${esc(b.label)}</a>
          <span class="tlx-dot m" style="left:${x2}px;top:25px;background:${b.dashed ? 'var(--surface)' : 'var(--tl-marco)'};${b.dashed ? 'border:2px dashed var(--tl-marco)' : ''}"></span></div>`;
        continue;
      }
      const rowH = 34;
      if (p < lane.min && !lane.summarize) {
        const n = model.events.filter((e) => e.lane === lane.id && e.d >= st.t0 && e.d <= st.t1).length;
        html += `<div class="tlx-lane" style="height:38px"><span class="tlx-lh"><i style="background:${lane.color}"></i>${lane.label}</span>${grid}<span class="tlx-empty">${n} itens · aproxime para ver</span>${model.events.filter((e) => e.lane === lane.id).map((e) => { const x = X(e.d); return x < 0 || x > W() ? '' : `<span class="tlx-pip" style="left:${x - 3}px;background:${lane.color}"></span>`; }).join('')}</div>`;
        continue;
      }
      if (p < lane.min && lane.summarize) {
        const ms = model.events.filter((e) => e.lane === lane.id && e.kind !== 'check');
        let inner = '';
        if (ms.length) {
          if (30.4 * p < 80) { const a = ms[0].d, z = ms[ms.length - 1].d; inner = `<span class="tlx-agg" data-zoomto="${Math.round((a + z) / 2)}" data-span="${z - a + 20}" style="left:${Math.max(150, Math.min(W() - 150, X((a + z) / 2)))}px">Programa de 3 meses · ${ms.length} encontros e aulas</span>`; }
          else {
            const by = {}; ms.forEach((e) => { const x = S(e.d); const k = `${x.getUTCFullYear()}-${x.getUTCMonth()}`; (by[k] = by[k] || []).push(e); });
            inner = Object.entries(by).map(([k, l]) => { const [y, m] = k.split('-').map(Number); const mid = D(`${y}-${String(m + 1).padStart(2, '0')}-15`);
              const ind = l.filter((e) => e.kind === 'ind').length, gr = l.filter((e) => e.kind === 'grupo').length, au = l.filter((e) => e.kind === 'aula').length;
              return `<span class="tlx-agg" data-zoomto="${mid}" style="left:${X(mid)}px">${[ind && `${ind} indiv.`, gr && `${gr} grupo`, au && `${au} aula`].filter(Boolean).join(' · ')}</span>`; }).join('');
          }
        }
        html += `<div class="tlx-lane" style="height:66px"><span class="tlx-lh"><i style="background:${lane.color}"></i>${lane.label}</span>${grid}<span class="tlx-empty">aproxime para ver cada encontro</span>${inner}</div>`;
        continue;
      }
      const list = model.events.filter((e) => e.lane === lane.id && e.d >= st.t0 - 30 && e.d <= st.t1 + 30 && p >= (e.min ?? lane.min)).sort((a, b) => a.d - b.d);
      const placed = place(list, lane.rows).filter((q) => q.x > -280 && q.x < W() + 20);
      if (!placed.length) { html += `<div class="tlx-lane" style="height:40px"><span class="tlx-lh"><i style="background:${lane.color}"></i>${lane.label}</span>${grid}<span class="tlx-empty">nada neste período</span></div>`; continue; }
      const used = Math.max(1, ...placed.map((q) => q.row + 1)); const base = 30 + used * rowH + 8;
      html += `<div class="tlx-lane" style="height:${base + 16}px"><span class="tlx-lh"><i style="background:${lane.color}"></i>${lane.label}</span>${grid}${placed.map(({ e, x, row }) => {
        const top = row >= 0 ? 30 + (used - 1 - row) * rowH : null; const idx = model.events.indexOf(e);
        return `<div class="tlx-ev ${e.m ? 'm' : ''} ${st.sel === idx ? 'sel' : ''} s-${e.status} ${e.est ? 'est' : ''}" data-ev="${idx}">
          ${top != null ? `<div class="tlx-stem" style="left:${x}px;top:${top + 26}px;height:${base - top - 26}px;background:${lane.color}"></div>
          <div class="tlx-lab" style="left:${x}px;top:${top}px;border-left-color:${lane.color}">${esc(e.title)}<small>${fmtD(e.d, p < 7)}${e.h ? ' · ' + e.h : ''}${e.status === 'late' ? ' · atrasado' : ''}${e.edited ? ' · ajustado' : ''}</small></div>` : ''}
          <div class="tlx-dot ${e.m ? 'm' : ''}" style="left:${x}px;top:${base}px;--c:${lane.color}"></div></div>`; }).join('')}</div>`;
    }
    const xt = X(model.today);
    html += `<div class="tlx-axis">${tk.map((t) => `<span class="tlx-tick ${t.major ? 'major' : ''}" style="left:${X(t.d)}px">${t.l}</span>`).join('')}</div>`;
    view.innerHTML = html + (xt >= 0 && xt <= W() ? `<div class="tlx-today" style="left:${xt}px"><span>hoje</span></div>` : '');
    crumb(); mini();
  }

  function mini() {
    const el = root.querySelector('.tlx-mini'), w = el.clientWidth || 1, k = (d) => ((d - model.a) / (model.b - model.a)) * w;
    const bands = model.turma ? model.lanes.map((l) => ({ a: l.bar.a, b: l.bar.b, c: l.color, dashed: l.bar.dashed })) : model.phases;
    el.innerHTML = bands.map((p) => `<span class="m ${p.dashed ? 'dashed' : ''}" style="left:${k(p.a)}px;width:${Math.max(2, k(p.b) - k(p.a))}px;--c:${p.c}"></span>`).join('')
      + `<span class="t" style="left:${k(model.today)}px"></span><span class="win" style="left:${k(st.t0)}px;width:${Math.max(6, k(st.t1) - k(st.t0))}px"></span>`;
  }

  // Lista vertical (celular)
  function renderList() {
    crumb();
    const scopes = [['semana', 'Próximos 7 dias', 7], ['mes', 'Próximas 4 semanas', 28], ['tri', '3 meses', 92], ['tudo', 'Tudo', 1e5]];
    const sc = scopes.find((x) => x[0] === st.listScope);
    const evs = model.turma ? [] : model.events.filter((e) => st.on[e.lane] && (sc[0] === 'tudo' ? true : e.d >= model.today - 3 && e.d <= model.today + sc[2])).sort((a, b) => a.d - b.d);
    const lateOld = model.turma ? [] : model.events.filter((e) => st.on[e.lane] && e.status === 'late' && e.d < model.today - 3);
    const groups = {}; if (lateOld.length && sc[0] !== 'tudo') groups['Atrasados'] = lateOld;
    evs.forEach((e) => { const x = S(e.d); const k = `${MES[x.getUTCMonth()]} ${x.getUTCFullYear()}`; (groups[k] = groups[k] || []).push(e); });
    const lane = Object.fromEntries(model.lanes.map((l) => [l.id, l]));
    root.querySelector('.tlx-list').innerHTML = model.turma
      ? `<div class="tlx-mlist">${model.lanes.map((l) => `<a class="tlx-mrow" href="${l.bar.href}"><span class="tlx-mdot" style="background:${l.color}"></span><span><b>${esc(l.label)}</b><small>${esc(l.bar.label)}</small></span></a>`).join('')}</div>`
      : `<div class="tlx-scopes">${scopes.map(([id, l]) => `<button type="button" data-scope="${id}" class="${st.listScope === id ? 'on' : ''}">${l}</button>`).join('')}</div>
        ${Object.entries(groups).map(([k, list]) => `<h3 class="tlx-mh">${k}</h3><div class="tlx-mlist">${list.map((e) => `<button type="button" class="tlx-mrow s-${e.status} ${e.est ? 'est' : ''}" data-ev="${model.events.indexOf(e)}"><span class="tlx-mdate">${dow(e.d)}<b>${S(e.d).getUTCDate()}</b></span><span class="tlx-mdot" style="background:${lane[e.lane].color}"></span><span><b>${esc(e.title)}</b><small>${lane[e.lane].label}${e.h ? ' · ' + e.h : ''}${e.status === 'late' ? ' · atrasado' : e.status === 'done' ? ' · feito' : ''}</small></span></button>`).join('')}</div>`).join('') || '<div class="empty">Nada neste período.</div>'}`;
  }

  // Interação
  view.addEventListener('wheel', (e) => {
    e.preventDefault(); const r = view.getBoundingClientRect(), at = st.t0 + ((e.clientX - r.left) / r.width) * (st.t1 - st.t0);
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) { const dd = ((e.deltaX || e.deltaY) / r.width) * (st.t1 - st.t0); setRange(st.t0 + dd, st.t1 + dd); }
    else zoom(Math.exp(e.deltaY * 0.0022), at);
  }, { passive: false });
  let drag = null;
  view.addEventListener('pointerdown', (e) => { if (e.target.closest('a')) return; drag = { x: e.clientX, a: st.t0, b: st.t1, moved: false }; view.setPointerCapture(e.pointerId); });
  view.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 3) { drag.moved = true; view.classList.add('drag'); } const dd = (-dx / W()) * (drag.b - drag.a); setRange(drag.a + dd, drag.b + dd); });
  view.addEventListener('pointerup', (e) => {
    view.classList.remove('drag'); const moved = drag && drag.moved; drag = null; if (moved) return;
    const t = document.elementFromPoint(e.clientX, e.clientY);
    const ev = t && t.closest('[data-ev]'), ph = t && t.closest('[data-ph]'), ag = t && t.closest('[data-zoomto]');
    if (ag) { const c = +ag.dataset.zoomto, h = (+ag.dataset.span || 40) / 2; return setRange(c - h, c + h, true); }
    if (ev) { st.sel = +ev.dataset.ev; render(); opts.onSelect && opts.onSelect(model.events[st.sel]); return; }
    if (ph) { const p = model.phases.find((x) => x.id === ph.dataset.ph); setRange(p.a - (p.b - p.a) * 0.05, p.b + (p.b - p.a) * 0.05, true); }
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.z) return zoom(b.dataset.z === 'in' ? 0.6 : 1.6);
    if (b.dataset.p) {
      if (b.dataset.p === 'all') return setRange(model.a, model.b, true);
      const c = b.dataset.p === 'today' ? model.today : (st.t0 + st.t1) / 2;
      const span = { year: 365, month: 40, week: 9, today: Math.min(st.t1 - st.t0, 40) }[b.dataset.p];
      return setRange(c - span / 2, c + span / 2, true);
    }
    if (b.dataset.scope) { st.listScope = b.dataset.scope; return render(); }
    if (b.dataset.ev && mobile()) { opts.onSelect && opts.onSelect(model.events[+b.dataset.ev]); }
  });
  root.querySelectorAll('[data-lane]').forEach((b) => b.addEventListener('click', () => { st.on[b.dataset.lane] = !st.on[b.dataset.lane]; b.classList.toggle('off', !st.on[b.dataset.lane]); render(); }));
  let lastW = 0; const ro = new ResizeObserver(() => { const w = root.clientWidth; if (w !== lastW) { lastW = w; render(); } }); ro.observe(root);
  lastW = root.clientWidth; render();
  return { render, clearSel: () => { st.sel = null; render(); } };
}

// Itens dos próximos dias (para o Início).
export function upcoming(model, days = 7) {
  return model.events.filter((e) => e.d >= model.today && e.d <= model.today + days && !(e.lane === 'processo' && e.status === 'done')).sort((a, b) => a.d - b.d)
    .concat(model.events.filter((e) => e.status === 'late'));
}
