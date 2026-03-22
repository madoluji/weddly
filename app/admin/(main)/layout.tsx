import Sidebar from "@/app/ui/admin-components/sidebar";
import "../../ui/globals.css";

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <div lang="en" className="flex w-full">
    <Sidebar />
    <main className="w-full">{children}</main>
  </div>
);

export default RootLayout;
