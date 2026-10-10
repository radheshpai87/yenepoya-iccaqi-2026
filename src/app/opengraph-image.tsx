import { ImageResponse } from 'next/og';

export const alt = 'ICCAQI 2026 | International Conference on Computing, AI, Quantum Intelligence and Future Technologies';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          backgroundColor: '#040914',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(124, 179, 5, 0.22) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(14, 165, 233, 0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid accent overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid rgba(255, 255, 255, 0.08)',
            margin: '20px',
            borderRadius: '24px',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header: University Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            paddingBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '1px',
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              Yenepoya (Deemed to be University)
            </span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#94a3b8',
                marginTop: '4px',
              }}
            >
              School of Engineering &amp; Technology • Mangaluru, Karnataka, India
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(124, 179, 5, 0.15)',
              border: '1px solid rgba(124, 179, 5, 0.4)',
              borderRadius: '9999px',
              padding: '8px 20px',
              color: '#bef264',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            NAAC A+ ACCREDITED
          </div>
        </div>

        {/* Center: Hero Conference Information */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '8px',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              HYBRID CONFERENCE • IN-PERSON &amp; VIRTUAL
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: '#fbbf24',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              SCOPUS PUBLICATION TRACK
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '16px',
            }}
          >
            <span
              style={{
                fontSize: '76px',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-2px',
                color: '#ffffff',
              }}
            >
              ICCAQI
            </span>
            <span
              style={{
                fontSize: '76px',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-2px',
                color: '#84cc16',
              }}
            >
              2026
            </span>
          </div>

          <p
            style={{
              fontSize: '22px',
              fontWeight: 600,
              lineHeight: 1.35,
              color: '#e2e8f0',
              maxWidth: '960px',
              margin: 0,
            }}
          >
            International Conference on Computing, Artificial Intelligence, Quantum Intelligence and Future Technologies
          </p>
        </div>

        {/* Bottom Bar: Highlights & Dates */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Conference Dates
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                November 25–26, 2026
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Submission Mode
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#84cc16', marginTop: '2px' }}>
                Online &amp; In-Person / Offline
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Host Venue
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                Mangaluru, India
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#84cc16',
              color: '#052e16',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '0.5px',
            }}
          >
            yenepoya.edu.in/iccaqi-2026
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
