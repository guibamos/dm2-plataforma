// Roteador e moldura da plataforma: topo verde, abas, sub-abas e barra de baixo no celular.

import { store } from './store.js?v=202611162315';
import { icon, initials, installTooltips } from './ui.js?v=202611162315';
import { destroyCharts } from './charts.js?v=202611162315';
import { renderRegister, setRegisterDate } from './view-register.js?v=202611162315';
import { renderStudentDashboard } from './view-dashboard.js?v=202611162315';
import { renderRoster, renderMentorStudent } from './view-mentor.js?v=202611162315';
import { renderHistory, renderSettings, renderLogin } from './view-other.js?v=202611162315';
import { renderHome, renderLessons, renderLesson, renderTimeline, renderGuide } from './view-platform.js?v=202611162315';
import { renderStudents, renderCrm, renderAcervo, renderConfig } from './view-admin.js?v=202611162315';
import { esc } from './util.js?v=202611162315';

const $top = document.getElementById('top');
const $nav = document.getElementById('nav');
const $sub = document.getElementById('subnav');
const $main = document.getElementById('main');
const $bottom = document.getElementById('bottom');

const ACOMP = ['registrar', 'painel', 'historico', 'ajustes'];
const STUDENT_PAGES = ['inicio', 'aulas', 'aula', 'timeline', 'guia', 'guiapage', ...ACOMP];
const ADMIN_PAGES = ['geral', 'alunos', 'aluno', 'aulas', 'aula', 'guia', 'guiapage', 'crm', 'acervo', 'config'];

// [rota, rótulo, ícone, rotas que deixam a aba ativa]
const STUDENT_TABS = [
  ['inicio', 'Início', 'home', ['inicio']],
  ['aulas', 'Aulas', 'play', ['aulas', 'aula']],
  ['registrar', 'Acompanhamento', 'chart', ACOMP],
  ['timeline', 'Timeline', 'route', ['timeline']],
  ['guia', 'Guias', 'compass', ['guia', 'guiapage']],
];
const ADMIN_TABS = [
  ['geral', 'Painel geral', 'grid', ['geral']],
  ['alunos', 'Alunos', 'users', ['alunos', 'aluno']],
  ['aulas', 'Aulas', 'play', ['aulas', 'aula']],
  ['guia', 'Guias', 'compass', ['guia', 'guiapage']],
  ['crm', 'CRM', 'funnel', ['crm']],
  ['acervo', 'Acervo', 'bookmark', ['acervo']],
  ['config', 'Configurações', 'gear', ['config']],
];
const SUB_TABS = [['registrar', 'Registrar', 'pencil'], ['painel', 'Meu painel', 'chart'], ['historico', 'Histórico', 'clock'], ['ajustes', 'Ajustes', 'sliders']];

// Tema claro/escuro: escolha do usuário, guardada só neste navegador.
function currentTheme() {
  let t = null;
  try { t = localStorage.getItem('dm2-theme'); } catch (e) { /* ignora */ }
  return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function applyTheme() { document.documentElement.dataset.theme = currentTheme(); }

let moreOpen = false;

function frame(real, me, page) {
  const admin = real && real.role === 'mentor';
  const asStudent = me && me.role === 'student';
  const dark = currentTheme() === 'dark';
  $top.innerHTML = `<div class="top-in">
    <a class="logo" href="#"><span class="logo-mark">DM<sup>2</sup></span><span class="logo-name">Daily Method</span></a>
    <span class="demo-chip">Protótipo · dados fictícios</span>
    <span class="top-sp"></span>
    ${admin ? `<div class="vswitch" role="group" aria-label="Trocar de visão" title="Temporário: só para conferir o que o aluno vê">
      <button type="button" data-view="admin" class="${asStudent ? '' : 'on'}">Admin</button>
      <button type="button" data-view="aluno" class="${asStudent ? 'on' : ''}">Aluno</button></div>` : ''}
    ${real ? `<button class="icon-btn" type="button" data-act="theme" aria-label="${dark ? 'Modo claro' : 'Modo escuro'}" title="${dark ? 'Modo claro' : 'Modo escuro'}">${icon(dark ? 'sun' : 'moon')}</button>
    <button class="who" data-act="logout" title="Trocar de perfil (protótipo)"><span class="avatar">${initials(me.name)}</span><span class="who-txt"><b>${esc(me.name)}</b><small>${asStudent ? (admin ? 'Vendo como aluno' : 'Aluno') : 'Admin'} · trocar perfil</small></span></button>` : ''}
  </div>`;

  if (!real) { $nav.hidden = true; $sub.innerHTML = ''; $bottom.innerHTML = ''; return; }
  const tabs = asStudent ? STUDENT_TABS : ADMIN_TABS;
  $nav.hidden = false;
  $nav.innerHTML = `<div class="nav-in">${tabs.map(([r, label, , match]) => `<a href="#${r}" class="${match.includes(page) ? 'on' : ''}">${label}</a>`).join('')}</div>`;

  $sub.innerHTML = asStudent && ACOMP.includes(page)
    ? `<div class="subnav-in">${SUB_TABS.map(([r, label, ic]) => `<a href="#${r}" class="${page === r ? 'on' : ''}">${icon(ic)}${label}</a>`).join('')}</div>`
    : '';

  // Celular: barra de baixo. "Mais" abre o resto do menu.
  const bar = asStudent
    ? [['inicio', 'Início', 'home', ['inicio']], ['aulas', 'Aulas', 'play', ['aulas', 'aula']], ['registrar', 'Registrar', 'plus', ['registrar'], 'reg'], ['painel', 'Painel', 'chart', ['painel']]]
    : [['geral', 'Geral', 'grid', ['geral']], ['alunos', 'Alunos', 'users', ['alunos', 'aluno']], ['aulas', 'Aulas', 'play', ['aulas', 'aula']]];
  const more = asStudent
    ? [['timeline', 'Timeline', 'route'], ['guia', 'Guias', 'compass'], ['historico', 'Histórico', 'clock'], ['ajustes', 'Ajustes', 'sliders']]
    : [['guia', 'Guias', 'compass'], ['crm', 'CRM', 'funnel'], ['acervo', 'Acervo', 'bookmark'], ['config', 'Configurações', 'gear']];
  const moreOn = more.some(([r]) => r === page);
  $bottom.innerHTML = `${bar.map(([r, label, ic, match, cls]) => `<a href="#${r}" class="${cls || ''} ${match.includes(page) ? 'on' : ''}">${icon(ic)}<span>${label}</span></a>`).join('')}
    <button type="button" data-act="more" class="${moreOn || moreOpen ? 'on' : ''}" aria-expanded="${moreOpen}">${icon('menu')}<span>Mais</span></button>
    ${moreOpen ? `<div class="more-sheet">${more.map(([r, label, ic]) => `<a href="#${r}" class="${page === r ? 'on' : ''}">${icon(ic)}${label}</a>`).join('')}</div>` : ''}`;
}

function render() {
  destroyCharts();
  applyTheme();
  const real = store.realMe();
  const me = store.me();
  let route = location.hash.replace(/^#/, '');
  if (!real) route = 'entrar';
  const asStudent = me && me.role === 'student';
  let page = route.startsWith('aluno-') ? 'aluno' : route.startsWith('aula-') ? 'aula' : route.startsWith('guia-') ? 'guiapage' : route;
  if (real && (!page || page === 'entrar' || !(asStudent ? STUDENT_PAGES : ADMIN_PAGES).includes(page))) {
    route = page = asStudent ? 'inicio' : 'geral';
  }
  const arg = page === 'aluno' ? route.slice(6) : page === 'aula' ? route.slice(5) : page === 'guiapage' ? route.slice(5) : null;
  frame(real, me, page);
  document.body.classList.toggle('has-sub', !!$sub.innerHTML);

  const ctx = {
    me, real, admin: !asStudent,
    refresh: render,
    editDay: (d) => { setRegisterDate(d); location.hash = '#registrar'; },
  };
  if (asStudent) ctx.data = store.student(me.id);
  if (!real) return renderLogin($main, ctx);

  if (asStudent) {
    if (page === 'inicio') return renderHome($main, ctx);
    if (page === 'aulas') return renderLessons($main, ctx);
    if (page === 'aula') return renderLesson($main, ctx, arg);
    if (page === 'timeline') return renderTimeline($main, ctx);
    if (page === 'guia' || page === 'guiapage') return renderGuide($main, ctx, arg);
    if (page === 'painel') return renderStudentDashboard($main, ctx);
    if (page === 'historico') return renderHistory($main, ctx);
    if (page === 'ajustes') return renderSettings($main, ctx);
    return renderRegister($main, ctx);
  }
  if (page === 'aluno' && arg) return renderMentorStudent($main, ctx, arg);
  if (page === 'alunos') return renderStudents($main, ctx);
  if (page === 'aulas') return renderLessons($main, ctx);
  if (page === 'aula') return renderLesson($main, ctx, arg);
  if (page === 'guia' || page === 'guiapage') return renderGuide($main, ctx, arg);
  if (page === 'crm') return renderCrm($main, ctx);
  if (page === 'acervo') return renderAcervo($main, ctx);
  if (page === 'config') return renderConfig($main, ctx);
  return renderRoster($main, ctx);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act="logout"]');
  if (b) { store.logout(); location.hash = '#entrar'; render(); return; }
  const th = e.target.closest('[data-act="theme"]');
  if (th) {
    try { localStorage.setItem('dm2-theme', currentTheme() === 'dark' ? 'light' : 'dark'); } catch (err) { /* ignora */ }
    render(); return;
  }
  const v = e.target.closest('[data-view]');
  if (v) {
    if (v.dataset.view === 'aluno') { store.viewAs('ana'); location.hash = '#inicio'; }
    else { store.viewAs(null); location.hash = '#geral'; }
    render(); return;
  }
  const m = e.target.closest('[data-act="more"]');
  if (m) { moreOpen = !moreOpen; render(); return; }
  if (moreOpen && !e.target.closest('.more-sheet')) { moreOpen = false; render(); }
  // Confirmação em dois cliques (o link publicado não mostra janelas de confirmação).
  const r = e.target.closest('[data-act="reset"]');
  if (r) {
    if (r.dataset.armed) { store.resetDemo(); r.textContent = 'Dados fictícios restaurados'; delete r.dataset.armed; render(); return; }
    r.dataset.armed = '1';
    r.textContent = 'Apaga o que você registrou aqui. Clique de novo para confirmar';
    setTimeout(() => { if (r.dataset.armed) { delete r.dataset.armed; r.textContent = 'Restaurar dados fictícios'; } }, 5000);
  }
});

let lastHash = location.hash;
window.addEventListener('hashchange', () => { if (location.hash !== lastHash) { lastHash = location.hash; moreOpen = false; window.scrollTo(0, 0); render(); } });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);

installTooltips();
render();
