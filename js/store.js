// Camada de dados do protótipo.
// Hoje grava no navegador (localStorage). Em produção, cada função vira uma chamada ao Supabase,
// e as mesmas regras de acesso ficam no banco (ver supabase/schema.sql):
//   - aluno lê e grava só os próprios registros;
//   - mentor lê os registros dos alunos dele e grava só as notas de mentoria.

import { uid, today } from './util.js?v=202611162357';
import { buildSeed } from './seed.js?v=202611162357';
import { MODULES_SEED, WATCHED_SEED } from './content.js?v=202611162357';
import { defaultTemplate } from './timeline.js?v=202611162357';

const KEY = 'dm2-plataforma-v4';
const VIEWAS = 'dm2-viewas';
const SESSION = 'dm2-session';
const STUDENT_TABLES = ['blocks', 'anki', 'mistakes', 'assessments'];

let db = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return withContent(JSON.parse(raw));
  } catch (e) { /* sem storage: segue com a semente em memória */ }
  return withContent(buildSeed());
}
// Aulas e progresso: entram na base se ainda não existirem.
function withContent(d) {
  if (!d.modules) d.modules = JSON.parse(JSON.stringify(MODULES_SEED));
  if (!d.watched) d.watched = JSON.parse(JSON.stringify(WATCHED_SEED));
  if (!d.tlTemplate) d.tlTemplate = defaultTemplate();
  if (!d.tlDone) d.tlDone = { ana: ['wdoms', 'intealth', 'traducao', 'video'], carla: ['wdoms', 'intealth'], diego: ['wdoms', 'intealth', 'traducao', 'video', 'credenciais', 'fsmb', 'prometric'] };
  if (!d.tlOverrides) d.tlOverrides = {};
  for (const u of d.users) if (u.role === 'student' && !u.email) u.email = `${u.id}@exemplo.com`;
  return d;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignora */ } }

class AccessDenied extends Error { constructor() { super('Sem permissão para estes dados.'); } }

export const store = {
  users: () => db.users.map(({ id, name, role }) => ({ id, name, role })),

  // Quem entrou de verdade (admin ou aluno).
  realMe() {
    let id = null;
    try { id = sessionStorage.getItem(SESSION); } catch (e) { /* ignora */ }
    return db.users.find((u) => u.id === id) || null;
  },
  // Quem a tela representa: o admin pode, por enquanto, ver como um aluno.
  me() {
    const r = this.realMe();
    if (r && r.role === 'mentor') {
      let v = null;
      try { v = sessionStorage.getItem(VIEWAS); } catch (e) { /* ignora */ }
      const u = v && db.users.find((x) => x.id === v && x.role === 'student');
      if (u) return u;
    }
    return r;
  },
  viewAs(id) { try { if (id) sessionStorage.setItem(VIEWAS, id); else sessionStorage.removeItem(VIEWAS); } catch (e) { /* ignora */ } },
  isAdmin() { const r = this.realMe(); return !!r && r.role === 'mentor'; },
  login(id) { try { sessionStorage.setItem(SESSION, id); sessionStorage.removeItem(VIEWAS); } catch (e) { /* ignora */ } },
  logout() { try { sessionStorage.removeItem(SESSION); sessionStorage.removeItem(VIEWAS); } catch (e) { /* ignora */ } },

  canRead(studentId) {
    const me = this.me();
    if (!me) return false;
    if (me.role === 'student') return me.id === studentId;
    const s = db.users.find((u) => u.id === studentId);
    return me.role === 'mentor' && !!s; // os mentores veem todos os alunos
  },

  myStudents() {
    const me = this.me();
    if (!me || me.role !== 'mentor') return [];
    return db.users.filter((u) => u.role === 'student');
  },
  mentors() { return db.users.filter((u) => u.role === 'mentor'); },

  // Cadastro de aluno pelo admin.
  addStudent({ name, email, exam, examDate }) {
    if (!this.isAdmin()) throw new AccessDenied();
    const id = uid();
    db.users.push({ id, name, email, role: 'student' });
    db.settings[id] = { exam, startDate: today(), examDate: examDate || null, weeklyGoal: 200, ankiGoal: 7 };
    save();
    return id;
  },

  // Aulas.
  modules() { return db.modules; },
  lesson(id) { for (const m of db.modules) { const l = m.lessons.find((x) => x.id === id); if (l) return { ...l, module: m }; } return null; },
  saveLesson(id, patch) {
    if (!this.isAdmin()) throw new AccessDenied();
    for (const m of db.modules) { const l = m.lessons.find((x) => x.id === id); if (l) Object.assign(l, patch); }
    save();
  },
  addLesson(moduleId) {
    if (!this.isAdmin()) throw new AccessDenied();
    const m = db.modules.find((x) => x.id === moduleId);
    const l = { id: uid(), title: 'Nova aula', min: 0, desc: '', video: '' };
    m.lessons.push(l); save(); return l.id;
  },
  addModule() {
    if (!this.isAdmin()) throw new AccessDenied();
    db.modules.push({ id: uid(), title: 'Novo módulo', lessons: [] }); save();
  },
  watched(studentId) { return db.watched[studentId] || []; },

  // Timeline: modelo da mentoria, itens feitos e datas ajustadas por aluno.
  tlTemplate() { return db.tlTemplate; },
  saveTlTemplateItem(id, patch) {
    if (!this.isAdmin()) throw new AccessDenied();
    const it = db.tlTemplate.find((x) => x.id === id); if (it) Object.assign(it, patch); save();
  },
  tlState(studentId) { return { done: db.tlDone[studentId] || [], overrides: db.tlOverrides[studentId] || {} }; },
  toggleTlDone(itemId) {
    const me = this.me();
    if (!me || me.role !== 'student') throw new AccessDenied();
    const l = db.tlDone[me.id] || (db.tlDone[me.id] = []);
    const i = l.indexOf(itemId); if (i < 0) l.push(itemId); else l.splice(i, 1);
    save();
  },
  setTlOverride(studentId, itemId, isoDate) {
    if (!this.isAdmin()) throw new AccessDenied();
    const o = db.tlOverrides[studentId] || (db.tlOverrides[studentId] = {});
    if (isoDate) o[itemId] = isoDate; else delete o[itemId];
    save();
  },
  toggleWatched(lessonId) {
    const me = this.me();
    if (!me || me.role !== 'student') throw new AccessDenied();
    const list = db.watched[me.id] || (db.watched[me.id] = []);
    const i = list.indexOf(lessonId);
    if (i < 0) list.push(lessonId); else list.splice(i, 1);
    save();
  },

  student(studentId) {
    if (!this.canRead(studentId)) throw new AccessDenied();
    const u = db.users.find((x) => x.id === studentId);
    const pick = (t) => db[t].filter((r) => r.studentId === studentId);
    const me = this.me();
    return {
      user: u,
      settings: db.settings[studentId],
      blocks: pick('blocks'),
      anki: pick('anki'),
      mistakes: pick('mistakes'),
      assessments: pick('assessments'),
      // Notas de mentoria: só o mentor vê.
      notes: me.role === 'mentor' ? db.notes.filter((n) => n.studentId === studentId) : [],
    };
  },

  // Gravações do aluno (só nos próprios dados).
  add(table, row) {
    const me = this.me();
    if (!me || me.role !== 'student' || !STUDENT_TABLES.includes(table)) throw new AccessDenied();
    const rec = { ...row, id: uid(), studentId: me.id, createdAt: new Date().toISOString() };
    if (table === 'anki') {
      db.anki = db.anki.filter((a) => !(a.studentId === me.id && a.date === rec.date));
    }
    db[table].push(rec);
    save();
    return rec;
  },
  remove(table, id) {
    const me = this.me();
    const list = db[table];
    const i = list.findIndex((r) => r.id === id);
    if (i < 0) return;
    const ok = (me.role === 'student' && list[i].studentId === me.id) || (table === 'notes' && list[i].mentorId === me.id);
    if (!ok) throw new AccessDenied();
    list.splice(i, 1);
    save();
  },
  saveSettings(patch) {
    const me = this.me();
    if (!me || me.role !== 'student') throw new AccessDenied();
    db.settings[me.id] = { ...db.settings[me.id], ...patch };
    save();
  },

  // Gravação do mentor.
  addNote(studentId, text) {
    const me = this.me();
    if (!me || me.role !== 'mentor' || !this.canRead(studentId)) throw new AccessDenied();
    db.notes.push({ id: uid(), studentId, mentorId: me.id, date: today(), text });
    save();
  },

  resetDemo() { db = withContent(buildSeed()); save(); },
};
