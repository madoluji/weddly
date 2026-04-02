import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <main className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">

      {/* Hero Section with Antigravity Elements */}
      <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden bg-surface">
        {/* Background Gradient & Floating Icons Shell */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary-fixed/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] bg-secondary-fixed/30 blur-[150px] rounded-full"></div>

          {/* Floating 3D Elements (Simulated with Icons and depth) */}
          <div className="absolute top-[20%] left-[15%] opacity-40 rotate-12 scale-150 text-primary-container">
            <span
              className="material-symbols-outlined !text-6xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div className="absolute top-[60%] left-[5%] opacity-20 -rotate-12 scale-[2] text-primary">
            <span
              className="material-symbols-outlined !text-8xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              filter_vintage
            </span>
          </div>
          <div className="absolute bottom-[15%] left-[20%] opacity-30 rotate-45 scale-110 text-secondary">
            <span
              className="material-symbols-outlined !text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_camera
            </span>
          </div>
          <div className="absolute top-[10%] right-[10%] opacity-25 -rotate-45 scale-[2.5] text-primary-fixed-dim">
            <span
              className="material-symbols-outlined !text-9xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div className="absolute top-[45%] right-[5%] opacity-40 rotate-12 scale-125 text-primary-container">
            <span
              className="material-symbols-outlined !text-7xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              diamond
            </span>
          </div>
          <div className="absolute bottom-[10%] right-[20%] opacity-30 -rotate-12 scale-150 text-secondary-fixed-dim">
            <span
              className="material-symbols-outlined !text-6xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              celebration
            </span>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center flex flex-col items-center">
          <div className="mb-6">
            <span className="uppercase tracking-widest text-xs font-label text-on-surface-variant bg-surface-container-low px-4 py-1.5 rounded-full inline-block mb-4">
              The Editorial Wedding Marketplace
            </span>
            <h1 className="font-headline text-6xl md:text-8xl text-on-surface leading-[1.1] mb-8">
              Curating <span className="italic text-primary font-light">Timeless</span>{" "}
              Moments.
            </h1>
            <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl font-body leading-relaxed mb-12">
              Connect with the world's most visionary wedding artisans. From
              secluded estates to bespoke floral designers, find everything for
              your high-end celebration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <a
              href="/login?callbackUrl=%2Fuser%2Fbest-matches"
              className="flex-1 block w-full cta-gradient text-on-primary py-4 px-8 rounded-md font-medium text-base hover:scale-[0.98] transition-transform editorial-shadow text-center"
            >
              Lets Go
            </a>
          </div>

          {/* Trusted By Bar (Subtle) */}
          <div className="mt-24 pt-8 border-t border-outline-variant/10 w-full max-w-4xl opacity-60">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6">
              As featured in global publications
            </p>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-6 grayscale contrast-125">
              <span className="font-headline font-bold text-xl italic">VOGUE</span>
              <span className="font-headline font-bold text-xl">Brides</span>
              <span className="font-headline font-bold text-xl italic">The Knot</span>
              <span className="font-headline font-bold text-xl">
                Harpers Bazaar
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Curated Gallery Section */}
      <section className="bg-surface py-32 px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="font-label text-xs uppercase tracking-widest text-primary mb-2 block">
                The Gallery
              </span>
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">
                Artisan Perspectives
              </h2>
            </div>
            <Link
              className="text-primary font-medium hover:underline flex items-center gap-2"
              href="/search/talent"
            >
              View Portfolio{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-12 snap-x scrollbar-hide">
            {/* Card 1 */}
            <div className="min-w-[320px] md:min-w-[450px] snap-start">
              <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden mb-6 relative group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Elegant outdoor wedding ceremony set in a historic European villa garden with white roses and warm evening sunlight"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuASy02BCPzcLRjYXlc92tf7OVxWdgk3ogvQgHHKfYJ0cpPrunejheDDntZCH780R57iIZYTVsudPTICLVQ_9UkFhZFIijSThYGuuP4n2GF0zCbHsx56oGBR7NEjI5qB0DDIKtjVEIje7tvjTeiYEfmUkvmkj3mz51fkmvjHqs1iwO80afn_wzRUfX4hfGtSeip-Mn-WTZQivHmyE9bmyzL6LP_q0FWw93gHYbbFfDKfGN9Vr4yY_HEtEzj7LSljvO8RBfK1jjV1Zw"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-headline text-xl mb-1">
                Villa d'Este Ceremony
              </h3>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                Cernobbio, Italy
              </p>
            </div>

            {/* Card 2 */}
            <div className="min-w-[320px] md:min-w-[450px] snap-start pt-12">
              <div className="aspect-[1/1] bg-surface-container-low rounded-xl overflow-hidden mb-6 relative group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Close-up of luxury bridal accessories featuring gold wedding rings and delicate floral details on a cream silk texture"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKOkm9RhJOMp45040bn-jHoKllq_gn-0O8xq9f9VSRbD__roQljwYLr0Vh4Ey4FDQ2lKp1uF8cucForek3SwDV9bi2ue_0u42W6Lv5J5jIIaJue041J87xYI_o-S1Wga_ly15SFuq3FGycIw9fEQFK1Xfg7RD0Qpoo76CJOQ75LJ6OcBnune2H7KzxmjqV0jvYBwUlMv94tA4cf0v4U0U3LtwQQaNV_zbrtaT05TTTwnjBgwVACm98qEXSm7YGIZrrjubByaDSXA"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-headline text-xl mb-1">
                The Golden Hour Ring
              </h3>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                Still Life Editorial
              </p>
            </div>

            {/* Card 3 */}
            <div className="min-w-[320px] md:min-w-[450px] snap-start">
              <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden mb-6 relative group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Modern minimalist wedding reception table setting with tall candles, emerald green accents, and artisan ceramic plates"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkKLWMulkUrD-Z1nVt9wwnMXLJ-hxqz-bXCvhLmtn055DUwjQXLbIfqY3DqPxf5de_o0ouEs4xbOmp8aFsSrU-azxh8xwypd6K0B4NqHkzxveHZdjeLep7JjuxOcAAA5gHZXxbnvPyy5OfveEXxsNC4dbmF6GEqL1V1BNMJsoJQdc7k9vQaD8qMWyYPR0sZvyKZ2xhhD-1YWa5SJ-4cELCkdYwJMrmyuqWVsQc9u-iBPdIKaDfQtEn3libjamf-bli9dJL2-LASw"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-headline text-xl mb-1">
                Minimalist Tablescape
              </h3>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                London Design Studio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Layout for Planning Tools */}
      <section className="bg-surface-container-low py-32 px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[800px]">
            <div className="md:col-span-7 bg-surface-container-lowest p-12 rounded-xl flex flex-col justify-end editorial-shadow relative overflow-hidden group min-h-[400px]">
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <img
                  className="w-full h-full object-cover"
                  alt="Overhead view of an aesthetic wedding planner book with fine stationery and a glass of champagne"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK6ND23jeve228uF_VpchTpnc4V7He3Qb9__gSq5roEhpmusrjPTiT1vO5jiNfBCc1fNPpG5wrKqTeO8EhUsN2rc7s-OvXkw1ATRIwmtgWlrTw78YCD53e282tDg0ZOG-zMYE288SOG6_lG3MK-4rniWpSkGTlWA2PSzavH5AhNqoWJkJ0R24sGn2cMbNU907MddXuRwZY0pyP_w_za9hI_C3piZgdorKEOd62s0Te13SnMX77I6mop22R7bhLp-igEXhVdyyf5g"
                />
              </div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl text-primary mb-6 block">
                  auto_awesome_motion
                </span>
                <h3 className="font-headline text-3xl mb-4 text-on-surface">
                  Curated Concierge
                </h3>
                <p className="text-on-surface-variant max-w-md mb-8">
                  Personalized matching with vendors who align with your aesthetic
                  values and budget architecture.
                </p>
                <Link href="/signup/usermode-select">
                  <button className="text-primary font-bold uppercase tracking-widest text-xs hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Explore Service{" "}
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 grid grid-rows-2 gap-6">
              <div className="bg-primary-container p-12 rounded-xl flex flex-col justify-center editorial-shadow min-h-[300px]">
                <span className="material-symbols-outlined text-4xl text-primary-fixed mb-4 block">
                  calendar_month
                </span>
                <h3 className="font-headline text-2xl text-on-primary mb-2">
                  The Digital Timeline
                </h3>
                <p className="text-primary-fixed/80 text-sm">
                  Synchronized scheduling for your bridal party and vendor team in
                  one sophisticated interface.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-12 rounded-xl flex flex-col justify-center editorial-shadow border border-outline-variant/10 min-h-[300px]">
                <span className="material-symbols-outlined text-4xl text-primary mb-4 block">
                  payments
                </span>
                <h3 className="font-headline text-2xl text-on-surface mb-2">
                  Budget Intelligence
                </h3>
                <p className="text-on-surface-variant text-sm">
                  Insightful analytics into luxury spending and investment tracking
                  for your grand event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-100 dark:bg-stone-950 w-full mt-20 transition-colors">
        <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-serif text-emerald-900 dark:text-emerald-50">
              Weddly
            </span>
            <p className="font-body text-sm text-stone-500 dark:text-stone-400">
              © 2024 Weddly Editorial Marketplace. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <Link
              className="text-stone-500 dark:text-stone-400 hover:text-emerald-900 transition-all font-body text-sm"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-stone-500 dark:text-stone-400 hover:text-emerald-900 transition-all font-body text-sm"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-stone-500 dark:text-stone-400 hover:text-emerald-900 transition-all font-body text-sm"
              href="#"
            >
              Cookie Settings
            </Link>
            <Link
              className="text-stone-500 dark:text-stone-400 hover:text-emerald-900 transition-all font-body text-sm"
              href="#"
            >
              Contact Us
            </Link>
          </nav>
          <div className="flex gap-4">
            <span className="font-label italic text-emerald-900 dark:text-emerald-500">
              Find us on Instagram
            </span>
            <span className="material-symbols-outlined text-stone-500">
              public
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
