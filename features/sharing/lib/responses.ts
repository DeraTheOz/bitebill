export function shareOutcomeErrorResponse(outcome: "not-found" | "expired") {
  if (outcome === "expired") {
    return Response.json(
      {
        error: "This share link has expired",
        code: "SHARE_EXPIRED",
      },
      { status: 410 },
    );
  }

  return Response.json(
    {
      error: "Shared invoice not found",
      code: "SHARE_NOT_FOUND",
    },
    { status: 404 },
  );
}

