import api from "@/lib/api";
import { TUserResponse } from "@/types/user.type";

export async function fetchSelf(): Promise<TUserResponse> {
  const response = await api.get("/api/user/self");
  return response?.data as TUserResponse;
}
