import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
}

export function useSeo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = `${title} | Open4Printing`;
    
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
}
