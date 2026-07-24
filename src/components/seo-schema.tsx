"use client";

import Script from "next/script";

type SchemaType = "Organization" | "Product" | "BreadcrumbList" | "FAQPage";

interface SeoSchemaProps {
  type: SchemaType;
  data: any;
}

export function SeoSchema({ type, data }: SeoSchemaProps) {
  let schemaData = {};

  switch (type) {
    case "Organization":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ORINKO",
        "url": "https://orinko.in",
        "logo": "https://orinko.in/images/logo.png",
        "sameAs": [
          "https://instagram.com/orinko.in",
          "https://facebook.com/orinko"
        ]
      };
      break;
    
    case "Product":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.name,
        "image": data.images,
        "description": data.description,
        "sku": data.sku,
        "brand": {
          "@type": "Brand",
          "name": "ORINKO"
        },
        "offers": {
          "@type": "Offer",
          "url": `https://orinko.in/product/${data.slug}`,
          "priceCurrency": "INR",
          "price": data.price,
          "availability": data.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        }
      };
      break;

    case "BreadcrumbList":
      schemaData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };
      break;
  }

  return (
    <Script
      id={`schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
