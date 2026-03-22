import TypingAnimation from "../typingAnimation";
import {
  UserIcon,
  DocumentCheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../button";
import DisplaySessionInfo from "../displaySessionInfo";
import Link from "next/link";

const WelcomeText = () => {
  return (
    <div className="flex flex-col items-center justify-center top-1/2 m-52 ">
      <div className="text-4xl">
        Welcome <DisplaySessionInfo name={true} />! Let’s get started on{" "}
        <TypingAnimation
          text={"posting your Job"}
          className="text-primary-600"
          interval={153}
        />
        <TypingAnimation
          text={"!"}
          className="text-primary-600"
          interval={10}
          startDelay={3500}
        />
        <TypingAnimation
          text={"🚀"}
          className="text-primary-600"
          interval={13}
          startDelay={3000}
        />{" "}
      </div>
      <div className="text-2xl mt-10">
        Bring your vision to life with top-tier talent!
      </div>

      <Link href={"/client/post-job/job-details"}>
        <Button className="mt-10 text-white p-5 ">Get Started</Button>
      </Link>
    </div>
  );
};

export default WelcomeText;
