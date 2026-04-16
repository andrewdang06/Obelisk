import { created, handleRouteError, ok } from "@/lib/api";
import { generatePlanForTask } from "@/lib/planner";
import { createTask, listTasks } from "@/lib/tasks";
import { createTaskSchema } from "@/lib/validators";

export async function GET() {
  try {
    return ok({ tasks: await listTasks() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createTaskSchema.parse(await request.json());
    const task = await createTask(input);
    const plan = await generatePlanForTask(task.id);
    return created({ task: { ...task, plan, status: "PLANNED" } });
  } catch (error) {
    return handleRouteError(error);
  }
}
