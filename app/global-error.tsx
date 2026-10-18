"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "1.5rem",
          textAlign: "center",
          background: "#f8f8fb",
          color: "#141625",
          fontFamily:
            "'League Spartan', Arial, Helvetica, sans-serif",
        }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: "4rem",
            height: "4rem",
            borderRadius: "9999px",
            background: "rgba(236, 87, 90, 0.1)",
            color: "#ec575a",
            fontSize: "32px",
            fontWeight: 700,
          }}
          aria-hidden="true">
          !
        </span>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h1>
        <p
          style={{
            maxWidth: "28rem",
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1.6,
            color: "#888eb2",
          }}>
          A critical error occurred. Reload the page to try again, and if the
          problem continues, please contact support.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            height: "3rem",
            padding: "0 1.5rem",
            border: "none",
            borderRadius: "9999px",
            background: "#7c5dfa",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}>
          Reload
        </button>
      </body>
    </html>
  );
}
