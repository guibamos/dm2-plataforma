# Plataforma DM2 (protótipo geral)

16/11/2026. Primeira versão da plataforma inteira, para ver como fica de forma geral. Usa dados fictícios e grava só no navegador.

Link privado (artifact, compartilhar pelo menu Share): https://claude.ai/artifact/2DLmrW8HQccMSSJ7BD1vCP

Desenho e decisões: [03-produto-e-oferta/plataforma-desenho-geral.md](../../03-produto-e-oferta/plataforma-desenho-geral.md)

## O que tem
- **Aluno:** Início, Aulas (módulos, página da aula, marcar como assistida), Acompanhamento (o app de antes: Registrar, Meu painel, Histórico e Ajustes), Timeline (rascunho com as datas do sistema) e Guia de provas (só a estrutura).
- **Admin:** Painel geral (todos os alunos), Alunos (um a um, em grupo e cadastro de aluno novo), Aulas com edição, Guia, CRM (só o lugar), Acervo (link) e Configurações.
- **Botão Admin ⇄ Aluno** no topo: temporário, mostra a visão da aluna fictícia Ana Lima.
- **Menu:** topo verde com tema claro/escuro e perfil, abas sublinhadas e pílulas suaves dentro de Acompanhamento. No celular, barra de baixo com Registrar no meio.

## Abrir no computador
`python3 serve.py 8770` dentro desta pasta e depois http://localhost:8770

O protótipo antigo (`05-materiais/app-acompanhamento`) não foi alterado.
