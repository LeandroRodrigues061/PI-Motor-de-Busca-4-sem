'use client'
import { useEffect } from 'react';

declare global {
  interface Window {
    VLibras: any;
  }
}

export function VLibrasPlugin() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;
      script.onload = () => {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      };
      document.body.appendChild(script);
    }, 500); // espera meio segundo
  
    return () => clearTimeout(timeout);
  }, []);
  

  return null;
}
