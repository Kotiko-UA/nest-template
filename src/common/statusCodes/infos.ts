export enum InfoCodes {
  Success = 1,
  NeedChangeTemporaryPassword = 2,
  EmailIsNotExistInSocialProfile = 3,
  NeedVerifyEmail = 4
}

export function generateInfoResponse(
  code: number,
): {
    success: boolean;
    status: { code: number };
  } {
  return {
    success: true,
    status: {
      code,
    },
  };
}
