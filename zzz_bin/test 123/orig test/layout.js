import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kansha Ai",
  description: "Classroom Management for the 21 Century",
};

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          🪲 NextJS 14 test
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/teams" className="text-white hover:text-gray-300">
              Teams
            </Link>
          </li>
          <li>
            <Link href="/games" className="text-white hover:text-gray-300">
              Games
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-white hover:text-gray-300">
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900`}>
        <Navbar />
        <main className="container mx-auto mt-4 p-4">{children}</main>
      </body>
    </html>
  );
}
