import { ApiError } from "../lib/apiError";

export function authorize(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    throw new ApiError("Sem permissão", 403);
  }
}
