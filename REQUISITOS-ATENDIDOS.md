# Verificação de requisitos do projeto

Este documento confere cada exigência com a implementação atual.

---

## OBJETIVO DO PROJETO
| Exigência | Status | Onde |
|-----------|--------|------|
| Curso completo Lei da Atração (básico ao avançado), conteúdo EXTENSO | ✅ | `public/index.html` |
| Conteúdo centralizado em um único index.html | ✅ | `public/index.html` (curso completo) |
| Visualização direta no Cursor + estrutura preparada para login/bloqueio | ✅ | DEV_MODE em `public/index.html` + auth/server |

---

## MODOS DE FUNCIONAMENTO
| Exigência | Status | Onde |
|-----------|--------|------|
| **DEV_MODE** ativo: acesso direto, sem login | ✅ | `window.DEV_MODE = true` em `public/index.html` (linha ~658) |
| **PROD_MODE** preparado: curso só com autenticação, sessão única, bloqueio por compartilhamento | ✅ | Porta de autenticação (auth-gate), `server/server.js`, `server/auth.js`, `server/sessions.js` |

---

## ESTRUTURA DE ARQUIVOS
| Exigência | Status | Caminho |
|-----------|--------|---------|
| Curso completo em um único HTML | ✅ | `/public/index.html` |
| Login e registro | ✅ | `/auth/login.html`, `/auth/register.html` |
| Servidor e autenticação | ✅ | `/server/server.js`, `/server/auth.js`, `/server/sessions.js` |
| Assets | ✅ | `/assets/css`, `/assets/js`, `/assets/images` |
| index.html funciona sozinho no Cursor | ✅ | Abrir `public/index.html`; DEV_MODE exibe o curso sem backend |

---

## DESIGN
| Exigência | Status | Onde |
|-----------|--------|------|
| Estilo moderno, chamativo, premium | ✅ | CSS em `public/index.html` |
| Fundo preto | ✅ | `--preto: #0A0A0A`, `background: var(--preto)` |
| Branco para leitura, vermelho para destaques | ✅ | `--branco`, `--vermelho`, `.accent` |
| Sem aparência de livro antigo / fundo branco dominante | ✅ | Tema escuro em todo o curso |
| Responsivo (mobile-first) | ✅ | Media queries e layout em `public/index.html` |
| Menu limpo, hambúrguer opcional, nada sobreposto ao conteúdo | ✅ | Sidebar colapsável, overlay, conteúdo centralizado |

---

## NAVEGAÇÃO DO CURSO
| Exigência | Status | Onde |
|-----------|--------|------|
| Página Início: título, descrição, botão “Começar Curso” | ✅ | `.course-landing` em `public/index.html` |
| “Começar Curso” → apenas INTRODUÇÃO | ✅ | `startCourse()` chama `showSection('introducao')` |
| A partir do Módulo 1: sem cabeçalho do início, módulo isolado | ✅ | `showSection()` oculta `.course-landing` e exibe só a seção do módulo |

---

## CONTEÚDO DO CURSO
| Exigência | Status | Onde |
|-----------|--------|------|
| 15 módulos | ✅ | `#modulo1` … `#modulo15` em `public/index.html` |
| Texto extenso, explicação clara, ≥1 atividade e ≥1 lembrete por módulo | ✅ | Conteúdo de cada seção |
| Mesmo nível de profundidade do Módulo 1 | ✅ | Módulos expandidos conforme escopo do projeto |
| Temas: Fundamentos, Consciência e realidade, Visualização, Afirmações, Emoções, Vibração e energia, Alinhamento, Manifestações, Crenças limitantes, Lei da suposição, Reprogramação mental, Shifting, Integração (+ outros) | ✅ | Correspondência nos títulos e IDs dos módulos |

---

## MÓDULO 8 – ARQUÉTIPOS
| Exigência | Status | Onde |
|-----------|--------|------|
| Botões expansíveis | ✅ | `.archetype-section-btn` e `.archetype-content` |
| Ao clicar, conteúdo abre do primeiro arquétipo (de cima para baixo) | ✅ | `scrollTo(0)` + `scrollIntoView` no primeiro item (IDs inicio-*) |
| 1. Clássicos junguianos → O MAGO | ✅ | `id="inicio-junguianos"` no primeiro item |
| 2. Figuras históricas → CLEÓPATRA (último: JESSICA RABBIT) | ✅ | `id="inicio-historicos"` |
| 3. Deuses e deusas → AFRODITE/VÊNUS | ✅ | `id="inicio-deuses"` |
| 4. Animais → LEÃO | ✅ | `id="inicio-animais"` |
| 5. Místicos e espirituais → SEREIA | ✅ | `id="inicio-misticos"` |
| 6. Qualidades específicas → PODER | ✅ | `id="inicio-qualidades"` |
| 7. Como trabalhar com arquétipos de forma segura → início do texto | ✅ | `id="inicio-seguro"` |
| Cada arquétipo: o que é, qualidades (luz), lado sombra, quando usar, ativar só luz, aviso ativação inconsciente sombra | ✅ | Estrutura `.archetype-item` com modo-luz, modo-sombra, alerta |
| Lista de arquétipos obrigatórios (Sereia, Vampiro, Bruxas, Marilyn Monroe, etc.) | ✅ | Incluídos nas seções do Módulo 8 |

---

## MENSAGEM DE SEGURANÇA
| Exigência | Status | Onde |
|-----------|--------|------|
| “Este curso é de acesso individual. O compartilhamento de login pode resultar em bloqueio automático da conta.” | ✅ | Rodapé em `public/index.html` (`.security-msg`) e em `auth/login.html` e `auth/register.html` |

---

## GITHUB
| Exigência | Status | Onde |
|-----------|--------|------|
| Projeto pronto para GitHub Pages, link público, HTTPS | ✅ | `index.html` na raiz redireciona para `public/index.html`; conteúdo em um HTML estático |

---

## REGRAS FINAIS
| Exigência | Status |
|-----------|--------|
| Não criar páginas vazias | ✅ |
| Não criar botões sem conteúdo | ✅ |
| Não duplicar textos | ✅ |
| Revisar ortografia e coerência | ✅ (conteúdo já revisado) |
| Não remover nada do pedido | ✅ |
| Não simplificar | ✅ |

---

## COMO USAR

- **No Cursor (DEV_MODE):** abra `public/index.html`. O curso carrega direto, sem login.
- **Produção (PROD_MODE):** altere em `public/index.html` para `window.DEV_MODE = false`, suba o servidor (`npm start`); o curso só será exibido após login em `/auth/login.html` e acesso a `/curso`.
- **GitHub Pages:** publique o repositório; a raiz redireciona para `public/index.html` e o curso abre no navegador (HTTPS conforme configuração do GitHub).
