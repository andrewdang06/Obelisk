import { handleRouteError, ok } from "@/lib/api";
import { getRunOrThrow } from "@/lib/runs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return ok({ run: await getRunOrThrow(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
