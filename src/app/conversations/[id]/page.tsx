import type { Metadata } from "next";
import { db } from "@/lib/db";
import { verifyConversationSignature } from "@/lib/chat-token";

export const metadata: Metadata = {
  title: "Conversation | Huddle Duck",
  robots: { index: false, follow: false },
};

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}

function parseTranscript(raw: string): { role: string; content: string }[] {
  return raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const colonIdx = line.indexOf(": ");
      if (colonIdx === -1) return { role: "system", content: line };
      return {
        role: line.slice(0, colonIdx).trim(),
        content: line.slice(colonIdx + 2).trim(),
      };
    });
}

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sig?: string }>;
}) {
  const { id } = await params;
  const { sig } = await searchParams;

  if (!sig || !verifyConversationSignature(id, sig)) {
    return (
      <main
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary)",
          fontFamily: "var(--font-primary)",
        }}
      >
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 16px" }}>
            Access denied
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, margin: 0 }}>
            This link is invalid or has expired.
          </p>
        </div>
      </main>
    );
  }

  const result = await db.execute({
    sql: "SELECT * FROM conversations WHERE conversation_id = ? LIMIT 1",
    args: [id],
  });

  if (result.rows.length === 0) {
    return (
      <main
        style={{
          background: "var(--black)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <h1
            style={{
              color: "var(--text-primary)",
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 900,
              fontFamily: "var(--font-heading)",
              margin: "0 0 12px",
            }}
          >
            Conversation not found
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, margin: "0 0 32px" }}>
            This conversation may have expired or the link is invalid.
          </p>
        </div>
      </main>
    );
  }

  const row = result.rows[0];
  const businessName = row.business_name as string;
  const visitorRole = row.visitor_role as string;
  const locationCount = row.location_count as string;
  const conversationOutcome = row.conversation_outcome as string;
  const durationSecs = row.duration_secs as number;
  const mainChallenge = row.main_challenge as string;
  const objectionsRaised = row.objections_raised as string;
  const transcript = row.transcript as string;
  const conversationId = row.conversation_id as string;

  const messages = parseTranscript(transcript);

  return (
    <main style={{ background: "var(--black)", minHeight: "100vh", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Metadata card */}
        <div
          style={{
            background: "var(--black-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              color: "var(--text-primary)",
              fontSize: 24,
              fontWeight: 900,
              fontFamily: "var(--font-heading)",
              margin: "0 0 16px",
            }}
          >
            {businessName || "Conversation"}
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
            {visitorRole && (
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Role
                </span>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
                  {visitorRole}
                </p>
              </div>
            )}
            {locationCount && (
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Locations
                </span>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
                  {locationCount}
                </p>
              </div>
            )}
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Outcome
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
                {conversationOutcome || "Unknown"}
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Duration
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
                {formatDuration(durationSecs)}
              </p>
            </div>
          </div>

          {mainChallenge && (
            <div style={{ marginTop: 16 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Main Challenge
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
                {mainChallenge}
              </p>
            </div>
          )}

          {objectionsRaised && (
            <div style={{ marginTop: 12 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Objections
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "4px 0 0" }}>
                {objectionsRaised}
              </p>
            </div>
          )}
        </div>

        {/* Transcript */}
        <div
          style={{
            background: "var(--black-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h2
            style={{
              color: "var(--text-primary)",
              fontSize: 16,
              fontWeight: 700,
              margin: "0 0 20px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Transcript
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => {
              const isAgent = msg.role === "assistant";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isAgent ? "flex-start" : "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isAgent ? "var(--viridian)" : "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 4,
                    }}
                  >
                    {isAgent ? "AI Agent" : "Visitor"}
                  </span>
                  <div
                    style={{
                      background: isAgent ? "rgba(30, 186, 143, 0.08)" : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${isAgent ? "rgba(30, 186, 143, 0.15)" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: "12px 16px",
                      maxWidth: "85%",
                    }}
                  >
                    <p
                      style={{
                        color: "var(--text-primary)",
                        fontSize: 14,
                        lineHeight: 1.6,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", marginTop: 24 }}>
          Conversation ID: {conversationId}
        </p>
      </div>
    </main>
  );
}
