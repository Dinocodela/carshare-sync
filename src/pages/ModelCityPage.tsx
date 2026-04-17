import { useParams, Navigate } from "react-router-dom";
import { ModelCityLandingPage } from "@/components/marketing/ModelCityLandingPage";
import { modelCityPages } from "@/data/modelCityPages";

export default function ModelCityPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = modelCityPages.find((p) => p.slug === slug);

  if (!data) return <Navigate to="/not-found" replace />;

  return <ModelCityLandingPage data={data} />;
}
