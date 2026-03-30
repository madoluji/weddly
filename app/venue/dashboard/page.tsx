"use client";

import { useAuth } from "@/app/providers";

const VenueDashboard = () => {
  const { session } = useAuth();
  const userName = session?.user?.name || "Venue Manager";

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap");

        .vd-page {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          padding: 2rem 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .vd-header {
          margin-bottom: 2.5rem;
        }

        .vd-greeting {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.4rem;
        }

        .vd-greeting span {
          color: #2f5f4a;
        }

        .vd-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .vd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .vd-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.75rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .vd-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .vd-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          background: #e6f0eb;
        }

        .vd-card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.35rem;
        }

        .vd-card-value {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #2f5f4a;
          margin: 0 0 0.25rem;
        }

        .vd-card-desc {
          font-size: 0.85rem;
          color: #9ca3af;
          margin: 0;
          line-height: 1.4;
        }

        .vd-section-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 2.5rem 0 1rem;
        }

        .vd-inbox {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
        }

        .vd-inbox-empty {
          padding: 3rem 2rem;
          text-align: center;
          color: #9ca3af;
          font-size: 0.95rem;
        }

        .vd-inbox-empty span {
          display: block;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <div className="vd-page">
        <div className="vd-header">
          <h1 className="vd-greeting">
            Welcome, <span>{userName}</span>
          </h1>
          <p className="vd-subtitle">
            Manage your venue, track inquiries, and connect with wedding professionals.
          </p>
        </div>

        <div className="vd-grid">
          <div className="vd-card">
            <div className="vd-card-icon">🏰</div>
            <p className="vd-card-title">Venue Name</p>
            <p className="vd-card-value">—</p>
            <p className="vd-card-desc">Your venue name will appear here once configured.</p>
          </div>

          <div className="vd-card">
            <div className="vd-card-icon">👥</div>
            <p className="vd-card-title">Max Capacity</p>
            <p className="vd-card-value">—</p>
            <p className="vd-card-desc">Set the maximum guest capacity for your space.</p>
          </div>

          <div className="vd-card">
            <div className="vd-card-icon">📍</div>
            <p className="vd-card-title">Location</p>
            <p className="vd-card-value">—</p>
            <p className="vd-card-desc">Your venue address will display here.</p>
          </div>

          <div className="vd-card">
            <div className="vd-card-icon">📬</div>
            <p className="vd-card-title">Inquiry Inbox</p>
            <p className="vd-card-value">0</p>
            <p className="vd-card-desc">New inquiries from couples and planners.</p>
          </div>
        </div>

        <h2 className="vd-section-title">Recent Inquiries</h2>
        <div className="vd-inbox">
          <div className="vd-inbox-empty">
            <span>📭</span>
            No inquiries yet. Once your venue is listed, inquiries will appear here.
          </div>
        </div>
      </div>
    </>
  );
};

export default VenueDashboard;
