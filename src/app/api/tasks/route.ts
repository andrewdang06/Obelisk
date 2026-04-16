import { created, handleRouteError, ok } from "@/lib/api";
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
    return created({ task: await createTask(input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
