import { useCallback, useEffect, useState } from "react";
import { fallbackRuntimeCatalog, fetchRuntimeCatalog } from "../lib/catalogClient.js";

export function useRuntimeCatalog() {
  const [catalog, setCatalog] = useState(fallbackRuntimeCatalog);
  const [status, setStatus] = useState("loading");

  const reload = useCallback(async (signal) => {
    setStatus("loading");
    try {
      const nextCatalog = await fetchRuntimeCatalog({ signal });
      setCatalog(nextCatalog);
      setStatus("ready");
    } catch (error) {
      if (error?.name === "AbortError") return;
      setStatus("fallback");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => reload(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [reload]);

  return { catalog, status, reload };
}
