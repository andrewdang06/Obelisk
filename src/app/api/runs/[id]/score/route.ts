import { handleRouteError, ok } from "@/lib/api";
import { computeConfidenceForRun } from "@/lib/confidence";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return ok({ run: await computeConfidenceForRun(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
