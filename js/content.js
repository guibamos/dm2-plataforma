// Conteúdo de exemplo das aulas e do guia. Os títulos são só para ver o layout:
// o conteúdo real vai ser definido pelo Gabriel e pelo Mateus.

export const MODULES_SEED = [
  {
    id: 'm1', title: 'Começando',
    lessons: [
      { id: 'l1', title: 'Boas-vindas: como funciona a mentoria', min: 12, desc: 'O que esperar dos encontros, como falar com o mentor e o que fazer na primeira semana.', video: '' },
      { id: 'l2', title: 'Como usar o acompanhamento', min: 9, desc: 'Registrar blocos, Anki, erros e simulados, e como ler o seu painel.', video: '' },
      { id: 'l3', title: 'Anki: configurando o deck AnKing', min: 24, desc: 'Instalação, configurações recomendadas e como não acumular revisões.', video: '' },
    ],
  },
  {
    id: 'm2', title: 'Método de estudo',
    lessons: [
      { id: 'l4', title: 'Como fazer e revisar um bloco de questões', min: 18, desc: 'Antes, durante e depois do bloco. A revisão é onde o aprendizado acontece.', video: '' },
      { id: 'l5', title: 'Os 6 tipos de erro e o que fazer com cada um', min: 15, desc: 'Por que separar "não sabia" de "li errado" muda o que você estuda a seguir.', video: '' },
      { id: 'l6', title: 'Simulados: como ler o resultado', min: 14, desc: 'O que o NBME e o UWSA dizem, e o que eles não dizem.', video: '' },
    ],
  },
  {
    id: 'm3', title: 'Encontros em grupo (gravações)',
    lessons: [
      { id: 'l7', title: 'Encontro em grupo · exemplo', min: 62, desc: 'Gravação de um encontro em grupo. As perguntas da turma ficam com marcação de tempo.', video: '' },
    ],
  },
];

export const WATCHED_SEED = { ana: ['l1', 'l2', 'l3', 'l4'], carla: ['l1', 'l2'], diego: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'], elisa: ['l1'], gabriela: ['l1', 'l2', 'l3'] };

// Guia de provas: só a estrutura. O conteúdo ainda vai ser definido.
export const GUIDE = [
  { id: 'provas', icon: 'flag', title: 'As provas', desc: 'Step 1 e Step 2 CK: formato, duração, como marcar e o que muda entre elas.', items: ['Step 1', 'Step 2 CK', 'Como marcar a prova'] },
  { id: 'simulados', icon: 'target', title: 'Simulados', desc: 'Quais existem, quando fazer e como interpretar cada um.', items: ['NBME', 'UWSA', 'Free 120'] },
  { id: 'custos', icon: 'wallet', title: 'Custos', desc: 'Quanto custa cada etapa: inscrição, bancos de questões e simulados.', items: ['Inscrição e taxas', 'Bancos de questões', 'Simulados'] },
  { id: 'fontes', icon: 'book', title: 'Fontes e recursos', desc: 'Os materiais padrão-ouro e para que serve cada um.', items: ['UWorld', 'Anki · AnKing', 'First Aid, Pathoma, Sketchy, Boards & Beyond'] },
];

export const ACERVO_URL = 'https://claude.ai/artifact/PkrZYdxzQhajU31jRTVnBo';
