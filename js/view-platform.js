// Áreas novas da plataforma: Início, Aulas, Timeline e Guia de provas.
// O admin vê as mesmas páginas de Aulas e Guia, com o botão Editar.

import { store } from './store.js';
import { analyze } from './analytics.js';
import { GUIDE } from './content.js';
import { fmtPct, fmtInt, fmtDate, fmtDateLong, esc, today, diffDays } from './util.js';
import { icon, toast } from './ui.js';

const noHandlers = (root) => { root.onclick = root.oninput = root.onchange = root.onsubmit = null; };
const draft = (txt) => `<span class="draft">${icon('info')} ${txt}</span>`;

function allLessons() { return store.modules().flatMap((m) => m.lessons.map((l) => ({ ...l, module: m }))); }

// ---------------- Início ----------------
export function renderHome(root, ctx) {
  const data = ctx.data;
  const a = analyze(data, '7d');
  const t = today();
  const first = data.user.name.split(' ')[0];
  const did = data.blocks.filter((b) => b.date === t);
  const qToday = did.reduce((s, b) => s + b.questions, 0);
  const ankiToday = data.anki.some((x) => x.date === t);
  const seen = new Set(store.watched(data.user.id));
  const lessons = allLessons();
  const next = lessons.find((l) => !seen.has(l.id));
  const focus = a.insights.filter((i) => i.severity !== 'good').slice(0, 3);
  const goalPct = a.week.goal ? Math.min(100, (a.week.q / a.week.goal) * 100) : 0;

  root.innerHTML = `
    <div class="zone-head">
      <div><h1>Olá, ${esc(first)}</h1>
        <p class="sub">${esc(fmtDateLong(t))} · ${esc(data.settings.exam)}${a.daysToExam != null ? ` · prova em <b>${a.daysToExam} dias</b>` : ''} · mentor: ${esc(data.mentor ? data.mentor.name : '—')}</p></div>
    </div>
    <div class="grid home-grid">
      <div class="card fill">
        <div class="card-h"><div><span class="eyebrow fill">${icon('pencil')} Hoje</span><h2 style="margin-top:4px">${qToday ? `${fmtInt(qToday)} questões registradas` : 'Nada registrado ainda hoje'}</h2>
          <p>${ankiToday ? 'Anki feito hoje.' : 'Anki de hoje ainda não marcado.'}</p></div></div>
        <div class="actions" style="justify-content:flex-start"><a class="btn btn-fill" href="#registrar">${icon('plus')} Registrar</a><a class="btn btn-ghost" href="#painel">${icon('chart')} Ver meu painel</a></div>
      </div>
      <div class="card">
        <div class="card-h"><div><h2>Esta semana</h2><p>Atualiza sozinho com os seus registros.</p></div></div>
        <div class="mini-kpis">
          <div><span class="kpi-l">Questões</span><span class="kpi-v">${fmtInt(a.week.q)}<small> de ${fmtInt(a.week.goal)}</small></span><div class="meter"><i style="width:${goalPct}%"></i></div></div>
          <div><span class="kpi-l">Acerto (7 dias)</span><span class="kpi-v">${fmtPct(a.total.acc)}</span></div>
          <div><span class="kpi-l">Anki (7 dias)</span><span class="kpi-v">${a.anki.days}<small> de ${a.anki.den}</small></span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><div><h2>Próximo encontro</h2><p>A agenda real entra quando definirmos os encontros.</p></div></div>
        <div class="meet"><span class="meet-d"><b>qui</b>20h</span><div><b>Individual com ${esc(data.mentor ? data.mentor.name.split(' ')[0] : 'o mentor')}</b><small>30 min · link da chamada aparece aqui</small></div></div>
        <div class="meet"><span class="meet-d"><b>ter</b>20h</span><div><b>Encontro em grupo</b><small>A gravação vai para Aulas depois</small></div></div>
        ${draft('Exemplo')}
      </div>
      <div class="card">
        <div class="card-h"><div><h2>Continue de onde parou</h2><p>${seen.size} de ${lessons.length} aulas assistidas.</p></div></div>
        ${next ? `<a class="lesson-row" href="#aula-${next.id}"><span class="play">${icon('play')}</span><span class="lr-t"><b>${esc(next.title)}</b><small>${esc(next.module.title)} · ${next.min} min</small></span>${icon('chevron')}</a>` : '<div class="empty">Você assistiu todas as aulas.</div>'}
        <div class="meter" style="margin-top:12px"><i style="width:${(seen.size / Math.max(1, lessons.length)) * 100}%"></i></div>
      </div>
      <div class="card span-2">
        <div class="card-h"><div><h2>Onde focar agora</h2><p>Os principais alertas do seu painel nos últimos 7 dias.</p></div><a class="btn btn-ghost btn-sm" href="#painel">Ver painel ${icon('chevron')}</a></div>
        ${focus.length ? focus.map((i) => `<div class="ins ${i.severity}">${icon(i.severity === 'gap' ? 'target' : i.severity === 'critical' ? 'alertCircle' : i.severity === 'info' ? 'info' : 'alert')}<div><b>${esc(i.title)}</b><small>${esc(i.detail)}</small></div></div>`).join('') : `<div class="ins good">${icon('checkCircle')}<div><b>Tudo no ritmo</b><small>Nenhum alerta nos últimos 7 dias.</small></div></div>`}
      </div>
    </div>`;
  noHandlers(root);
}

// ---------------- Aulas ----------------
export function renderLessons(root, ctx) {
  const admin = ctx.admin;
  const seen = admin ? new Set() : new Set(store.watched(ctx.me.id));
  const mods = store.modules();
  const total = mods.reduce((s, m) => s + m.lessons.length, 0);
  root.innerHTML = `
    <div class="zone-head">
      <div><h1>Aulas</h1><p class="sub">${admin ? `${mods.length} módulos · ${total} aulas. Clique em Editar para mudar título, descrição e vídeo.` : `${seen.size} de ${total} aulas assistidas.`}</p></div>
      ${admin ? `<button class="btn btn-ghost" data-addmod="1">${icon('plus')} Novo módulo</button>` : ''}
    </div>
    ${admin ? `<div class="privacy" style="margin-bottom:16px">${icon('info')}<div>Os títulos são exemplos para ver o layout. O conteúdo real e a hospedagem dos vídeos ainda vão ser definidos.</div></div>` : ''}
    <div class="modules">
      ${mods.map((m, mi) => {
        const done = m.lessons.filter((l) => seen.has(l.id)).length;
        return `<section class="card module">
          <div class="card-h"><div><span class="eyebrow ana">Módulo ${mi + 1}</span><h2 style="margin-top:2px">${esc(m.title)}</h2>
            <p>${m.lessons.length} aulas · ${m.lessons.reduce((s, l) => s + (l.min || 0), 0)} min${admin ? '' : ` · ${done} assistidas`}</p></div>
            ${admin ? `<button class="btn btn-ghost btn-sm" data-addles="${m.id}">${icon('plus')} Aula</button>` : `<span class="mod-pct">${Math.round((done / Math.max(1, m.lessons.length)) * 100)}%</span>`}</div>
          ${m.lessons.map((l, li) => `<a class="lesson-row" href="#aula-${l.id}">
            <span class="play ${seen.has(l.id) ? 'done' : ''}">${icon(seen.has(l.id) ? 'check' : 'play')}</span>
            <span class="lr-t"><b>${li + 1}. ${esc(l.title)}</b><small>${l.min ? `${l.min} min` : 'sem vídeo ainda'}</small></span>
            ${admin ? `<span class="btn btn-ghost btn-sm">${icon('pencil')} Editar</span>` : icon('chevron')}
          </a>`).join('') || '<div class="empty">Nenhuma aula neste módulo.</div>'}
        </section>`;
      }).join('')}
    </div>`;
  root.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.addmod) { store.addModule(); toast('Módulo criado'); ctx.refresh(); }
    if (b.dataset.addles) { const id = store.addLesson(b.dataset.addles); location.hash = `#aula-${id}`; }
  };
  root.oninput = root.onchange = root.onsubmit = null;
}

export function renderLesson(root, ctx, id) {
  const l = store.lesson(id);
  if (!l) { root.innerHTML = `<div class="empty">Aula não encontrada. <a href="#aulas">Voltar</a></div>`; noHandlers(root); return; }
  const admin = ctx.admin;
  const list = allLessons();
  const i = list.findIndex((x) => x.id === id);
  const prev = list[i - 1]; const next = list[i + 1];
  const seen = !admin && store.watched(ctx.me.id).includes(id);

  root.innerHTML = `
    <a class="back" href="#aulas">${icon('arrowLeft')} Aulas</a>
    <div class="lesson-layout">
      <div>
        <div class="video">${icon('video')}<span>Vídeo da aula</span><small>${l.video ? esc(l.video) : 'A hospedagem dos vídeos ainda vai ser definida'}</small></div>
        <div class="zone-head" style="margin-top:18px"><div><span class="eyebrow ana">${esc(l.module.title)}</span><h1>${esc(l.title)}</h1><p class="sub">${l.min ? `${l.min} min` : 'Sem duração'}</p></div>
          ${admin ? '' : `<button class="btn ${seen ? 'btn-ghost' : 'btn-fill'}" data-watch="1">${icon('check')} ${seen ? 'Assistida' : 'Marcar como assistida'}</button>`}</div>
        ${admin ? `<div class="card fill"><div class="card-h"><div><span class="eyebrow fill">${icon('pencil')} Editar aula</span></div></div>
          <form class="form" data-form="lesson">
            <label class="field"><span>Título</span><input class="input" name="title" value="${esc(l.title)}" required></label>
            <div class="row"><label class="field"><span>Duração (min)</span><input class="input" type="number" min="0" name="min" value="${l.min || 0}"></label>
              <label class="field"><span>Link do vídeo</span><input class="input" name="video" value="${esc(l.video || '')}" placeholder="Vimeo, Panda Video…"></label></div>
            <label class="field"><span>Descrição</span><textarea class="input" name="desc" rows="3">${esc(l.desc || '')}</textarea></label>
            <div class="actions"><span class="muted small">No protótipo, salva só neste navegador.</span><button class="btn btn-fill" type="submit">${icon('check')} Salvar aula</button></div>
          </form></div>`
        : `<div class="card"><p style="margin:0">${esc(l.desc || 'Sem descrição.')}</p>
          <div class="materials"><span class="label">Material de apoio</span><span class="chip xs" style="cursor:default">${icon('file')} Resumo da aula (PDF) · exemplo</span></div></div>`}
        <div class="lesson-nav">${prev ? `<a class="btn btn-ghost" href="#aula-${prev.id}">${icon('arrowLeft')} Anterior</a>` : '<span></span>'}${next ? `<a class="btn btn-ghost" href="#aula-${next.id}">Próxima ${icon('chevron')}</a>` : ''}</div>
      </div>
      <aside class="card lesson-side">
        <h3 style="margin:0 0 8px">${esc(l.module.title)}</h3>
        ${l.module.lessons.map((x, k) => `<a class="side-row ${x.id === id ? 'on' : ''}" href="#aula-${x.id}">${k + 1}. ${esc(x.title)}</a>`).join('')}
      </aside>
    </div>`;
  root.onclick = (e) => {
    if (e.target.closest('[data-watch]')) { store.toggleWatched(id); ctx.refresh(); }
  };
  root.oninput = root.onchange = null;
  root.onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    store.saveLesson(id, { title: f.get('title').trim() || 'Sem título', min: Number(f.get('min')) || 0, video: f.get('video').trim(), desc: f.get('desc').trim() });
    toast('Aula salva');
    ctx.refresh();
  };
}

// ---------------- Timeline ----------------
export function renderTimeline(root, ctx) {
  const data = ctx.data; const s = data.settings; const t = today();
  const evs = [
    { date: s.startDate, title: 'Início da mentoria', kind: 'start' },
    ...data.assessments.map((x) => ({ date: x.date, title: `${x.kind} ${x.name}`, detail: `${fmtPct(x.pct)} de acerto`, kind: 'sim' })),
    { date: t, title: 'Hoje', kind: 'today' },
    ...(s.examDate ? [{ date: s.examDate, title: s.exam, detail: `faltam ${diffDays(s.examDate, t)} dias`, kind: 'exam' }] : []),
  ].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
  root.innerHTML = `
    <div class="zone-head"><div><h1>Minha timeline</h1><p class="sub">Os marcos do seu caminho até a prova.</p></div></div>
    <div class="privacy" style="margin-bottom:16px">${icon('info')}<div><b>Rascunho.</b> A timeline ainda vai ser desenhada numa conversa própria. Por enquanto, mostra só datas que já existem no sistema: início, simulados, hoje e prova.</div></div>
    <div class="card"><ol class="tl">
      ${evs.map((e) => `<li class="tl-${e.kind} ${e.date > t ? 'future' : ''}"><span class="tl-dot"></span><span class="tl-date">${fmtDate(e.date)}</span><div><b>${esc(e.title)}</b>${e.detail ? `<small>${esc(e.detail)}</small>` : ''}</div></li>`).join('')}
    </ol></div>`;
  noHandlers(root);
}

// ---------------- Guia de provas ----------------
export function renderGuide(root, ctx) {
  const admin = ctx.admin;
  root.innerHTML = `
    <div class="zone-head"><div><h1>Guia de provas</h1><p class="sub">Fontes, simulados, custos e tudo o que ajuda a planejar.</p></div></div>
    <div class="privacy" style="margin-bottom:16px">${icon('info')}<div><b>Estrutura provisória.</b> O conteúdo de cada seção ainda vai ser definido. A DM2 não tem vínculo com USMLE, NBME, ECFMG, UWorld ou AMBOSS: o guia só informa onde encontrar cada coisa.</div></div>
    <div class="grid g-2">
      ${GUIDE.map((g) => `<div class="card">
        <div class="card-h"><div style="display:flex;gap:12px;align-items:flex-start"><span class="guide-ic">${icon(g.icon)}</span><div><h2>${esc(g.title)}</h2><p>${esc(g.desc)}</p></div></div>
          ${admin ? `<button class="btn btn-ghost btn-sm" data-edit-guide="${g.id}">${icon('pencil')} Editar</button>` : ''}</div>
        <ul class="guide-list">${g.items.map((it) => `<li><span>${esc(it)}</span><small>a definir</small></li>`).join('')}</ul>
      </div>`).join('')}
    </div>`;
  root.onclick = (e) => { if (e.target.closest('[data-edit-guide]')) toast('A edição do guia entra quando definirmos o conteúdo'); };
  root.oninput = root.onchange = root.onsubmit = null;
}
