"use client";
import React, { useEffect, useRef, useState } from "react";

/**
 * Envuelve cualquier visualización y activa scroll-x si se desborda
 * respecto del ancho disponible del mensaje. Se adapta en vivo con ResizeObserver.
 */
export function MessageVisual({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const checkOverflow = () => {
      const allowed = wrapper.clientWidth;  // ancho disponible del mensaje
      const actual = content.scrollWidth;   // ancho real del contenido
      setIsOverflowing(actual > allowed);
    };

    // medición inicial y en cada cambio de tamaño del wrapper o del contenido
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(wrapper);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`max-w-full ${isOverflowing ? "overflow-x-auto" : "overflow-x-visible"}`}
      style={{
        WebkitOverflowScrolling: "touch", // scroll suave en iOS
        scrollBehavior: "smooth",         // scroll suave en navegadores modernos
      }}
    >
      {/* inline-block = respeta el ancho natural del hijo */}
      <div ref={contentRef} className="inline-block">{children}</div>
    </div>
  );
}

export default MessageVisual;

