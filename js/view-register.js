// Zona VOCÊ PREENCHE: registro rápido do dia.

import { store } from './store.js?v=202611162334';
import { SYSTEMS, SUBJECTS, BANKS, MODES, MISTAKES, ASSESSMENTS, MIXED, systemShort, subjectShort, mistakeById } from './lists.js?v=202611162334';
import { today, addDays, fmtDateLong, fmtDate, fmtPct, fmtInt, esc, sum, mondayOf, diffDays } from './util.js?v=202611162334';
import { icon, toast } from './ui.js?v=202611162334';

const S = {
  tab: 'dia',
  date: today(),
  block: { questions: 40, correct: '', bank: 'UWorld', mode: 'Cronometrado', system: MIXED, subject: MIXED },
  err: { qid: '', system: '', subtopic: '', type: '', learned: '' },
  sim: { kind: '', name: '', pct: '', score: '', note: '' },
};

const opt = (v, label, sel) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(label)}</option>`;

function stepper(name, value, step = 5) {
  return `<div class="stepper">
    <button type="button" data-step="${name}" data-d="-${step}" aria-label="Menos ${step}">${icon('minus')}</button>
    <input type="number" inputmode="numeric" min="0" name="${name}" value="${value}" placeholder="0" aria-label="${name === 'questions' ? 'Questões' : 'Acertos'}">
    <button type="button" data-step="${name}" data-d="${step}" aria-label="Mais ${step}">${icon('plus')}</button>
  </div>`;
}

function dateChips() {
  const t = today(); const y = addDays(t, -1);
  return `<div class="chips" role="group" aria-label="Dia do registro">
    <button type="button" class="chip ${S.date === t ? 'on' : ''}" data-date="${t}">Hoje</button>
    <button type="button" class="chip ${S.date === y ? 'on' : ''}" data-date="${y}">Ontem</button>
    <input type="date" class="input" style="width:auto;padding:5px 10px;font-size:13px" name="date" value="${S.date}" max="${t}" aria-label="Outra data">
  </div>`;
}

function tabDia(data) {
  const exam = data.settings.exam;
  const b = S.block;
  const acc = b.questions > 0 && b.correct !== '' ? Math.min(1, b.correct / b.questions) : null;
  const anki = data.anki.find((a) => a.date === S.date);
  return `
  <form class="form" data-form="block" autocomplete="off">
    <div class="card-h" style="margin:0">
      <div><h2>${icon('book')} Bloco de questões</h2><p>Um registro por bloco.</p></div>
    </div>
    <div class="row keep">
      <label class="field"><span>Questões</span>${stepper('questions', b.questions, 5)}</label>
      <label class="field"><span>Acertos</span>${stepper('correct', b.correct, 1)}</label>
    </div>
    <div class="live" aria-live="polite">${acc == null ? 'Preencha questões e acertos.' : `Acerto do bloco: <b>${fmtPct(acc)}</b> <span class="muted">· ${b.questions - b.correct} erros para revisar</span>`}</div>
    <div class="field"><span>Banco</span><div class="chips">${BANKS.map((x) => `<button type="button" class="chip ${b.bank === x ? 'on' : ''}" data-pick="bank" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
    <div class="field"><span>Modo</span><div class="chips">${MODES.map((x) => `<button type="button" class="chip ${b.mode === x ? 'on' : ''}" data-pick="mode" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
    <div class="row">
      <label class="field"><span>Sistema <em>(se o bloco foi de um sistema só)</em></span>
        <select class="input" name="system">${opt(MIXED, 'Misto (bloco aleatório)', b.system)}${SYSTEMS.map((s) => opt(s.id, s.id, b.system)).join('')}</select></label>
      <label class="field"><span>Matéria <em>(se foi de uma só)</em></span>
        <select class="input" name="subject">${opt(MIXED, 'Misto', b.subject)}${SUBJECTS[exam].map((s) => opt(s, `${s} · ${subjectShort(s)}`, b.subject)).join('')}</select></label>
    </div>
    <div class="actions"><span class="muted small">${fmtDateLong(S.date)}</span><button class="btn btn-fill" type="submit">${icon('check')} Salvar bloco</button></div>
  </form>
  <hr style="border:0;border-top:1px solid var(--gold-line);margin:22px 0">
  <div class="form">
    <div><h2>${icon('layers')} Anki</h2><p class="muted small" style="margin:2px 0 0">Um toque. Revisões e cards novos são opcionais.</p></div>
    <button type="button" class="toggle ${anki ? 'on' : ''}" data-act="anki-toggle" aria-pressed="${anki ? 'true' : 'false'}">
      <span class="sw"></span><span><b>${anki ? 'Fiz Anki' : 'Ainda não fiz Anki'}</b><small>${fmtDateLong(S.date)}</small></span>
    </button>
    ${anki ? `<div class="row">
      <label class="field"><span>Revisões <em>(opcional)</em></span><input class="input" type="number" min="0" inputmode="numeric" name="reviews" value="${anki.reviews ?? ''}" data-anki="reviews"></label>
      <label class="field"><span>Cards novos <em>(opcional)</em></span><input class="input" type="number" min="0" inputmode="numeric" name="newCards" value="${anki.newCards ?? ''}" data-anki="newCards"></label>
    </div>` : ''}
  </div>`;
}

function tabErro() {
  const e = S.err;
  const subs = e.system ? SYSTEMS.find((s) => s.id === e.system).subtopics : [];
  return `
  <form class="form" data-form="err" autocomplete="off">
    <div><h2>${icon('x')} Questão errada</h2><p class="muted small" style="margin:2px 0 0">Registre na hora da revisão do bloco, não no fim do dia. Anote só o ID e o que você aprendeu, nunca o texto da questão.</p></div>
    <div class="row">
      <label class="field"><span>ID da questão</span><input class="input" name="qid" value="${esc(e.qid)}" inputmode="numeric" placeholder="ex.: 12345"></label>
      <label class="field"><span>Sistema</span><select class="input" name="system" required>${opt('', 'Escolha…', e.system)}${SYSTEMS.map((s) => opt(s.id, s.id, e.system)).join('')}</select></label>
    </div>
    <label class="field"><span>Subtópico</span><select class="input" name="subtopic" ${e.system ? '' : 'disabled'}>${opt('', e.system ? 'Escolha…' : 'Escolha o sistema primeiro', e.subtopic)}${subs.map((s) => opt(s, s, e.subtopic)).join('')}</select></label>
    <div class="field"><span>Por que errei?</span>
      <div class="mtypes">${MISTAKES.map((m) => `<button type="button" class="mtype ${e.type === m.id ? 'on' : ''}" data-pick="type" data-v="${m.id}"><b>${m.label}</b><small>${m.hint}</small></button>`).join('')}</div>
    </div>
    <label class="field"><span>O que aprendi <em>(1 frase)</em></span><textarea class="input" name="learned" rows="2" placeholder="ex.: ATR tipo 1: pH urinário > 5,5">${esc(e.learned)}</textarea></label>
    <div class="actions"><span>${dateChips()}</span><button class="btn btn-fill" type="submit">${icon('check')} Salvar erro</button></div>
  </form>`;
}

function tabSim(data) {
  const exam = data.settings.exam;
  const s = S.sim;
  return `
  <form class="form" data-form="sim" autocomplete="off">
    <div><h2>${icon('clipboard')} Simulado</h2><p class="muted small" style="margin:2px 0 0">Registre assim que sair o resultado. Copie o que o próprio simulado informa.</p></div>
    <div class="field"><span>Qual simulado</span><div class="chips">${ASSESSMENTS[exam].map((x) => `<button type="button" class="chip ${s.kind === x ? 'on' : ''}" data-pick="kind" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
    <div class="row">
      <label class="field"><span>Forma ou número</span><input class="input" name="name" value="${esc(s.name)}" placeholder="ex.: Form 28, UWSA 2"></label>
      <label class="field"><span>Data</span><input class="input" type="date" name="date" value="${S.date}" max="${today()}"></label>
    </div>
    <div class="row">
      <label class="field"><span>% de acerto</span><input class="input" type="number" min="0" max="100" step="1" inputmode="numeric" name="pct" value="${esc(s.pct)}" placeholder="ex.: 68" required></label>
      <label class="field"><span>${exam === 'Step 2 CK' ? 'Nota estimada (3 dígitos)' : 'Nota ou chance de passar'} <em>(opcional)</em></span><input class="input" name="score" value="${esc(s.score)}" placeholder="${exam === 'Step 2 CK' ? 'ex.: 245' : 'como o simulado informar'}"></label>
    </div>
    <label class="field"><span>Como foi <em>(opcional)</em></span><textarea class="input" name="note" rows="2" placeholder="ex.: fiz em casa, sem pausas, cansei no último bloco">${esc(s.note)}</textarea></label>
    <div class="actions"><span></span><button class="btn btn-fill" type="submit">${icon('check')} Salvar simulado</button></div>
  </form>`;
}

function dayLog(data) {
  const blocks = data.blocks.filter((b) => b.date === S.date).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const anki = data.anki.find((a) => a.date === S.date);
  const errs = data.mistakes.filter((m) => m.date === S.date).sort((a, b) => ((a.createdAt || '') < (b.createdAt || '') ? 1 : -1));
  const q = sum(blocks, (b) => b.questions); const c = sum(blocks, (b) => b.correct);
  const rows = [];
  for (const b of blocks) {
    rows.push(`<div class="entry"><div class="entry-ic">${icon('book')}</div><div class="entry-body"><b>${b.questions} questões · ${b.correct} acertos</b><small>${esc(b.bank)} · ${esc(b.mode)} · ${b.system === MIXED ? 'Misto' : esc(systemShort(b.system))}${b.subject !== MIXED ? ` · ${esc(subjectShort(b.subject))}` : ''}</small></div><span class="entry-val">${fmtPct(b.correct / b.questions)}</span><button class="btn-icon" data-del="blocks" data-id="${b.id}" aria-label="Apagar bloco">${icon('trash')}</button></div>`);
  }
  if (anki) rows.push(`<div class="entry"><div class="entry-ic anki">${icon('layers')}</div><div class="entry-body"><b>Anki feito</b><small>${anki.reviews ? `${fmtInt(anki.reviews)} revisões` : 'sem número de revisões'}${anki.newCards ? ` · ${anki.newCards} novos` : ''}</small></div><button class="btn-icon" data-del="anki" data-id="${anki.id}" aria-label="Desmarcar Anki">${icon('trash')}</button></div>`);
  for (const m of errs.slice(0, 6)) {
    rows.push(`<div class="entry"><div class="entry-ic err">${icon('x')}</div><div class="entry-body"><b>${esc(mistakeById(m.type)?.label || '')}</b><small>${m.qid ? `#${esc(m.qid)} · ` : ''}${esc(systemShort(m.system))}${m.subtopic ? ` › ${esc(m.subtopic)}` : ''}</small></div><button class="btn-icon" data-del="mistakes" data-id="${m.id}" aria-label="Apagar erro">${icon('trash')}</button></div>`);
  }
  if (errs.length > 6) rows.push(`<div class="entry"><div class="entry-body muted small">e mais ${errs.length - 6} erros neste dia</div></div>`);
  const sims = data.assessments.filter((a) => a.date === S.date);
  for (const a of sims) rows.push(`<div class="entry"><div class="entry-ic sim">${icon('clipboard')}</div><div class="entry-body"><b>${esc(a.kind)} · ${esc(a.name)}</b><small>${a.score ? `nota ${esc(a.score)}` : 'simulado'}</small></div><span class="entry-val">${fmtPct(a.pct)}</span><button class="btn-icon" data-del="assessments" data-id="${a.id}" aria-label="Apagar simulado">${icon('trash')}</button></div>`);

  return `<div class="card">
    <div class="card-h"><div><h2>Registrado em ${S.date === today() ? 'hoje' : fmtDate(S.date)}</h2><p>${q ? `${fmtInt(q)} questões · ${fmtPct(c / q)} de acerto` : 'Nada registrado ainda neste dia.'}</p></div></div>
    <div class="entries">${rows.join('') || `<div class="empty">Comece pelo bloco de questões ao lado.</div>`}</div>
  </div>`;
}

function weekCard(data) {
  const t = today(); const wk = mondayOf(t);
  const q = sum(data.blocks.filter((b) => b.date >= wk), (b) => b.questions);
  const goal = data.settings.weeklyGoal;
  let ak = 0; for (let d = wk; d <= t; d = addDays(d, 1)) if (data.anki.some((a) => a.date === d)) ak++;
  const days = diffDays(t, wk) + 1;
  return `<div class="card">
    <div class="card-h"><div><span class="eyebrow ana">${icon('sparkles')} Resumo automático</span><h2 style="margin-top:4px">Esta semana</h2></div><a class="btn btn-ghost btn-sm" href="#painel">Ver painel ${icon('chevron')}</a></div>
    <div class="small" style="display:flex;justify-content:space-between"><span>Questões</span><b>${fmtInt(q)} de ${fmtInt(goal)}</b></div>
    <div class="meter"><i style="width:${Math.min(100, (q / goal) * 100)}%"></i></div>
    <div class="small" style="display:flex;justify-content:space-between;margin-top:12px"><span>Dias com Anki</span><b>${ak} de ${days}</b></div>
    <div class="meter gold"><i style="width:${(ak / 7) * 100}%"></i></div>
  </div>`;
}

export function setRegisterDate(d) { S.date = d; S.tab = 'dia'; }

export function renderRegister(root, ctx) {
  const data = ctx.data;
  const t = today();
  const todayBlocks = data.blocks.filter((b) => b.date === t);
  const todayQ = sum(todayBlocks, (b) => b.questions);
  const ankiToday = data.anki.some((a) => a.date === t);
  const errToday = data.mistakes.filter((m) => m.date === t).length;

  root.innerHTML = `
  <div class="zone-head">
    <div>
      <span class="eyebrow fill">${icon('pencil')} Você preenche</span>
      <h1>Registro do dia</h1>
    </div>
    <div class="today-strip">
      <span class="pill ${todayQ ? 'ok' : 'no'}">${icon('book')} ${todayQ ? `${todayQ} questões hoje` : 'Sem questões hoje'}</span>
      <span class="pill ${ankiToday ? 'ok' : 'no'}">${icon('layers')} ${ankiToday ? 'Anki feito' : 'Anki pendente'}</span>
      <span class="pill no">${icon('x')} ${errToday} ${errToday === 1 ? 'erro' : 'erros'} anotados</span>
    </div>
  </div>
  <div class="grid g-reg">
    <div class="card fill">
      <div class="actions" style="margin-bottom:18px">
        <div class="seg full" role="tablist">
          <button role="tab" class="${S.tab === 'dia' ? 'on' : ''}" data-tab="dia">${icon('book')} Questões e Anki</button>
          <button role="tab" class="${S.tab === 'erro' ? 'on' : ''}" data-tab="erro">${icon('x')} Erro</button>
          <button role="tab" class="${S.tab === 'sim' ? 'on' : ''}" data-tab="sim">${icon('clipboard')} Simulado</button>
        </div>
        ${S.tab === 'dia' ? dateChips() : ''}
      </div>
      ${S.tab === 'dia' ? tabDia(data) : S.tab === 'erro' ? tabErro() : tabSim(data)}
    </div>
    <div class="grid">${dayLog(data)}${weekCard(data)}</div>
  </div>`;

  bind(root, ctx);
}

function bind(root, ctx) {
  const rerender = () => ctx.refresh();
  root.onclick = (e) => {
    const el = e.target.closest('button, [data-date]');
    if (!el) return;
    if (el.dataset.tab) { S.tab = el.dataset.tab; rerender(); return; }
    if (el.dataset.date) { S.date = el.dataset.date; rerender(); return; }
    if (el.dataset.step) {
      const k = el.dataset.step; const d = Number(el.dataset.d);
      S.block[k] = Math.max(0, (Number(S.block[k]) || 0) + d);
      if (k === 'questions' && S.block.correct !== '' && S.block.correct > S.block.questions) S.block.correct = S.block.questions;
      if (k === 'correct') S.block.correct = Math.min(S.block.correct, S.block.questions);
      rerender(); return;
    }
    if (el.dataset.pick) {
      const k = el.dataset.pick; const v = el.dataset.v;
      if (k === 'type') S.err.type = S.err.type === v ? '' : v;
      else if (k === 'kind') S.sim.kind = v;
      else S.block[k] = v;
      rerender(); return;
    }
    if (el.dataset.del) {
      store.remove(el.dataset.del, el.dataset.id);
      toast('Registro apagado');
      rerender(); return;
    }
    if (el.dataset.act === 'anki-toggle') {
      const cur = ctx.data.anki.find((a) => a.date === S.date);
      if (cur) store.remove('anki', cur.id);
      else store.add('anki', { date: S.date, done: true, reviews: null, newCards: null });
      toast(cur ? 'Anki desmarcado' : 'Anki marcado');
      rerender();
    }
  };

  root.oninput = (e) => {
    const t = e.target;
    if (t.closest('[data-form="block"]') && (t.name === 'questions' || t.name === 'correct')) {
      S.block[t.name] = t.value === '' ? '' : Math.max(0, Number(t.value) || 0);
      const live = root.querySelector('.live');
      const b = S.block;
      if (live) live.innerHTML = b.questions > 0 && b.correct !== '' ? `Acerto do bloco: <b>${fmtPct(Math.min(1, b.correct / b.questions))}</b> <span class="muted">· ${Math.max(0, b.questions - b.correct)} erros para revisar</span>` : 'Preencha questões e acertos.';
    }
    if (t.closest('[data-form="err"]') && ['qid', 'learned'].includes(t.name)) S.err[t.name] = t.value;
    if (t.closest('[data-form="sim"]') && ['name', 'pct', 'score', 'note'].includes(t.name)) S.sim[t.name] = t.value;
  };

  root.onchange = (e) => {
    const t = e.target;
    if (t.name === 'date' && t.value) { S.date = t.value; rerender(); return; }
    if (t.closest('[data-form="block"]') && (t.name === 'system' || t.name === 'subject')) { S.block[t.name] = t.value; return; }
    if (t.closest('[data-form="err"]') && t.name === 'system') { S.err.system = t.value; S.err.subtopic = ''; rerender(); return; }
    if (t.closest('[data-form="err"]') && t.name === 'subtopic') { S.err.subtopic = t.value; return; }
    if (t.dataset.anki) {
      const cur = ctx.data.anki.find((a) => a.date === S.date);
      if (cur) { store.remove('anki', cur.id); store.add('anki', { ...cur, id: undefined, [t.dataset.anki]: t.value === '' ? null : Number(t.value) }); toast('Anki atualizado'); }
    }
  };

  root.onsubmit = (e) => {
    e.preventDefault();
    const f = e.target.dataset.form;
    if (f === 'block') {
      const b = S.block;
      if (!b.questions || b.correct === '' || b.correct > b.questions) { toast('Confira questões e acertos'); return; }
      store.add('blocks', { date: S.date, bank: b.bank, mode: b.mode, system: b.system, subject: b.subject, questions: b.questions, correct: b.correct });
      toast(`Bloco salvo: ${b.correct}/${b.questions}`);
      S.block.correct = '';
    }
    if (f === 'err') {
      const x = S.err;
      if (!x.system || !x.type) { toast('Escolha o sistema e o tipo de erro'); return; }
      store.add('mistakes', { date: S.date, qid: x.qid.trim(), system: x.system, subtopic: x.subtopic, type: x.type, learned: x.learned.trim() });
      toast('Erro salvo. Próximo?');
      S.err = { ...S.err, qid: '', type: '', learned: '' }; // mantém sistema e subtópico para o próximo erro
    }
    if (f === 'sim') {
      const x = S.sim;
      const pctv = Number(x.pct);
      if (!x.kind || !(pctv > 0 && pctv <= 100)) { toast('Escolha o simulado e informe a % de acerto'); return; }
      const fd = new FormData(e.target);
      store.add('assessments', { date: fd.get('date') || S.date, kind: x.kind, name: x.name.trim() || x.kind, pct: pctv / 100, score: x.score.trim() || null, note: x.note.trim() });
      toast('Simulado salvo');
      S.sim = { kind: '', name: '', pct: '', score: '', note: '' };
    }
    rerender();
  };
}
