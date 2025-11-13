import React, { useRef } from "react";

export default function Carousel({ children }) {
  const containerRef = useRef(null);

  const scrollLeft = () => {
    containerRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Items */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-hidden snap-x snap-mandatory scroll-smooth pb-6"
      >
        {children}
      </div>

      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
      >
        ◀
      </button>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
      >
        ▶
      </button>
    </div>
  );
}
