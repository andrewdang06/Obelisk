import { created, handleRouteError } from "@/lib/api";
import { createQueuedRun } from "@/lib/runs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return created({ run: await createQueuedRun(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
