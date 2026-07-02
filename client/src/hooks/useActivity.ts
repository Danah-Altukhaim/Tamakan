import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DayActivity } from "../data/types";

/** Fetch a learner's weekly activity series (Overview chart). */
export function useActivity(userId: string | undefined): DayActivity[] {
  const [data, setData] = useState<DayActivity[]>([]);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api
      .activity(userId)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setData([]));
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return data;
}
