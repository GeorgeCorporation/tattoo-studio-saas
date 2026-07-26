import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getOnboardingDraftStorageKey, useOnboardingDraft } from "@/hooks/useOnboardingDraft";

describe("useOnboardingDraft", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not restore one user's onboarding draft for another user", () => {
    const owner = renderHook(() => useOnboardingDraft<{ name: string }>("user-a"));

    act(() => {
      owner.result.current.save({ name: "Studio da Ana" });
    });

    const otherUser = renderHook(() => useOnboardingDraft<{ name: string }>("user-b"));

    expect(otherUser.result.current.restore()).toEqual({});
    expect(localStorage.getItem(getOnboardingDraftStorageKey("user-a"))).toContain("Studio da Ana");
  });

  it("clears only the authenticated user's onboarding draft", () => {
    const owner = renderHook(() => useOnboardingDraft<{ name: string }>("user-a"));
    const otherUser = renderHook(() => useOnboardingDraft<{ name: string }>("user-b"));

    act(() => {
      owner.result.current.save({ name: "Studio da Ana" });
      otherUser.result.current.save({ name: "Studio do Bruno" });
      owner.result.current.clear();
    });

    expect(owner.result.current.restore()).toEqual({});
    expect(otherUser.result.current.restore()).toEqual({ name: "Studio do Bruno" });
  });

  it("does not read or write a draft before authentication identifies a user", () => {
    const anonymous = renderHook(() => useOnboardingDraft<{ name: string }>(undefined));

    act(() => {
      anonymous.result.current.save({ name: "Rascunho anônimo" });
    });

    expect(anonymous.result.current.restore()).toEqual({});
    expect(localStorage.length).toBe(0);
  });
});
