import Image from "next/image";
import Link from "next/link";
import SignupForm from "../ui/login-signup-component/signup-form";
import AppLogo from "../ui/shared/AppLogo";
import { getServerSession } from "next-auth";
// import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";

const SignUppage = async () => {
  const session = await getServerSession(authOptions); //typescript error
  if (session) redirect("/");

  return (
    <div className="min-h-screen lg:h-screen bg-[#f5f5f5] p-4 sm:p-6 lg:p-6 flex items-center justify-center">
      <div className="w-full max-w-[1130px] lg:h-full grid lg:grid-cols-2 rounded-[30px] overflow-hidden border border-slate-200/80 bg-white">
        <div className="p-7 sm:p-10 lg:px-12 lg:py-10 overflow-y-auto">
          <div className="mb-9">
            <AppLogo width={40} height={40} className="mb-5" />
            <h1 className="text-[44px] font-serif font-semibold text-slate-800 leading-[1.08]">
              Join WeddingJobs
            </h1>
            <p className="mt-2 text-[20px] text-slate-500">Create your vendor profile in minutes</p>
          </div>

          <SignupForm />

          <div className="mt-8 text-center text-[15px] text-slate-600">
            Already have an account?
          </div>
          <Link
            href="/login"
            className="mt-4 block w-full rounded-xl border border-slate-300 bg-white py-3.5 text-center font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to Login
          </Link>
        </div>

        <div className="hidden lg:block p-5">
          <div className="relative h-full w-full overflow-hidden rounded-[28px]">
            <Image
              src="/images/weddly-login-hero.webp"
              alt="Wedding ceremony"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
            <div className="absolute bottom-10 left-8 right-8 text-white">
              <h2 className="text-[52px] font-serif font-semibold leading-[1.06]">Start your wedding vendor journey</h2>
              <p className="mt-4 max-w-md text-xl leading-relaxed text-white/90">
                Join thousands of vendors who are building their dream wedding business on our platform.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white/40 bg-white/20"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">2k+ Vendors</p>
                  <p className="text-sm text-white/80">Growing every day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUppage;
