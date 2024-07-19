export class OTPUtils {
  /**
   * Generates a 6-digit OTP.
   * @returns A 6-digit OTP as a string.
   */
  public static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
