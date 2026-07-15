# Arquitetura — Inkora Tattoo Studio SaaS

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Padrão Arquitetural](#4-padrão-arquitetural)
5. [Fluxo de Dados](#5-fluxo-de-dados)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Banco de Dados](#7-banco-de-dados)
8. [Serviços](#8-serviços)
9. [Hooks](#9-hooks)
10. [Roteamento](#10-roteamento)
11. [Componentes e Layout](#11-componentes-e-layout)
12. [Storage e Upload](#12-storage-e-upload)
13. [Deploy e CI/CD](#13-deploy-e-cicd)
14. [Testes](#14-testes)
15. [Segurança](#15-segurança)
16. [Decisões Arquiteturais](#16-decisões-arquiteturais)
17. [Limitações Conhecidas](#17-limitações-conhecidas)

---

## 1. Visão Geral

_Esta seção descreve o propósito do sistema, seus módulos principais e o contexto geral de uso._

## 2. Stack Tecnológica

_Lista completa de tecnologias, versões e propósito de cada uma._

## 3. Estrutura de Diretórios

_Mapa completo do projeto com descrição da responsabilidade de cada diretório._

## 4. Padrão Arquitetural

_Descrição do padrão em camadas e das regras de dependência entre módulos._

## 5. Fluxo de Dados

_Diagrama textual do fluxo de dados: Pages → Hooks → Services → Supabase._

## 6. Autenticação e Autorização

_Fluxo completo de login, registro, callback, ativação de tatuador e controle de acesso baseado em papéis (manager/artist)._

## 7. Banco de Dados

_Lista de tabelas, relacionamentos, índices, funções RPC e políticas RLS._

## 8. Serviços

_Descrição de cada serviço em src/services/, suas responsabilidades e dependências._

## 9. Hooks

_Descrição de cada hook customizado, seu estado retornado e funções expostas._

## 10. Roteamento

_Estrutura de rotas públicas e privadas, guards de autenticação e protectores de rota._

## 11. Componentes e Layout

_Descrição dos componentes de layout compartilhados: DashboardLayout, Sidebar, PrivateRoute, AppErrorBoundary._

## 12. Storage e Upload

_Configuração dos buckets Supabase, validação de upload, políticas de acesso._

## 13. Deploy e CI/CD

_Configuração Cloudflare Pages, GitHub Actions, variáveis de ambiente._

## 14. Testes

_Estratégia de testes, ferramentas, cobertura atual e gaps._

## 15. Segurança

_Camadas de segurança: RLS, PrivateRoute, access service, rate limit, logs._

## 16. Decisões Arquiteturais

_Registro das principais decisões de arquitetura e suas justificativas._

## 17. Limitações Conhecidas

_Gaps atuais: falta de migrations, code splitting, cache, testes de hooks._
