import { useState, useEffect } from 'react';

interface ExchangeRateResult {
  rate: number | null;
  loading: boolean;
  error: string | null;
}

const API_URL = 'https://api.frankfurter.app/latest?from=USD&to=CNY';

export function useExchangeRate(): ExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`汇率API错误! 状态码: ${response.status}`);
        }
        const data = await response.json();
        if (data.rates && data.rates.CNY) {
          if (isMounted) {
            setRate(data.rates.CNY);
          }
        } else {
          throw new Error('无法从API响应中获取CNY汇率');
        }
      } catch (err) {
        console.error('获取汇率失败:', err);
        if (isMounted) {
          setError(err instanceof Error ? `汇率获取失败: ${err.message}` : '获取汇率时发生未知错误');
          setRate(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRate();

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  return { rate, loading, error };
}
