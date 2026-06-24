import { getPhoneCountries } from '@/features/shipper-mobile-flow/application/get-phone-countries';
import { LoginScreen } from '@/features/shipper-mobile-flow/screens/login-screen';

export default async function LoginPage() {
  const phoneCountries = await getPhoneCountries();
  return <LoginScreen phoneCountries={phoneCountries} />;
}
