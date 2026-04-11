import "../ui/globals.css";
import KYCStatus from "../ui/kycStatus";
import NavBar from "../ui/navbar/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-x-hidden bg-white dark:bg-dark-background min-h-screen">
      <div className="fixed left-0 right-0 z-[1200] bg-white dark:bg-dark-surface w-full">
        <NavBar />
      </div>
      <KYCStatus />
      <div className=" body-container pt-[75px] m-auto w-full">
        {children}
      </div>
    </div>
  );
}
