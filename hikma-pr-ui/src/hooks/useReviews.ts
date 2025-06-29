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
        console.log('🔄 Fetching data from API...');
        const response = await fetch('/api/reviews');
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API returned non-JSON response');
        }
        
        const data = await response.json();
        setReviews(data.reviews || []);
        setSummaryStats(data.summaryStats || mockSummaryStats);
        setLoading(false);
        
        console.log(`✅ Loaded ${data.reviews?.length || 0} reviews from API`);
        
      } catch (err) {
        console.error('❌ Failed to load data from API:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Fallback to mock data only as last resort
        console.log('📝 Falling back to mock data');
        setReviews(mockReviews);
        setSummaryStats(mockSummaryStats);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { reviews, summaryStats, loading, error };
}
