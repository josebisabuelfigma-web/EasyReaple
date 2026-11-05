"use client";

import { useEffect, useRef, useState } from "react";

type T = { id: string; name: string; city: string; rating: number; text: string };

export default function TestimonialSlider({ items }: { items: T[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = useRef(items.length);
  count.current = items.length;

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % count.current), 5000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className="testimonial-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="testimonial-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((t) => (
          <div className="testimonial-card" key={t.id}>
            <div className="testimonial-stars">
              {Array.from({ length: t.rating }).map((_, i) => (
                <i key={i} className="fa-solid fa-star"></i>
              ))}
            </div>
            <p>&ldquo;{t.text}&rdquo;</p>
            <h4>{t.name}</h4>
            <span>{t.city}</span>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="testimonial-dots">
          {items.map((t, i) => (
            <button
              key={t.id}
              className={`testimonial-dot${i === current ? " active" : ""}`}
              aria-label={`Testimonio ${i + 1}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
