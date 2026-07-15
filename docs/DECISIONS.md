# Decisões Técnicas — Inkora Tattoo Studio SaaS

## Índice

1. [Propósito](#1-propósito)
2. [Stack e Ferramentas](#2-stack-e-ferramentas)
3. [Arquitetura](#3-arquitetura)
4. [Banco de Dados](#4-banco-de-dados)
5. [Autenticação](#5-autenticação)
6. [Frontend](#6-frontend)
7. [Deploy](#7-deploy)
8. [Testes](#8-testes)
9. [Decisões Pendentes](#9-decisões-pendentes)

---

## 1. Propósito

_Este documento registra decisões técnicas importantes, contexto e alternativas consideradas._

## 2. Stack e Ferramentas

### 2.1 React + Vite + TypeScript

### 2.2 Tailwind CSS sem Component Library

### 2.3 Supabase como Backend

### 2.4 Cloudflare Pages para Deploy

### 2.5 Vitest + Testing Library

## 3. Arquitetura

### 3.1 Camadas sem Store Global

### 3.2 Services com Supabase Direto (sem ORM)

### 3.3 Hooks como Camada de Estado

### 3.4 Domínio Puro em src/lib/

## 4. Banco de Dados

### 4.1 UUID como Primary Key

### 4.2 RLS como Única Camada de Autorização no Banco

### 4.3 Funções RPC para Operações Complexas

### 4.4 Schema SQL sem Migrations Versionadas

## 5. Autenticação

### 5.1 Supabase Auth com Email/Senha

### 5.2 Convite de Tatuador via Token

### 5.3 Rate Limit Client-side

## 6. Frontend

### 6.1 SPA sem SSR

### 6.2 Dark Mode como Único Tema

### 6.3 Português como Único Idioma

## 7. Deploy

### 7.1 Cloudflare Pages com SPA Fallback

### 7.2 Variáveis de Ambiente no Wrangler

## 8. Testes

### 8.1 Testes de Domínio Puro

### 8.2 Testes de Serviço com Supabase Real

### 8.3 Ausência de Testes de Hook

## 9. Decisões Pendentes

_Decisões que precisam ser tomadas: React Query vs cache manual, framework de teste E2E, API de pagamentos, etc._
