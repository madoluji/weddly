import AppLogo from "@/app/ui/shared/AppLogo";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div lang="en">
      <div className="absolute top-5 left-5 z-10">
        <AppLogo width={80} height={80} alt="logo" />
      </div>
      {children}
    </div>
  );
};

export default RootLayout;
