import { created, handleRouteError } from "@/lib/api";
import { generatePlanForTask } from "@/lib/planner";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return created({ plan: await generatePlanForTask(id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
