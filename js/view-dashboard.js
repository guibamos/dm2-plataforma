// Zona ANÁLISE: o painel. Serve para o aluno e, em modo leitura, para o mentor.

import { analyze, PERIODS, MIN_N } from './analytics.js?v=202611162334';
import { systemShort, subjectShort, mistakeById } from './lists.js?v=202611162334';
import { fmtPct, fmtInt, fmtDate, fmtDateLong, esc, today, parse, monthShort } from './util.js?v=202611162334';
import { icon, deltaHtml, STATUS_ICON } from './ui.js?v=202611162334';
import { weeklyVolume, weeklyAccuracy, assessmentsChart } from './charts.js?v=202611162334';

export const dashState = { period: '28d', sysSort: 'worst', showTable: {} };

function kpis(a) {
  const goalPct = a.week.goal ? a.week.q / a.week.goal : 0;
  return `<div class="kpis">
    <div class="kpi"><span class="kpi-l">${icon('book')} Questões</span><span class="kpi-v">${fmtInt(a.total.q)}</span>
      <span class="kpi-d">${a.prev.q ? `antes: ${fmtInt(a.prev.q)}` : 'no período'} · ${a.activeDays} dias com questões</span></div>
    <div class="kpi"><span class="kpi-l">${icon('target')} Acerto</span><span class="kpi-v">${fmtPct(a.total.acc)}</span>
      <span class="kpi-d">${a.delta != null ? `${deltaHtml(a.delta, ' pts')} vs período anterior` : 'sem período anterior para comparar'}</span></div>
    <div class="kpi"><span class="kpi-l">${icon('layers')} Anki</span><span class="kpi-v">${a.anki.days}<small> de ${a.anki.den} dias</small></span>
      <div class="meter gold"><i style="width:${(a.anki.rate || 0) * 100}%"></i></div></div>
    <div class="kpi"><span class="kpi-l">${icon('calendar')} Meta da semana</span><span class="kpi-v">${fmtInt(a.week.q)}<small> de ${fmtInt(a.week.goal)}</small></span>
      <div class="meter"><i style="width:${Math.min(100, goalPct * 100)}%"></i></div></div>
    <div class="kpi"><span class="kpi-l">${icon('flame')} Sequência</span><span class="kpi-v">${a.streak}<small> ${a.streak === 1 ? 'dia' : 'dias'}</small></span>
      <span class="kpi-d">${a.daysToExam != null ? `prova em <b style="color:var(--ink)">${a.daysToExam} dias</b>` : 'sem data de prova'}</span></div>
  </div>`;
}

function insightRow(i) {
  return `<div class="ins ${i.severity}">${icon(STATUS_ICON[i.severity])}<div><b>${esc(i.title)}</b><small>${esc(i.detail)}</small></div></div>`;
}

function focusCard(a, who) {
  const habits = a.insights.filter((i) => i.severity !== 'gap');
  const gaps = a.insights.filter((i) => i.severity === 'gap');
  return `<div class="card">
    <div class="card-h"><div><h2>Onde focar agora</h2><p>Sistema ou matéria com menos de ${MIN_N} questões no período não entra nas lacunas.</p></div></div>
    <div class="focus">
      <div class="focus-col"><h3>Ritmo e hábitos</h3>${habits.map(insightRow).join('')}</div>
      <div class="focus-col"><h3>Lacunas de conteúdo</h3>${gaps.map(insightRow).join('') || `<div class="ins good">${icon('checkCircle')}<div><b>Nenhuma lacuna clara</b><small>Nenhum sistema ou matéria bem abaixo da média ${who === 'mentor' ? 'do aluno' : 'sua'} neste período.</small></div></div>`}</div>
    </div>
  </div>`;
}

function chartCard(id, title, desc, extra = '', tableHtml = '') {
  const showT = dashState.showTable[id];
  return `<div class="card">
    <div class="card-h"><div><h2>${title}</h2><p>${desc}</p></div>
      ${tableHtml ? `<button class="btn btn-ghost btn-sm" data-table="${id}" aria-pressed="${showT ? 'true' : 'false'}">${icon(showT ? 'chart' : 'table')} ${showT ? 'Gráfico' : 'Tabela'}</button>` : ''}</div>
    ${showT ? `<div class="t-wrap">${tableHtml}</div>` : `<div class="chart"><canvas id="cv-${id}" role="img" aria-label="${esc(title)}"></canvas></div>${extra}`}
  </div>`;
}

function weeksTable(weeks, goal) {
  return `<table class="t"><thead><tr><th>Semana</th><th>Início</th><th class="r">Questões</th><th class="r">Meta</th><th class="r">Acerto</th><th class="r">Dias de Anki</th></tr></thead><tbody>
  ${weeks.slice().reverse().map((w) => `<tr><td>${w.label}${w.current ? ' <span class="muted">(atual)</span>' : ''}</td><td>${fmtDate(w.start)}</td><td class="r">${fmtInt(w.q)}</td><td class="r">${fmtInt(goal)}</td><td class="r">${fmtPct(w.acc)}</td><td class="r">${w.ankiDays}/7</td></tr>`).join('')}
  </tbody></table>`;
}

function calendarCard(a) {
  const lvl = (q) => (q === 0 ? '' : q < 20 ? 'l1' : q < 40 ? 'l2' : q < 60 ? 'l3' : q < 90 ? 'l4' : 'l5');
  const cells = [];
  const dl = ['seg', '', 'qua', '', 'sex', '', ''];
  cells.push('<span></span>');
  dl.forEach((d) => cells.push(`<span class="dl">${d}</span>`));
  let lastMonth = -1;
  const t = today();
  for (let w = 0; w < a.calendar.length / 7; w++) {
    const week = a.calendar.slice(w * 7, w * 7 + 7);
    const m = parse(week[0].date).getMonth();
    cells.push(`<span class="mo">${m !== lastMonth ? monthShort(m) : ''}</span>`);
    lastMonth = m;
    for (const d of week) {
      if (d.future) { cells.push('<span class="d" style="background:transparent"></span>'); continue; }
      if (d.beforeStart) { cells.push(`<span class="d out" data-tip="${fmtDateLong(d.date)}\nAntes do início da mentoria"></span>`); continue; }
      const tip = `${fmtDateLong(d.date)}\n${d.q ? `${d.q} questões` : 'Sem questões'} · ${d.anki ? 'Anki feito' : 'sem Anki'}`;
      cells.push(`<span class="d ${lvl(d.q)} ${d.anki ? 'ak' : ''} ${d.date === t ? 'today' : ''}" data-tip="${tip}"></span>`);
    }
  }
  return `<div class="card">
    <div class="card-h"><div><h2>Constância</h2><p>Cada quadrado é um dia. Quanto mais escuro, mais questões. O ponto dourado marca dia com Anki.</p></div></div>
    <div class="cal-wrap"><div class="cal" style="grid-template-columns: 26px">${cells.join('')}</div></div>
    <div class="cal-legend" style="margin-top:12px">Menos <span class="d" style="background:var(--seq-0)"></span><span class="d" style="background:var(--seq-1)"></span><span class="d" style="background:var(--seq-2)"></span><span class="d" style="background:var(--seq-3)"></span><span class="d" style="background:var(--seq-4)"></span><span class="d" style="background:var(--seq-5)"></span> Mais
      <span style="margin-left:14px;display:inline-flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:var(--gold-mark);display:inline-block"></span> Anki</span></div>
  </div>`;
}

function hbars(items, avg, kind) {
  const withData = items.filter((s) => s.q > 0);
  const none = items.filter((s) => s.q === 0);
  const sorted = withData.slice().sort((x, y) => (dashState.sysSort === 'worst' ? x.acc - y.acc : y.q - x.q));
  const rows = sorted.map((s) => {
    const low = s.q >= MIN_N && avg != null && s.acc < avg - 0.05;
    const tip = `${kind === 'sys' ? s.id : s.id}\n${fmtPct(s.acc, 1)} de acerto em ${fmtInt(s.q)} questões${s.mistakes != null ? `\nErros anotados: ${s.mistakes}` : ''}${s.topType ? `\nErro mais comum: ${s.topType.label}` : ''}${s.delta != null ? `\nVs período anterior: ${s.delta > 0 ? '+' : ''}${(s.delta * 100).toFixed(1).replace('.', ',')} pts` : ''}${s.q < MIN_N ? '\nPoucas questões: ainda não dá para concluir' : ''}`;
    return `<div class="hbar" data-tip="${esc(tip)}">
      <span class="nm">${esc(s.label)}</span>
      <span class="trk"><span class="bar ${low ? 'low' : ''} ${s.q < MIN_N ? 'thin' : ''}" style="width:${s.acc * 100}%"></span>${avg != null ? `<span class="avg" style="left:calc(${avg * 100}% - 1px)"></span>` : ''}</span>
      <span class="v">${fmtPct(s.acc)}</span>
      <span class="n">${fmtInt(s.q)} q${s.delta != null ? ` ${s.delta >= 0.005 ? '▲' : s.delta <= -0.005 ? '▼' : ''}` : ''}</span>
    </div>`;
  });
  return `<div class="hbars">${rows.join('') || '<div class="empty">Sem blocos de um sistema ou matéria só neste período. Blocos mistos não entram aqui.</div>'}</div>
    <div class="legend"><span><i style="background:var(--series)"></i>Acerto</span><span><i style="background:var(--div-neg)"></i>Mais de 5 pts abaixo da média</span><span><i class="line"></i>Média do período (${fmtPct(avg)})</span><span><i style="background:var(--series);opacity:.35"></i>Menos de ${MIN_N} questões</span></div>
    ${none.length ? `<p class="small muted" style="margin:10px 0 0"><b>Sem questões no período:</b> ${none.map((s) => esc(s.label)).join(', ')}.</p>` : ''}`;
}

function matrixCard(a) {
  const { systems, subjects, get } = a.matrix;
  if (!systems.length || !subjects.length) return '';
  const avg = a.total.acc;
  const color = (acc) => {
    const d = Math.max(-0.2, Math.min(0.2, acc - avg));
    const p = Math.round((Math.abs(d) / 0.2) * 85);
    return `background:color-mix(in oklab, ${d < 0 ? 'var(--div-neg)' : 'var(--div-pos)'} ${p}%, var(--div-mid));color:${p > 55 ? '#fff' : 'var(--ink)'}`;
  };
  const head = subjects.map((j) => `<th scope="col">${esc(subjectShort(j))}</th>`).join('');
  const body = systems.map((s) => `<tr><th scope="row">${esc(systemShort(s))}</th>${subjects.map((j) => {
    const c = get(s, j);
    if (c.q < 10) return `<td class="na" data-tip="${esc(systemShort(s))} × ${esc(subjectShort(j))}\n${c.q ? `${c.q} questões: poucas para concluir` : 'Sem questões'}">${c.q ? '·' : ''}</td>`;
    const acc = c.c / c.q;
    return `<td style="${color(acc)}" data-tip="${esc(systemShort(s))} × ${esc(subjectShort(j))}\n${fmtPct(acc, 1)} em ${c.q} questões">${Math.round(acc * 100)}</td>`;
  }).join('')}</tr>`).join('');
  return `<div class="card">
    <div class="card-h"><div><h2>Sistema × matéria</h2><p>Números = % de acerto. Vermelho abaixo da média, verde acima.</p></div></div>
    <div class="mx-wrap"><table class="mx"><thead><tr><th></th>${head}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="legend"><span><i style="background:var(--div-neg)"></i>Abaixo da média (${fmtPct(avg)})</span><span><i style="background:var(--div-mid);border:1px solid var(--line-2)"></i>Na média</span><span><i style="background:var(--div-pos)"></i>Acima</span><span>· menos de 10 questões</span></div>
  </div>`;
}

function mistakesCard(a) {
  const m = a.mistakes;
  const max = Math.max(1, ...m.types.map((t) => t.n));
  const rows = m.types.slice().sort((x, y) => y.n - x.n).map((t) => `
    <div class="hbar" style="grid-template-columns:minmax(120px,190px) minmax(0,1fr) 44px 44px" data-tip="${esc(t.label)}\n${t.n} erros (${Math.round(t.share * 100)}%)\n${esc(t.hint)}">
      <span class="nm">${esc(t.label)}</span>
      <span class="trk"><span class="bar" style="width:${(t.n / max) * 100}%;background:var(--div-neg)"></span></span>
      <span class="v">${t.n}</span><span class="n">${Math.round(t.share * 100)}%</span>
    </div>`).join('');
  return `<div class="card">
    <div class="card-h"><div><h2>Por que você erra</h2><p>${fmtInt(m.total)} erros anotados no período, pelos 6 tipos de erro.</p></div></div>
    ${m.total ? `<div class="hbars">${rows}</div>
    ${m.top ? `<div class="ins info" style="margin-top:14px">${icon('info')}<div><b>O que fazer: ${esc(m.top.label.toLowerCase())}</b><small>${esc(m.top.todo)}</small></div></div>` : ''}` : '<div class="empty">Nenhum erro anotado neste período.</div>'}
  </div>`;
}

function subtopicsCard(a) {
  const list = a.mistakes.topSubtopics;
  return `<div class="card">
    <div class="card-h"><div><h2>Subtópicos com mais erros</h2></div></div>
    ${list.length ? `<ul class="subs">${list.map((s) => `<li><span class="cnt">${s.n}</span><span class="tx"><b>${esc(s.subtopic || 'Sem subtópico')}</b><small>${esc(systemShort(s.system))}${s.topType ? ` · mais comum: ${esc(s.topType.label.toLowerCase())}` : ''}</small></span></li>`).join('')}</ul>` : '<div class="empty">Nenhum erro anotado neste período.</div>'}
  </div>`;
}

function assessmentsCard(a) {
  const list = a.assessments;
  const useScore = a.settings.exam === 'Step 2 CK' && list.length && list.every((x) => x.score);
  const table = `<table class="t"><thead><tr><th>Data</th><th>Simulado</th><th class="r">Acerto</th><th class="r">${a.settings.exam === 'Step 2 CK' ? 'Nota' : 'Nota/chance'}</th></tr></thead><tbody>
    ${list.slice().reverse().map((x) => `<tr><td>${fmtDate(x.date)}</td><td>${esc(x.kind)} <span class="muted">${esc(x.name)}</span></td><td class="r"><b>${fmtPct(x.pct)}</b></td><td class="r">${esc(x.score || '—')}</td></tr>`).join('')}</tbody></table>`;
  if (!list.length) {
    return `<div class="card"><div class="card-h"><div><h2>Simulados</h2><p>Evolução nos simulados (NBME, UWSA, Free 120).</p></div></div><div class="empty">Nenhum simulado registrado ainda. Combine com o mentor quando fazer o primeiro.</div></div>`;
  }
  return `<div class="card">
    <div class="card-h"><div><h2>Simulados</h2><p>${useScore ? 'Nota estimada' : '% de acerto'} em cada simulado, desde o início.</p></div></div>
    ${list.length >= 2 ? `<div class="chart sm"><canvas id="cv-sim" role="img" aria-label="Evolução nos simulados"></canvas></div>` : ''}
    <div class="t-wrap" style="margin-top:12px">${table}</div>
  </div>`;
}

function learnedCard(a, who) {
  const list = a.mistakes.recentLearned;
  return `<div class="card">
    <div class="card-h"><div><h2>${who === 'mentor' ? 'O que o aluno anotou' : 'O que você aprendeu'}</h2><p>As últimas frases do campo "O que aprendi".</p></div></div>
    ${list.length ? `<ul class="learned" style="margin:0;padding:0">${list.map((m) => `<li><small>${fmtDate(m.date)} · ${esc(systemShort(m.system))}${m.subtopic ? ` › ${esc(m.subtopic)}` : ''} · ${esc(mistakeById(m.type)?.label || '')}</small>${esc(m.learned)}</li>`).join('')}</ul>` : '<div class="empty">Nenhuma anotação ainda.</div>'}
  </div>`;
}

export function dashboardBody(data, who) {
  const a = analyze(data, dashState.period);
  const html = `
    ${kpis(a)}
    ${focusCard(a, who)}
    <div class="section-gap"></div>
    <div class="grid g-2">
      ${chartCard('vol', 'Questões por semana', 'Desde o início da mentoria. A linha dourada é a meta semanal. A semana atual aparece mais clara.', `<div class="legend"><span><i style="background:var(--series)"></i>Questões</span><span><i style="background:var(--gold-mark);height:3px;border-radius:2px"></i>Meta (${fmtInt(a.week.goal)})</span></div>`, weeksTable(a.weeks, a.week.goal))}
      ${chartCard('acc', 'Acerto por semana', 'Desde o início. A % de acerto costuma oscilar com o tema da semana; o que importa é a tendência.', '', weeksTable(a.weeks, a.week.goal))}
    </div>
    <div class="section-gap"></div>
    ${calendarCard(a)}
    <div class="section-gap"></div>
    <div class="grid g-2">
      <div class="card">
        <div class="card-h"><div><h2>Por sistema</h2><p>Só blocos de um sistema. ${a.mixedQ ? `${fmtInt(a.mixedQ)} questões de blocos mistos ficam de fora.` : ''}</p></div>
          <div class="seg" style="flex:none"><button class="${dashState.sysSort === 'worst' ? 'on' : ''}" data-sort="worst" style="padding:5px 10px;font-size:12px">Pior primeiro</button><button class="${dashState.sysSort === 'volume' ? 'on' : ''}" data-sort="volume" style="padding:5px 10px;font-size:12px">Mais questões</button></div></div>
        ${hbars(a.bySystem, a.total.acc, 'sys')}
      </div>
      <div class="card">
        <div class="card-h"><div><h2>Por matéria</h2><p>Disciplinas como aparecem no UWorld (${esc(a.settings.exam)}).</p></div></div>
        ${hbars(a.bySubject.map((s) => ({ ...s, mistakes: null })), a.total.acc, 'sub')}
      </div>
    </div>
    <div class="section-gap"></div>
    ${matrixCard(a)}
    <div class="section-gap"></div>
    <div class="grid g-2">${mistakesCard(a)}${subtopicsCard(a)}</div>
    <div class="section-gap"></div>
    <div class="grid g-2">${assessmentsCard(a)}${learnedCard(a, who)}</div>`;
  return { html, a };
}

export function periodFilter() {
  return `<div class="filters"><span class="small muted">Período</span><div class="seg full" role="group" aria-label="Período">${PERIODS.map((p) => `<button class="${dashState.period === p.id ? 'on' : ''}" data-period="${p.id}">${p.label}</button>`).join('')}</div></div>`;
}

export function mountCharts(root, a) {
  if (!dashState.showTable.vol) weeklyVolume(root.querySelector('#cv-vol'), a.weeks, a.week.goal);
  if (!dashState.showTable.acc) weeklyAccuracy(root.querySelector('#cv-acc'), a.weeks);
  if (a.assessments.length >= 2) assessmentsChart(root.querySelector('#cv-sim'), a.assessments, a.settings.exam === 'Step 2 CK' && a.assessments.every((x) => x.score));
}

// Cliques comuns do painel (período, ordenação, tabela).
export function handleDashClick(e, refresh) {
  const el = e.target.closest('button');
  if (!el) return false;
  if (el.dataset.period) { dashState.period = el.dataset.period; refresh(); return true; }
  if (el.dataset.sort) { dashState.sysSort = el.dataset.sort; refresh(); return true; }
  if (el.dataset.table) { dashState.showTable[el.dataset.table] = !dashState.showTable[el.dataset.table]; refresh(); return true; }
  return false;
}

export function renderStudentDashboard(root, ctx) {
  const { html, a } = dashboardBody(ctx.data, 'student');
  root.innerHTML = `
    <div class="zone-head">
      <div><span class="eyebrow ana">${icon('sparkles')} Análise automática</span><h1>Meu painel</h1>
        <p class="sub">${esc(a.settings.exam)}${a.settings.examDate ? ` · prova em ${fmtDate(a.settings.examDate)}` : ' · sem data de prova'}</p></div>
      ${periodFilter()}
    </div>
    ${html}`;
  mountCharts(root, a);
  root.onclick = (e) => handleDashClick(e, ctx.refresh);
  root.oninput = root.onchange = root.onsubmit = null;
}
