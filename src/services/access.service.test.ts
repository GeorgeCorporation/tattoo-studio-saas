import { describe, expect, it } from "vitest";
import { resolveAccessRole } from "@/services/access.service";

describe("access.service", () => {
  it("prioriza o dono do estúdio como gestor", () => {
    const result = resolveAccessRole({
      ownerStudioId: "studio-1",
      memberRole: "artist",
      memberArtistId: "artist-1",
    });

    expect(result).toEqual({
      role: "manager",
      artistId: null,
      isOwner: true,
      studioId: "studio-1",
    });
  });

  it("resolve membro tatuador com vínculo ao próprio tatuador", () => {
    const result = resolveAccessRole({
      ownerStudioId: null,
      memberRole: "artist",
      memberArtistId: "artist-1",
      memberStudioId: "studio-1",
    });

    expect(result).toEqual({
      role: "artist",
      artistId: "artist-1",
      isOwner: false,
      studioId: "studio-1",
    });
  });

  it("retorna nulo quando usuário não pertence a nenhum estúdio", () => {
    expect(
      resolveAccessRole({
        ownerStudioId: null,
        memberRole: null,
        memberArtistId: null,
        memberStudioId: null,
      }),
    ).toBeNull();
  });
});
