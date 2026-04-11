"use client";

import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

const BUDGET_OPTIONS = [
  "Under Rs 10,00,000",
  "Rs 10,00,000 – Rs 25,00,000",
  "Rs 25,00,000 – Rs 50,00,000",
  "Rs 50,00,000 – Rs 1,00,00,000",
  "Rs 1,00,00,000+",
];

const WelcomeText = () => {
  const router = useRouter();
  const { session, status } = useAuth();
  const id = session?.user.id;

  const [weddingDate, setWeddingDate] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchWithAuth("/api/user?fields=roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles.client) router.push(`/client/best-matches`);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  }, [status, session, router]);

  return (
    <>
      <style jsx>{`
        .pw-page {
          font-family: var(--font-montserrat), sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #fafbfc;
        }

        .pw-container {
          max-width: 560px;
          width: 100%;
          text-align: center;
        }

        .pw-badge {
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

        .pw-heading {
          font-family: var(--font-playfair-display), serif;
          font-size: 2.6rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          margin: 0 0 1rem;
          letter-spacing: -0.01em;
        }

        .pw-subtext {
          font-size: 1.08rem;
          color: #6b7280;
          line-height: 1.65;
          margin: 0 0 2.5rem;
        }

        .pw-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.25rem 2rem;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05),
            0 8px 24px rgba(0, 0, 0, 0.06);
          text-align: left;
        }

        .pw-card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 1.5rem;
        }

        .pw-field {
          margin-bottom: 1.25rem;
        }

        .pw-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
          letter-spacing: 0.02em;
        }

        .pw-label-opt {
          font-weight: 400;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .pw-input,
        .pw-select {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-family: inherit;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background: #fafbfc;
          color: #1a1a1a;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }

        .pw-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2.5rem;
        }

        .pw-input::placeholder {
          color: #9ca3af;
        }

        .pw-input:focus,
        .pw-select:focus {
          border-color: #2f5f4a;
          box-shadow: 0 0 0 3px rgba(47, 95, 74, 0.1);
          background: #ffffff;
        }

        .pw-btn {
          width: 100%;
          padding: 0.85rem;
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
          margin-top: 0.5rem;
        }

        .pw-btn:hover {
          background: #265040;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(47, 95, 74, 0.35);
        }

        .pw-btn:active {
          transform: translateY(0);
        }

        @media (min-width: 768px) {
          .pw-heading {
            font-size: 3rem;
          }
        }
      `}</style>

      <div className="pw-page">
        <div className="pw-container">
          <div className="pw-badge">✨ Wedding Planner</div>

          <h1 className="pw-heading">
            Let&apos;s bring your vision to life.
          </h1>

          <p className="pw-subtext">
            Your journey to the perfect wedding starts here. Create your profile
            to start exploring venues, vendors, and specialists.
          </p>

          <div className="pw-card">
            <div className="pw-card-title">Get started with a few details</div>

            <div className="pw-field">
              <label className="pw-label">
                Wedding Date <span className="text-red-500 font-semibold">*</span>
              </label>
              <input
                type="date"
                className="pw-input"
                value={weddingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setWeddingDate(e.target.value)}
                required
              />
            </div>

            <div className="pw-field">
              <label className="pw-label">Budget Range</label>
              <select
                className="pw-select"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="" disabled>
                  Select a range
                </option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="pw-btn"
              onClick={() => {
                if (!weddingDate) {
                  alert("Please select a wedding date to proceed.");
                  return;
                }
                if (!budget) {
                  alert("Please select a budget range to proceed.");
                  return;
                }
                const params = new URLSearchParams();
                if (weddingDate) params.set("date", weddingDate);
                if (budget) params.set("budget", budget);
                const qs = params.toString();
                router.push(`/signup/client/${id}${qs ? `?${qs}` : ""}`);
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeText;
