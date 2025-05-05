import {
  AuthError,
  AuthOtpResponse,
  AuthResponse,
  AuthTokenResponse,
  AuthTokenResponsePassword,
  OAuthResponse,
  Session,
  UserAttributes,
  UserResponse,
} from "@supabase/supabase-js";
import { createClient } from "./client";
import { AuthenticationError } from "../services";

export const signUpSupaBase = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred signing up", {
      cause: error,
    });
  }
};

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<AuthTokenResponsePassword> => {
  try {
    const supabase = createClient();
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred signing in", {
      cause: error,
    });
  }
};

export const signInWithOAuth = async (): Promise<OAuthResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred signing in with OAuth", {
      cause: error,
    });
  }
};

export const exchangeCodeForSession = async (
  code: string,
): Promise<AuthTokenResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.exchangeCodeForSession(code);
  } catch (error: unknown) {
    throw new AuthenticationError(
      "An error occurred exchanging code for session",
      {
        cause: error,
      },
    );
  }
};

export const signInWithEmail = async (
  email: string,
  options?: Record<string, any>,
): Promise<AuthOtpResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.signInWithOtp({
      email,
      options,
    });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred signing in with OTP", {
      cause: error,
    });
  }
};

export const getUser = async (): Promise<UserResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.getUser();
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred getting user", {
      cause: error,
    });
  }
};

export const retrieveSession = async (): Promise<{
  data: {
    session: Session | null;
  };
  error: AuthError | null;
}> => {
  try {
    const supabase = createClient();
    return supabase.auth.getSession();
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred retrieving session", {
      cause: error,
    });
  }
};

export const refreshSession = async (
  refresh_token: string,
): Promise<AuthResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.refreshSession({ refresh_token });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred refreshing session", {
      cause: error,
    });
  }
};

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export const refreshSupaBaseToken = async (
  refresh_token: string | null,
): Promise<RefreshTokenResponse> => {
  try {
    const supabase = createClient();
    const currentSession = refresh_token ? { refresh_token } : undefined;
    const { data, error } = await supabase.auth.refreshSession(currentSession);
    if (error) {
      throw new Error("error refreshing access token: ", error);
    }
    return {
      accessToken: String(data?.session?.access_token),
      refreshToken: String(data?.session?.refresh_token),
    };
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred refreshing session", {
      cause: error,
    });
  }
};

export const supaBaseSignOut = async () => {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred signing out", {
      cause: error,
    });
  }
};

export const verifyToken = async (
  email: string,
  token: string,
): Promise<AuthResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.verifyOtp({ email, token, type: "email" });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred verifying token", {
      cause: error,
    });
  }
};

export const updateUser = async (
  attributes: UserAttributes,
): Promise<UserResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.updateUser(attributes);
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred updating user", {
      cause: error,
    });
  }
};

export const resetPasswordForEmail = async (
  email: string,
): Promise<{ data: {} | null; error: AuthError | null }> => {
  try {
    const supabase = createClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    });
  } catch (error: unknown) {
    throw new AuthenticationError("An error occurred resetting password", {
      cause: error,
    });
  }
};
