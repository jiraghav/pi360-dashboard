"use client";
import { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function ActivityFeed({ activities, loading, error }) {
  const [activityList, setActivityList] = useState([]);
  const router = useRouter();

  // ✅ Convert submittedToLawyers into formatted activities
  useEffect(() => {
    if (activities && activities.length > 0) {
      const formatted = activities.map((item) => ({
        id: item.datetime,
        status: `Submitted to Lawyer`,
        name: `${item.name}`,
        caseId: `${item.caseId}`,
        time: moment(item.datetime).format("MM/DD/YYYY hh:mm A"),
      }));
      setActivityList(formatted);
    }
  }, [activities]);

  const [showAll, setShowAll] = useState(false);
  
  const onViewProfile = (a) => {
    if (!a?.name) return;

    const query = encodeURIComponent(a.name);
    router.push(`/cases?search=${query}`);
  };

  return (
    <div className="col-span-12 lg:col-span-6 card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="dot bg-sky-400"></span>
          <h4 className="font-semibold">Activity</h4>
        </div>
      </div>

      {loading ? (
        <p className="text-mute">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : activityList.length === 0 ? (
        <p className="text-mute italic">No recent activity</p>
      ) : (
        <>
          <ul className="divide-y divide-stroke/70">
            {(showAll ? activityList : activityList.slice(0, 3)).map(
              (activity, i) => (
                <li
                  key={i}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {activity.name && (
                        <span
                          onClick={() => onViewProfile(activity)}
                          className="truncate text-blue-600 hover:underline cursor-pointer items-center"
                        >
                          {activity.name}{" "}
                        </span>
                      )}
                      <span className="text-xs text-mute">
                        · Case #{activity.caseId}
                      </span>
                    </div>
                    <div className="text-xs text-mute">{activity.status}</div>
                  </div>
                  <span className="text-xs text-mute">{activity.time}</span>
                </li>
              )
            )}
          </ul>

          {activityList.length > 3 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn btn-sm btn-outline"
              >
                {showAll ? "Show Less" : "View All"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
