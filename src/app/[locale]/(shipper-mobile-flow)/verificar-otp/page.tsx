import { getMockOtp } from '@/features/shipper-mobile-flow/application/get-mock-otp';
import { VerifyOtpScreen } from '@/features/shipper-mobile-flow/screens/verify-otp-screen';

export default async function VerifyOtpPage() {
  const mockOtp = await getMockOtp();
  return <VerifyOtpScreen mockOtp={mockOtp} />;
}
