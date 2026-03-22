import React, { Suspense } from "react";
import Filter from "../filter";

const ExpertiseFilter = () => {
  return (
    <div>
      <p>Expertise Level </p>
      <ul>
        <li>
          <Suspense>
            <Filter Experience="Entry" />
          </Suspense>
        </li>
        <li>
          <Suspense>
            <Filter Experience="Intermediate" />
          </Suspense>
        </li>
        <li>
          <Suspense>
            <Filter Experience="Expert" />
          </Suspense>
        </li>
      </ul>
    </div>
  );
};

export default ExpertiseFilter;
