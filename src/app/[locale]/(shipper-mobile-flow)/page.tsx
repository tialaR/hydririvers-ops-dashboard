import { getLandingChartPoints } from '@/features/shipper-mobile-flow/application/get-landing-chart-points';
import { LandingScreen } from '@/features/shipper-mobile-flow/screens/landing-screen';

export default async function ShipperLandingPage() {
  const chartPoints = await getLandingChartPoints();
  return <LandingScreen chartPoints={chartPoints} />;
}
