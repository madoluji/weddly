import Image from "next/image";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div lang="en">
      <div className="absolute top-5 left-5 ">
        <Image src="/logo/weddlylogo-v2.png" alt="logo" width={50} height={50} />
      </div>
      {children}
    </div>
  );
};

export default RootLayout;
