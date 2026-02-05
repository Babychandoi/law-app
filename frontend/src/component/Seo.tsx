// Seo.tsx
import { Title, Meta } from "react-head";

interface SeoProps {
  title: string;
  description?: string;
  keywords?: string;
}

export function Seo({ title, description, keywords }: SeoProps) {
  return (
    <>
      <Title>{title}</Title>
      {description && <Meta name="description" content={description}  />}
      {keywords && <Meta name="keywords" content={keywords} />}
    </>
  );
}
