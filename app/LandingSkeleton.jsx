// app/components/LandingSkeleton.jsx
"use client";

import React from "react";

export default function LandingSkeleton() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-banner"></div>
      <div className="skeleton-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
      </div>

      <style jsx>{`
        .skeleton-wrapper {
          width: 100%;
          min-height: 100vh;
          background-color: #fafafa; /* 화이트아웃 방지용 배경색 */
          padding-top: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .skeleton-banner {
          width: 90%;
          max-width: 1200px;
          height: 450px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite ease-in-out;
          border-radius: 20px;
          margin-bottom: 50px;
        }
        .skeleton-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .skeleton-line {
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
        }
        .skeleton-line.short { width: 150px; }
        .skeleton-line.medium { width: 300px; }
        .skeleton-line.long { width: 450px; }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}