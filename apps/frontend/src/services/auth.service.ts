import api from "@/lib/api";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgetPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
} from "@/types/auth.type";

// POST - Sign In
export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const response = await api.post("/api/auth/signin", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Sign Up
export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  if (payload.image) formData.append("image", payload.image);

  const response = await api.post("/api/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data as AuthResponse;
}

// POST - Sign Out
export async function signOut(): Promise<AuthResponse> {
  const response = await api.post("/api/auth/logout", null, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Google Sign In
export async function googleSignIn(id_token: string): Promise<AuthResponse> {
  const response = await api.post(
    "/api/auth/google-login",
    { id_token },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data as AuthResponse;
}

// POST - Refresh Token
export async function refreshToken(): Promise<AuthResponse> {
  const response = await api.post("/api/auth/refresh-token", null, {
    // withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// PATCH - Change Password
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<AuthResponse> {
  const response = await api.patch("/api/auth/change-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Forget Password
export async function forgetPassword(
  payload: ForgetPasswordPayload,
): Promise<AuthResponse> {
  const response = await api.post("/api/auth/forget-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// PATCH - Reset Password
// The backend's resetPassword controller reads the reset token from
// `req.headers.authorization` (it's an unauthenticated route reached via an
// emailed link, not a signed-in session), so `token` is sent the same way
// here rather than through the request body.
export async function resetPassword(
  payload: ResetPasswordPayload,
  token: string,
): Promise<AuthResponse> {
  const response = await api.patch("/api/auth/reset-password", payload, {
    headers: { "Content-Type": "application/json", Authorization: token },
  });
  return response.data as AuthResponse;
}

// POST - Email Verification Source
export async function emailVerificationSource(): Promise<AuthResponse> {
  const response = await api.post("/api/auth/email-verification-source", null, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Email Verification
// Same as resetPassword above: the verification token comes from the
// emailed link's URL, not a signed-in session, so it's forwarded as the
// Authorization header the backend controller actually reads.
export async function emailVerification(token: string): Promise<AuthResponse> {
  const response = await api.post("/api/auth/email-verification", null, {
    headers: { "Content-Type": "application/json", Authorization: token },
  });
  return response.data as AuthResponse;
}
