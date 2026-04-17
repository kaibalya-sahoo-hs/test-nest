import React, { useState } from "react";
import { useEffect } from "react";
import ApiLogChart from "../components/ApiLogChart";
import UserDistribution from "../components/UserDistribution";

function Stats() {
  const [logCharts, setlogCharts] = useState([]);
  const fetchlogData = async () => {
    try {
      const res = await fetch("/admin/apiLogs");
      const { logs } = await res.json();
      console.log(logs);
      setlogCharts(logs);
    } catch (error) {
      console.log(`Error while fetchnig logs ${error}`);
    }
  };
  const data = [
    { time: "10:00", requests: 400, errors: 24 },
    { time: "11:00", requests: 300, errors: 10 },
    { time: "12:00", requests: 500, errors: 60 },
    { time: "13:00", requests: 600, errors: 30 },
    { time: "14:00", requests: 700, errors: 33 },
    { time: "15:00", requests: 800, errors: 42 },
  ];
  useEffect(() => {
    fetchlogData();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-semibold my-2">Data Stats</h1>
      <div className="">
        <ApiLogChart logData={data} />
        <UserDistribution
          admins={[1, 4, 5]}
          guests={[1, 22, 34, 56]}
          members={[1, 2, 3, 4, 5, 6, 7]}
        />
      </div>
    </div>
  );
}

export default Stats;
