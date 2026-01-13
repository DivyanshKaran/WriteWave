import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: unknown[] | undefined;
    gtag: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as
  | string
  | undefined;

function loadGtag(measurementId: string) {
  if (window.dataLayer) return;
  window.dataLayer = window.dataLayer || [];
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(gtagScript);

  const inline = document.createElement("script");
  inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);} 
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(inline);
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    loadGtag(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}


