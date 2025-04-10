import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Distinction</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/signin"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Transform Your Construction</span>
                <span className="block text-blue-600">Management with AI</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Streamline your construction projects with AI-powered insights, automated scheduling, and real-time collaboration.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Start Free Trial
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/demo"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Request Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 dark:bg-gray-800 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI-Powered Insights</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-300">
                  Get predictive analytics and intelligent recommendations for your construction projects.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Real-time Collaboration</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-300">
                  Connect your team with instant updates and seamless communication tools.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Automated Scheduling</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-300">
                  Optimize your project timeline with AI-driven scheduling and resource allocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 Distinction. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
