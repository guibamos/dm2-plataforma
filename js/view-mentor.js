// Visão dos mentores: todos os alunos e o painel de cada um (só leitura).

import { store } from './store.js';
import { analyze } from './analytics.js';
import { fmtPct, fmtInt, fmtDate, esc, today, addDays, diffDays } from './util.js';
import { icon, statusChip, initials, deltaHtml, toast } from './ui.js';
import { dashboardBody, periodFilter, mountCharts, handleDashClick } from './view-dashboard.js';

const ORDER = { critical: 0, serious: 1, warning: 2, good: 3 };

export function renderRoster(root, ctx) {
  const me = store.me();
  const rows = store.myStudents().map((u) => {
    const data = store.student(u.id);
    const a = analyze(data, '7d');
    const t = today();
    const dots = [];
    for (let i = 6; i >= 0; i--) dots.push(data.anki.some((x) => x.date === addDays(t, -i)));
    const lastSim = a.assessments[a.assessments.length - 1];
    return { u, data, a, dots, lastSim };
  }).sort((x, y) => ORDER[x.a.status.level] - ORDER[y.a.status.level] || (y.a.daysSinceAny || 0) - (x.a.daysSinceAny || 0));

  const need = rows.filter((r) => r.a.status.level === 'critical' || r.a.status.level === 'serious').length;

  root.innerHTML = `
    <div class="zone-head">
      <div><span class="eyebrow ana">${icon('sparkles')} Análise automática</span><h1>Painel geral</h1>
        <p class="sub">Olá, ${esc(me.name.split(' ')[0])}. Todos os ${rows.length} alunos, nos últimos 7 dias, ordenados por quem precisa de atenção.</p></div>
      <div class="today-strip">
        <span class="pill ${need ? '' : 'ok'}">${icon(need ? 'alert' : 'checkCircle')} ${need ? `${need} ${need === 1 ? 'aluno precisa' : 'alunos precisam'} de atenção` : 'Todos no ritmo'}</span>
      </div>
    </div>
    <div class="roster-head"><span>Aluno</span><span>Situação</span><span>Último registro</span><span>Questões 7 dias</span><span>Acerto 7 dias</span><span>Anki 7 dias</span><span></span></div>
    <div class="roster">
      ${rows.map(({ u, a, dots, lastSim }) => {
        const top = a.insights.find((i) => i.severity === 'critical' || i.severity === 'warning');
        return `<a class="stu" href="#aluno-${u.id}">
          <span class="stu-name"><span class="avatar">${initials(u.name)}</span><span style="min-width:0"><b>${esc(u.name)}</b><small>${esc(a.settings.exam)} · ${a.daysToExam != null ? `prova em ${a.daysToExam} dias` : 'sem data de prova'}${lastSim ? ` · último simulado ${fmtPct(lastSim.pct)}` : ''}</small></span></span>
          <span>${statusChip(a.status)}${top ? `<small class="muted" style="display:block;font-size:11px;margin-top:4px;line-height:1.3">${esc(top.title)}</small>` : ''}</span>
          <span class="stu-m"><small>Último registro</small><b>${a.daysSinceAny == null ? '—' : a.daysSinceAny === 0 ? 'hoje' : a.daysSinceAny === 1 ? 'ontem' : `há ${a.daysSinceAny} dias`}</b></span>
          <span class="stu-m"><small>Questões 7 dias</small><b>${fmtInt(a.total.q)}</b></span>
          <span class="stu-m"><small>Acerto 7 dias</small><b>${fmtPct(a.total.acc)}</b>${deltaHtml(a.delta)}</span>
          <span class="stu-m"><small>Anki 7 dias</small><span class="dots" aria-label="${dots.filter(Boolean).length} de 7 dias">${dots.map((d) => `<i class="${d ? 'on' : ''}"></i>`).join('')}</span></span>
          ${icon('chevron')}
        </a>`;
      }).join('')}
    </div>
    <div class="section-gap"></div>
    <div class="privacy">${icon('shield')}<div><b>Os dois mentores veem todos os alunos.</b> Para filtrar por mentor ou ver em grupo, use a aba Alunos.</div></div>`;
  root.onclick = root.oninput = root.onchange = root.onsubmit = null;
}

export function renderMentorStudent(root, ctx, studentId) {
  let data;
  try { data = store.student(studentId); } catch (e) {
    root.innerHTML = `<div class="card" style="text-align:center;padding:40px">${icon('lock')}<h2 style="margin-top:8px">Sem acesso</h2><p class="sub">Aluno não encontrado.</p><p><a class="btn btn-ghost" href="#alunos">Voltar</a></p></div>`;
    return;
  }
  const { html, a } = dashboardBody(data, 'mentor');
  const status = analyze(data, '7d').status; // mesmo critério da lista de alunos
  const u = data.user; const s = data.settings;
  const lastSim = a.assessments[a.assessments.length - 1];
  const notes = data.notes.slice().sort((x, y) => (x.date < y.date ? 1 : -1));

  root.innerHTML = `
    <a class="back" href="#alunos">${icon('arrowLeft')} Alunos</a>
    <div class="zone-head">
      <div style="display:flex;gap:14px;align-items:center">
        <span class="avatar lg">${initials(u.name)}</span>
        <div><span class="eyebrow ana">${icon('sparkles')} Painel do aluno</span><h1 style="margin:2px 0">${esc(u.name)}</h1>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${statusChip(status)}<span class="readonly">${icon('lock')} Só leitura: quem preenche é o aluno</span></div></div>
      </div>
      ${periodFilter()}
    </div>
    <div class="grid g-2" style="margin-bottom:16px">
      <div class="card">
        <div class="card-h"><div><h2>Combinado</h2></div></div>
        <table class="t"><tbody>
          <tr><td class="muted">Prova</td><td><b>${esc(s.exam)}</b>${s.examDate ? ` · ${fmtDate(s.examDate)} (${diffDays(s.examDate, today())} dias)` : ' · sem data marcada'}</td></tr>
          <tr><td class="muted">Início</td><td>${fmtDate(s.startDate)} · semana ${a.weeks.length}</td></tr>
          <tr><td class="muted">Meta semanal</td><td>${fmtInt(s.weeklyGoal)} questões · Anki ${s.ankiGoal} dias</td></tr>
          <tr><td class="muted">Último simulado</td><td>${lastSim ? `${esc(lastSim.kind)} ${esc(lastSim.name)} · <b>${fmtPct(lastSim.pct)}</b> em ${fmtDate(lastSim.date)}` : 'nenhum'}</td></tr>
          <tr><td class="muted">Total desde o início</td><td>${fmtInt(a.allTime.q)} questões · ${fmtPct(a.allTime.acc)}</td></tr>
        </tbody></table>
      </div>
      <div class="card fill">
        <div class="card-h"><div><span class="eyebrow fill">${icon('pencil')} Você preenche</span><h2 style="margin-top:4px">Notas da mentoria</h2><p>Só os mentores veem. O aluno não tem acesso.</p></div></div>
        <form class="form" data-form="note" style="gap:10px">
          <textarea class="input" name="text" rows="2" placeholder="ex.: Combinamos revisar Renal antes do próximo simulado." required></textarea>
          <div class="actions"><span></span><button class="btn btn-fill btn-sm" type="submit">${icon('check')} Salvar nota</button></div>
        </form>
        <ul class="notes">${notes.map((n) => `<li><small>${fmtDate(n.date)}</small>${esc(n.text)}</li>`).join('') || '<li class="muted">Nenhuma nota ainda.</li>'}</ul>
      </div>
    </div>
    ${html}`;
  mountCharts(root, a);
  root.onclick = (e) => handleDashClick(e, ctx.refresh);
  root.oninput = root.onchange = null;
  root.onsubmit = (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get('text').trim();
    if (!text) return;
    store.addNote(studentId, text);
    toast('Nota salva');
    ctx.refresh();
  };
}
