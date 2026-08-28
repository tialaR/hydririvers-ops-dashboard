import { getShipperLandingChartPoints } from '@/features/home/application/get-shipper-landing-chart-points';
import { ShipperLandingScreen } from '@/features/home/components/shipper-landing/shipper-landing-screen';

export default async function ShipperLandingPage() {
  const chartPoints = await getShipperLandingChartPoints();
  return <ShipperLandingScreen chartPoints={chartPoints} />;
}
