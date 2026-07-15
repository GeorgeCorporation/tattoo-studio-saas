# Documentação do Projeto — Inkora Tattoo Studio SaaS

> **Data:** 2026-07-12
> **Versão:** 0.1.0
>
> Este documento unifica toda a documentação do projeto: perfil, comandos, arquitetura, roadmap, decisões técnicas e regras.

---

## Índice

1. [Perfil do Projeto (CLAUDE.md)](#1-perfil-do-projeto-claudemd)
2. [Arquitetura](#2-arquitetura)
3. [Roadmap](#3-roadmap)
4. [Decisões Técnicas](#4-decisões-técnicas)
5. [Regras do Projeto](#5-regras-do-projeto)
6. [Arquivos de Referência](#6-arquivos-de-referência)

---

# 1. Perfil do Projeto (CLAUDE.md)

## Perfil do Projeto

- **Nome:** Inkora
- **Tipo:** SaaS para estúdios de tatuagem
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Cloudflare Pages
- **Node:** 22.x (ver .nvmrc)
- **Package manager:** npm

## Comandos Essenciais

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (typecheck + bundle)
npm run test       # rodar testes
npm run typecheck  # checagem de tipos
npm run lint       # ESLint
npm run format     # Prettier
npm run check      # pipeline completa (typecheck + lint + test + build)
```

## Estrutura

- **src/pages/** — páginas organizadas por módulo
- **src/services/** — camada de dados (chamadas Supabase)
- **src/hooks/** — hooks customizados (useAuth, useAccess, useDashboard, useArtist)
- **src/lib/** — domínio puro, utilitários, cliente Supabase
- **src/components/layout/** — layouts, sidebar, guards de rota
- **src/types/** — tipos TypeScript do banco e domínio

## Regras

1. Não adicionar dependências sem discussão prévia
2. Manter camadas: Page → Hook → Service → Supabase
3. Testar domínio puro (lib/) antes de integração
4. RLS policies são a única barreira de segurança no banco
5. Cores devem usar variáveis Tailwind, nunca hardcoded
6. Toda query ao Supabase precisa de tratamento de erro
7. Componentes de UI (Input, Button, Modal) devem ficar em components/ui/
8. Barrel files vazios não devem existir
9. Arquivos SQL não pertencem a src/lib/ — usar supabase/migrations/
10. Toda página pública com slug precisa validar slug reservado

## Arquivos de Referência

- [docs/PROJECT_ANALYSIS.md](docs/PROJECT_ANALYSIS.md) — análise completa do projeto
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitetura do sistema
- [docs/ROADMAP.md](docs/ROADMAP.md) — roadmap de evolução
- [docs/DECISIONS.md](docs/DECISIONS.md) — decisões técnicas registradas
- [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) — regras do projeto

---

# 2. Arquitetura

## Índice

1. [Visão Geral](#21-visão-geral)
2. [Stack Tecnológica](#22-stack-tecnológica)
3. [Estrutura de Diretórios](#23-estrutura-de-diretórios)
4. [Padrão Arquitetural](#24-padrão-arquitetural)
5. [Fluxo de Dados](#25-fluxo-de-dados)
6. [Autenticação e Autorização](#26-autenticação-e-autorização)
7. [Banco de Dados](#27-banco-de-dados)
8. [Serviços](#28-serviços)
9. [Hooks](#29-hooks)
10. [Roteamento](#210-roteamento)
11. [Componentes e Layout](#211-componentes-e-layout)
12. [Storage e Upload](#212-storage-e-upload)
13. [Deploy e CI/CD](#213-deploy-e-cicd)
14. [Testes](#214-testes)
15. [Segurança](#215-segurança)
16. [Decisões Arquiteturais](#216-decisões-arquiteturais)
17. [Limitações Conhecidas](#217-limitações-conhecidas)

---

## 2.1 Visão Geral

_Esta seção descreve o propósito do sistema, seus módulos principais e o contexto geral de uso._

## 2.2 Stack Tecnológica

_Lista completa de tecnologias, versões e propósito de cada uma._

## 2.3 Estrutura de Diretórios

_Mapa completo do projeto com descrição da responsabilidade de cada diretório._

## 2.4 Padrão Arquitetural

_Descrição do padrão em camadas e das regras de dependência entre módulos._

## 2.5 Fluxo de Dados

_Diagrama textual do fluxo de dados: Pages → Hooks → Services → Supabase._

## 2.6 Autenticação e Autorização

_Fluxo completo de login, registro, callback, ativação de tatuador e controle de acesso baseado em papéis (manager/artist)._

## 2.7 Banco de Dados

_Lista de tabelas, relacionamentos, índices, funções RPC e políticas RLS._

## 2.8 Serviços

_Descrição de cada serviço em src/services/, suas responsabilidades e dependências._

## 2.9 Hooks

_Descrição de cada hook customizado, seu estado retornado e funções expostas._

## 2.10 Roteamento

_Estrutura de rotas públicas e privadas, guards de autenticação e protectores de rota._

## 2.11 Componentes e Layout

_Descrição dos componentes de layout compartilhados: DashboardLayout, Sidebar, PrivateRoute, AppErrorBoundary._

## 2.12 Storage e Upload

_Configuração dos buckets Supabase, validação de upload, políticas de acesso._

## 2.13 Deploy e CI/CD

_Configuração Cloudflare Pages, GitHub Actions, variáveis de ambiente._

## 2.14 Testes

_Estratégia de testes, ferramentas, cobertura atual e gaps._

## 2.15 Segurança

_Camadas de segurança: RLS, PrivateRoute, access service, rate limit, logs._

## 2.16 Decisões Arquiteturais

_Registro das principais decisões de arquitetura e suas justificativas._

## 2.17 Limitações Conhecidas

_Gaps atuais: falta de migrations, code splitting, cache, testes de hooks._

---

# 3. Roadmap

## Índice

1. [Visão Geral](#31-visão-geral)
2. [Fase 1 — Qualidade](#32-fase-1--qualidade)
3. [Fase 2 — Produto](#33-fase-2--produto)
4. [Fase 3 — Escala](#34-fase-3--escala)
5. [Fase 4 — Maturidade](#35-fase-4--maturidade)
6. [Métricas de Sucesso](#36-métricas-de-sucesso)
7. [Riscos e Dependências](#37-riscos-e-dependências)

---

## 3.1 Visão Geral

_Propósito do roadmap, critérios de priorização, visão de longo prazo do produto._

## 3.2 Fase 1 — Qualidade

_2-3 sprints. Fundação: testes, performance, componentização._

### 3.2.1 Migrations Versionadas

### 3.2.2 Testes de Hooks

### 3.2.3 Cache de Queries

### 3.2.4 Code Splitting

### 3.2.5 Componentes Base UI

### 3.2.6 Tema Tailwind

## 3.3 Fase 2 — Produto

_3-4 sprints. Features essenciais para maturidade do produto._

### 3.3.1 Lembretes WhatsApp

### 3.3.2 Relatórios Financeiros

### 3.3.3 Avaliações de Clientes

### 3.3.4 Página de Serviços

### 3.3.5 Galeria Antes/Depois

## 3.4 Fase 3 — Escala

_2-3 sprints. Preparação para crescimento._

### 3.4.1 Paginação

### 3.4.2 Otimização de Queries

### 3.4.3 Múltiplos Estúdios

### 3.4.4 Pagamentos Online

### 3.4.5 Tema Claro/Escuro

## 3.5 Fase 4 — Maturidade

_Contínuo. Excelência operacional._

### 3.5.1 Testes E2E

### 3.5.2 Internacionalização (i18n)

### 3.5.3 Performance Budget

### 3.5.4 Monitoramento

### 3.5.5 Documentação

## 3.6 Métricas de Sucesso

_Definição de métricas para cada fase: cobertura de testes, tempo de carregamento, etc._

## 3.7 Riscos e Dependências

_Riscos identificados por fase e dependências externas._

---

# 4. Decisões Técnicas

## Índice

1. [Propósito](#41-propósito)
2. [Stack e Ferramentas](#42-stack-e-ferramentas)
3. [Arquitetura](#43-arquitetura)
4. [Banco de Dados](#44-banco-de-dados)
5. [Autenticação](#45-autenticação)
6. [Frontend](#46-frontend)
7. [Deploy](#47-deploy)
8. [Testes](#48-testes)
9. [Decisões Pendentes](#49-decisões-pendentes)

---

## 4.1 Propósito

_Este documento registra decisões técnicas importantes, contexto e alternativas consideradas._

## 4.2 Stack e Ferramentas

### 4.2.1 React + Vite + TypeScript

### 4.2.2 Tailwind CSS sem Component Library

### 4.2.3 Supabase como Backend

### 4.2.4 Cloudflare Pages para Deploy

### 4.2.5 Vitest + Testing Library

## 4.3 Arquitetura

### 4.3.1 Camadas sem Store Global

### 4.3.2 Services com Supabase Direto (sem ORM)

### 4.3.3 Hooks como Camada de Estado

### 4.3.4 Domínio Puro em src/lib/

## 4.4 Banco de Dados

### 4.4.1 UUID como Primary Key

### 4.4.2 RLS como Única Camada de Autorização no Banco

### 4.4.3 Funções RPC para Operações Complexas

### 4.4.4 Schema SQL sem Migrations Versionadas

## 4.5 Autenticação

### 4.5.1 Supabase Auth com Email/Senha

### 4.5.2 Convite de Tatuador via Token

### 4.5.3 Rate Limit Client-side

## 4.6 Frontend

### 4.6.1 SPA sem SSR

### 4.6.2 Dark Mode como Único Tema

### 4.6.3 Português como Único Idioma

## 4.7 Deploy

### 4.7.1 Cloudflare Pages com SPA Fallback

### 4.7.2 Variáveis de Ambiente no Wrangler

## 4.8 Testes

### 4.8.1 Testes de Domínio Puro

### 4.8.2 Testes de Serviço com Supabase Real

### 4.8.3 Ausência de Testes de Hook

## 4.9 Decisões Pendentes

_Decisões que precisam ser tomadas: React Query vs cache manual, framework de teste E2E, API de pagamentos, etc._

---

# 5. Regras do Projeto

## Índice

1. [Código](#51-código)
2. [Commits e Versionamento](#52-commits-e-versionamento)
3. [Testes](#53-testes)
4. [Banco de Dados](#54-banco-de-dados)
5. [Estilo e Componentes](#55-estilo-e-componentes)
6. [Segurança](#56-segurança)
7. [Performance](#57-performance)
8. [Fluxo de Trabalho](#58-fluxo-de-trabalho)
9. [CLAUDE.md](#59-claudemd)

---

## 5.1 Código

### 5.1.1 TypeScript Strict Mode

### 5.1.2 Estrutura de Arquivos

### 5.1.3 Nomenclatura

### 5.1.4 Imports e Organização

### 5.1.5 Tratamento de Erros

### 5.1.6 Evitar `any`

### 5.1.7 Comentários

## 5.2 Commits e Versionamento

### 5.2.1 Formato de Commit

### 5.2.2 Branch Strategy

### 5.2.3 Pull Requests

## 5.3 Testes

### 5.3.1 Obrigatoriedade Mínima

### 5.3.2 Estrutura de Testes

### 5.3.3 Mocks e Ambiente

## 5.4 Banco de Dados

### 5.4.1 Migrations

### 5.4.2 RLS Policies

### 5.4.3 Funções RPC

### 5.4.4 Índices

## 5.5 Estilo e Componentes

### 5.5.1 Tema e Cores

### 5.5.2 Componentes Base

### 5.5.3 Responsividade

## 5.6 Segurança

### 5.6.1 RLS como Barreira

### 5.6.2 Validação de Upload

### 5.6.3 Variáveis de Ambiente

### 5.6.4 Logs de Segurança

## 5.7 Performance

### 5.7.1 Lazy Loading

### 5.7.2 Cache de Queries

### 5.7.3 Bundle Size

## 5.8 Fluxo de Trabalho

### 5.8.1 Desenvolvimento Local

### 5.8.2 Antes de Commitar

### 5.8.3 CI/CD

## 5.9 CLAUDE.md

_Regras de configuração do arquivo CLAUDE.md na raiz do projeto._

---

# 6. Arquivos de Referência

- [docs/PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) — análise completa do projeto (stack, banco, qualidade, segurança, TODO)
- [docs/PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) — documentação unificada do projeto (este arquivo)
- [CLAUDE.md](../CLAUDE.md) — perfil do projeto, comandos e regras resumidas
