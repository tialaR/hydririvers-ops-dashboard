import { getAuthPhoneCountries } from '@/features/auth/application/get-auth-phone-countries';
import { RegisterScreen } from '@/features/auth/screens/register-screen';

export default async function RegisterPage() {
  const phoneCountries = await getAuthPhoneCountries();
  return <RegisterScreen phoneCountries={phoneCountries} />;
}
