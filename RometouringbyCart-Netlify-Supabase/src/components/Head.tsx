import { useEffect } from "react";

interface HeadProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export function Head({
  title = "RometouringbyCart | Private Cart Tours in Rome",
  description = "Private electric cart tours in Rome for couples, families and small groups.",
  keywords = "Rome cart tour, private tour Rome, golf cart Rome, Rome sightseeing, electric cart tour Rome",
}: HeadProps) {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", keywords);
  }, [title, description, keywords]);

  return null;
}
