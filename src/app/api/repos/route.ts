import { created, handleRouteError, ok } from "@/lib/api";
import { createRepo, listRepos } from "@/lib/repositories";
import { createRepoSchema } from "@/lib/validators";

export async function GET() {
  try {
    return ok({ repos: await listRepos() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createRepoSchema.parse(await request.json());
    return created({ repo: await createRepo(input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
