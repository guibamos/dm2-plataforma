// Histórico, ajustes e tela de entrada.

import { store } from './store.js';
import { MIXED, systemShort, subjectShort, mistakeById } from './lists.js';
import { fmtPct, fmtInt, fmtDate, fmtDateLong, esc, today, addDays, sum, groupBy } from './util.js';
import { icon, toast, initials, examDateField } from './ui.js';

const H = { days: 21 };

export function renderHistory(root, ctx) {
  const data = ctx.data;
  const t = today();
  const byDay = groupBy(data.blocks, 'date');
  const errByDay = groupBy(data.mistakes, 'date');
  const ankiSet = new Set(data.anki.map((a) => a.date));
  const rows = [];
  for (let i = 0; i < H.days; i++) {
    const d = addDays(t, -i);
    if (d < data.settings.startDate) break;
    const bl = byDay.get(d) || [];
    const q = sum(bl, (b) => b.questions); const c = sum(bl, (b) => b.correct);
    rows.push(`<tr>
      <td><b>${fmtDateLong(d)}</b></td>
      <td class="r">${q ? fmtInt(q) : '<span class="muted">—</span>'}</td>
      <td class="r">${q ? fmtPct(c / q) : ''}</td>
      <td>${bl.map((b) => `<span class="chip xs" style="cursor:default">${b.system === MIXED ? 'Misto' : esc(systemShort(b.system))} ${b.correct}/${b.questions}</span>`).join(' ')}</td>
      <td class="r">${ankiSet.has(d) ? `<span class="status good">${icon('check')}Sim</span>` : '<span class="muted">Não</span>'}</td>
      <td class="r">${(errByDay.get(d) || []).length || ''}</td>
      <td class="r"><button class="btn btn-ghost btn-sm" data-edit="${d}">${icon('pencil')} Editar</button></td>
    </tr>`);
  }
  root.innerHTML = `
    <div class="zone-head">
      <div><span class="eyebrow fill">${icon('clock')} Seus registros</span><h1>Histórico</h1><p class="sub">Para completar um dia, clique em Editar.</p></div>
    </div>
    <div class="card"><div class="t-wrap"><table class="t">
      <thead><tr><th>Dia</th><th class="r">Questões</th><th class="r">Acerto</th><th>Blocos</th><th class="r">Anki</th><th class="r">Erros</th><th></th></tr></thead>
      <tbody>${rows.join('')}</tbody></table></div>
      ${H.days < 400 ? `<div style="text-align:center;margin-top:12px"><button class="btn btn-ghost btn-sm" data-more="1">Ver mais dias</button></div>` : ''}
    </div>`;
  root.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.more) { H.days += 28; ctx.refresh(); }
    if (b.dataset.edit) { ctx.editDay(b.dataset.edit); }
  };
  root.oninput = root.onchange = root.onsubmit = null;
}

export function renderSettings(root, ctx) {
  const s = ctx.data.settings;
  root.innerHTML = `
    <div class="zone-head"><div><span class="eyebrow fill">${icon('pencil')} Você preenche · uma vez</span><h1>Ajustes</h1><p class="sub">Preencha junto com o mentor no primeiro dia.</p></div></div>
    <div class="card fill" style="max-width:640px">
      <form class="form" data-form="settings">
        <div class="row">
          <label class="field"><span>Prova</span><select class="input" name="exam"><option ${s.exam === 'Step 1' ? 'selected' : ''}>Step 1</option><option ${s.exam === 'Step 2 CK' ? 'selected' : ''}>Step 2 CK</option></select></label>
        </div>
        ${examDateField(s.examDate)}
        <div class="row">
          <label class="field"><span>Início da mentoria</span><input class="input" type="date" name="startDate" value="${s.startDate}" required></label>
          <label class="field"><span>Meta semanal de questões</span><input class="input" type="number" min="0" step="10" name="weeklyGoal" value="${s.weeklyGoal}"></label>
        </div>
        <label class="field" style="max-width:50%"><span>Meta de dias com Anki por semana</span><input class="input" type="number" min="0" max="7" name="ankiGoal" value="${s.ankiGoal}"></label>
        <div class="actions"><span class="muted small">Mudar a meta não apaga nada.</span><button class="btn btn-fill" type="submit">${icon('check')} Salvar</button></div>
      </form>
    </div>`;
  root.onclick = root.oninput = root.onchange = null;
  root.onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    store.saveSettings({ exam: f.get('exam'), examDate: f.get('examDate') || null, startDate: f.get('startDate'), weeklyGoal: Number(f.get('weeklyGoal')) || 0, ankiGoal: Number(f.get('ankiGoal')) || 0 });
    toast('Ajustes salvos');
    ctx.refresh();
  };
}

export function renderLogin(root, ctx) {
  const users = store.users();
  const mentors = users.filter((u) => u.role === 'mentor');
  const students = users.filter((u) => u.role === 'student');
  root.innerHTML = `
    <div class="login">
      <div class="login-hero">
        <span class="eyebrow ana">Protótipo · dados fictícios</span>
        <h1>Plataforma DM2</h1>
        <p class="sub">Escolha um perfil para ver a plataforma.<br>Na versão real, cada pessoa entra com o próprio e-mail, e quem é admin já cai na visão de admin.</p>
      </div>
      <h3 style="margin:0 0 10px" class="muted">Admins (mentores)</h3>
      <div class="pick">${mentors.map((m) => `<button data-login="${m.id}"><span class="avatar">${initials(m.name)}</span><span><b>${esc(m.name)}</b><small>Admin · pode trocar para a visão do aluno</small></span></button>`).join('')}</div>
      <h3 style="margin:24px 0 10px" class="muted">Alunos</h3>
      <div class="pick">${students.map((s) => `<button data-login="${s.id}"><span class="avatar" style="background:var(--surface-3);color:var(--ink)">${initials(s.name)}</span><span><b>${esc(s.name)}</b><small>Aluno fictício</small></span></button>`).join('')}</div>
      <div class="section-gap"></div>
      <div class="privacy">${icon('shield')}<div><b>Privacidade (LGPD).</b> O aluno vê e edita só os próprios dados. Os mentores veem todos os alunos, sem editar os registros deles. As notas da mentoria são só dos mentores. Na versão real, essas regras ficam no banco de dados, não só na tela.</div></div>
    </div>`;
  root.onclick = (e) => {
    const b = e.target.closest('[data-login]');
    if (!b) return;
    store.login(b.dataset.login);
    const me = store.me();
    // Se a pessoa abriu um link direto (ex.: #guia-custos), vai para ele depois de escolher o perfil.
    const want = location.hash.replace(/^#/, '');
    if (!want || want === 'entrar') location.hash = me.role === 'mentor' ? '#geral' : '#inicio';
    ctx.refresh();
  };
  root.oninput = root.onchange = root.onsubmit = null;
}
