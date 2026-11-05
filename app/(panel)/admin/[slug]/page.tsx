import { notFound } from "next/navigation";
import ResourceManager from "@/components/admin/ResourceManager";
import { RESOURCE_SLUGS } from "@/lib/resources";

export default function ResourcePage({ params }: { params: { slug: string } }) {
  const resource = RESOURCE_SLUGS[params.slug];
  if (!resource) notFound();
  return <ResourceManager key={resource} resource={resource} />;
}
