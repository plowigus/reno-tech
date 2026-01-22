"use client";

import Navbar from "./Navbar";

export function Hero() {
  return (
    <section className="min-h-screen relative bg-black z-10  p-4 md:p-8 text-white">
      <Navbar />
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] flex flex-col justify-center items-center text-center">
        <div className=" p-8 md:p-16 mb-8 w-full max-w-4xl">
          <div className=" px-4 py-2 mb-4 text-4xl md:text-6xl lg:text-8xl font-bold">
            RENOTECH
          </div>
          <div className=" px-4 py-1 text-lg md:text-2xl">
            Specjaliści od elektroniki samochodów Renault i Dacia
          </div>
        </div>
      </div>
    </section>
  );
}
