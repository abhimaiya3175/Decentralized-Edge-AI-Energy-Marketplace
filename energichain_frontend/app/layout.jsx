import "./globals.css";
import ClientProviders from "./components/ClientProviders";

export const metadata = {
  title: "EnergyChain — Decentralized P2P Renewable Energy Marketplace",
  description: "Secure, on-chain renewable energy trading, smart microgrid pre-booking, and edge AI load prediction.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--bg-canvas)] text-[var(--text-primary)]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
