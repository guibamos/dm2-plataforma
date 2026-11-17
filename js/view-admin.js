// Áreas só do admin: Alunos (lista, grupos e cadastro), CRM, Acervo e Configurações.

import { store } from './store.js?v=202611162315';
import { analyze } from './analytics.js?v=202611162315';
import { ACERVO_URL } from './content.js?v=202611162315';
import { fmtPct, fmtInt, fmtDate, esc } from './util.js?v=202611162315';
import { icon, statusChip, initials, toast, examDateField } from './ui.js?v=202611162315';

const F = { q: '', exam: '', view: 'lista', group: 'exam', adding: false };
const noHandlers = (root) => { root.onclick = root.oninput = root.onchange = root.onsubmit = null; };

export function renderStudents(root, ctx) {
  const all = store.myStudents().map((u) => {
    const data = store.student(u.id);
    return { u, data, a: analyze(data, '7d') };
  });
  const rows = all.filter(({ u, a }) => (!F.q || u.name.toLowerCase().includes(F.q)) && (!F.exam || a.settings.exam === F.exam));

  const groupKey = (r) => (F.group === 'exam' ? r.a.settings.exam : r.a.status.label);
  const groups = new Map();
  rows.forEach((r) => { const k = groupKey(r); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });

  const list = `<div class="card" style="padding:0"><div class="t-wrap"><table class="t students">
    <thead><tr><th>Aluno</th><th>Prova</th><th>Situação</th><th class="r">Questões 7d</th><th class="r">Acerto 7d</th><th class="r">Anki 7d</th><th></th></tr></thead>
    <tbody>${rows.map(({ u, a }) => `<tr data-go="${u.id}">
      <td><span class="stu-name"><span class="avatar">${initials(u.name)}</span><span><b>${esc(u.name)}</b><small>${esc(u.email || '')}</small></span></span></td>
      <td>${esc(a.settings.exam)}<small class="muted" style="display:block">${a.daysToExam != null ? `em ${a.daysToExam} dias` : 'sem data'}</small></td>
      <td>${statusChip(a.status)}</td>
      <td class="r">${fmtInt(a.total.q)}</td><td class="r">${fmtPct(a.total.acc)}</td><td class="r">${a.anki.days}/${a.anki.den}</td>
      <td class="r">${icon('chevron')}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">Nenhum aluno com esses filtros.</td></tr>'}</tbody></table></div></div>`;

  const grouped = `<div class="grid g-3">${[...groups.entries()].map(([k, rs]) => {
    const q = rs.reduce((s, r) => s + r.a.total.q, 0);
    const c = rs.reduce((s, r) => s + (r.a.total.acc || 0) * r.a.total.q, 0);
    const need = rs.filter((r) => ['critical', 'serious'].includes(r.a.status.level)).length;
    return `<div class="card">
      <div class="card-h"><div><h2>${esc(k)}</h2><p>${rs.length} ${rs.length === 1 ? 'aluno' : 'alunos'}</p></div></div>
      <div class="mini-kpis">
        <div><span class="kpi-l">Questões 7d</span><span class="kpi-v">${fmtInt(q)}</span></div>
        <div><span class="kpi-l">Acerto médio</span><span class="kpi-v">${q ? fmtPct(c / q) : '—'}</span></div>
        <div><span class="kpi-l">Precisam de atenção</span><span class="kpi-v" style="color:${need ? 'var(--critical-ink)' : 'inherit'}">${need}</span></div>
      </div>
      <div class="avatars">${rs.map(({ u }) => `<a class="avatar" href="#aluno-${u.id}" data-tip="${esc(u.name)}">${initials(u.name)}</a>`).join('')}</div>
    </div>`;
  }).join('')}</div>`;

  root.innerHTML = `
    <div class="zone-head">
      <div><h1>Alunos</h1><p class="sub">${all.length} alunos ativos</p></div>
      <button class="btn btn-fill" data-add="1">${icon('plus')} Novo aluno</button>
    </div>
    ${F.adding ? `<div class="card fill" style="margin-bottom:16px">
      <div class="card-h"><div><span class="eyebrow fill">${icon('pencil')} Novo aluno</span><h2 style="margin-top:4px">Cadastrar e enviar convite</h2><p>O aluno recebe um e-mail para entrar, sem senha. No protótipo, nada é enviado.</p></div></div>
      <form class="form" data-form="student">
        <div class="row"><label class="field"><span>Nome</span><input class="input" name="name" required></label><label class="field"><span>E-mail</span><input class="input" type="email" name="email" required></label></div>
        <div class="row"><label class="field"><span>Prova</span><select class="input" name="exam"><option>Step 1</option><option>Step 2 CK</option></select></label></div>
        ${examDateField(null)}
        <p class="err small" hidden style="color:var(--critical-ink);margin:0"></p>
        <div class="actions"><button class="btn btn-ghost" type="button" data-cancel="1">Cancelar</button><button class="btn btn-fill" type="submit">${icon('mail')} Cadastrar e convidar</button></div>
      </form></div>` : ''}
    <div class="toolbar">
      <label class="search-box">${icon('search')}<input class="input" type="search" placeholder="Buscar aluno" value="${esc(F.q)}" data-f="q"></label>
      <select class="input" data-f="exam"><option value="">Todas as provas</option><option ${F.exam === 'Step 1' ? 'selected' : ''}>Step 1</option><option ${F.exam === 'Step 2 CK' ? 'selected' : ''}>Step 2 CK</option></select>
      <span class="top-sp"></span>
      <div class="seg"><button class="${F.view === 'lista' ? 'on' : ''}" data-view-mode="lista">${icon('users')} Um a um</button><button class="${F.view === 'grupo' ? 'on' : ''}" data-view-mode="grupo">${icon('grid')} Em grupo</button></div>
    </div>
    ${F.view === 'grupo' ? `<div class="filters" style="margin:0 0 14px"><span class="small muted">Agrupar por</span><div class="seg">${[['exam', 'Prova'], ['status', 'Situação']].map(([k, l]) => `<button class="${F.group === k ? 'on' : ''}" data-group="${k}" style="padding:5px 10px;font-size:12px">${l}</button>`).join('')}</div></div>${grouped}` : list}
    <p class="small muted" style="margin-top:14px">A visão em grupo ainda vai ser detalhada. Aqui é só uma primeira ideia.</p>`;

  root.onclick = (e) => {
    const tr = e.target.closest('tr[data-go]');
    if (tr) { location.hash = `#aluno-${tr.dataset.go}`; return; }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.add) { F.adding = true; ctx.refresh(); }
    if (b.dataset.cancel) { F.adding = false; ctx.refresh(); }
    if (b.dataset.viewMode) { F.view = b.dataset.viewMode; ctx.refresh(); }
    if (b.dataset.group) { F.group = b.dataset.group; ctx.refresh(); }
  };
  root.onchange = (e) => { const k = e.target.dataset.f; if (k && k !== 'q') { F[k] = e.target.value; ctx.refresh(); } };
  root.oninput = (e) => {
    if (e.target.dataset.f === 'q') {
      F.q = e.target.value.toLowerCase();
      const pos = e.target.selectionStart; ctx.refresh();
      const el = root.querySelector('[data-f="q"]'); if (el) { el.focus(); el.setSelectionRange(pos, pos); }
    }
  };
  root.onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = f.get('name').trim(); const email = f.get('email').trim();
    const err = root.querySelector('.err');
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Preencha o nome e um e-mail válido.'; err.hidden = false; return; }
    store.addStudent({ name, email, exam: f.get('exam'), examDate: f.get('examDate') });
    F.adding = false;
    toast(`${name.split(' ')[0]} cadastrado. O convite iria para ${email}`);
    ctx.refresh();
  };
}

export function renderCrm(root) {
  const cols = [['Interessados', 3], ['Conversa de diagnóstico', 2], ['Proposta enviada', 1], ['Virou aluno', 0]];
  root.innerHTML = `
    <div class="zone-head"><div><h1>CRM</h1></div></div>
    <div class="privacy" style="margin-bottom:16px">${icon('info')}<div><b>A ser criado.</b> As etapas abaixo são só um esboço do lugar onde o CRM vai ficar. A ideia é que um interessado vire aluno com um clique, levando os dados para o cadastro.</div></div>
    <div class="kanban">${cols.map(([c, n]) => `<div class="kcol"><div class="kcol-h">${esc(c)}</div>${Array.from({ length: n }, () => '<div class="kcard"><span class="sk"></span><span class="sk short"></span></div>').join('')}</div>`).join('')}</div>`;
  noHandlers(root);
}

// ---------------- Acervo DM2 ----------------
// Cópia dos posts do artifact Acervo DM2 (16/11/2026). Favoritos e notas editados aqui ficam só neste navegador.
const TEMAS = ['Oferta e venda', 'Prova social', 'Método de estudo', 'Recursos (UWorld, Anki, NBME)', 'Processo e burocracia', 'Vida e carreira nos EUA', 'Brasil x EUA (dor)', 'Jornada pessoal', 'Humor e meme', 'Live, aula e evento', 'Pesquisa', 'Bastidores do produto', 'Outros'];
const FORMATOS = [['', 'Todos'], ['Reel', 'Reels'], ['Carrossel', 'Carrosséis'], ['Foto', 'Fotos']];
const A = { rows: null, loading: false, q: '', fmt: '', perfil: '', tema: '', fav: false, limit: 60, open: null };
const EDITS = 'dm2-acervo-edits';
const fmtOf = (r) => (r.formato === 'Post' ? 'Foto' : r.formato || 'Outro');
// Datas exatas (2025-10-03) ou aproximadas (~2025-10, ~2025-09/10).
const dt = (d) => {
  const s = String(d || '');
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1].slice(2)}`;
  m = s.match(/^~?(\d{4})-(\d{2})(?:-(\d{2}))?(?:\/(\d{2}))?/);
  if (!m) return s.length > 22 ? `${s.slice(0, 21)}…` : s; // texto livre, como "há 4 dias"
  return `~${m[3] ? `${m[3]}/` : ''}${m[2]}${m[4] ? `–${m[4]}` : ''}/${m[1].slice(2)}`;
};
const sortKey = (r) => { const k = String(r.data || '').replace(/^~/, ''); return /^\d{4}/.test(k) ? k : ''; };
const safeUrl = (u) => (/^https:\/\//i.test(u || '') ? u : '#');
function edits() { try { return JSON.parse(localStorage.getItem(EDITS) || '{}'); } catch (e) { return {}; } }
function saveEdit(id, patch) { const e = edits(); e[id] = { ...(e[id] || {}), ...patch }; try { localStorage.setItem(EDITS, JSON.stringify(e)); } catch (err) { /* ignora */ } }
function rowsWithEdits() { const e = edits(); return A.rows.map((r) => (e[r.id] ? { ...r, ...e[r.id] } : r)); }

export function renderAcervo(root, ctx) {
  if (!A.rows) {
    root.innerHTML = '<div class="empty">Carregando o acervo…</div>';
    noHandlers(root);
    if (!A.loading) {
      A.loading = true;
      fetch('data/acervo.json').then((r) => r.json()).then((d) => { A.rows = d; ctx.refresh(); })
        .catch(() => { root.innerHTML = '<div class="empty">Não foi possível carregar o acervo.</div>'; A.loading = false; });
    }
    return;
  }
  const all = rowsWithEdits();
  const match = (r, skip) => (!A.fav || r.favorito)
    && (skip === 'fmt' || !A.fmt || fmtOf(r) === A.fmt)
    && (skip === 'perfil' || !A.perfil || r.perfil === A.perfil)
    && (skip === 'tema' || !A.tema || (r.temas || []).includes(A.tema))
    && (!A.q || [r.trecho, r.resumo, r.notas, r.perfil, ...(r.temas || [])].join(' ').toLowerCase().includes(A.q));
  const list = all.filter((r) => match(r)).sort((x, y) => sortKey(y).localeCompare(sortKey(x)));
  const perfis = [...new Set(all.map((r) => r.perfil))].sort();
  const count = (skip, f) => all.filter((r) => match(r, skip) && f(r)).length;
  const temas = TEMAS.filter((t) => count('tema', (r) => (r.temas || []).includes(t)) || A.tema === t);
  const open = A.open && all.find((r) => r.id === A.open);

  root.innerHTML = `
    <div class="zone-head">
      <div><h1>Acervo DM2</h1><p class="sub">${list.length === all.length ? `${all.length} posts de ${perfis.length} perfis` : `${list.length} de ${all.length} posts`}</p></div>
    </div>
    <div class="toolbar">
      <label class="search-box">${icon('search')}<input class="input" type="search" placeholder="Buscar por assunto, frase ou perfil" value="${esc(A.q)}" data-a="q"></label>
      <div class="seg">${FORMATOS.map(([v, l]) => `<button class="${A.fmt === v ? 'on' : ''}" data-fmt="${v}">${v ? `<span class="fdot f-${v}"></span>` : ''}${l}</button>`).join('')}</div>
      <select class="input" data-a="perfil"><option value="">Todos os perfis</option>${perfis.map((p) => `<option value="${esc(p)}" ${A.perfil === p ? 'selected' : ''}>@${esc(p)} (${count('perfil', (r) => r.perfil === p)})</option>`).join('')}</select>
      <button class="btn btn-ghost ${A.fav ? 'fav-on' : ''}" data-favonly="1">${A.fav ? '★' : '☆'} Favoritos</button>
    </div>
    <div class="chips tchips">${[['', 'Todos os temas'], ...temas.map((t) => [t, t])].map(([v, l]) => `<button class="chip ${A.tema === v ? 'on' : ''}" data-tema="${esc(v)}">${esc(l)}${v ? ` <span class="muted">${count('tema', (r) => (r.temas || []).includes(v))}</span>` : ''}</button>`).join('')}</div>
    <div class="acervo-grid">${list.slice(0, A.limit).map((r) => `<button class="ac-card" data-open="${r.id}">
      <span class="ac-top"><span class="ac-fmt"><span class="fdot f-${fmtOf(r)}"></span>${esc(fmtOf(r))}</span><span class="ac-date">${dt(r.data)}</span></span>
      <span class="ac-title">${esc(r.resumo || r.trecho || '')}</span>
      ${r.resumo && r.trecho ? `<span class="ac-ex">${esc(r.trecho)}</span>` : ''}
      <span class="ac-foot"><span>@${esc(r.perfil)}</span>${r.favorito ? '<span class="ac-star">★</span>' : ''}</span>
    </button>`).join('') || '<div class="empty">Nenhum post com esses filtros.</div>'}</div>
    ${list.length > A.limit ? `<div style="text-align:center;margin-top:16px"><button class="btn btn-ghost" data-more="1">Mostrar mais</button></div>` : ''}
    <p class="small muted" style="margin-top:16px">Cópia de 16/11/2026 do Acervo. Novos posts continuam entrando pelo <a href="${ACERVO_URL}" target="_blank" rel="noopener">artifact do Acervo</a> até a versão real.</p>
    ${open ? `<div class="scrim" data-close="1"></div><aside class="drawer" role="dialog" aria-label="Detalhes do post">
      <button class="btn btn-ghost btn-sm" data-close="1" style="align-self:flex-end">Fechar</button>
      <span class="ac-top"><span class="ac-fmt"><span class="fdot f-${fmtOf(open)}"></span>${esc(fmtOf(open))}</span><span class="ac-date">@${esc(open.perfil)}${open.data ? ` · ${dt(open.data)}` : ''}</span></span>
      <h2 class="dr-title">${esc(open.resumo || 'Sem resumo')}</h2>
      ${open.trecho ? `<blockquote class="dr-quote">${esc(open.trecho)}</blockquote>` : ''}
      <dl class="dr-kv">
        <dt>Temas</dt><dd>${esc((open.temas || []).join(', ') || '—')}</dd>
        <dt>Emoção</dt><dd>${esc(open.emocao || '—')}</dd>
        <dt>Funil</dt><dd>${esc(open.funil || '—')}</dd>
        <dt>Gancho</dt><dd>${esc(open.gancho || '—')}</dd>
        ${(open.ctas || []).length ? `<dt>Chamada</dt><dd>${esc(open.ctas.join(', '))}</dd>` : ''}
        ${open.fixado || open.collab ? `<dt>Obs.</dt><dd>${[open.fixado ? 'Post fixado' : '', open.collab ? 'Collab' : ''].filter(Boolean).join(' · ')}</dd>` : ''}
      </dl>
      <form class="form" data-form="notas" style="gap:8px">
        <label class="field"><span>Notas da DM2 (o que aproveitar)</span><textarea class="input" name="notas" rows="3">${esc(open.notas || '')}</textarea></label>
        <div class="actions"><span class="muted small">Fica salvo só neste navegador.</span><button class="btn btn-ghost btn-sm" type="submit">${icon('check')} Salvar nota</button></div>
      </form>
      <div class="actions" style="justify-content:flex-start"><a class="btn btn-fill" href="${esc(safeUrl(open.url))}" target="_blank" rel="noopener">${icon('external')} Abrir no Instagram</a>
        <button class="btn btn-ghost ${open.favorito ? 'fav-on' : ''}" data-fav="${open.id}">${open.favorito ? '★ Favorito' : '☆ Favoritar'}</button></div>
    </aside>` : ''}`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-open],[data-close],[data-fmt],[data-tema],[data-favonly],[data-fav],[data-more]');
    if (!b) return;
    if (b.dataset.open) A.open = b.dataset.open;
    else if (b.dataset.close) A.open = null;
    else if (b.dataset.fmt !== undefined) { A.fmt = b.dataset.fmt; A.limit = 60; }
    else if (b.dataset.tema !== undefined) { A.tema = A.tema === b.dataset.tema ? '' : b.dataset.tema; A.limit = 60; }
    else if (b.dataset.favonly) { A.fav = !A.fav; A.limit = 60; }
    else if (b.dataset.fav) { const r = all.find((x) => x.id === b.dataset.fav); saveEdit(r.id, { favorito: !r.favorito }); }
    else if (b.dataset.more) A.limit += 60;
    ctx.refresh();
  };
  root.onchange = (e) => { if (e.target.dataset.a === 'perfil') { A.perfil = e.target.value; A.limit = 60; ctx.refresh(); } };
  root.oninput = (e) => {
    if (e.target.dataset.a !== 'q') return;
    A.q = e.target.value.trim().toLowerCase(); A.limit = 60;
    const pos = e.target.selectionStart; ctx.refresh();
    const el = root.querySelector('[data-a="q"]'); if (el) { el.focus(); el.setSelectionRange(pos, pos); }
  };
  root.onsubmit = (e) => {
    e.preventDefault();
    saveEdit(A.open, { notas: new FormData(e.target).get('notas').trim() });
    toast('Nota salva neste navegador');
    ctx.refresh();
  };
}

export function renderConfig(root) {
  const admins = store.mentors();
  root.innerHTML = `
    <div class="zone-head"><div><h1>Configurações</h1></div></div>
    <div class="grid g-2">
      <div class="card"><div class="card-h"><div><h2>Admins</h2><p>Entram com o próprio e-mail e veem tudo.</p></div></div>
        ${admins.map((m) => `<div class="meet"><span class="avatar">${initials(m.name)}</span><div><b>${esc(m.name)}</b><small>Admin · mentor</small></div></div>`).join('')}
      </div>
      <div class="card"><div class="card-h"><div><h2>Termos e privacidade</h2><p>Aceite no primeiro acesso do aluno (LGPD). Texto a revisar com o advogado.</p></div></div>
        <span class="draft">${icon('info')} A definir</span></div>
    </div>`;
  noHandlers(root);
}
