const rawSiteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:5173";

export const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const seo = {
  businessName: "Damitha Cushion Works",
  title: "Damitha Cushion Works - Handcrafted cushions in Matara",
  description:
    "Handcrafted sofa, outdoor, car seat and custom cushions from a small workshop in Pamburana, Matara. Made to fit, built to last.",
  locale: "en_LK",
  address: {
    street: "No.14, Galle Road",
    locality: "Pamburana",
    region: "Matara",
    country: "LK",
    display: "No.14, Galle Road, Pamburana, Matara, Sri Lanka",
  },
  phone: "+94766438015",
  whatsapp: "+94702249246",
  email: "yeharadananjaya@gmail.com",
  openingHours: "Mo-Su 08:30-17:30",
  services: [
    "Sofa and couch cushions",
    "Outdoor and patio cushions",
    "Car seat cushions",
    "Custom cushion orders",
    "Foam replacement",
    "Re-upholstery",
  ],
  logoPath: "/assets/logo.png",
  brandLogoPath: "/assets/logo-with-name.png",
  imagePath: "/assets/logo-with-name.png",
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": absoluteUrl("/#business"),
    name: seo.businessName,
    url: absoluteUrl("/"),
    image: absoluteUrl(seo.imagePath),
    logo: absoluteUrl(seo.logoPath),
    description: seo.description,
    telephone: seo.phone,
    email: seo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: seo.address.street,
      addressLocality: seo.address.locality,
      addressRegion: seo.address.region,
      addressCountry: seo.address.country,
    },
    areaServed: ["Matara", "Pamburana", "Sri Lanka"],
    openingHours: seo.openingHours,
    makesOffer: seo.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service,
      },
    })),
  };
}
