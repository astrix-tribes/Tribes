import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "./components/WalletProvider";
import { PostsProvider } from "../context/PostsContext";
import { EventsProvider } from "../context/EventsContext";
import { ProfileProvider } from "../context/ProfileContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fuse Tribe",
  description: "Decentralized communities on Fuse Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <PostsProvider>
            <EventsProvider>
              <ProfileProvider>
                {children}
              </ProfileProvider>
            </EventsProvider>
          </PostsProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
