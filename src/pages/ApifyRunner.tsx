import { useEffect } from 'react';

export default function ApifyRunner() {
  useEffect(() => {
    // Redirect to new app structure
    window.location.href = '/app';
  }, []);

  return null;
}