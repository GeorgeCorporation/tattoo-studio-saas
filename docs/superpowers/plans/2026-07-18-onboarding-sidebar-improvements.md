# Onboarding and Sidebar Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o limite visual de 200 caracteres, simplificar o serviço inicial e exibir a identidade do estúdio no dashboard desktop e mobile.

**Architecture:** O onboarding continuará controlando seu estado local e enviando o mesmo contrato ao serviço. Um utilitário isolado tratará graphemes. `DashboardLayout` carregará o acesso uma vez e passará nome, logo e papel para uma `Sidebar` puramente orientada por props.

**Tech Stack:** React 18, TypeScript strict, Vite, Vitest, Testing Library, Tailwind CSS e Supabase.

## Global Constraints

- Não alterar banco de dados, migrations ou contratos Supabase.
- Não implementar CEP, favicon, biblioteca de serviços, duplicação de serviços ou menu avançado da logo.
- Preservar rascunhos e serviços já persistidos.
- Remover `Inkora` e `Studio SaaS` somente da área autenticada.
- Aplicar TDD: observar cada teste falhar pelo motivo esperado antes do código de produção.
- Não refatorar módulos fora do escopo.

---

### Task 1: Limite por caracteres visuais

**Files:**
- Create: `src/lib/text-limit.test.ts`
- Create: `src/lib/text-limit.ts`

**Interfaces:**
- Produces: `countVisualCharacters(value: string): number`
- Produces: `limitVisualCharacters(value: string, limit: number): string`

- [ ] **Step 1: Write the failing utility tests**

Create `src/lib/text-limit.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { countVisualCharacters, limitVisualCharacters } from "@/lib/text-limit";

describe("text-limit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("conta texto simples, emoji e acento combinado como caracteres visuais", () => {
    expect(countVisualCharacters("a".repeat(200))).toBe(200);
    expect(countVisualCharacters("🎨".repeat(200))).toBe(200);
    expect(countVisualCharacters("e\u0301".repeat(200))).toBe(200);
  });

  it("limita sem cortar o caractere visual", () => {
    const value = `${"🎨".repeat(200)}fim`;

    expect(limitVisualCharacters(value, 200)).toBe("🎨".repeat(200));
    expect(countVisualCharacters(limitVisualCharacters(value, 200))).toBe(200);
  });

  it("mantém funcionamento básico quando Intl.Segmenter não existe", async () => {
    vi.stubGlobal("Intl", {} as typeof Intl);
    vi.resetModules();
    const fallbackModule = await import("@/lib/text-limit");

    expect(fallbackModule.countVisualCharacters("abc")).toBe(3);
    expect(fallbackModule.limitVisualCharacters("abcd", 3)).toBe("abc");
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
npm.cmd run test -- src/lib/text-limit.test.ts
```

Expected: FAIL because `@/lib/text-limit` does not exist.

- [ ] **Step 3: Implement the minimal grapheme utility**

Create `src/lib/text-limit.ts`:

```ts
type GraphemeSegment = {
  segment: string;
};

type SegmenterInstance = {
  segment(value: string): Iterable<GraphemeSegment>;
};

type SegmenterConstructor = new (
  locale?: string,
  options?: { granularity: "grapheme" },
) => SegmenterInstance;

const Segmenter = (Intl as typeof Intl & { Segmenter?: SegmenterConstructor }).Segmenter;
const graphemeSegmenter = Segmenter ? new Segmenter("pt-BR", { granularity: "grapheme" }) : null;

function splitVisualCharacters(value: string) {
  if (!graphemeSegmenter) return Array.from(value.normalize("NFC"));
  return Array.from(graphemeSegmenter.segment(value), (item) => item.segment);
}

export function countVisualCharacters(value: string) {
  return splitVisualCharacters(value).length;
}

export function limitVisualCharacters(value: string, limit: number) {
  if (limit <= 0) return "";
  return splitVisualCharacters(value).slice(0, limit).join("");
}
```

- [ ] **Step 4: Run the utility tests and verify GREEN**

Run:

```powershell
npm.cmd run test -- src/lib/text-limit.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the utility**

```powershell
git add src/lib/text-limit.ts src/lib/text-limit.test.ts
git commit -m "fix: count onboarding description characters visually"
```

---

### Task 2: Integrar o limite à descrição do onboarding

**Files:**
- Modify: `src/pages/onboarding/OnboardingPage.test.tsx`
- Modify: `src/pages/onboarding/OnboardingPage.tsx`

**Interfaces:**
- Consumes: `countVisualCharacters` and `limitVisualCharacters` from Task 1.
- Produces: textarea limitado a 200 graphemes e contador sincronizado.

- [ ] **Step 1: Write the failing component regression test**

Add inside `describe("OnboardingPage", ...)` in `src/pages/onboarding/OnboardingPage.test.tsx`:

```ts
  it("permite exatamente 200 caracteres visuais e limita o excedente", async () => {
    renderPage();

    await screen.findByText("Identidade do estúdio");
    const description = screen.getByLabelText("Descrição");
    const exactLimit = "🎨".repeat(200);

    fireEvent.change(description, { target: { value: exactLimit } });

    expect(description).toHaveValue(exactLimit);
    expect(screen.getByText("200/200")).toBeInTheDocument();

    fireEvent.change(description, { target: { value: `${exactLimit}🎨` } });

    expect(description).toHaveValue(exactLimit);
    expect(screen.getByText("200/200")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```powershell
npm.cmd run test -- src/pages/onboarding/OnboardingPage.test.tsx
```

Expected: FAIL because the current counter reports UTF-16 length and the handler does not truncate values fired above the limit.

- [ ] **Step 3: Connect the visual limiter to the textarea**

Add the import and limit constant in `src/pages/onboarding/OnboardingPage.tsx`:

```ts
import { countVisualCharacters, limitVisualCharacters } from "@/lib/text-limit";

const DESCRIPTION_LIMIT = 200;
```

After `cityOptions`, derive the counter:

```ts
  const descriptionLength = countVisualCharacters(description);
```

Add the handler near the other field handlers:

```ts
  function handleDescriptionChange(value: string) {
    setDescription(limitVisualCharacters(value, DESCRIPTION_LIMIT));
  }
```

Replace the description textarea and counter with:

```tsx
                    <textarea
                      aria-describedby="studio-description-counter"
                      className={`${inputClass} min-h-28 resize-none`}
                      onChange={(event) => handleDescriptionChange(event.target.value)}
                      value={description}
                    />
                    <p aria-live="polite" className="mt-2 text-right text-xs text-zinc-500" id="studio-description-counter">
                      {descriptionLength}/{DESCRIPTION_LIMIT}
                    </p>
```

- [ ] **Step 4: Run utility and onboarding tests and verify GREEN**

Run:

```powershell
npm.cmd run test -- src/lib/text-limit.test.ts src/pages/onboarding/OnboardingPage.test.tsx
```

Expected: both test files PASS.

- [ ] **Step 5: Commit the onboarding description fix**

```powershell
git add src/pages/onboarding/OnboardingPage.tsx src/pages/onboarding/OnboardingPage.test.tsx
git commit -m "fix: enforce visual description limit in onboarding"
```

---

### Task 3: Simplificar e validar o serviço inicial

**Files:**
- Modify: `src/pages/onboarding/OnboardingPage.test.tsx`
- Modify: `src/pages/onboarding/OnboardingPage.tsx`
- Modify: `src/services/onboarding.service.test.ts`
- Modify: `src/services/onboarding.service.ts`

**Interfaces:**
- Consumes: `validateOnboardingStep(step, data)`.
- Produces: formulário com nome, duração e preço opcional.
- Produces: duração mínima válida de 30 minutos para serviços informados.

- [ ] **Step 1: Write the failing UI test**

Add inside the onboarding page test suite:

```ts
  it("mostra somente os campos essenciais do serviço inicial", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    expect(screen.getByLabelText("Nome do serviço")).toBeInTheDocument();
    expect(screen.getByLabelText("Duração média em minutos")).toBeInTheDocument();
    expect(screen.getByLabelText("Preço inicial (opcional)")).toBeInTheDocument();
    expect(screen.queryByLabelText("Categoria")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Descrição")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Orçamento" })).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Write the failing domain validation tests**

Add to `src/services/onboarding.service.test.ts`:

```ts
  it("exige duração válida quando um serviço é informado", () => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: true,
        firstArtists: [{ name: "Ana" }],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: null }],
      }),
    ).toContain("duração");

    expect(
      validateOnboardingStep(4, {
        activateBooking: true,
        firstArtists: [{ name: "Ana" }],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: 120 }],
      }),
    ).toBe("");
  });

  it("permite concluir sem serviço quando a agenda pública está desligada", () => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: false,
        firstArtists: [],
        firstServices: [],
      }),
    ).toBe("");
  });
```

- [ ] **Step 3: Run the two suites and verify RED**

Run:

```powershell
npm.cmd run test -- src/pages/onboarding/OnboardingPage.test.tsx src/services/onboarding.service.test.ts
```

Expected: FAIL because optional fields and example buttons remain visible and service duration is not validated.

- [ ] **Step 4: Add duration validation to the domain service**

Replace the current step 4 branch in `validateOnboardingStep` with:

```ts
  if (step === 4) {
    const artists = data.firstArtists?.length ? data.firstArtists : data.firstArtist ? [data.firstArtist] : [];
    const services = data.firstServices?.length ? data.firstServices : data.firstService ? [data.firstService] : [];
    const namedArtists = artists.filter((artist) => artist.name?.trim());
    const namedServices = services.filter((service) => service.name?.trim());
    const invalidDuration = namedServices.some(
      (service) =>
        typeof service.avg_duration_minutes !== "number" ||
        !Number.isFinite(service.avg_duration_minutes) ||
        service.avg_duration_minutes < 30,
    );

    if (invalidDuration) return "Informe uma duração média válida de pelo menos 30 minutos para cada serviço.";

    if (data.activateBooking !== false && (!namedArtists.length || !namedServices.length)) {
      return "Para ativar a agenda pública agora, informe pelo menos um tatuador e um serviço. Ou desmarque a opção para fazer depois.";
    }
  }
```

- [ ] **Step 5: Simplify service state and validation data in the page**

Delete the complete `serviceCategories` and `serviceExamples` constants. Keep `category` and `description` in `ServiceDraft` so loaded services preserve persisted metadata.

In `DraftData`, replace the current-service fields with exactly:

```ts
  serviceName: string;
  startingPrice: string;
  durationMinutes: string;
```

Replace the current-service state declarations with:

```ts
  const [serviceName, setServiceName] = useState(draft.serviceName ?? "");
  const [startingPrice, setStartingPrice] = useState(draft.startingPrice ?? "");
  const [durationMinutes, setDurationMinutes] = useState(draft.durationMinutes ?? "120");
```

Remove `serviceCategory` and `serviceDescription` from `draftToSave` and from the dependency array of the draft-saving effect. Delete the complete `applyServiceExample` function.

Initialize saved drafts with a safe duration:

```ts
  const [services, setServices] = useState<ServiceDraft[]>(
    (draft.services ?? []).map((service) => ({
      ...service,
      durationMinutes: service.durationMinutes || "120",
    })),
  );
```

Replace `currentService` with:

```ts
  const currentService: ServiceDraft = {
    name: serviceName,
    category: "Outro",
    description: "",
    startingPrice,
    durationMinutes,
  };
```

Map validation services to the domain contract:

```ts
      firstServices: servicesToSave.map((service) => ({
        name: service.name,
        avg_duration_minutes: service.durationMinutes ? Number(service.durationMinutes) : null,
      })),
```

Replace `addCurrentService` with:

```ts
  function addCurrentService() {
    if (!serviceName.trim()) {
      setError("Informe o nome do serviço antes de adicionar outro.");
      return;
    }

    const duration = Number(durationMinutes);
    if (!Number.isFinite(duration) || duration < 30) {
      setError("Informe uma duração média válida de pelo menos 30 minutos.");
      return;
    }

    setServices((current) => [
      ...current,
      {
        name: serviceName.trim(),
        category: "Outro",
        description: "",
        startingPrice,
        durationMinutes,
      },
    ]);
    setServiceName("");
    setStartingPrice("");
    setDurationMinutes("120");
    setError("");
  }
```

- [ ] **Step 6: Replace the service onboarding controls**

Remove the quick-example button group, category select and service description textarea. Replace the service field grid with:

```tsx
                <div className="grid gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-medium">Nome do serviço</span>
                    <input className={inputClass} onChange={(event) => setServiceName(event.target.value)} placeholder="Tatuagem pequena" value={serviceName} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Duração média em minutos</span>
                    <input className={inputClass} min="30" onChange={(event) => setDurationMinutes(event.target.value)} type="number" value={durationMinutes} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Preço inicial (opcional)</span>
                    <input className={inputClass} min="0" onChange={(event) => setStartingPrice(event.target.value)} placeholder="250" type="number" value={startingPrice} />
                  </label>
                </div>
```

In each saved-service card, replace the category line with:

```tsx
                          <p className="text-sm text-zinc-500">
                            {service.durationMinutes} min{service.startingPrice ? ` • A partir de R$ ${service.startingPrice}` : ""}
                          </p>
```

- [ ] **Step 7: Run onboarding tests and verify GREEN**

Run:

```powershell
npm.cmd run test -- src/pages/onboarding/OnboardingPage.test.tsx src/services/onboarding.service.test.ts src/services/onboarding.flow.test.ts
```

Expected: all onboarding page, validation and persistence tests PASS.

- [ ] **Step 8: Commit the service simplification**

```powershell
git add src/pages/onboarding/OnboardingPage.tsx src/pages/onboarding/OnboardingPage.test.tsx src/services/onboarding.service.ts src/services/onboarding.service.test.ts
git commit -m "feat: simplify onboarding service setup"
```

---

### Task 4: Aplicar a identidade do estúdio no layout autenticado

**Files:**
- Create: `src/components/layout/Sidebar.test.tsx`
- Create: `src/components/layout/DashboardLayout.test.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `AccessContext.studioName`, `studioLogoUrl` and `role`.
- Produces: `StudioIdentity` shared by desktop and mobile.
- Produces: `SidebarProps` with `studioName`, `studioLogoUrl`, `role` and `showMobileButton`.

- [ ] **Step 1: Write the failing Sidebar tests**

Create `src/components/layout/Sidebar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/Sidebar";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));

describe("Sidebar", () => {
  it("mostra logo e nome do estúdio sem branding institucional", () => {
    render(
      <MemoryRouter>
        <Sidebar role="manager" showMobileButton={false} studioLogoUrl="https://cdn.test/ideal.png" studioName="Ideal Tattoo" />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("Logo do estúdio Ideal Tattoo")).toHaveAttribute("src", "https://cdn.test/ideal.png");
    expect(screen.getAllByText("Ideal Tattoo").length).toBeGreaterThan(0);
    expect(screen.queryByText("Inkora")).not.toBeInTheDocument();
    expect(screen.queryByText("Studio SaaS")).not.toBeInTheDocument();
  });

  it("usa iniciais quando o estúdio não tem logo", () => {
    render(
      <MemoryRouter>
        <Sidebar role="manager" showMobileButton={false} studioName="Ideal Tattoo" />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Identidade visual do estúdio Ideal Tattoo")).toHaveTextContent("IT");
  });
});
```

- [ ] **Step 2: Write the failing layout test for one access load and mobile branding**

Create `src/components/layout/DashboardLayout.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const mocks = vi.hoisted(() => ({
  useAccess: vi.fn(() => ({
    access: {
      studioId: "studio-1",
      studioName: "Ideal Tattoo",
      studioSlug: "ideal-tattoo",
      studioLogoUrl: "https://cdn.test/ideal.png",
      role: "manager" as const,
      artistId: null,
      isOwner: true,
    },
  })),
}));

vi.mock("@/hooks/useAccess", () => ({
  useAccess: mocks.useAccess,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));

describe("DashboardLayout", () => {
  it("reutiliza um único acesso e mostra o branding no desktop e mobile", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route element={<p>Conteúdo</p>} path="/dashboard" />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(mocks.useAccess).toHaveBeenCalledTimes(1);
    expect(screen.getAllByAltText("Logo do estúdio Ideal Tattoo").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("Inkora")).not.toBeInTheDocument();
    expect(screen.queryByText("Studio SaaS")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run layout tests and verify RED**

Run:

```powershell
npm.cmd run test -- src/components/layout/Sidebar.test.tsx src/components/layout/DashboardLayout.test.tsx
```

Expected: FAIL because the current layout hardcodes Inkora, ignores the logo prop and invokes `useAccess` inside each Sidebar.

- [ ] **Step 4: Make Sidebar prop-driven and add StudioIdentity**

In `src/components/layout/Sidebar.tsx`, remove the Inkora asset and `useAccess` imports. Import the role type:

```ts
import type { UserRole } from "@/lib/access-control";
```

Replace the props and add the shared identity component at module scope:

```tsx
type SidebarProps = {
  studioName?: string;
  studioLogoUrl?: string | null;
  role?: UserRole;
  showMobileButton?: boolean;
};

type StudioIdentityProps = {
  studioName?: string;
  studioLogoUrl?: string | null;
  compact?: boolean;
};

function getStudioInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StudioIdentity({ studioName = "Seu estúdio", studioLogoUrl, compact = false }: StudioIdentityProps) {
  const imageClass = compact ? "h-8 w-8" : "h-9 w-9";

  return (
    <div className="flex min-w-0 items-center gap-3">
      {studioLogoUrl ? (
        <img alt={`Logo do estúdio ${studioName}`} className={`${imageClass} rounded-lg object-cover`} src={studioLogoUrl} />
      ) : (
        <div
          aria-label={`Identidade visual do estúdio ${studioName}`}
          className={`${imageClass} flex shrink-0 items-center justify-center rounded-lg bg-[#E8650A] text-xs font-semibold text-white`}
          role="img"
        >
          {getStudioInitials(studioName) || "SE"}
        </div>
      )}
      <p className={compact ? "truncate font-semibold" : "truncate text-lg font-semibold"}>{studioName}</p>
    </div>
  );
}
```

Change the Sidebar signature and item resolution:

```tsx
export function Sidebar({
  studioName = "Seu estúdio",
  studioLogoUrl = null,
  role = "manager",
  showMobileButton = true,
}: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const items = getSidebarItemsForRole(role);
```

Replace the hardcoded top branding block with:

```tsx
        <StudioIdentity studioLogoUrl={studioLogoUrl} studioName={studioName} />
```

- [ ] **Step 5: Pass access data once from DashboardLayout**

In `src/components/layout/DashboardLayout.tsx`, remove the Inkora asset import and import both layout components:

```ts
import { Sidebar, StudioIdentity } from "@/components/layout/Sidebar";
```

Replace the component body with:

```tsx
export function DashboardLayout() {
  const { access } = useAccess();
  const studioName = access?.studioName ?? "Seu estúdio";
  const studioLogoUrl = access?.studioLogoUrl ?? null;
  const role = access?.role ?? "manager";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar role={role} showMobileButton={false} studioLogoUrl={studioLogoUrl} studioName={studioName} />

      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-white/10 px-4 lg:hidden">
          <Sidebar role={role} studioLogoUrl={studioLogoUrl} studioName={studioName} />
          <StudioIdentity compact studioLogoUrl={studioLogoUrl} studioName={studioName} />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run layout tests and verify GREEN**

Run:

```powershell
npm.cmd run test -- src/components/layout/Sidebar.test.tsx src/components/layout/DashboardLayout.test.tsx
```

Expected: 3 tests PASS and `useAccess` called once.

- [ ] **Step 7: Commit authenticated branding**

```powershell
git add src/components/layout/Sidebar.tsx src/components/layout/DashboardLayout.tsx src/components/layout/Sidebar.test.tsx src/components/layout/DashboardLayout.test.tsx
git commit -m "feat: show studio identity in authenticated layout"
```

---

### Task 5: Verification and scope audit

**Files:**
- Verify only; no planned production changes.

**Interfaces:**
- Confirms all design acceptance criteria and repository health.

- [ ] **Step 1: Run all affected tests**

```powershell
npm.cmd run test -- src/lib/text-limit.test.ts src/pages/onboarding/OnboardingPage.test.tsx src/services/onboarding.service.test.ts src/services/onboarding.flow.test.ts src/components/layout/Sidebar.test.tsx src/components/layout/DashboardLayout.test.tsx src/services/studio-brand.service.test.ts
```

Expected: every listed test file PASS with zero failures.

- [ ] **Step 2: Run the full test suite**

```powershell
npm.cmd run test
```

Expected: exit code 0 and zero failed tests.

- [ ] **Step 3: Run TypeScript validation**

```powershell
npm.cmd run typecheck
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 4: Run lint**

```powershell
npm.cmd run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 5: Run production build**

```powershell
npm.cmd run build
```

Expected: exit code 0 and Vite production bundle generated successfully.

- [ ] **Step 6: Audit diff and scope**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only plan-approved source and test files appear.

- [ ] **Step 7: Re-read acceptance criteria**

Confirm explicitly:

- 200 visual characters accepted and counter synchronized.
- Service onboarding has exactly three visible fields.
- Public booking off allows no service.
- Public booking on requires artist, service and valid duration.
- Desktop and mobile show studio name/logo or initials.
- Authenticated layout contains neither `Inkora` nor `Studio SaaS`.
- No database, CEP, favicon, service library, duplication or advanced logo menu changes.
