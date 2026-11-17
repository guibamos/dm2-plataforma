// Todas as contas do painel. Nada aqui é digitado pelo aluno: sai dos registros.

import { SYSTEMS, SUBJECTS, MISTAKES, MIXED, systemShort, subjectShort, mistakeById } from './lists.js?v=202611162357';
import { today, addDays, diffDays, mondayOf, sum, pct, fmtPct, fmtInt, fmtDate } from './util.js?v=202611162357';

export const MIN_N = 20; // abaixo disso, a % de acerto ainda não diz muito

export const PERIODS = [
  { id: '7d', label: '7 dias', days: 7 },
  { id: '28d', label: '4 semanas', days: 28 },
  { id: '84d', label: '12 semanas', days: 84 },
  { id: 'all', label: 'Tudo', days: null },
];

export function periodRange(periodId, settings) {
  const t = today();
  const p = PERIODS.find((x) => x.id === periodId) || PERIODS[1];
  const from = p.days ? addDays(t, -(p.days - 1)) : settings.startDate;
  const len = diffDays(t, from) + 1;
  return { from, to: t, len, prevFrom: addDays(from, -len), prevTo: addDays(from, -1) };
}

const inRange = (d, a, b) => d >= a && d <= b;

function agg(blocks) {
  const q = sum(blocks, (b) => b.questions);
  const c = sum(blocks, (b) => b.correct);
  return { q, c, acc: pct(c, q) };
}

export function analyze(data, periodId) {
  const { settings } = data;
  const t = today();
  const R = periodRange(periodId, settings);
  const blocks = data.blocks.filter((b) => inRange(b.date, R.from, R.to));
  const prevBlocks = data.blocks.filter((b) => inRange(b.date, R.prevFrom, R.prevTo));
  const mistakes = data.mistakes.filter((m) => inRange(m.date, R.from, R.to));
  const total = agg(blocks);
  const prev = agg(prevBlocks);
  const allTime = agg(data.blocks);

  // Anki: conta até ontem, ou até hoje se hoje já foi marcado.
  const ankiSet = new Set(data.anki.filter((a) => a.done).map((a) => a.date));
  const ankiEnd = ankiSet.has(t) ? t : addDays(t, -1);
  const ankiFrom = R.from < settings.startDate ? settings.startDate : R.from;
  const ankiDen = Math.max(0, diffDays(ankiEnd, ankiFrom) + 1);
  let ankiDays = 0;
  for (let d = ankiFrom; d <= ankiEnd; d = addDays(d, 1)) if (ankiSet.has(d)) ankiDays++;
  const ankiReviews = sum(data.anki.filter((a) => inRange(a.date, R.from, R.to)), (a) => a.reviews);

  // Dias com questões e sequência atual.
  const qDays = new Map();
  for (const b of data.blocks) qDays.set(b.date, (qDays.get(b.date) || 0) + b.questions);
  const studied = (d) => qDays.has(d) || ankiSet.has(d);
  let streak = 0;
  for (let d = studied(t) ? t : addDays(t, -1); studied(d); d = addDays(d, -1)) streak++;
  const lastQ = [...qDays.keys()].sort().pop();
  const lastAny = [...new Set([...qDays.keys(), ...ankiSet])].sort().pop();
  const daysSinceQ = lastQ ? diffDays(t, lastQ) : null;
  const daysSinceAny = lastAny ? diffDays(t, lastAny) : null;
  let activeDays = 0;
  for (let d = R.from < settings.startDate ? settings.startDate : R.from; d <= t; d = addDays(d, 1)) if (qDays.has(d)) activeDays++;

  // Semana atual e meta.
  const wkStart = mondayOf(t);
  const weekQ = sum(data.blocks.filter((b) => b.date >= wkStart), (b) => b.questions);
  const daysIntoWeek = diffDays(t, wkStart) + 1;

  // Semana a semana desde o início.
  const weeks = [];
  for (let w = mondayOf(settings.startDate), i = 1; w <= t; w = addDays(w, 7), i++) {
    const end = addDays(w, 6);
    const a = agg(data.blocks.filter((b) => inRange(b.date, w, end)));
    let ak = 0;
    for (let d = w; d <= end && d <= t; d = addDays(d, 1)) if (ankiSet.has(d)) ak++;
    weeks.push({ n: i, start: w, label: `S${i}`, ...a, ankiDays: ak, current: w === wkStart });
  }

  // Calendário (últimas 18 semanas).
  const calStart = [addDays(mondayOf(t), -7 * 17), addDays(mondayOf(settings.startDate), -7 * 4)].sort()[1]; // até 18 semanas, sem sobrar meses vazios
  const calendar = [];
  for (let d = calStart; d <= addDays(mondayOf(t), 6); d = addDays(d, 1)) {
    calendar.push({ date: d, q: qDays.get(d) || 0, anki: ankiSet.has(d), future: d > t, beforeStart: d < settings.startDate });
  }

  // Por sistema e por matéria (só blocos com sistema/matéria definidos).
  const mistakesBySys = new Map();
  for (const m of mistakes) {
    if (!mistakesBySys.has(m.system)) mistakesBySys.set(m.system, []);
    mistakesBySys.get(m.system).push(m);
  }
  const prevBy = (key) => {
    const m = new Map();
    for (const b of prevBlocks) { if (b[key] === MIXED) continue; const o = m.get(b[key]) || { q: 0, c: 0 }; o.q += b.questions; o.c += b.correct; m.set(b[key], o); }
    return m;
  };
  const prevSys = prevBy('system');
  const prevSub = prevBy('subject');
  const bySystem = SYSTEMS.map((s) => {
    const a = agg(blocks.filter((b) => b.system === s.id));
    const ms = mistakesBySys.get(s.id) || [];
    const p = prevSys.get(s.id);
    const pAcc = p && p.q >= MIN_N ? p.c / p.q : null;
    return { id: s.id, label: s.short, ...a, mistakes: ms.length, topType: topMistake(ms), prevAcc: pAcc, delta: a.acc != null && pAcc != null && a.q >= MIN_N ? a.acc - pAcc : null };
  });
  const subjects = SUBJECTS[settings.exam];
  const bySubject = subjects.map((s) => {
    const a = agg(blocks.filter((b) => b.subject === s));
    const p = prevSub.get(s);
    const pAcc = p && p.q >= MIN_N ? p.c / p.q : null;
    return { id: s, label: subjectShort(s), ...a, prevAcc: pAcc, delta: a.acc != null && pAcc != null && a.q >= MIN_N ? a.acc - pAcc : null };
  });
  const mixedQ = sum(blocks.filter((b) => b.system === MIXED), (b) => b.questions);

  // Matriz sistema × matéria.
  const matrixSystems = bySystem.filter((s) => s.q > 0).sort((a, b) => b.q - a.q).slice(0, 12).map((s) => s.id);
  const matrixSubjects = bySubject.filter((s) => s.q > 0).map((s) => s.id);
  const cell = new Map();
  for (const b of blocks) {
    if (b.system === MIXED || b.subject === MIXED) continue;
    const k = `${b.system}|${b.subject}`;
    const o = cell.get(k) || { q: 0, c: 0 }; o.q += b.questions; o.c += b.correct; cell.set(k, o);
  }
  const matrix = { systems: matrixSystems, subjects: matrixSubjects, get: (s, j) => cell.get(`${s}|${j}`) || { q: 0, c: 0 } };

  // Cobertura (histórico todo): sistemas que ainda não apareceram.
  const coveredSys = new Set(data.blocks.map((b) => b.system));
  const uncovered = SYSTEMS.filter((s) => !coveredSys.has(s.id)).map((s) => s.short);

  // Erros.
  const mistakeTypes = MISTAKES.map((m) => {
    const n = mistakes.filter((x) => x.type === m.id).length;
    return { ...m, n, share: mistakes.length ? n / mistakes.length : 0 };
  });
  const topType = mistakeTypes.slice().sort((a, b) => b.n - a.n)[0];
  const subMap = new Map();
  for (const m of mistakes) {
    const k = `${m.system}|${m.subtopic}`;
    const o = subMap.get(k) || { system: m.system, subtopic: m.subtopic, n: 0, types: [] };
    o.n++; o.types.push(m); subMap.set(k, o);
  }
  const topSubtopics = [...subMap.values()].sort((a, b) => b.n - a.n).slice(0, 6).map((o) => ({ ...o, topType: topMistake(o.types) }));
  const recentLearned = data.mistakes.filter((m) => m.learned).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  const assessments = data.assessments.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const daysToExam = settings.examDate ? diffDays(settings.examDate, t) : null;

  const res = {
    range: R, settings, total, prev, allTime, delta: total.acc != null && prev.acc != null && prev.q >= MIN_N ? total.acc - prev.acc : null,
    anki: { days: ankiDays, den: ankiDen, rate: ankiDen ? ankiDays / ankiDen : null, reviews: ankiReviews },
    streak, daysSinceQ, daysSinceAny, activeDays, daysToExam,
    week: { q: weekQ, goal: settings.weeklyGoal, daysIn: daysIntoWeek, expected: Math.round(settings.weeklyGoal * daysIntoWeek / 7) },
    weeks, calendar, bySystem, bySubject, mixedQ, matrix, uncovered,
    mistakes: { total: mistakes.length, types: mistakeTypes, top: topType && topType.n ? topType : null, topSubtopics, recentLearned },
    assessments,
  };
  res.insights = insights(res);
  res.status = statusOf(res);
  return res;
}

function topMistake(list) {
  if (!list.length) return null;
  const c = new Map();
  for (const m of list) c.set(m.type, (c.get(m.type) || 0) + 1);
  const [id] = [...c.entries()].sort((a, b) => b[1] - a[1])[0];
  return mistakeById(id);
}

// "Onde focar": lacunas e sinais de alerta em linguagem simples.
// severity: critical | warning | good | info (hábito) e gap (lacuna de conteúdo, não muda o status)
function insights(a) {
  const out = [];
  const avg = a.total.acc;

  if (a.daysSinceAny != null && a.daysSinceAny >= 3) {
    out.push({ severity: 'critical', key: 'sumiu', title: `Sem registro há ${a.daysSinceAny} dias`, detail: 'Vale mandar uma mensagem de check-in.' });
  }
  if (avg != null) {
    a.bySystem.filter((s) => s.q >= MIN_N && s.acc < avg - 0.05).sort((x, y) => x.acc - y.acc).slice(0, 3).forEach((s) => {
      out.push({ severity: 'gap', key: 'sys', title: `${s.label}: ${fmtPct(s.acc)} de acerto`, detail: `${fmtInt(s.q)} questões, abaixo da sua média de ${fmtPct(avg)}${s.topType ? `. Erro mais comum: ${s.topType.label.toLowerCase()}.` : '.'}` });
    });
    a.bySubject.filter((s) => s.q >= MIN_N && s.acc < avg - 0.05).sort((x, y) => x.acc - y.acc).slice(0, 2).forEach((s) => {
      out.push({ severity: 'gap', key: 'sub', title: `${s.label}: ${fmtPct(s.acc)} de acerto`, detail: `${fmtInt(s.q)} questões no período, abaixo da média de ${fmtPct(avg)}.` });
    });
  }
  const wk = a.weeks.filter((w) => !w.current && w.q > 0);
  if (wk.length >= 4) {
    const last2 = wk.slice(-2); const prev2 = wk.slice(-4, -2);
    const l = sum(last2, (w) => w.c) / sum(last2, (w) => w.q); const p = sum(prev2, (w) => w.c) / sum(prev2, (w) => w.q);
    if (l - p <= -0.04) out.push({ severity: 'warning', key: 'queda', title: `Acerto caiu ${Math.round((p - l) * 100)} pontos`, detail: `Últimas 2 semanas: ${fmtPct(l)}. As 2 anteriores: ${fmtPct(p)}. Cansaço ou tema novo?` });
    if (l - p >= 0.04) out.push({ severity: 'good', key: 'subiu', title: `Acerto subiu ${Math.round((l - p) * 100)} pontos`, detail: `Últimas 2 semanas: ${fmtPct(l)}. As 2 anteriores: ${fmtPct(p)}.` });
  }
  if (a.mistakes.top && a.mistakes.total >= 10 && a.mistakes.top.share >= 0.3) {
    out.push({ severity: 'info', key: 'erro', title: `${Math.round(a.mistakes.top.share * 100)}% dos erros: ${a.mistakes.top.label.toLowerCase()}`, detail: a.mistakes.top.todo });
  }
  if (a.anki.rate != null && a.anki.den >= 5 && a.anki.rate < 0.8) {
    out.push({ severity: 'warning', key: 'anki', title: `Anki em ${a.anki.days} de ${a.anki.den} dias`, detail: 'Dia sem Anki acumula revisão. Melhor poucos cards todo dia do que muitos de vez em quando.' });
  }
  if (a.week.goal && a.week.daysIn >= 3 && a.week.q < a.week.expected * 0.7) {
    out.push({ severity: 'warning', key: 'meta', title: `Semana abaixo da meta: ${fmtInt(a.week.q)} de ${fmtInt(a.week.goal)}`, detail: `Até hoje o esperado era cerca de ${fmtInt(a.week.expected)}.` });
  }
  const lastSim = a.assessments[a.assessments.length - 1];
  if (a.daysToExam != null && a.daysToExam <= 60 && (!lastSim || diffDays(today(), lastSim.date) > 21)) {
    out.push({ severity: 'warning', key: 'sim', title: 'Simulado atrasado', detail: lastSim ? `O último foi em ${fmtDate(lastSim.date)}, e a prova é em ${a.daysToExam} dias.` : `A prova é em ${a.daysToExam} dias e ainda não há simulado registrado.` });
  }
  if (a.uncovered.length && a.settings.exam === 'Step 1' && a.uncovered.length <= 14) {
    out.push({ severity: 'gap', key: 'cob', title: `${a.uncovered.length} sistemas ainda sem questões`, detail: a.uncovered.slice(0, 6).join(', ') + (a.uncovered.length > 6 ? '…' : '.') });
  }
  if (!out.some((o) => o.severity === 'critical' || o.severity === 'warning')) {
    out.unshift({ severity: 'good', key: 'ok', title: 'Tudo em dia', detail: 'Volume, Anki e acerto dentro do combinado.' });
  }
  return out;
}

function statusOf(a) {
  if (a.insights.some((i) => i.severity === 'critical')) return { level: 'critical', label: 'Precisa de contato' };
  const w = a.insights.filter((i) => i.severity === 'warning').length;
  if (w >= 2) return { level: 'serious', label: 'Atenção' };
  if (w === 1) return { level: 'warning', label: 'Acompanhar' };
  return { level: 'good', label: 'No ritmo' };
}

export { systemShort, subjectShort };
