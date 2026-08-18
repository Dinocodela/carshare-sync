import { useParams } from "react-router-dom";
import { ModelCityLandingPage } from "@/components/marketing/ModelCityLandingPage";
import { modelCityPages } from "@/data/modelCityPages";
import NotFound from "@/pages/NotFound";

export default function ModelCityPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = modelCityPages.find((p) => p.slug === slug);

  if (!data) return <NotFound />;

  return <ModelCityLandingPage data={data} />;
}
