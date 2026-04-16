import { handleRouteError, ok } from "@/lib/api";
import { runVerificationForRun } from "@/lib/verification";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return ok(await runVerificationForRun(id));
  } catch (error) {
    return handleRouteError(error);
  }
}
