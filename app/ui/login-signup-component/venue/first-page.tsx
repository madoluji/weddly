"use client";

import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VenueWelcome = () => {
  const router = useRouter();
  const { session } = useAuth();
  const id = session?.user.id;

  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");

  return (
    <>
      <style jsx>{`
        .vw-page {
          font-family: var(--font-montserrat), sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #fafbfc;
        }

        .vw-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          max-width: 960px;
          width: 100%;
          align-items: center;
        }

        @media (min-width: 768px) {
          .vw-container {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* --- Left Column --- */
        .vw-content h1 {
          font-family: var(--font-playfair-display), serif;
          font-size: 2.6rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          margin: 0 0 1rem;
          letter-spacing: -0.01em;
        }

        .vw-content h1 span {
          color: #2f5f4a;
        }

        .vw-content p {
          font-size: 1.08rem;
          color: #6b7280;
          line-height: 1.65;
          margin: 0 0 2rem;
        }

        .vw-features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .vw-feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #374151;
          font-weight: 500;
        }

        .vw-feature-dot {
          width: 8px;
          height: 8px;
          background: #2f5f4a;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* --- Right Column (Form Card) --- */
        .vw-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05),
            0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .vw-card-title {
          font-family: var(--font-playfair-display), serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.35rem;
        }

        .vw-card-sub {
          font-size: 0.9rem;
          color: #9ca3af;
          margin: 0 0 1.75rem;
        }

        .vw-field {
          margin-bottom: 1.25rem;
        }

        .vw-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
          letter-spacing: 0.02em;
        }

        .vw-input {
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

        .vw-input::placeholder {
          color: #9ca3af;
        }

        .vw-input:focus {
          border-color: #2f5f4a;
          box-shadow: 0 0 0 3px rgba(47, 95, 74, 0.1);
          background: #ffffff;
        }

        .vw-btn {
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

        .vw-btn:hover {
          background: #265040;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(47, 95, 74, 0.35);
        }

        .vw-btn:active {
          transform: translateY(0);
        }

        /* --- Gallery --- */
        .vw-gallery {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 0.5rem;
          margin-top: 2rem;
          border-radius: 14px;
          overflow: hidden;
        }

        .vw-gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
        }

        .vw-gallery-item:first-child {
          grid-row: 1 / 3;
        }

        .vw-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .vw-gallery-item:hover img {
          transform: scale(1.05);
        }

        .vw-gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.35) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .vw-gallery-label {
          position: absolute;
          bottom: 0.6rem;
          left: 0.75rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @media (min-width: 768px) {
          .vw-content h1 {
            font-size: 3rem;
          }
        }
      `}</style>

      <div className="vw-page">
        <div className="vw-container">
          {/* Left — Content */}
          <div className="vw-content">
            <h1>
              Grow your venue&apos;s <span>reach</span>.
            </h1>
            <p>
              List your property on Weddly to connect with couples and planners
              looking for the perfect space.
            </p>

            <ul className="vw-features">
              <li className="vw-feature">
                <span className="vw-feature-dot" />
                Reach thousands of engaged couples nearby
              </li>
              <li className="vw-feature">
                <span className="vw-feature-dot" />
                Manage bookings and availability in one place
              </li>
              <li className="vw-feature">
                <span className="vw-feature-dot" />
                Connect with top-tier wedding specialists
              </li>
            </ul>

            {/* Venue Gallery */}
            <div className="vw-gallery">
              <div className="vw-gallery-item">
                <img src="/images/venue/venue-ballroom.png" alt="Luxury ballroom with chandeliers" />
                <div className="vw-gallery-overlay" />
                <span className="vw-gallery-label">Grand Ballroom</span>
              </div>
              <div className="vw-gallery-item">
                <img src="/images/venue/venue-garden.png" alt="Outdoor garden ceremony" />
                <div className="vw-gallery-overlay" />
                <span className="vw-gallery-label">Garden Ceremony</span>
              </div>
              <div className="vw-gallery-item">
                <img src="/images/venue/venue-reception.png" alt="Elegant reception dinner" />
                <div className="vw-gallery-overlay" />
                <span className="vw-gallery-label">Reception Dinner</span>
              </div>
            </div>
          </div>

          {/* Right — Form Card */}
          <div className="vw-card">
            <div className="vw-card-title">Get Started</div>
            <p className="vw-card-sub">
              Tell us about your venue to begin.
            </p>

            <div className="vw-field">
              <label className="vw-label">Venue Name</label>
              <input
                type="text"
                className="vw-input"
                placeholder="e.g. The Grand Ballroom"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>

            <div className="vw-field">
              <label className="vw-label">Location</label>
              <input
                type="text"
                className="vw-input"
                placeholder="e.g. Kathmandu, Nepal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="vw-btn"
              onClick={() => {
                const params = new URLSearchParams();
                if (venueName) params.set("name", venueName);
                if (location) params.set("location", location);
                const qs = params.toString();
                router.push(`/signup/venue/${id}${qs ? `?${qs}` : ""}`);
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

export default VenueWelcome;
