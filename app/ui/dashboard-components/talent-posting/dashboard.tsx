import InformationCircleIcon from "@heroicons/react/24/outline/esm/InformationCircleIcon";
import styles from "./dashboardCss.module.css";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/solid";
import ProjectCarousel from "./projectCarousel";
import SearchBar from "./searchBar";
import NavBar from "./navBar";
import { Suspense } from "react";

const ClientDashboard = () => {
  return (
    <div className="wedding-gigs-panel mt-5 w-full col-span-4">
      <div className="flex ">
        <span className="text-2xl   ">
          {" "}
          Your Wedding Gigs
          <InformationCircleIcon className={styles.hoverInfo} />
          <p className={styles.info}>
            {" "}
            Manage your wedding gigs and contracts efficiently: those needing
            urgent action and with time sensitivity are displayed first
          </p>
        </span>{" "}
        <Link href={"#"}>
          <button className="btn btn-primary text-white flex bg-primary-700 rounded-xl p-3">
            <PlusIcon className="h-6 w-6 mr-1" />
            Post a Wedding Gig
          </button>
        </Link>
      </div>
      <ProjectCarousel />
      <div className="sticky top-[75px]  pt-5   bg-white">
        <Suspense>
          <SearchBar />
        </Suspense>
        <NavBar />
      </div>{" "}
    </div>
  );
};

export default ClientDashboard;
