import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export default function SEO({ title, description, canonical, ogImage }: SEOProps) {
  const fullTitle = title.includes("SolMatch") ? title : `${title} | SolMatch`;
  const url = canonical ? `https://solmatch.co.za${canonical}` : "https://solmatch.co.za";
  const image = ogImage || "https://solmatch.co.za/og-image.png";

  useEffect(() => {
    document.title = fullTitle;
    setMeta("description", description);
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:url", url);
    setMeta("og:image", image);
    setMeta("og:type", "website");
    setMeta("og:site_name", "SolMatch");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setCanonical(url);
  }, [fullTitle, description, url, image]);

  return null;
}

function setMeta(property: string, content: string) {
  const isOg = property.startsWith("og:") || property.startsWith("twitter:");
  const attr = isOg ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}
