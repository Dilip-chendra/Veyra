import React from "react";

export interface CompanyLogoProps {
  className?: string;
  size?: number;
}

// 1. Google (Official Multi-Color 'G' + 'Google' Wordmark)
export const GoogleLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 100 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 4)">
      <path d="M12 23.5c6.35 0 11.68-4.22 11.68-11.75 0-.82-.07-1.61-.2-2.38H12v4.51h6.64c-.29 1.5-1.15 2.77-2.45 3.62v2.98h3.94C22.44 18.35 23.68 15.2 23.68 11.75 23.68 11.05 23.62 10.38 23.48 9.75H12V5.24h11.48C23.48 5.24 23.68 11.75 23.68 11.75z" fill="none"/>
      <path d="M23.48 9.75H12v4.51h6.64c-.29 1.5-1.15 2.77-2.45 3.62l3.94 3.05c2.31-2.13 3.65-5.27 3.65-9.18 0-.69-.06-1.36-.19-2z" fill="#4285F4"/>
      <path d="M12 23.5c3.24 0 5.96-1.07 7.95-2.91l-3.94-3.05c-1.08.72-2.46 1.15-4.01 1.15-3.09 0-5.71-2.09-6.65-4.9H1.27v3.15C3.31 20.9 7.37 23.5 12 23.5z" fill="#34A853"/>
      <path d="M5.35 13.79c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.06H1.27C.46 7.67 0 9.48 0 11.5s.46 3.83 1.27 5.44l4.08-3.15z" fill="#FBBC05"/>
      <path d="M12 4.19c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95.84 15.23 0 12 0 7.37 0 3.31 2.6 1.27 6.06l4.08 3.15c.94-2.81 3.56-4.9 6.65-4.9z" fill="#EA4335"/>
    </g>
    <text x="32" y="22" fill="#E2E8F0" fontSize="18" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5px">Google</text>
  </svg>
);

// 2. Microsoft (Official 4-Color Square + 'Microsoft')
export const MicrosoftLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 120 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 6)">
      <rect x="0" y="0" width="9.5" height="9.5" fill="#F25022" />
      <rect x="11" y="0" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="0" y="11" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="11" y="11" width="9.5" height="9.5" fill="#FFB900" />
    </g>
    <text x="30" y="22" fill="#E2E8F0" fontSize="17" fontWeight="600" fontFamily="Segoe UI, system-ui, sans-serif" letterSpacing="-0.3px">Microsoft</text>
  </svg>
);

// 3. Amazon (Official Amazon Wordmark + Orange Smile Arrow)
export const AmazonLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 110 34" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="2" y="21" fill="#FFFFFF" fontSize="21" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.8px">amazon</text>
    <path d="M10 27c22 8 54 8 74-4" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M80 20l5 3-4 4" fill="none" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 4. Meta (Official Blue Infinity Ribbon + 'Meta')
export const MetaLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 95 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 6)">
      <path d="M14.6 2.3c-2.3 0-4.3 1.4-5.4 3.4C8.1 3.7 6.1 2.3 3.8 2.3 1.7 2.3 0 4 0 6.1c0 3.3 2.7 6 6 6 2.3 0 4.3-1.4 5.4-3.4 1.1 2 3.1 3.4 5.4 3.4 3.3 0 6-2.7 6-6 0-2.1-1.7-3.8-3.8-3.8zm-10.8 7.6c-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8c1.6 0 3 1 3.6 2.4-.6 1.4-1.8 2.4-3.6 2.4zm10.8 0c-1.8 0-3-1-3.6-2.4.6-1.4 2-2.4 3.6-2.4 2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8z" fill="#0081FB" transform="scale(1.2)"/>
    </g>
    <text x="36" y="22" fill="#E2E8F0" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.4px">Meta</text>
  </svg>
);

// 5. Apple (Official Apple Silhouette)
export const AppleLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 85 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M15.2 16.5c-.7 1-1.4 2-2.5 2-1.1 0-1.4-.7-2.7-.7-1.3 0-1.7.7-2.7.7-1.1 0-1.9-1.1-2.6-2.1C3.5 14.4 2.4 10.7 3.9 8.2c.7-1.3 2-2.1 3.4-2.1 1.1 0 2.1.7 2.7.7.6 0 1.9-.9 3.2-.8.6 0 2.1.2 3.1 1.7-.1.1-1.8 1.1-1.8 3.2 0 2.5 2.2 3.4 2.2 3.4-.1.1-.3 1.2-1.1 2.2zM12.9 5.8c.6-.7 1-1.7.9-2.6-.9 0-1.8.6-2.4 1.3-.5.6-1 1.6-.9 2.5 1 .1 1.8-.5 2.4-1.2z" fill="#FFFFFF" transform="scale(1.15) translate(-1, 0)"/>
    <text x="28" y="22" fill="#E2E8F0" fontSize="18" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.3px">Apple</text>
  </svg>
);

// 6. NVIDIA (Official Green Eye Logo + 'NVIDIA')
export const NvidiaLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 110 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 5)">
      <path d="M9.8 16.2c-4.2 0-7.8-3.4-7.8-7.6 0-3.6 2.5-6.6 6-7.4v2.2C5.7 4 4 6 4 8.6c0 3.2 2.6 5.8 5.8 5.8 2.2 0 4.1-1.2 5.1-3h2.3c-1.2 3-4.1 4.8-7.4 4.8zm0-4.3c-1.8 0-3.3-1.5-3.3-3.3 0-1.8 1.5-3.3 3.3-3.3 1.4 0 2.6.9 3 2.2h2.2c-.5-2.5-2.6-4.4-5.2-4.4-2.9 0-5.3 2.4-5.3 5.3s2.4 5.3 5.3 5.3c2 0 3.7-1.1 4.6-2.7H17c-.9 2.3-3 3.9-5.4 3.9z" fill="#76B900" transform="scale(1.2)"/>
    </g>
    <text x="32" y="22" fill="#E2E8F0" fontSize="17" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5px">NVIDIA</text>
  </svg>
);

// 7. Netflix (Official Red Curved Wordmark)
export const NetflixLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 95 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="23" fill="#E50914" fontSize="20" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif" letterSpacing="2px">NETFLIX</text>
  </svg>
);

// 8. OpenAI (Official Rosette + 'OpenAI')
export const OpenAILogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 115 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 5)">
      <path d="M19.8 8.4a5.3 5.3 0 0 0-.5-4.4 5.4 5.4 0 0 0-4.1-2.6 5.4 5.4 0 0 0-4.2.8 5.4 5.4 0 0 0-3.7 2.6 5.4 5.4 0 0 0-.5 4.4 5.4 5.4 0 0 0-2.2 4.1 5.4 5.4 0 0 0 1.2 4.4 5.4 5.4 0 0 0 4.1 2.6 5.4 5.4 0 0 0 4.2-.8 5.4 5.4 0 0 0 3.7-2.6 5.4 5.4 0 0 0 .5-4.4 5.4 5.4 0 0 0 2.2-4.1 5.4 5.4 0 0 0-1.2-4.4zM10.7 20a4 4 0 0 1-3.2 0 4 4 0 0 1-1.2-.8l1.2-2.1a2.6 2.6 0 0 0 2.1 1.2 2.6 2.6 0 0 0 2.5-1.7l1.4.8a4 4 0 0 1-2.8 2.6zM5.3 18a4 4 0 0 1-2.3-2.3 4 4 0 0 1 0-3.3l2.1 1.2a2.6 2.6 0 0 0 0 2.4 2.6 2.6 0 0 0 2.1 1.5l-.8 1.4a4 4 0 0 1-1.1-.9zM3 11.4a4 4 0 0 1 1-3.1 4 4 0 0 1 3.2-.9l-1.2 2.1a2.6 2.6 0 0 0-2.1 1.2 2.6 2.6 0 0 0-.4 2.6l-1.4-.8a4 4 0 0 1 .9-1.1zm9.5-2.5a4 4 0 0 1 2.3 2.3 4 4 0 0 1 0 3.3l-2.1-1.2a2.6 2.6 0 0 0 0-2.4 2.6 2.6 0 0 0-2.1-1.5l.8-1.4a4 4 0 0 1 1.1.9zm2.2 6.6a4 4 0 0 1-1 3.1 4 4 0 0 1-3.2.9l1.2-2.1a2.6 2.6 0 0 0 2.1-1.2 2.6 2.6 0 0 0 .4-2.6l1.4.8a4 4 0 0 1-.9 1.1zm-4.1-2.2a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" fill="#FFFFFF"/>
    </g>
    <text x="28" y="22" fill="#E2E8F0" fontSize="18" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.3px">OpenAI</text>
  </svg>
);

// 9. Stripe (Official Slanted 'stripe' Wordmark)
export const StripeLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 85 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="2" y="23" fill="#635BFF" fontSize="23" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.8px">stripe</text>
  </svg>
);

// 10. Spotify (Official Green Soundwaves + 'Spotify')
export const SpotifyLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 115 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 5)">
      <circle cx="11" cy="11" r="11" fill="#1DB954" />
      <path d="M16.5 7.8c-2.8-.7-6.2-.4-8.7.9-.4.2-.6.7-.4 1.1.2.4.7.6 1.1.4 2.2-1.1 5.3-1.4 7.7-.8.5.1.9-.2 1-.7.2-.5-.2-.9-.7-.9zm-.7 3.3c-2.4-.6-5.3-.3-7.4.8-.4.2-.5.6-.3 1 .2.4.6.5 1 .3 1.8-1 4.4-1.2 6.5-.7.4.1.8-.2.9-.6.1-.4-.2-.8-.7-.8zm-.8 3.3c-2-.5-4.4-.3-6.1.6-.3.2-.4.5-.2.8.2.3.5.4.8.2 1.5-.7 3.6-.9 5.3-.5.3.1.7-.1.7-.5.1-.3-.1-.6-.5-.6z" fill="#06070d"/>
    </g>
    <text x="30" y="22" fill="#E2E8F0" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.4px">Spotify</text>
  </svg>
);

// 11. Uber (Official Bold 'Uber' Wordmark)
export const UberLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 75 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="2" y="23" fill="#FFFFFF" fontSize="23" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5px">Uber</text>
  </svg>
);

// 12. Airbnb (Official Coral Bélo + 'airbnb')
export const AirbnbLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 115 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 4)">
      <path d="M11 1.5c-3.5 0-6 2.5-6 6.5 0 4.5 4.5 9 6 12 1.5-3 6-7.5 6-12 0-4-2.5-6.5-6-6.5zm0 15c-1.8 0-3.2-1.4-3.2-3.2s1.4-3.2 3.2-3.2 3.2 1.4 3.2 3.2-1.4 3.2-3.2 3.2z" fill="#FF5A5F" />
    </g>
    <text x="28" y="22" fill="#E2E8F0" fontSize="19" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.6px">airbnb</text>
  </svg>
);

// 13. GitHub (Official Octocat + 'GitHub')
export const GitHubLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 115 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 4)">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-1.99 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.72 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" fill="#FFFFFF"/>
    </g>
    <text x="30" y="22" fill="#E2E8F0" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.3px">GitHub</text>
  </svg>
);

// 14. LinkedIn (Official Blue 'in' + 'LinkedIn')
export const LinkedInLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 120 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 5)">
      <rect x="0" y="0" width="22" height="22" rx="4" fill="#0A66C2" />
      <path d="M5.5 8.5h2.5V17H5.5V8.5zm1.3-4.2c.8 0 1.5.6 1.5 1.4 0 .8-.7 1.4-1.5 1.4s-1.4-.6-1.4-1.4c0-.8.6-1.4 1.4-1.4zm5.7 4.2h2.4v1.2h.1c.3-.7 1.3-1.4 2.6-1.4 2.8 0 3.3 1.8 3.3 4.2V17h-2.5v-3.8c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2v3.9h-2.5V8.5z" fill="#FFFFFF"/>
    </g>
    <text x="30" y="22" fill="#E2E8F0" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.3px">LinkedIn</text>
  </svg>
);

// 15. Salesforce (Official Blue Cloud + 'salesforce')
export const SalesforceLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 135 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 4)">
      <path d="M10 2a6 6 0 0 1 5.5 3.6 4.5 4.5 0 0 1 4.5 4.4c0 .3 0 .6-.1.8A5 5 0 0 1 18 20H5a5 5 0 0 1-1.5-9.7A6 6 0 0 1 10 2z" fill="#00A1E0" />
    </g>
    <text x="26" y="22" fill="#E2E8F0" fontSize="17" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.4px">salesforce</text>
  </svg>
);

// 16. Adobe (Official Red 'A' Square + 'Adobe')
export const AdobeLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 100 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 5)">
      <rect width="22" height="22" rx="3" fill="#FA0F00" />
      <path d="M13.8 4.5L18 17.5h-3.2l-1.4-4.5H9.8l2.5-7.5h1.5zM8.2 4.5L4 17.5h3.2l1.4-4.5h3.6l-4-8.5z" fill="#FFFFFF" />
    </g>
    <text x="30" y="22" fill="#E2E8F0" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.3px">Adobe</text>
  </svg>
);

// 17. Cisco (Official Wave Bridge + 'cisco')
export const CiscoLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 95 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 6)" fill="#049FD9">
      <rect x="0" y="8" width="2" height="6" rx="1"/>
      <rect x="4" y="4" width="2" height="10" rx="1"/>
      <rect x="8" y="0" width="2" height="14" rx="1"/>
      <rect x="12" y="4" width="2" height="10" rx="1"/>
      <rect x="16" y="8" width="2" height="6" rx="1"/>
    </g>
    <text x="26" y="22" fill="#E2E8F0" fontSize="18" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5px">cisco</text>
  </svg>
);

// 18. Oracle (Official Red Oval + 'ORACLE')
export const OracleLogo: React.FC<CompanyLogoProps> = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="0 0 110 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 7)">
      <rect x="0" y="0" width="18" height="18" rx="9" fill="none" stroke="#C74634" strokeWidth="4"/>
    </g>
    <text x="26" y="22" fill="#C74634" fontSize="18" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="1px">ORACLE</text>
  </svg>
);
