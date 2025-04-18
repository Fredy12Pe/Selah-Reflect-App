import DevotionPageClient from "./DevotionPageClient";

export default function Page({ params }: { params: { date: string } }) {
  return <DevotionPageClient date={params.date} />;
}
