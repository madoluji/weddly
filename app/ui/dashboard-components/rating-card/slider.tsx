"use client";
import { useEffect, useState } from "react";

interface userRating {
  rating: number;
}

const SliderRating = ({ rating }: userRating) => {
  const initialValue = 0;
  const targetValue = rating;
  const [count, setCount] = useState(initialValue);
  const duration = 1; // 4 seconds

  useEffect(() => {
    const startValue = initialValue;
    const maxInterval = 10; // Maximum interval for the slowest increments
    const minInterval = 15; // Minimum interval for the fastest increments
    const incrementStep = 0.09; // Smaller increment step for smoother transition

    const incrementCount = (i: number) => {
      if (i <= targetValue) {
        setCount(parseFloat(i.toFixed(2))); // Adjust precision to match increment step
        const progress = (i - startValue) / (targetValue - startValue); // Calculate progress as a value between 0 and 1
        const interval = maxInterval + progress * (minInterval - maxInterval); // Linearly interpolate interval based on progress
        setTimeout(() => incrementCount(i + incrementStep), interval);
      }
    };

    incrementCount(startValue);
  }, [targetValue, initialValue]);

  return (
    <div className="flex  gap-1">
      <p className="text-slate-500">0</p>
      <div className="rounded-xl m-auto max-w-[250px] w-full relative h-[12px] bg-slate-200">
        <div
          className="relative h-[12px] w-0 rounded-xl bg-primary-600 transition-all duration-300 ease-in-out"
          style={{ width: `${count * 20}%` }}
        >
          <div
            className="absolute right-[5px] top-0 h-7 w-[8px] -translate-y-[25%] bg-white"
          >
            {/* <Emoji rating={rating} /> */}
          </div>
          <div
            className="absolute right-2 top-0 h-7 w-[2px] -translate-y-[25%] rounded-3xl bg-primary-700"
          >
            {/* <Emoji rating={rating} /> */}
          </div>
        </div>
        {/* <hr className="absolute w-1 h-7 translate-x-1/2  top-0 -translate-y-1/2 right-1/2  border-4 px-1 border-white rounded  dark:bg-primary-700"></hr> */}
      </div>
      <p className="text-slate-500">5</p>
    </div>
  );
};

export default SliderRating;
