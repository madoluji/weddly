"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ModeOption = {
  id: string;
  title: string;
  subtext: string;
  icon: React.ReactNode;
  route: string;
};

const MODES: ModeOption[] = [
  {
    id: "client",
    title: "I'm Planning a Wedding",
    subtext: "Find the perfect venue and hire a professional team",
    route: "/signup/client",
    icon: (
      // Engagement Ring icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mode-icon"
      >
        <path d="M22 18L32 8L42 18" />
        <path d="M27 8H37" />
        <circle cx="32" cy="38" r="18" />
        <circle cx="32" cy="38" r="10" />
        <path d="M28 34L32 30L36 34L32 38Z" />
      </svg>
    ),
  },
  {
    id: "venue",
    title: "I'm a Venue",
    subtext: "List your event space and manage bookings",
    route: "/signup/venue",
    icon: (
      // Elegant Building / Castle icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mode-icon"
      >
        <rect x="8" y="26" width="48" height="30" rx="2" />
        <path d="M16 26V16L22 10L28 16V26" />
        <path d="M36 26V16L42 10L48 16V26" />
        <rect x="26" y="40" width="12" height="16" rx="1" />
        <circle cx="35" cy="48" r="1.2" />
        <rect x="12" y="32" width="8" height="8" rx="1" />
        <rect x="44" y="32" width="8" height="8" rx="1" />
        <line x1="16" y1="36" x2="16" y2="36" />
      </svg>
    ),
  },
  {
    id: "specialist",
    title: "I'm a Specialist",
    subtext: "Showcase your portfolio and find new gigs",
    route: "/signup/specialist",
    icon: (
      // Camera icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mode-icon"
      >
        <path d="M6 22H58V54H6z" />
        <path d="M22 22L26 12H38L42 22" />
        <circle cx="32" cy="37" r="10" />
        <circle cx="32" cy="37" r="5" />
        <circle cx="50" cy="28" r="2" />
      </svg>
    ),
  },
];

const ModeSelect = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    const mode = MODES.find((m) => m.id === selected);
    if (mode) router.push(mode.route);
  };

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

        .mode-page {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #fafbfc;
        }

        .mode-heading {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          text-align: center;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .mode-subheading {
          font-size: 1.05rem;
          color: #6b7280;
          text-align: center;
          margin-bottom: 2.5rem;
          font-weight: 400;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          width: 100%;
          max-width: 900px;
          margin-bottom: 2.5rem;
        }

        @media (min-width: 768px) {
          .mode-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
          .mode-heading {
            font-size: 2.5rem;
          }
        }

        .mode-card {
          position: relative;
          background: #ffffff;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 2.5rem 2rem 2rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.04);
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .mode-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
            0 12px 28px rgba(0, 0, 0, 0.06);
        }

        .mode-card.selected {
          border-color: #2f5f4a;
          box-shadow: 0 0 0 1px #2f5f4a, 0 4px 12px rgba(47, 95, 74, 0.12),
            0 12px 28px rgba(47, 95, 74, 0.08);
        }

        .mode-card-radio {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .mode-card.selected .mode-card-radio {
          border-color: #2f5f4a;
          background: #2f5f4a;
        }

        .mode-card-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: transparent;
          transition: background 0.2s ease;
        }

        .mode-card.selected .mode-card-radio-dot {
          background: #ffffff;
        }

        .mode-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          background: #f0f7f3;
          transition: background 0.25s ease;
        }

        .mode-card.selected .mode-icon-wrap {
          background: #e6f0eb;
        }

        .mode-card :global(.mode-icon) {
          width: 32px;
          height: 32px;
          color: #2f5f4a;
        }

        .mode-card-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.4rem;
          line-height: 1.3;
        }

        .mode-card-sub {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.45;
          font-weight: 400;
        }

        .mode-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.9rem 3rem;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: inherit;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.01em;
        }

        .mode-btn:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .mode-btn:not(:disabled) {
          background: #2f5f4a;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(47, 95, 74, 0.3);
        }

        .mode-btn:not(:disabled):hover {
          background: #265040;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(47, 95, 74, 0.35);
        }

        .mode-btn:not(:disabled):active {
          transform: translateY(0);
        }
      `}</style>

      <div className="mode-page">
        <h1 className="mode-heading">How will you use Weddly?</h1>
        <p className="mode-subheading">
          Choose the option that best describes you. You can always change this
          later.
        </p>

        <div className="mode-grid">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`mode-card ${selected === mode.id ? "selected" : ""}`}
              onClick={() => setSelected(mode.id)}
              aria-pressed={selected === mode.id}
            >
              <span className="mode-card-radio">
                <span className="mode-card-radio-dot" />
              </span>
              <span className="mode-icon-wrap">{mode.icon}</span>
              <span className="mode-card-title">{mode.title}</span>
              <span className="mode-card-sub">{mode.subtext}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mode-btn"
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </>
  );
};

export default ModeSelect;
