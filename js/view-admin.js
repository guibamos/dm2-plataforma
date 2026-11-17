// Áreas só do admin: Alunos (lista, grupos e cadastro), CRM, Acervo e Configurações.

import { store } from './store.js';
import { analyze } from './analytics.js';
import { ACERVO_URL } from './content.js';
import { fmtPct, fmtInt, fmtDate, esc } from './util.js';
import { icon, statusChip, initials, toast } from './ui.js';

const F = { q: '', mentor: '', exam: '', view: 'lista', group: 'mentor', adding: false };
const noHandlers = (root) => { root.onclick = root.oninput = root.onchange = root.onsubmit = null; };

export function renderStudents(root, ctx) {
  const mentors = store.mentors();
  const all = store.myStudents().map((u) => {
    const data = store.student(u.id);
    return { u, data, a: analyze(data, '7d') };
  });
  const rows = all.filter(({ u, a }) => (!F.q || u.name.toLowerCase().includes(F.q)) && (!F.mentor || u.mentorId === F.mentor) && (!F.exam || a.settings.exam === F.exam));

  const groupKey = (r) => (F.group === 'mentor' ? store.mentorName(r.u.mentorId) : F.group === 'exam' ? r.a.settings.exam : r.a.status.label);
  const groups = new Map();
  rows.forEach((r) => { const k = groupKey(r); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });

  const list = `<div class="card" style="padding:0"><div class="t-wrap"><table class="t students">
    <thead><tr><th>Aluno</th><th>Mentor</th><th>Prova</th><th>Situação</th><th class="r">Questões 7d</th><th class="r">Acerto 7d</th><th class="r">Anki 7d</th><th></th></tr></thead>
    <tbody>${rows.map(({ u, a }) => `<tr data-go="${u.id}">
      <td><span class="stu-name"><span class="avatar">${initials(u.name)}</span><span><b>${esc(u.name)}</b><small>${esc(u.email || '')}</small></span></span></td>
      <td>${esc(store.mentorName(u.mentorId).split(' ')[0])}</td>
      <td>${esc(a.settings.exam)}${a.daysToExam != null ? `<small class="muted" style="display:block">em ${a.daysToExam} dias</small>` : ''}</td>
      <td>${statusChip(a.status)}</td>
      <td class="r">${fmtInt(a.total.q)}</td><td class="r">${fmtPct(a.total.acc)}</td><td class="r">${a.anki.days}/${a.anki.den}</td>
      <td class="r">${icon('chevron')}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Nenhum aluno com esses filtros.</td></tr>'}</tbody></table></div></div>`;

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
      <div><h1>Alunos</h1><p class="sub">${all.length} alunos ativos. Os dois mentores veem todos.</p></div>
      <button class="btn btn-fill" data-add="1">${icon('plus')} Novo aluno</button>
    </div>
    ${F.adding ? `<div class="card fill" style="margin-bottom:16px">
      <div class="card-h"><div><span class="eyebrow fill">${icon('pencil')} Novo aluno</span><h2 style="margin-top:4px">Cadastrar e enviar convite</h2><p>O aluno recebe um e-mail para entrar, sem senha. No protótipo, nada é enviado.</p></div></div>
      <form class="form" data-form="student">
        <div class="row"><label class="field"><span>Nome</span><input class="input" name="name" required></label><label class="field"><span>E-mail</span><input class="input" type="email" name="email" required></label></div>
        <div class="row-3 row"><label class="field"><span>Mentor responsável</span><select class="input" name="mentorId">${mentors.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Prova</span><select class="input" name="exam"><option>Step 1</option><option>Step 2 CK</option></select></label>
          <label class="field"><span>Data da prova <em>(se já tem)</em></span><input class="input" type="date" name="examDate"></label></div>
        <p class="err small" hidden style="color:var(--critical-ink);margin:0"></p>
        <div class="actions"><button class="btn btn-ghost" type="button" data-cancel="1">Cancelar</button><button class="btn btn-fill" type="submit">${icon('mail')} Cadastrar e convidar</button></div>
      </form></div>` : ''}
    <div class="toolbar">
      <label class="search-box">${icon('search')}<input class="input" type="search" placeholder="Buscar aluno" value="${esc(F.q)}" data-f="q"></label>
      <select class="input" data-f="mentor"><option value="">Todos os mentores</option>${mentors.map((m) => `<option value="${m.id}" ${F.mentor === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>
      <select class="input" data-f="exam"><option value="">Todas as provas</option><option ${F.exam === 'Step 1' ? 'selected' : ''}>Step 1</option><option ${F.exam === 'Step 2 CK' ? 'selected' : ''}>Step 2 CK</option></select>
      <span class="top-sp"></span>
      <div class="seg"><button class="${F.view === 'lista' ? 'on' : ''}" data-view-mode="lista">${icon('users')} Um a um</button><button class="${F.view === 'grupo' ? 'on' : ''}" data-view-mode="grupo">${icon('grid')} Em grupo</button></div>
    </div>
    ${F.view === 'grupo' ? `<div class="filters" style="margin:0 0 14px"><span class="small muted">Agrupar por</span><div class="seg">${[['mentor', 'Mentor'], ['exam', 'Prova'], ['status', 'Situação']].map(([k, l]) => `<button class="${F.group === k ? 'on' : ''}" data-group="${k}" style="padding:5px 10px;font-size:12px">${l}</button>`).join('')}</div></div>${grouped}` : list}
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
    store.addStudent({ name, email, mentorId: f.get('mentorId'), exam: f.get('exam'), examDate: f.get('examDate') });
    F.adding = false;
    toast(`${name.split(' ')[0]} cadastrado. O convite iria para ${email}`);
    ctx.refresh();
  };
}

export function renderCrm(root) {
  const cols = [['Interessados', 3], ['Conversa de diagnóstico', 2], ['Proposta enviada', 1], ['Virou aluno', 0]];
  root.innerHTML = `
    <div class="zone-head"><div><h1>CRM</h1><p class="sub">O funil de interessados até virar aluno.</p></div></div>
    <div class="privacy" style="margin-bottom:16px">${icon('info')}<div><b>A ser criado.</b> As etapas abaixo são só um esboço do lugar onde o CRM vai ficar. A ideia é que um interessado vire aluno com um clique, levando os dados para o cadastro.</div></div>
    <div class="kanban">${cols.map(([c, n]) => `<div class="kcol"><div class="kcol-h">${esc(c)}</div>${Array.from({ length: n }, () => '<div class="kcard"><span class="sk"></span><span class="sk short"></span></div>').join('')}</div>`).join('')}</div>`;
  noHandlers(root);
}

export function renderAcervo(root) {
  root.innerHTML = `
    <div class="zone-head"><div><h1>Acervo DM2</h1><p class="sub">Posts de referência do Instagram, classificados por tema, funil e gancho.</p></div></div>
    <div class="card" style="max-width:640px">
      <div class="card-h"><div><h2>Abre em outra aba</h2><p>Por enquanto, o Acervo continua sendo uma página própria. Trazer os dados para dentro da plataforma fica para depois.</p></div></div>
      <a class="btn btn-fill" href="${ACERVO_URL}" target="_blank" rel="noopener">${icon('external')} Abrir o Acervo</a>
    </div>`;
  noHandlers(root);
}

export function renderConfig(root) {
  const admins = store.mentors();
  root.innerHTML = `
    <div class="zone-head"><div><h1>Configurações</h1><p class="sub">Quem é admin, textos fixos e termos.</p></div></div>
    <div class="grid g-2">
      <div class="card"><div class="card-h"><div><h2>Admins</h2><p>Entram com o próprio e-mail e veem tudo.</p></div></div>
        ${admins.map((m) => `<div class="meet"><span class="avatar">${initials(m.name)}</span><div><b>${esc(m.name)}</b><small>Admin · mentor</small></div></div>`).join('')}
      </div>
      <div class="card"><div class="card-h"><div><h2>Termos e privacidade</h2><p>Aceite no primeiro acesso do aluno (LGPD). Texto a revisar com o advogado.</p></div></div>
        <span class="draft">${icon('info')} A definir</span></div>
    </div>`;
  noHandlers(root);
}
