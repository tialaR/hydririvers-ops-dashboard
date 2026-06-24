import { getPhoneCountries } from '@/features/shipper-mobile-flow/application/get-phone-countries';
import { RegisterScreen } from '@/features/shipper-mobile-flow/screens/register-screen';

export default async function RegisterPage() {
  const phoneCountries = await getPhoneCountries();
  return <RegisterScreen phoneCountries={phoneCountries} />;
}
