// Telas da timeline: a do aluno e a do admin (modelo da mentoria, turma e ajuste por aluno).

import { store } from './store.js?v=202611162357';
import { buildStudent, buildModel, buildTurma, mountTimeline, upcoming, fmtD, dow, ISO, LANES } from './timeline.js?v=202611162357';
import { GUIDES } from './guides.js?v=202611162357';
import { esc } from './util.js?v=202611162357';
import { icon, toast } from './ui.js?v=202611162357';

const laneOf = Object.fromEntries(LANES.map((l) => [l.id, l]));
const guideTitle = (id) => (GUIDES.find((g) => g.id === id) || {}).title;
const statusTxt = { done: 'Feito', next: 'Próximo', late: 'Atrasado' };

function panelHtml(e, body) {
  const l = laneOf[e.lane] || { label: '', color: 'var(--ink-3)' };
  return `<div class="tlx-panel" role="dialog" aria-label="${esc(e.title)}"><button type="button" class="tlx-close" data-close="1">Fechar</button>
    <span class="tlx-tag" style="color:${l.color}">${l.label}</span><h3>${esc(e.title)}</h3>
    <div class="tlx-when">${dow(e.d)}, ${fmtD(e.d)}${e.h ? ' · ' + e.h : ''}${e.est ? ' · previsão' : ''}</div>
    <div class="tlx-pills"><span class="tlx-st s-${e.status}">${statusTxt[e.status] || ''}</span>${e.edited ? '<span class="tlx-st">Data ajustada pela mentoria</span>' : ''}</div>
    ${e.text ? `<p>${esc(e.text)}</p>` : ''}
    ${e.guide ? `<p><a href="#guia-${e.guide}">${icon('compass')} Guia: ${esc(guideTitle(e.guide))}</a></p>` : ''}
    ${body || ''}</div>`;
}

// ---------------- Aluno ----------------
export function renderTimeline(root, ctx) {
  const me = ctx.me;
  const build = () => buildStudent(ctx.data, store.tlTemplate(), store.tlState(me.id));
  let model = build();
  const noDate = !ctx.data.settings.examDate;
  root.innerHTML = `
    <div class="zone-head"><div><h1>Minha timeline</h1>
      <p class="sub">${esc(ctx.data.settings.exam)}${noDate ? ' · sem data de prova: as datas da prova em diante são previsão' : ''}</p></div></div>
    <div id="tl"></div><div id="tlp"></div>`;
  let tl;
  const show = (e) => {
    const body = e.check ? `<div class="actions" style="justify-content:flex-start;margin-top:12px"><button class="btn ${e.status === 'done' ? 'btn-ghost' : 'btn-fill'} btn-sm" data-done="${e.id}">${icon('check')} ${e.status === 'done' ? 'Desmarcar' : 'Marcar como feito'}</button></div>` : '';
    root.querySelector('#tlp').innerHTML = panelHtml(e, body);
  };
  tl = mountTimeline(root.querySelector('#tl'), model, { onSelect: show });
  root.onclick = (ev) => {
    if (ev.target.closest('[data-close]')) { root.querySelector('#tlp').innerHTML = ''; tl.clearSel(); return; }
    const d = ev.target.closest('[data-done]');
    if (d) {
      store.toggleTlDone(d.dataset.done); toast('Timeline atualizada');
      const id = d.dataset.done; const fresh = build();
      model.events.forEach((e, i) => { const f = fresh.events[i]; if (f) e.status = f.status; });
      tl.render(); show(model.events.find((e) => e.id === id));
    }
  };
  root.oninput = root.onchange = root.onsubmit = null;
}

// Card "Próximos 7 dias" do Início.
export function upcomingCard(ctx) {
  const model = buildStudent(ctx.data, store.tlTemplate(), store.tlState(ctx.me.id));
  const list = upcoming(model, 7);
  const late = list.filter((e) => e.status === 'late');
  const next = list.filter((e) => e.status !== 'late').slice(0, 5);
  const row = (e) => `<a class="tlx-mrow s-${e.status}" href="#timeline"><span class="tlx-mdate">${dow(e.d)}<b>${new Date(e.d * 864e5).getUTCDate()}</b></span><span class="tlx-mdot" style="background:${laneOf[e.lane].color}"></span><span><b>${esc(e.title)}</b><small>${laneOf[e.lane].label}${e.h ? ' · ' + e.h : ''}${e.status === 'late' ? ' · atrasado' : ''}</small></span></a>`;
  return `<div class="card">
    <div class="card-h"><div><h2>Próximos 7 dias</h2><p>Da sua timeline.</p></div><a class="btn btn-ghost btn-sm" href="#timeline">Ver timeline ${icon('chevron')}</a></div>
    <div class="tlx-mlist">${late.slice(0, 2).map(row).join('')}${late.length > 2 ? `<a class="tlx-more" href="#timeline">+ ${late.length - 2} atrasados na timeline</a>` : ''}${next.slice(0, 4).map(row).join('') || (late.length ? '' : '<div class="empty">Nada nos próximos 7 dias.</div>')}</div>
  </div>`;
}

// ---------------- Admin ----------------
const A = { mode: 'modelo', aluno: null };

export function renderAdminTimeline(root, ctx, alunoId) {
  if (alunoId) { A.mode = 'aluno'; A.aluno = alunoId; }
  const students = store.myStudents();
  if (!A.aluno && students.length) A.aluno = students[0].id;
  let model;
  if (A.mode === 'modelo') model = buildModel(store.tlTemplate());
  else if (A.mode === 'turma') model = buildTurma(students.map((u) => ({ u, data: store.student(u.id) })));
  else model = buildStudent(store.student(A.aluno), store.tlTemplate(), store.tlState(A.aluno));

  const desc = { modelo: 'O programa padrão da mentoria. Mudar aqui muda a timeline de todos os alunos. Clique num encontro para editar.', turma: 'Uma linha por aluno, do início da mentoria até a prova. Tracejado: ainda sem data de prova.', aluno: 'A timeline do aluno. Clique num item para ajustar a data só para ele.' };
  root.innerHTML = `
    <div class="zone-head"><div><h1>Timeline</h1><p class="sub">${desc[A.mode]}</p></div>
      <div class="filters"><div class="seg">${[['modelo', 'Modelo da mentoria'], ['turma', 'Turma'], ['aluno', 'Por aluno']].map(([k, l]) => `<button class="${A.mode === k ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('')}</div>
        ${A.mode === 'aluno' ? `<select class="input" data-aluno style="width:auto">${students.map((u) => `<option value="${u.id}" ${u.id === A.aluno ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : ''}</div></div>
    <div id="tl"></div><div id="tlp"></div>`;

  const show = (e) => {
    let body = '';
    if (A.mode === 'modelo' && e.lane === 'mentoria') {
      const it = store.tlTemplate().find((x) => x.id === e.id);
      body = `<form class="form" data-form="tpl" style="margin-top:12px;gap:10px">
        <label class="field"><span>Título</span><input class="input" name="title" value="${esc(it.title)}"></label>
        <div class="row"><label class="field"><span>Dia do programa</span><input class="input" type="number" min="0" name="off" value="${it.off}"></label>
          <label class="field"><span>Horário</span><input class="input" name="h" value="${esc(it.h || '')}" placeholder="20h"></label></div>
        <label class="field"><span>Descrição</span><input class="input" name="text" value="${esc(it.text || '')}"></label>
        <div class="actions"><span class="muted small">Dia 0 = início da mentoria.</span><button class="btn btn-fill btn-sm" type="submit">${icon('check')} Salvar no modelo</button></div></form>`;
    } else if (A.mode === 'modelo') {
      body = '<p class="muted small">Itens de processo, simulados e marcos dependem das datas de cada aluno. Para mudar só para um aluno, use "Por aluno".</p>';
    } else if (A.mode === 'aluno' && !e.id.startsWith('sim-')) {
      body = `<form class="form" data-form="ov" style="margin-top:12px;gap:10px">
        <label class="field"><span>Data só para este aluno</span><input class="input" type="date" name="date" value="${ISO(e.d)}"></label>
        <div class="actions">${e.edited ? `<button class="btn btn-ghost btn-sm" type="button" data-reset="${e.id}">Voltar ao padrão</button>` : '<span></span>'}<button class="btn btn-fill btn-sm" type="submit">${icon('check')} Salvar data</button></div></form>`;
    }
    root.querySelector('#tlp').innerHTML = panelHtml(e, body);
    root.querySelector('#tlp').dataset.id = e.id;
  };
  const tl = mountTimeline(root.querySelector('#tl'), model, { onSelect: show });

  root.onclick = (ev) => {
    const b = ev.target.closest('[data-mode]'); if (b) { A.mode = b.dataset.mode; return ctx.refresh(); }
    if (ev.target.closest('[data-close]')) { root.querySelector('#tlp').innerHTML = ''; tl.clearSel(); return; }
    const r = ev.target.closest('[data-reset]'); if (r) { store.setTlOverride(A.aluno, r.dataset.reset, null); toast('Data voltou ao padrão'); ctx.refresh(); }
  };
  root.onchange = (ev) => { if (ev.target.matches('[data-aluno]')) { A.aluno = ev.target.value; ctx.refresh(); } };
  root.oninput = null;
  root.onsubmit = (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target); const id = root.querySelector('#tlp').dataset.id;
    if (ev.target.dataset.form === 'tpl') { store.saveTlTemplateItem(id, { title: f.get('title').trim() || 'Encontro', off: Math.max(0, Number(f.get('off')) || 0), h: f.get('h').trim(), text: f.get('text').trim() }); toast('Modelo salvo'); }
    if (ev.target.dataset.form === 'ov') { store.setTlOverride(A.aluno, id, f.get('date')); toast('Data ajustada para este aluno'); }
    ctx.refresh();
  };
}
