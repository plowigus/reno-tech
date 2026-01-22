export function Services() {
  const services = [
    {
      title: "Programowanie Sterowników",
      description: "Aktualizacje i reprogi sterowników w Renault i Dacia",
    },
    {
      title: "Nawigacje i Multimedia",
      description: "Aktualizacja map, Android Auto, CarPlay",
    },
    {
      title: "Karty Hands Free",
      description: "Kodowanie i dorabianie kart dostępu",
    },
    {
      title: "Diagnostyka",
      description: "Kompleksowa diagnostyka i naprawa elektryki",
    },
    {
      title: "Chip Tuning",
      description: "Zwiększenie mocy lub optymalizacja zużycia",
    },
    {
      title: "Doposażenie",
      description: "Kamery, czujniki, LED i akcesoria",
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
          {services.map((service, index) => (
            <div key={index} className="border-2 border-black p-4 md:p-6">
              <div className="border border-black w-12 h-12 mb-4 flex items-center justify-center">
                ICON
              </div>
              <div className="border border-black p-2 mb-3 text-lg md:text-xl font-bold">
                {service.title}
              </div>
              <div className="border border-black p-2 text-sm md:text-base">
                {service.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
