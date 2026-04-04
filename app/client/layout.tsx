import "../ui/globals.css";
import KYCStatus from "../ui/kycStatus";
import NavBar from "../ui/navbar/navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-x-hidden">
      <div className="fixed left-0 right-0 z-10 bg-white w-full">
        <NavBar />
      </div>
      <KYCStatus />
      <div className=" body-container pt-[75px] m-auto w-full">
        {children}
      </div>
    </div>
  );
}
