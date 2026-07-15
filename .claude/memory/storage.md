---
name: storage
description: Supabase Storage — 5 buckets, upload, validação, ownership, políticas
metadata:
  type: project
---

# Storage

## Visão Geral

5 buckets públicos no Supabase Storage. SELECT público em todos. INSERT/DELETE autenticado com validação de ownership.

## Buckets

| Bucket | Conteúdo | SELECT | INSERT/DELETE |
|--------|---------|--------|--------------|
| `artists` | Fotos de perfil dos artistas | Público | Auth + ownership validation |
| `gallery` | Fotos da galeria do estúdio | Público | Auth + ownership validation |
| `logos` | Logos dos estúdios | Público | Auth + ownership validation |
| `booking-references` | Fotos de referência para agendamento | Público | Auth + path validation |
| `client-deliveries` | Fotos para entrega a clientes | Público | Auth + ownership validation |

## Validação de Upload

Implementada em `src/services/storage.service.ts`:

- **Tipos permitidos:** JPEG, PNG, WebP, GIF
- **Tamanho máximo:** 5MB
- **Extensões proibidas:** .exe, .sh, .bat, .cmd, .com, .msi, .scr, .ps1, .vbs, .jar
- **Ownership:** função RPC `user_owns_storage_studio(object_name)` valida se o path pertence ao estúdio do usuário

## Padrão de Upload

```typescript
const { error: uploadError } = await supabase.storage
  .from("bucket")
  .upload(path, file, { cacheControl: "3600", upsert: false });

const { data: publicUrl } = supabase.storage
  .from("bucket")
  .getPublicUrl(path);
```

## Funções RPC para Storage

- `user_owns_storage_studio(object_name)` — extrai studio_id do path e compara com auth.uid()
- `valid_public_booking_reference_path(object_name)` — valida path de upload público
- `storage_path_part(object_name, part_index)` — extrai parte do path

## Limitações

- **Buckets públicos** — qualquer URL de arquivo acessível sem autenticação
- **Sem CDN otimizado** — imagens servidas diretamente do Supabase Storage
- **Sem compressão automática** — cada imagem é servida no tamanho original
- **Sem lazy loading** — imagens carregadas sem `loading="lazy"`
- **5MB limit** — fotos de galeria de alta resolução podem exceder

## Riscos

- Abuso de bandwidth (download massivo de fotos públicas)
- Upload de conteúdo impróprio (apesar da validação de tipo)
- Custos de storage crescem com uso (free tier: 1GB)

## Recomendações

- Adicionar transformação de imagens (Supabase Storage Image Transformation)
- Implementar lazy loading com IntersectionObserver
- Considerar CDN externo (Cloudflare Images) para produção
- Adicionar rate limit de upload por estúdio
- Monitorar uso de bandwidth
