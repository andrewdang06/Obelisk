import { created, handleRouteError } from "@/lib/api";
import { writeSuggestedAgentsFile } from "@/lib/agents";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return created({ agents: await writeSuggestedAgentsFile(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
