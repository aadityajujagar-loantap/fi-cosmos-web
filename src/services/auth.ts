export const AGENT_OTP = "123456";

export function verifyMobileNumber(mobile: string): boolean {
  return /^\d{10}$/.test(mobile);
}

export function verifyOtpCode(otp: string): boolean {
  return otp === AGENT_OTP;
}
