"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DisplaySessionInfo from "../displaySessionInfo";

const steps = [
  {
    number: "01",
    icon: "edit_note",
    title: "Describe Your Day",
    description: "Share your vision — occasion type, date, location, and what you need from vendors.",
  },
  {
    number: "02",
    icon: "payments",
    title: "Set Your Budget",
    description: "Define your price range so the right talent can find and pitch you confidently.",
  },
  {
    number: "03",
    icon: "handshake",
    title: "Receive Proposals",
    description: "Sit back while curated vendors send you tailored proposals for your big day.",
  },
];

const categories = [
  { icon: "camera_alt", label: "Photography" },
  { icon: "videocam", label: "Videography" },
  { icon: "local_florist", label: "Floral Design" },
  { icon: "music_note", label: "DJ & Music" },
  { icon: "restaurant", label: "Catering" },
  { icon: "brush", label: "Makeup" },
  { icon: "celebration", label: "Decoration" },
  { icon: "event", label: "Planning" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const WelcomeText = () => {
  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-surface">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute -right-24 top-1/3 h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/4 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-16 lg:py-24">

        {/* Hero */}
        <motion.div
          className="text-center"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.3em] text-primary-600"
          >
            Curated Vendor Marketplace
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 [font-family:var(--font-noto-serif)] text-4xl leading-tight text-on-surface md:text-6xl"
          >
            Welcome back,{" "}
            <span className="italic text-primary">
              <DisplaySessionInfo name={true} />
            </span>
            .
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-xl [font-family:var(--font-inter)] text-base text-on-surface-variant md:text-lg"
          >
            Post your wedding job in minutes and connect with Nepal&apos;s finest vendors — photographers, decorators, caterers, and more.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/client/post-job/job-details"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 [font-family:var(--font-inter)] text-sm font-semibold text-on-primary shadow-[0_16px_40px_rgba(47,95,74,0.28)] transition-all hover:bg-primary-600 hover:shadow-[0_20px_48px_rgba(47,95,74,0.36)] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Post a Job
              <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/client/best-matches"
              className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-8 py-4 [font-family:var(--font-inter)] text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-base text-primary">search</span>
              Browse Vendors
            </Link>
          </motion.div>
        </motion.div>

        {/* Category pills */}
        <motion.div
          className="mt-14 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-2 [font-family:var(--font-inter)] text-xs font-medium text-on-surface-variant transition-all hover:border-primary/30 hover:bg-surface-container-highest hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm text-primary">{cat.icon}</span>
              {cat.label}
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="my-16 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="h-px flex-1 bg-outline-variant/20" />
          <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.2em] text-on-surface-variant/50">
            How it works
          </span>
          <div className="h-px flex-1 bg-outline-variant/20" />
        </motion.div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="group relative overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container-low px-6 py-7 transition-all hover:border-primary/20 hover:shadow-[0_12px_32px_rgba(47,95,74,0.10)]"
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/4 transition-all group-hover:bg-primary/8" />
              <p className="[font-family:var(--font-inter)] text-4xl font-bold text-primary/15">
                {step.number}
              </p>
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <span className="material-symbols-outlined text-xl text-primary">{step.icon}</span>
              </div>
              <h3 className="mt-4 [font-family:var(--font-noto-serif)] text-xl text-on-surface">
                {step.title}
              </h3>
              <p className="mt-2 [font-family:var(--font-inter)] text-sm leading-relaxed text-on-surface-variant">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-primary px-8 py-10 text-center shadow-[0_20px_60px_rgba(47,95,74,0.22)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <span className="material-symbols-outlined text-4xl text-on-primary/60">favorite</span>
          <h2 className="[font-family:var(--font-noto-serif)] text-2xl text-on-primary md:text-3xl">
            Ready to find your perfect vendor?
          </h2>
          <p className="max-w-md [font-family:var(--font-inter)] text-sm text-on-primary/80">
            It takes less than 5 minutes to post your first job. Your dream wedding team is waiting.
          </p>
          <Link
            href="/client/post-job/job-details"
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-on-primary px-8 py-4 [font-family:var(--font-inter)] text-sm font-semibold text-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default WelcomeText;
