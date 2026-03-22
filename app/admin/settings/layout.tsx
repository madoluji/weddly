import SettingsSidebar from "@/app/ui/admin-components/settingsSidebar";
import "../../ui/globals.css";

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <div lang="en" className="flex w-full">
    <SettingsSidebar />
    <main className="w-full">{children}</main>
  </div>
);

export default RootLayout;
