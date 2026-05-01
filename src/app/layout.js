import AppShell from "./AppShell";

export const metadata = {
  applicationName: "PI360",
  title: {
    default: "PI360",
    template: "%s | PI360",
  },
  description: "Complete Injury Centers — PI360 dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PI360",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f16" },
    { media: "(prefers-color-scheme: light)", color: "#0b0f16" },
  ],
};

const tailwindConfigInline = `
tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: '#0b0f16',
        card: '#0e1420',
        stroke: '#1b2534',
        ink: '#e6edf3',
        mute: '#9aa8bd',
        sky: { 500: '#38bdf8', 400:'#60c5fa' },
        mint: { 500: '#34d399' },
        grape: { 500: '#a78bfa' },
        amber: { 500: '#f59e0b' },
        rose: { 500: '#f87171' },
      }
    }
  }
}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink antialiased">
        {/* Sync load preserves original behavior: config runs after Tailwind runtime exists */}
        <script src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: tailwindConfigInline,
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
