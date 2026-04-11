import LoginForm from "@/app/ui/login-signup-component/login-form";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import AppLogo from "@/app/ui/shared/AppLogo";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/"); //might be version error also error after callback
  //   return <p>error</p>;
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col p-8 sm:p-12 lg:p-16">
          <div className="flex flex-col items-center lg:items-start space-y-2 mb-10">
            <div className="mb-4">
              <AppLogo width={100} height={60} alt="Weddly Logo" />
            </div>
            <h1 className="text-3xl font-semibold text-[#2D3748] tracking-tight text-center lg:text-left">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-center lg:text-left">
              Sign in to manage your wedding business profile
            </p>
          </div>

          <LoginForm />

          <p className="mt-10 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#4A7C66] hover:underline">
              Signup
            </Link>
          </p>
        </div>

        <div className="hidden lg:block relative p-6">
          <div className="h-full w-full relative rounded-[2rem] overflow-hidden">
            <Image
              src="/images/weddly-login-hero.webp"
              alt="Elegant Wedding"
              fill
              priority
              className="absolute inset-0 h-full w-full object-cover"
              sizes="(min-width: 1024px) 50vw, 0vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white space-y-4">
              <h2 className="text-5xl font-semibold leading-tight">
                Crafting unforgettable <br /> wedding experiences
              </h2>
              <p className="text-white/90 text-xl font-light leading-relaxed max-w-md">
                Join our community of world-class vendors and find your next dream wedding project today.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="size-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm"
                    />
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold">2k+ Vendors</span>
                  <span className="text-xs text-white/70 tracking-wide">Growing every day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
