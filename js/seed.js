// Dados fictícios para a demonstração. Nenhum aluno aqui existe.
// Cada perfil mostra uma situação que o mentor precisa enxergar no painel.

import { SYSTEMS, SUBJECTS, MISTAKES, ASSESSMENTS, MIXED } from './lists.js';
import { today, addDays, mondayOf, rng, uid } from './util.js';

const PROFILES = [
  { id: 'ana', name: 'Ana Lima', exam: 'Step 1', weeks: 9, examIn: 95, base: 0.58, trend: 0.012, perDay: 40, skip: 0.06, anki: 0.95,
    weak: ['Renal, Urinary Systems & Electrolytes', 'Biochemistry (General Principles)'], strongSubj: ['Physiology'], weakSubj: ['Biochemistry'], mix: [3, 2, 1, 2, 2, 1] },
  { id: 'bruno', name: 'Bruno Costa', exam: 'Step 1', weeks: 8, examIn: null, base: 0.55, trend: 0.004, perDay: 30, skip: 0.2, anki: 0.55, stopped: 5,
    weak: ['Pharmacology (General Principles)', 'Microbiology (General Principles)'], strongSubj: ['Pathology'], weakSubj: ['Pharmacology', 'Microbiology'], mix: [2, 5, 1, 1, 1, 2] },
  { id: 'carla', name: 'Carla Mendes', exam: 'Step 1', weeks: 6, examIn: 70, base: 0.68, trend: -0.022, perDay: 60, skip: 0.04, anki: 0.85,
    weak: ['Nervous System', 'Cardiovascular System'], strongSubj: ['Microbiology'], weakSubj: ['Anatomy'], mix: [1, 1, 4, 2, 2, 3] },
  { id: 'diego', name: 'Diego Rocha', exam: 'Step 2 CK', weeks: 10, examIn: 30, base: 0.64, trend: 0.009, perDay: 80, skip: 0.05, anki: 0.9, random: true,
    weak: ['Pregnancy, Childbirth & Puerperium', 'Psychiatric/Behavioral & Substance Use Disorder'], strongSubj: ['Medicine'], weakSubj: ['Obstetrics & Gynecology'], mix: [2, 1, 2, 3, 3, 1] },
  { id: 'elisa', name: 'Elisa Torres', exam: 'Step 1', weeks: 7, examIn: null, base: 0.6, trend: 0.008, perDay: 45, skip: 0.08, anki: 0.92,
    weak: ['Hematology & Oncology', 'Genetics (General Principles)'], strongSubj: ['Physiology'], weakSubj: ['Genetics'], mix: [3, 2, 1, 1, 2, 1] },
  { id: 'felipe', name: 'Felipe Nunes', exam: 'Step 1', weeks: 3, examIn: null, base: 0.54, trend: 0.01, perDay: 20, skip: 0.3, anki: 0.7,
    weak: ['Infectious Diseases'], strongSubj: ['Anatomy'], weakSubj: ['Microbiology'], mix: [4, 1, 1, 1, 1, 1] },
  { id: 'gabriela', name: 'Gabriela Prado', exam: 'Step 2 CK', weeks: 9, examIn: 50, base: 0.7, trend: 0.005, perDay: 70, skip: 0.07, anki: 0.88, random: true,
    weak: ['Pulmonary & Critical Care'], strongSubj: ['Pediatrics'], weakSubj: ['Surgery'], mix: [1, 2, 2, 2, 3, 2] },
];

// Frases de exemplo do campo "O que aprendi", por sistema.
const LEARNED = {
  'Renal, Urinary Systems & Electrolytes': ['ATR tipo 1 (distal): pH urinário > 5,5. Tipo 2 (proximal): bicarbonatúria.', 'GN pós-estreptocócica: C3 baixo, 2 a 3 semanas após faringite.', 'Lítio pode causar diabetes insípido nefrogênico.'],
  'Cardiovascular System': ['Estenose aórtica: sopro sistólico em crescendo-decrescendo irradiando para carótidas.', 'Tamponamento: tríade de Beck e pulso paradoxal.'],
  'Hematology & Oncology': ['G6PD: corpúsculos de Heinz e bite cells após estresse oxidativo.', 'PTT: anemia hemolítica, plaquetopenia e ADAMTS13 baixo.'],
  'Pharmacology (General Principles)': ['Inibidor competitivo: aumenta Km, Vmax igual.', 'Ordem zero: fenitoína, etanol e aspirina em dose alta.'],
  'Infectious Diseases': ['Aminoglicosídeos: nefro e ototoxicidade; sinergia com beta-lactâmicos.'],
  'Microbiology (General Principles)': ['Listeria: motilidade em cambalhota e crescimento a frio.'],
  'Biostatistics & Epidemiology': ['Sensibilidade não muda com a prevalência; o VPP muda.'],
  'Nervous System': ['Lesão de ACM: déficit maior em face e membro superior.'],
  'Biochemistry (General Principles)': ['Deficiência de tiamina: dar antes da glicose no etilista.'],
  'Psychiatric/Behavioral & Substance Use Disorder': ['Lítio: monitorar TSH e função renal.'],
};

const SYS_IDS = SYSTEMS.map((s) => s.id);
const STEP1_ORDER = ['Biochemistry (General Principles)', 'Genetics (General Principles)', 'Allergy & Immunology', 'Microbiology (General Principles)', 'Infectious Diseases',
  'Pharmacology (General Principles)', 'Pathology (General Principles)', 'Hematology & Oncology', 'Cardiovascular System', 'Renal, Urinary Systems & Electrolytes',
  'Pulmonary & Critical Care', 'Gastrointestinal & Nutrition', 'Nervous System', 'Endocrine, Diabetes & Metabolism'];

export function buildSeed() {
  const users = [
    { id: 'gabriel', name: 'Gabriel Abrantes', role: 'mentor' },
    { id: 'mateus', name: 'Mateus Rodrigues', role: 'mentor' },
  ];
  const db = { users, settings: {}, blocks: [], anki: [], mistakes: [], assessments: [], notes: [] };
  const t = today();

  PROFILES.forEach((p, pi) => {
    const r = rng(1000 + pi * 97);
    users.push({ id: p.id, name: p.name, role: 'student' });
    const start = addDays(mondayOf(t), -7 * (p.weeks - 1));
    db.settings[p.id] = { exam: p.exam, startDate: start, examDate: p.examIn == null ? null : addDays(t, p.examIn), weeklyGoal: Math.round(p.perDay * 6 / 10) * 10, ankiGoal: 7 };
    const subjects = SUBJECTS[p.exam];
    const lastDay = p.stopped ? addDays(t, -p.stopped) : addDays(t, -1);
    const mixTotal = p.mix.reduce((a, b) => a + b, 0);

    for (let d = start, day = 0; d <= t; d = addDays(d, 1), day++) {
      const week = Math.floor(day / 7);
      const isToday = d === t;
      const active = d <= lastDay || (isToday && !p.stopped && r() < 0.5);
      // Anki
      if (active && r() < p.anki) {
        db.anki.push({ id: uid(), studentId: p.id, date: d, done: true, reviews: Math.round(180 + r() * 220), newCards: Math.round(r() * 60) });
      }
      if (!active || r() < p.skip) continue;
      const acc = Math.min(0.9, p.base + p.trend * week);
      const focus = p.random ? null : STEP1_ORDER[Math.floor(day / 5) % STEP1_ORDER.length];
      const lateMix = !p.random && week >= p.weeks - 2;
      let left = Math.round(p.perDay * (0.7 + r() * 0.6) / 5) * 5;
      while (left > 0) {
        const size = Math.min(left, [20, 25, 40][Math.floor(r() * 3)]);
        left -= size;
        const mixed = p.random ? r() < 0.25 : lateMix && r() < 0.6;
        const system = mixed ? MIXED : (p.random ? SYS_IDS[Math.floor(r() * SYS_IDS.length)] : (r() < 0.8 ? focus : p.weak[Math.floor(r() * p.weak.length)]));
        const subject = mixed ? MIXED : subjects[Math.floor(r() * subjects.length)];
        let a = acc;
        if (p.weak.includes(system)) a -= 0.1;
        if (p.weakSubj.includes(subject)) a -= 0.07;
        if (p.strongSubj.includes(subject)) a += 0.08;
        a = Math.max(0.2, Math.min(0.95, a + (r() - 0.5) * 0.12));
        let correct = 0;
        for (let i = 0; i < size; i++) if (r() < a) correct++;
        db.blocks.push({ id: uid(), studentId: p.id, date: d, bank: p.exam === 'Step 1' && r() < 0.1 ? 'AMBOSS' : 'UWorld', mode: r() < 0.7 ? 'Cronometrado' : 'Tutor', system, subject, questions: size, correct });
        // Erros registrados: cerca de 1 a cada 3 erros, como acontece na prática.
        const wrong = size - correct;
        for (let i = 0; i < wrong; i++) {
          if (r() > 0.33) continue;
          let x = r() * mixTotal; let k = 0;
          while (x > p.mix[k]) { x -= p.mix[k]; k++; }
          const sys = system === MIXED ? (r() < 0.4 ? p.weak[0] : SYS_IDS[Math.floor(r() * SYS_IDS.length)]) : system;
          const subs = SYSTEMS.find((s) => s.id === sys).subtopics;
          db.mistakes.push({ id: uid(), studentId: p.id, date: d, qid: String(10000 + Math.floor(r() * 20000)), system: sys,
            subtopic: subs[Math.floor(r() * subs.length)], type: MISTAKES[k].id, learned: LEARNED[sys] && r() < 0.35 ? LEARNED[sys][Math.floor(r() * LEARNED[sys].length)] : '' });
        }
      }
    }
    // Simulados a partir da 3ª semana, a cada 2 ou 3 semanas.
    const kinds = ASSESSMENTS[p.exam];
    for (let w = 3; w < p.weeks; w += (w < 6 ? 3 : 2)) {
      const date = addDays(start, w * 7 + 5);
      if (date > lastDay) break;
      const pctv = Math.min(0.88, p.base + p.trend * w + 0.03 + (r() - 0.5) * 0.06);
      const kind = kinds[w % 3 === 0 ? 0 : w % 3 === 1 ? 1 : 2];
      const name = kind.startsWith('NBME') ? `Form ${26 + Math.floor(w / 2)}` : kind === 'UWSA' ? `UWSA ${1 + (w % 2)}` : 'Free 120';
      db.assessments.push({ id: uid(), studentId: p.id, date, kind, name, pct: Math.round(pctv * 100) / 100,
        score: p.exam === 'Step 2 CK' ? Math.round(200 + pctv * 80) : null, note: '' });
    }
  });

  db.notes.push({ id: uid(), studentId: 'ana', mentorId: 'gabriel', date: addDays(t, -6), text: 'Combinamos 40 questões por dia e revisar Renal no Pathoma antes do próximo bloco.' });
  db.notes.push({ id: uid(), studentId: 'bruno', mentorId: 'gabriel', date: addDays(t, -9), text: 'Está com muitas revisões atrasadas no Anki. Sugeri pausar cards novos por uma semana.' });
  return db;
}
