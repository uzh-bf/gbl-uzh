import { platformApi } from "@gbl-uzh/platform2";
import { type AppRouter } from "~/server/api/root";

export const api = platformApi<AppRouter>()
