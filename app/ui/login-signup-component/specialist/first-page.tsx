"use client";

import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

const STEPS = [
  { emoji: "📸", text: "Build your portfolio" },
  { emoji: "⭐", text: "Get discovered by venues & planners" },
  { emoji: "💰", text: "Get paid for your craft" },
];

const SpecialistWelcome = () => {
  const router = useRouter();
  const { session, status } = useAuth();
  const userName = session?.user.name;
  const id = session?.user.id;

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchWithAuth("/api/user?fields=roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles.freelancer) router.push(`/user/best-matches`);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  }, [status, session, router]);

  return (
    <>
      <style jsx>{`
        .sw-page {
          font-family: var(--font-montserrat), sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #fafbfc;
        }

        .sw-container {
          max-width: 560px;
          width: 100%;
          text-align: center;
        }

        .sw-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #2f5f4a;
          background: #e6f0eb;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }

        .sw-heading {
          font-family: var(--font-playfair-display), serif;
          font-size: 2.6rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          margin: 0 0 1rem;
          letter-spacing: -0.01em;
        }

        .sw-heading span {
          color: #2f5f4a;
        }

        .sw-subtext {
          font-size: 1.08rem;
          color: #6b7280;
          line-height: 1.65;
          margin: 0 0 2.5rem;
        }

        .sw-steps {
          list-style: none;
          padding: 0;
          margin: 0 auto 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 380px;
        }

        .sw-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
            0 4px 12px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sw-step:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07),
            0 8px 20px rgba(0, 0, 0, 0.04);
        }

        .sw-step-emoji {
          font-size: 1.6rem;
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f7f3;
          border-radius: 10px;
        }

        .sw-step-text {
          font-size: 1rem;
          font-weight: 500;
          color: #1a1a1a;
          text-align: left;
        }

        .sw-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.9rem 3.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: inherit;
          color: #ffffff;
          background: #2f5f4a;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(47, 95, 74, 0.3);
          letter-spacing: 0.01em;
        }

        .sw-btn:hover {
          background: #265040;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(47, 95, 74, 0.35);
        }

        .sw-btn:active {
          transform: translateY(0);
        }

        @media (min-width: 768px) {
          .sw-heading {
            font-size: 3rem;
          }
        }
      `}</style>

      <div className="sw-page">
        <div className="sw-container">
          <div className="sw-badge">📷 Wedding Specialist</div>

          <h1 className="sw-heading">
            Ready for your next big <span>endeavour</span>?
          </h1>

          <p className="sw-subtext">
            {userName && <>Hey {userName}! </>}
            Showcase your skills, build your portfolio, and connect with venues
            and couples who need your talent.
          </p>

          <ul className="sw-steps">
            {STEPS.map((step, i) => (
              <li key={i} className="sw-step">
                <span className="sw-step-emoji">{step.emoji}</span>
                <span className="sw-step-text">{step.text}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="sw-btn"
            onClick={() => router.push(`/signup/freelancer/${id}`)}
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
};

export default SpecialistWelcome;
