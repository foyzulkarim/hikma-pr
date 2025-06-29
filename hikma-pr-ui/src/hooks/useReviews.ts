import { useState, useEffect } from 'react';
import { mockReviews, mockSummaryStats, Review } from '@/data/mockData';

interface UseReviewsReturn {
  reviews: Review[];
  summaryStats: typeof mockSummaryStats;
  loading: boolean;
  error: string | null;
}

export function useReviews(): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summaryStats, setSummaryStats] = useState(mockSummaryStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Development: use mock data (Vite dev server runs on port 5173)
        if (window.location.hostname === 'localhost' && window.location.port === '5173') {
          console.log('🔧 Development mode: Using mock data');
          setReviews(mockReviews);
          setSummaryStats(mockSummaryStats);
          setLoading(false);
          return;
        }

        // Production (npx): fetch real data
        console.log('🚀 Production mode: Fetching real data');
        const response = await fetch('/api/reviews');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        
        const data = await response.json();
        setReviews(data.reviews || []);
        setSummaryStats(data.summaryStats || mockSummaryStats);
        setLoading(false);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
        // Fallback to mock data on error
        setReviews(mockReviews);
        setSummaryStats(mockSummaryStats);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { reviews, summaryStats, loading, error };
}
