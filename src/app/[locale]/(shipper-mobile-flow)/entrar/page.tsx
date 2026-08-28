import { getAuthPhoneCountries } from '@/features/auth/application/get-auth-phone-countries';
import { LoginScreen } from '@/features/auth/screens/login-screen';

export default async function LoginPage() {
  const phoneCountries = await getAuthPhoneCountries();
  return <LoginScreen phoneCountries={phoneCountries} />;
}
