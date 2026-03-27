import ChangePasswordForm from "@/app/ui/admin-components/login-component/change-password-form";

export default async function LoginPage() {
  return (
    <div className="flex justify-center p-10 items-center align-middle   h-screen relative ">
      {/* <Image
        src="/logo/weddlylogo-v2.png"
        alt="logo"
        width={50}
        height={50}
        className="absolute top-5 left-5"
      /> */}
      <div className="relative md:-translate-x-[50px] border-2 border-primary-600 rounded-3xl items-center justify-center flex w-full sm:w-[500px] flex-col  p-6">
        <h1 className="text-2xl font-bold text-gray-700 ">Log In to Weddly</h1>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
