import { getMockAuthOtp } from '@/features/auth/application/get-mock-auth-otp';
import { VerifyOtpScreen } from '@/features/auth/screens/verify-otp-screen';

export default async function VerifyOtpPage() {
  const mockOtp = await getMockAuthOtp();
  return <VerifyOtpScreen mockOtp={mockOtp} />;
}
