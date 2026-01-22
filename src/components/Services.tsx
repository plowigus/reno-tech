"use client";
import { Cpu, Navigation, Key, Zap, Fuel, Package } from "lucide-react";

export function Services() {
  const services = [
    {
      title: "Programowanie Sterowników",
      description: "Aktualizacje i reprogi sterowników w Renault i Dacia",
      icon: Cpu,
    },
    {
      title: "Nawigacje i Multimedia",
      description: "Aktualizacja map, Android Auto, CarPlay",
      icon: Navigation,
    },
    {
      title: "Karty Hands Free",
      description: "Kodowanie i dorabianie kart dostępu",
      icon: Key,
    },
    {
      title: "Diagnostyka",
      description: "Kompleksowa diagnostyka i naprawa elektryki",
      icon: Zap,
    },
    {
      title: "Chip Tuning",
      description: "Zwiększenie mocy lub optymalizacja zużycia",
      icon: Fuel,
    },
    {
      title: "Doposażenie",
      description: "Kamery, czujniki, LED i akcesoria",
      icon: Package,
    },
  ];

  return (
    <section className=" p-4 md:p-8 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-2 border-black p-6 md:p-8 mb-8 text-center">
          <div className="text-3xl md:text-5xl lg:text-7xl font-bold mb-2">
            USŁUGI
          </div>
          <div className="text-sm md:text-base border border-black p-2 inline-block">
            Kompleksowa obsługa elektroniki w Twoim Renault
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="border-2 border-black p-4 md:p-6">
                <div className=" w-12 h-12 mb-4 flex items-center justify-center">
                  <IconComponent size={24} />
                </div>
                <div className=" p-2 mb-3 text-lg md:text-xl font-bold">
                  {service.title}
                </div>
                <div className=" p-2 text-sm md:text-base">
                  {service.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
