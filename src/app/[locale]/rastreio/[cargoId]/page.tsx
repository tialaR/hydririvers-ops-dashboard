import CargoMapImmersiveClient from './cargo-map-immersive-client';

type PageProps = {
  params: Promise<{
    locale: string;
    cargoId: string;
  }>;
};

export default async function CargoMapImmersivePage({ params }: PageProps) {
  const { locale, cargoId } = await params;

  return <CargoMapImmersiveClient locale={locale} cargoId={cargoId} />;
}
