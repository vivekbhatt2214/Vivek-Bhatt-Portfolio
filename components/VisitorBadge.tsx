"use client";

import { useEffect, useState } from "react";
import { Eye, Users, Activity } from "@/components/Icons";

type VisitorData = {
  visitors: number;
  online: number;
  today: number;
};

export default function VisitorBadge() {
  const [data, setData] = useState<VisitorData>({
    visitors: 0,
    online: 0,
    today: 0,
  });

  useEffect(() => {
    fetch("/api/public-stats", {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) {
          return {
            visitors: 0,
            online: 0,
            today: 0,
          };
        }

        return res.json();
      })
      .then((result) => {
        setData({
          visitors: Number(result?.visitors ?? 0),
          online: Number(result?.online ?? 0),
          today: Number(result?.today ?? 0),
        });
      })
      .catch(() => {
        setData({
          visitors: 0,
          online: 0,
          today: 0,
        });
      });
  }, []);

  return (
    <div className="visitor-strip">
      <span>
        <Eye size={15} />
        <b>{data.visitors.toLocaleString()}</b> visitors
      </span>

      <span>
        <Users size={15} />
        <b>{data.today.toLocaleString()}</b> today
      </span>

      <span className="online">
        <Activity size={15} />
        <b>{data.online.toLocaleString()}</b> online
      </span>
    </div>
  );
}