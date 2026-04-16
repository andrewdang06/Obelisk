import { created, handleRouteError } from "@/lib/api";
import { executeTaskWithCodex } from "@/lib/codex-executor";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return created({ run: await executeTaskWithCodex(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
