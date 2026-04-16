import { handleRouteError, ok } from "@/lib/api";
import { getRepoOrThrow } from "@/lib/repositories";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return ok({ repo: await getRepoOrThrow(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
