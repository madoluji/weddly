"use client";

import { useAuth } from "@/app/providers";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useState } from "react";

const VenueForm = () => {
  const router = useRouter();
  const { session } = useAuth();
  const id = session?.user.id;

  const searchParams = useSearchParams();

  const [venueName, setVenueName] = useState(searchParams.get("name") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/venueInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, venueName, location }),
      });

      if (res.ok) {
        router.push("/client/best-matches");
      } else {
        const data = await res.json();
        alert(data.error || "Error registering venue.");
      }
    } catch (err) {
      console.error("Venue registration error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .vf-wrapper {
          font-family: var(--font-montserrat), sans-serif;
          width: 100%;
          max-width: 480px;
        }

        .vf-title {
          font-family: var(--font-playfair-display), serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.5rem;
        }

        .vf-sub {
          font-size: 1rem;
          color: #6b7280;
          margin: 0 0 2rem;
          line-height: 1.5;
        }

        .vf-field {
          margin-bottom: 1.5rem;
        }

        .vf-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
          letter-spacing: 0.02em;
        }

        .vf-input {
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
        }

        .vf-input::placeholder {
          color: #9ca3af;
        }

        .vf-input:focus {
          border-color: #2f5f4a;
          box-shadow: 0 0 0 3px rgba(47, 95, 74, 0.1);
          background: #ffffff;
        }

        .vf-btn {
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

        .vf-btn:hover:not(:disabled) {
          background: #265040;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(47, 95, 74, 0.35);
        }

        .vf-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="vf-wrapper">
        <h1 className="vf-title">Set up your venue</h1>
        <p className="vf-sub">
          Tell us about your space so couples and planners can find you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="vf-field">
            <label className="vf-label">Venue Name *</label>
            <input
              type="text"
              className="vf-input"
              placeholder="e.g. The Grand Ballroom"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              required
            />
          </div>

          <div className="vf-field">
            <label className="vf-label">Location *</label>
            <input
              type="text"
              className="vf-input"
              placeholder="e.g. Kathmandu, Nepal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="vf-btn" disabled={submitting}>
            {submitting ? "Registering..." : "Register Venue"}
          </button>
        </form>
      </div>
    </>
  );
};

export default VenueForm;
