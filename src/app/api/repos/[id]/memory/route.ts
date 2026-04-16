import { handleRouteError, ok } from "@/lib/api";
import { getRepoMemory, updateRepoMemory } from "@/lib/repo-memory";
import { updateRepoMemorySchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return ok({ memory: await getRepoMemory(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const input = updateRepoMemorySchema.parse(await request.json());
    return ok({ memory: await updateRepoMemory(id, input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
