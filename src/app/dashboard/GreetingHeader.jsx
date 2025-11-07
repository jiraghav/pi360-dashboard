"use client";

export default function GreetingHeader({ userName, loading }) {
  if (loading) {
    return (
      <section className="text-center md:text-left mb-6 animate-pulse">
        <div className="h-7 bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-48"></div>
      </section>
    );
  }

  if (!userName) return null;

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <section className="text-center md:text-left mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-white">
        {greeting}, {userName}
      </h1>
      <p className="text-gray-400 mt-1">
        Welcome to your command center
      </p>
    </section>
  );
}
