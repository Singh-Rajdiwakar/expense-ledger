import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fn = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      if (mountedRef.current) {
        setData(response);
        setError(null);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error);
      }
      toast.error(error.message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [cb]);

  return { data, loading, error, fn, setData };
};

export default useFetch;
