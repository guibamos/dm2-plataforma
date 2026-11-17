// Conteúdo da aba Guias. Base: guias do USMLE Privateers (reescritos e reorganizados)
// e fontes oficiais. Valores conferidos em 16/11/2026: ver 03-produto-e-oferta/guias-estrutura.md.
//
// Tipos de bloco: h (subtítulo), p (parágrafo), steps, cards, total, table, alert, list, terms, links, sources.

export const CHECKED = '16/11/2026';

export const GUIDES = [
  // ------------------------------------------------------------------
  {
    id: 'caminho', icon: 'route', title: 'O caminho até a residência',
    desc: 'As etapas do processo, do cadastro ao Match, e quanto tempo costuma levar.',
    blocks: [
      { t: 'p', text: 'Para fazer residência nos EUA, quem se formou fora do país (IMG) precisa da certificação do ECFMG. Com ela, pode se candidatar às vagas pelo Match. Estas são as etapas.' },
      { t: 'steps', items: [
        { title: 'Conferir se a faculdade é aceita', text: 'A faculdade precisa estar no WDOMS com as notas do ECFMG (Sponsor Notes) que cobrem o seu ano de formatura.', link: 'inscricao' },
        { title: 'Criar a conta no MyIntealth', text: 'É onde ficam identidade, documentos e a aplicação para a certificação do ECFMG.', link: 'inscricao' },
        { title: 'Step 1', text: 'Ciências básicas aplicadas à clínica. Resultado só de aprovado ou reprovado.', link: 'provas' },
        { title: 'Step 2 CK', text: 'Conhecimento clínico. Tem nota numérica, que é um dos números mais olhados no Match.', link: 'provas' },
        { title: 'Inglês (OET) pelos Pathways', text: 'Comprova a comunicação em inglês. Substituiu o antigo Step 2 CS.', link: 'provas' },
        { title: 'Certificação do ECFMG', text: 'Sai quando o Step 1, o Step 2 CK, o inglês e a verificação do diploma estão completos.' },
        { title: 'Estágios nos EUA e cartas de recomendação', text: 'Não são obrigatórios, mas pesam muito na candidatura: as cartas de médicos americanos são uma das partes mais importantes da aplicação.' },
        { title: 'ERAS e Match', text: 'A candidatura às residências é pelo ERAS, e o pareamento entre candidatos e programas é feito pelo NRMP (o Match).' },
        { title: 'Step 3', text: 'Feito nos EUA. Pode ser antes ou durante a residência.', link: 'provas' },
      ] },
      { t: 'alert', tone: 'info', title: 'A ordem é individual', text: 'Quando fazer o Step 1 e o Step 2 CK, e quanto tempo dedicar a cada um, muda de aluno para aluno. Isso é decidido na mentoria.' },
      { t: 'h', text: 'Quanto tempo de estudo costuma levar' },
      { t: 'table', head: ['Prova', 'Ritmo', 'Duração comum'], rows: [
        ['Step 1', 'Distribuído: 2 a 3 h por dia', '6 a 12 meses'],
        ['Step 1', 'Intensivo: 6 a 8 h por dia', '3 a 6 meses'],
        ['Step 2 CK', 'Varia com o momento do internato', '3 a 6 meses'],
      ], note: 'Referência da comunidade, não regra. Quem está formado há mais tempo costuma precisar de mais.' },
      { t: 'h', text: 'O que mudou nos últimos anos' },
      { t: 'cards', items: [
        { title: 'Step 1 sem nota', value: '2022', text: 'Virou só aprovado ou reprovado. Com isso, o Step 2 CK ganhou peso no Match.' },
        { title: 'Fim do Step 2 CS', value: '2021', text: 'A prova prática acabou. O inglês passou a ser comprovado pelo OET, dentro dos Pathways.' },
        { title: 'Nova inscrição', value: '12/01/2026', text: 'O registro das provas passou para o FSMB. O MyIntealth cuida de conta, documentos e certificação.' },
      ] },
      { t: 'sources', items: [['usmle.org', 'https://www.usmle.org'], ['Intealth · ECFMG', 'https://www.ecfmg.org'], ['USMLE Privateers · Comece aqui', 'https://www.usmleprivateers.com/usmle-wiki/comece-aqui']] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'siglas', icon: 'book', title: 'Siglas',
    desc: 'As siglas que aparecem em todo o processo, separadas por assunto.',
    blocks: [
      { t: 'h', text: 'Órgãos e sistemas' },
      { t: 'terms', items: [
        ['USMLE', 'United States Medical Licensing Examination', 'A série de provas (Step 1, Step 2 CK e Step 3) para a licença médica nos EUA.'],
        ['ECFMG', 'Educational Commission for Foreign Medical Graduates', 'Certifica os médicos formados fora dos EUA para a residência.'],
        ['Intealth', 'Intealth', 'Organização que reúne o ECFMG. É dona do MyIntealth.'],
        ['MyIntealth', 'MyIntealth', 'Sistema onde o IMG cria a conta, envia documentos e faz a aplicação para o ECFMG.'],
        ['FSMB', 'Federation of State Medical Boards', 'Desde 2026, é onde se paga e registra o Step 1 e o Step 2 CK, e de onde saem os transcripts.'],
        ['NBME', 'National Board of Medical Examiners', 'Coorganizador do USMLE. Vende os simulados oficiais.'],
        ['WDOMS', 'World Directory of Medical Schools', 'Lista mundial de faculdades de Medicina. Mostra se a sua é aceita pelo ECFMG.'],
        ['Prometric', 'Prometric', 'Rede de centros onde as provas são feitas.'],
        ['IMG', 'International Medical Graduate', 'Médico formado fora dos EUA e do Canadá.'],
      ] },
      { t: 'h', text: 'Provas e simulados' },
      { t: 'terms', items: [
        ['CK', 'Clinical Knowledge', 'O Step 2 CK: prova de conhecimento clínico.'],
        ['CS', 'Clinical Skills', 'Antiga prova prática do Step 2. Acabou em 2021.'],
        ['OET', 'Occupational English Test', 'Prova de inglês para a área da saúde, usada nos Pathways.'],
        ['Pathways', 'Pathways', 'Caminhos do ECFMG para comprovar a comunicação clínica em inglês.'],
        ['CBSSA', 'Comprehensive Basic Science Self-Assessment', 'Simulados oficiais do NBME para o Step 1.'],
        ['CCSSA', 'Comprehensive Clinical Science Self-Assessment', 'Simulados oficiais do NBME para o Step 2 CK.'],
        ['UWSA', 'UWorld Self-Assessment', 'Simulados do UWorld.'],
        ['Free 120', 'Free 120', 'Amostra gratuita de questões oficiais, no site do USMLE.'],
        ['Eligibility period', 'Período de elegibilidade', 'Janela de 3 meses em que você pode fazer a prova.'],
        ['Scheduling permit', 'Permissão de agendamento', 'Documento que libera a marcação da data na Prometric.'],
      ] },
      { t: 'h', text: 'Residência e estágios' },
      { t: 'terms', items: [
        ['USCE', 'US Clinical Experience', 'Experiência clínica nos EUA (estágios).'],
        ['Observership', 'Observership', 'Estágio só de observação, sem contato direto com o paciente.'],
        ['Clerkship', 'Clerkship', 'Estágio prático de estudante, com contato com o paciente.'],
        ['Sub-I', 'Sub-Internship', 'Estágio com responsabilidade parecida com a de um interno.'],
        ['VSLO', 'Visiting Student Learning Opportunities', 'Sistema da AAMC para se candidatar a estágios em muitas faculdades.'],
        ['LoR', 'Letter of Recommendation', 'Carta de recomendação.'],
        ['ERAS', 'Electronic Residency Application Service', 'Sistema onde se monta e envia a candidatura às residências.'],
        ['NRMP', 'National Resident Matching Program', 'Organiza o Match e publica os dados de cada especialidade.'],
        ['ACGME', 'Accreditation Council for Graduate Medical Education', 'Acredita os programas de residência.'],
        ['J-1 / H-1B', 'Vistos', 'Os dois vistos mais usados na residência.'],
      ] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'custos', icon: 'wallet', title: 'Custos',
    desc: 'Cada taxa oficial, quanto custa remarcar e como pagar em dólar.',
    blocks: [
      { t: 'p', text: 'Valores em dólar, conferidos nos sites oficiais em 16/11/2026. As taxas mudam, por isso cada valor tem a fonte no fim da página.' },
      { t: 'h', text: 'No MyIntealth (ECFMG)' },
      { t: 'cards', items: [
        { title: 'Abertura de conta', value: 'US$110', text: 'Cria a conta e inclui a verificação de identidade por vídeo.' },
        { title: 'Aplicação para a certificação', value: 'US$580', text: 'A aplicação formal para a certificação do ECFMG.' },
        { title: 'Verificação de credenciais', value: 'US$220', text: 'US$110 por documento: diploma e histórico.' },
        { title: 'Tradução feita pelo ECFMG', value: 'US$52/pág.', text: 'Cobrada se o documento não estiver em inglês ou a tradução estiver incompleta.' },
      ] },
      { t: 'h', text: 'No FSMB (as provas)' },
      { t: 'cards', items: [
        { title: 'Conta no FSMB', value: 'US$75', text: 'Cobrada uma vez, no registro.' },
        { title: 'Step 1 no Brasil', value: 'US$905', text: 'US$695 da prova + US$210 de taxa por fazer fora dos EUA e do Canadá.' },
        { title: 'Step 2 CK no Brasil', value: 'US$930', text: 'US$695 da prova + US$235 de taxa por fazer fora dos EUA e do Canadá.' },
        { title: 'Step 3', value: 'US$955', text: 'Feito só nos EUA.' },
      ] },
      { t: 'h', text: 'Inglês' },
      { t: 'cards', items: [
        { title: 'Pathways', value: 'US$945', text: 'Valor do ciclo 2027. O de 2026 foi US$925.' },
        { title: 'OET (Medicine)', value: 'AUD 587', text: 'Pago no site do OET, em dólar australiano.' },
      ] },
      { t: 'total', label: 'Mínimo para fazer o Step 1 no Brasil', value: 'US$1.890', text: 'Conta MyIntealth (110) + aplicação (580) + credenciais (220) + conta FSMB (75) + Step 1 (695) + taxa regional (210). Sem tradução, Pathways e OET.' },
      { t: 'h', text: 'Quanto custa remarcar' },
      { t: 'table', head: ['Antecedência', 'Step 1', 'Step 2 CK', 'Step 3'], rows: [
        ['46 dias ou mais', 'Grátis', 'Grátis', 'Grátis'],
        ['31 a 45 dias', 'US$35', 'US$35', 'US$35'],
        ['6 a 30 dias', 'US$100', 'US$100', 'US$100'],
        ['5 dias ou menos', 'US$158', 'US$178', 'US$317'],
      ], note: 'Em vigor desde 01/07/2026. O mesmo valor vale em qualquer país.' },
      { t: 'alert', tone: 'warning', title: 'Tradução pronta antes de começar', text: 'Se o documento traduzido ficar incompleto no MyIntealth, o sistema pode cobrar a tradução do ECFMG por página. Tenha a tradução juramentada de tudo antes de enviar.' },
      { t: 'alert', tone: 'info', title: 'Pagar em dólar', text: 'Cartão de crédito brasileiro cobra IOF e câmbio na fatura. Contas globais com cartão internacional, carregadas por Pix, costumam sair mais barato e são aceitas nos sites.' },
      { t: 'h', text: 'Fontes de estudo e simulados' },
      { t: 'p', text: 'Os preços de bancos de questões, livros, vídeos e simulados estão nos guias de Fontes de estudo e de Simulados.', links: ['fontes1', 'fontes2', 'simulados'] },
      { t: 'sources', checked: true, items: [['usmle.org · taxas', 'https://www.usmle.org/apply-exams'], ['usmle.org · remarcação', 'https://www.usmle.org/reschedule-exam'], ['ECFMG · taxas', 'https://www.ecfmg.org/fees/'], ['OET', 'https://oet.com']] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'inscricao', icon: 'clipboard', title: 'Inscrição passo a passo',
    desc: 'Elegibilidade, MyIntealth, FSMB e Prometric, com os erros mais comuns.',
    blocks: [
      { t: 'h', text: 'Antes de tudo: sua faculdade é aceita?' },
      { t: 'steps', items: [
        { title: 'Entre no WDOMS', text: 'wdoms.org, escolha Brasil e procure a sua faculdade. Cada campus tem um registro próprio.' },
        { title: 'Confira as Sponsor Notes', text: 'Elas dizem quais anos de formatura são aceitos pelo ECFMG.' },
        { title: 'Se você foi transferido', text: 'As duas faculdades precisam estar no WDOMS com Sponsor Notes válidas.' },
      ] },
      { t: 'alert', tone: 'warning', title: 'Faculdade sem Sponsor Notes', text: 'Costuma acontecer com faculdades novas, antes da primeira turma se formar. A faculdade precisa pedir a inclusão ao ECFMG (medschoolreview@ecfmg.org), e isso pode levar meses.' },
      { t: 'h', text: 'Duas plataformas' },
      { t: 'table', head: ['Plataforma', 'Para que serve', 'O que você faz lá'], rows: [
        ['MyIntealth', 'Identidade, documentos e certificação do ECFMG', 'Cria a conta, envia documentos, faz a verificação por vídeo e a aplicação'],
        ['FSMB', 'Pagamento e registro das provas', 'Paga o Step, escolhe o período de 3 meses e recebe a permissão de agendamento'],
      ] },
      { t: 'alert', tone: 'warning', title: 'Escolha ECFMG, não EPIC', text: 'Ao criar a conta, há dois botões parecidos. EPIC é para outros processos. Muita gente já clicou no errado.' },
      { t: 'h', text: 'No MyIntealth' },
      { t: 'steps', items: [
        { title: 'Criar a conta', text: 'Com o e-mail que você vai usar no processo inteiro. Quem já tinha conta no ECFMG antigo usa a opção de recuperar a conta, com o número do ECFMG.' },
        { title: 'Preencher os dados (cerca de 15 min)', bullets: ['Foto colorida estilo passaporte, com fundo claro', 'Passaporte válido', 'Data de formatura = a que está no diploma, não a da colação', 'Título profissional: "Medico", sem acento', 'Órgão certificador: CFM, não o CRM do estado'] },
        { title: 'Enviar os documentos', bullets: ['Diploma em português, frente e verso', 'Tradução juramentada do diploma para o inglês', 'Se mudou de nome: certidão traduzida e passaporte com o nome atual'] },
        { title: 'Verificação de identidade por vídeo', text: 'Chamada de cerca de 5 minutos com um oficial americano, com o passaporte em mãos. Pode acontecer logo depois do cadastro.' },
        { title: 'Verificação na faculdade', text: 'O ECFMG pede à sua faculdade a confirmação do diploma e o histórico. Ligue para a faculdade, avise e ofereça a tradução juramentada do histórico.' },
        { title: 'Aguardar a liberação', text: 'Quando aparecer "Credentials Verified", o MyIntealth avisa o FSMB. Pode levar de dias a semanas.' },
      ] },
      { t: 'alert', tone: 'info', title: 'Role a página até o fim', text: 'Há relatos de campos escondidos no fim do formulário. Se ficar algo em branco, o FSMB não libera o próximo passo.' },
      { t: 'h', text: 'No FSMB' },
      { t: 'steps', items: [
        { title: 'Entrar com o mesmo e-mail', text: 'Use o e-mail do MyIntealth e o número de 9 dígitos que aparece no canto da sua página lá.' },
        { title: 'Pagar a prova', text: 'Com cartão de crédito internacional. Os valores estão no guia de Custos.', link: 'custos' },
        { title: 'Escolher o período de elegibilidade', text: 'Uma janela de 3 meses para fazer a prova.' },
        { title: 'Receber a permissão e marcar', text: 'A permissão chega por e-mail com o link da Prometric. Escolha a cidade e a data.' },
      ] },
      { t: 'cards', items: [
        { title: 'Centros no Brasil', value: '5 cidades', text: 'São Paulo, Rio de Janeiro, Belo Horizonte, Brasília e Recife. Se não houver data, tente outro centro.' },
        { title: 'Quando começar', value: 'Cedo', text: 'A verificação dos documentos pode demorar. Pague a prova só quando for escolher o período de 3 meses.' },
      ] },
      { t: 'sources', items: [['usmle.org · transição para o FSMB', 'https://www.usmle.org/usmle-service-transition-faqs'], ['WDOMS', 'https://www.wdoms.org'], ['USMLE Privateers · Comece aqui', 'https://www.usmleprivateers.com/usmle-wiki/comece-aqui']] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'provas', icon: 'flag', title: 'As provas',
    desc: 'Step 1, Step 2 CK, Step 3 e OET: formato, resultado e regras de tentativas.',
    blocks: [
      { t: 'cards', wide: true, items: [
        { title: 'Step 1', value: 'Aprovado ou reprovado', list: ['Cerca de 8 horas', 'Até 280 questões', '7 blocos de 60 min', 'Ciências básicas aplicadas à clínica'] },
        { title: 'Step 2 CK', value: 'Nota de 3 dígitos', list: ['Cerca de 9 horas', 'Cerca de 318 questões', '8 blocos de 60 min', 'Diagnóstico, conduta e prevenção'] },
        { title: 'Step 3', value: '2 dias, só nos EUA', list: ['Dia 1: cerca de 232 questões em 6 blocos', 'Dia 2: cerca de 180 questões e 13 casos simulados (CCS)', 'Prática sem supervisão'] },
      ] },
      { t: 'h', text: 'O que cai no Step 1' },
      { t: 'table', head: ['Disciplina', 'Peso aproximado'], rows: [['Patologia', '45 a 55%'], ['Fisiologia', '30 a 40%'], ['Farmacologia', '10 a 20%'], ['Microbiologia', '10 a 20%'], ['Bioquímica e nutrição', '5 a 15%'], ['Imunologia', '5 a 15%']], note: 'Faixas do usmle.org (atualizadas em jan/2026). Uma questão pode contar para mais de uma disciplina, por isso a soma passa de 100%.' },
      { t: 'h', text: 'O que cai no Step 2 CK' },
      { t: 'table', head: ['Área', 'Peso aproximado'], rows: [['Clínica médica', '55 a 65%'], ['Pediatria', '17 a 27%'], ['Ginecologia e obstetrícia', '10 a 20%'], ['Psiquiatria', '10 a 15%'], ['Cirurgia', 'Confira no usmle.org']], note: 'Faixas do usmle.org. Também caem ética, prevenção e bioestatística.' },
      { t: 'h', text: 'Regras de tentativas' },
      { t: 'table', head: ['Regra', 'Detalhe'], rows: [
        ['Até 3 tentativas em 12 meses', 'A 4ª exige 12 meses desde a 1ª e 6 meses desde a última'],
        ['4 tentativas sem passar', 'Você fica inelegível para todos os Steps'],
        ['Tentativa incompleta conta', 'Sair no meio da prova também conta como tentativa'],
        ['Step aprovado não se refaz', 'Não dá para repetir para melhorar a nota'],
      ] },
      { t: 'h', text: 'OET (inglês)' },
      { t: 'table', head: ['Parte', 'Duração', 'Como é'], rows: [['Listening', 'Cerca de 40 min', 'Conversas e trechos da área da saúde'], ['Reading', '60 min', 'Textos da área da saúde'], ['Writing', '45 min', 'Uma carta clínica, como encaminhamento ou alta'], ['Speaking', 'Cerca de 20 min', 'Duas simulações de consulta']] },
      { t: 'sources', items: [['usmle.org · conteúdo do Step 1', 'https://www.usmle.org/exam-resources/step-1-materials/step-1-content-outline-and-specifications'], ['usmle.org · conteúdo do Step 2 CK', 'https://www.usmle.org/exam-resources/step-2-ck-materials/step-2-ck-content-outline-specifications'], ['usmle.org · regras de tentativas', 'https://www.usmle.org/bulletin-information/eligibility'], ['OET', 'https://oet.com']] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'fontes1', icon: 'layers', title: 'Fontes de estudo · Step 1',
    desc: 'Para que serve cada fonte, como usar e quanto custa.',
    blocks: [
      { t: 'p', text: 'Separadas por tipo. A combinação mais usada é um banco de questões, o Anki e uma fonte de revisão. O resto entra conforme a necessidade.' },
      { t: 'h', text: 'Banco de questões' },
      { t: 'resources', items: [
        { name: 'UWorld', role: 'Principal', price: 'p_uworld1', use: ['Primeiro por sistema, depois aleatório e cronometrado', 'Revisar todas as questões, inclusive as que acertou', 'Os pontos que errou viram cards no Anki'] },
        { name: 'AMBOSS', role: 'Complementar', price: 'p_amboss', use: ['Questões extras depois do UWorld', 'Biblioteca para consultar dúvidas'] },
      ] },
      { t: 'h', text: 'Revisão de conteúdo' },
      { t: 'resources', items: [
        { name: 'First Aid Step 1', role: 'Livro de referência', price: 'p_fa1', use: ['Guia central, para anotar o que aparece nas outras fontes', 'Revisão semanal do que já passou'] },
        { name: 'Pathoma', role: 'Patologia', price: 'p_pathoma', use: ['Vídeos e livro do Dr. Sattar', 'Os capítulos de patologia geral (1 a 3) são a base'] },
      ] },
      { t: 'h', text: 'Vídeos' },
      { t: 'resources', items: [
        { name: 'Boards & Beyond', role: 'Aulas por disciplina', price: 'p_bb', use: ['2 a 3 vídeos por dia', 'Assistir com o First Aid aberto, anotando'] },
        { name: 'Sketchy', role: 'Microbiologia e farmacologia', price: 'p_sketchy', use: ['Memorização por imagens e histórias', 'Tem decks de Anki próprios'] },
        { name: 'Med School Bootcamp', role: 'Aulas e cronogramas', price: 'p_bootcamp', use: ['Cronogramas prontos de 6, 9 e 12 semanas', 'Vídeos curtos e questões'] },
      ] },
      { t: 'h', text: 'Flashcards' },
      { t: 'resources', items: [
        { name: 'Anki + deck AnKing', role: 'Revisão espaçada', price: 'p_anki', use: ['O Anki é gratuito no computador e no Android', 'O deck AnKing atualizado vem pelo AnkiHub', 'Liberar os cards conforme os temas estudados'] },
      ] },
      { t: 'h', text: 'Como revisar uma questão' },
      { t: 'steps', items: [
        { title: 'Leia a explicação da alternativa certa', text: 'Ali está o que a prova quer que você saiba.' },
        { title: 'Entenda por que errou', text: 'Faltou conteúdo, leu errado, esqueceu, raciocinou errado? Cada tipo pede uma ação diferente.' },
        { title: 'Leia o objetivo educacional', text: 'O resumo no fim da explicação.' },
        { title: 'Transforme em card', text: 'Use o Anki em vez de caderno.' },
      ] },
      { t: 'alert', tone: 'warning', title: 'Erro comum', text: 'Comprar fontes demais. Um banco de questões bem feito e revisado vale mais do que vários recursos pela metade.' },
      { t: 'sources', items: [['USMLE Privateers · fontes do Step 1', 'https://www.usmleprivateers.com/usmle-wiki/steps/step-1/resources/ufaps-bb']] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'fontes2', icon: 'layers', title: 'Fontes de estudo · Step 2 CK',
    desc: 'As fontes do CK no mesmo formato do Step 1.',
    blocks: [
      { t: 'alert', tone: 'info', title: 'Em revisão', text: 'Esta lista vai ser revisada pelo Gabriel e pelo Mateus, que fizeram 261 e 267 no Step 2 CK.' },
      { t: 'h', text: 'Banco de questões' },
      { t: 'resources', items: [
        { name: 'UWorld Step 2 CK', role: 'Principal', price: 'p_uworld2', use: ['O banco de referência do CK', 'Mesma lógica do Step 1: revisar todas e levar os erros para o Anki'] },
        { name: 'AMBOSS', role: 'Complementar', price: 'p_amboss2', use: ['Questões extras', 'Biblioteca de condutas'] },
      ] },
      { t: 'h', text: 'Base clínica e revisão' },
      { t: 'resources', items: [
        { name: 'OnlineMedEd (OME)', role: 'Aulas de base clínica', price: 'p_ome', use: ['Vídeos curtos por especialidade', 'Bom para quem ainda não passou pelo internato'] },
        { name: 'Divine Intervention', role: 'Podcast', price: 'p_divine', use: ['Episódios de revisão de alto rendimento', 'Para ouvir no deslocamento'] },
        { name: 'First Aid Step 2 CK', role: 'Livro de referência', price: 'p_fa2', use: ['Consulta rápida por especialidade'] },
      ] },
      { t: 'h', text: 'Simulados do CK' },
      { t: 'p', text: 'NBME (CCSSA), UWSA e Free 120 do Step 2 CK. Preços e como ler o resultado no guia de Simulados.', links: ['simulados'] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'simulados', icon: 'target', title: 'Simulados',
    desc: 'Quais existem, quanto custam e como ler o resultado.',
    blocks: [
      { t: 'resources', items: [
        { name: 'NBME (CBSSA / CCSSA)', role: 'Oficial', price: 'p_nbme', use: ['Feito por quem faz a prova', 'No Step 1, mostra a chance de passar', 'No Step 2 CK, mostra uma nota estimada'] },
        { name: 'UWSA', role: 'UWorld', price: 'p_uwsa', use: ['Simulados do UWorld para Step 1 e Step 2 CK', 'Bom para treinar o ritmo'] },
        { name: 'Free 120', role: 'Oficial e gratuito', price: 'p_free120', use: ['Questões oficiais de amostra, no site do USMLE', 'Costuma ser um dos últimos antes da prova'] },
      ] },
      { t: 'h', text: 'Como a comunidade costuma usar' },
      { t: 'list', items: ['Fazer os NBMEs do mais antigo para o mais recente: os últimos se parecem mais com a prova atual', 'No Step 1, olhar a chance de passar, não só a % de acerto', 'Marcar a prova quando os últimos simulados ficam consistentemente bons', 'Depois de um simulado ruim, adiar algumas semanas costuma ser melhor do que arriscar'] },
      { t: 'alert', tone: 'info', title: 'Referência, não regra', text: 'O momento de marcar a prova é decidido com a mentoria, olhando a evolução nos simulados e no acompanhamento.' },
      { t: 'sources', items: [['NBME · simulados', 'https://www.nbme.org/examinees/self-assessments'], ['usmle.org · Free 120', 'https://www.usmle.org/prepare-your-exam']] },
    ],
  },
  // ------------------------------------------------------------------
  {
    id: 'links', icon: 'external', title: 'Links oficiais',
    desc: 'Onde ficam as informações de verdade.',
    blocks: [
      { t: 'links', items: [
        ['usmle.org', 'https://www.usmle.org', 'Regras, formato das provas, taxas e o Bulletin of Information.'],
        ['MyIntealth', 'https://app.myintealth.org', 'Conta, documentos e aplicação para a certificação do ECFMG.'],
        ['ECFMG', 'https://www.ecfmg.org', 'Certificação, taxas e Pathways.'],
        ['FSMB', 'https://www.fsmb.org', 'Pagamento e registro das provas, transcripts.'],
        ['WDOMS', 'https://www.wdoms.org', 'Conferir se a faculdade é aceita.'],
        ['Prometric', 'https://www.prometric.com/usmle', 'Marcar e remarcar a data da prova.'],
        ['NBME', 'https://www.nbme.org', 'Simulados oficiais.'],
        ['OET', 'https://oet.com', 'Prova de inglês.'],
        ['NRMP', 'https://www.nrmp.org', 'Match e dados de cada especialidade.'],
        ['ERAS (AAMC)', 'https://students-residents.aamc.org/eras', 'Candidatura às residências.'],
      ] },
      { t: 'alert', tone: 'info', title: 'A DM2 não tem vínculo com esses órgãos', text: 'Os links aparecem só para você encontrar a fonte oficial.' },
    ],
  },
];

// Preços das fontes e simulados (preenchidos depois da conferência).
export const PRICES = {};
