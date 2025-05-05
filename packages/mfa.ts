import {
  AuthMFAChallengeResponse,
  AuthMFAEnrollResponse,
  AuthMFAListFactorsResponse,
  AuthMFAVerifyResponse,
} from "@supabase/supabase-js";
import { createClient } from "./client";
import { AuthenticationError } from "../services";

export const mfaCreateChallenge = async (
  factorId: string,
): Promise<AuthMFAChallengeResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.mfa.challenge({ factorId });
  } catch (error: unknown) {
    throw new AuthenticationError("Error by creation challenge mfa", {
      cause: error,
    });
  }
};

export const mfaEnroll = async (): Promise<AuthMFAEnrollResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.mfa.enroll({
      factorType: "totp",
    });
  } catch (error: unknown) {
    throw new AuthenticationError("Error by enroll mfa", { cause: error });
  }
};

export const mfaVerify = async ({
  factorId,
  challengeId,
  code,
}: {
  factorId: string;
  challengeId: string;
  code: string;
}): Promise<AuthMFAVerifyResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
  } catch (error: unknown) {
    throw new AuthenticationError("Error by verify mfa", { cause: error });
  }
};

export const mfaListFactors = async (): Promise<AuthMFAListFactorsResponse> => {
  try {
    const supabase = createClient();
    return supabase.auth.mfa.listFactors();
  } catch (error: unknown) {
    throw new AuthenticationError("Error by getting mfa factors", {
      cause: error,
    });
  }
};
