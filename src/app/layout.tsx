import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ChatWidget from "@/components/chat/ChatWidget";
import CartPanel from "@/components/cart/CartPanel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Virtual Clothing Try-On",
  description: "Try on clothes virtually with our 3D avatar technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-blue-600">Virtual Clothing</h1>
                  </div>
                  <nav className="hidden md:flex space-x-8">
                    <a href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                      Home
                    </a>
                    <a href="/catalog" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                      Catalog
                    </a>
                    <a href="/favorites" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                      Favorites
                    </a>
                  </nav>
                </div>
              </div>
            </header>
            
            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-white border-t">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Virtual Clothing. All rights reserved.
                  </p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                      Terms
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                      Privacy
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </footer>
            
            {/* Chat widget */}
            <ChatWidget />
            
            {/* Cart panel */}
            <CartPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}
