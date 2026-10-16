"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Native drag events do not consistently scroll the document across browsers. */
export function useTierDragScroll() {
  const active = useRef(false);
  const pointerY = useRef(0);
  const frame = useRef(0);
  const lastTime = useRef(0);
  const [dragging, setDragging] = useState(false);
  const stop = useCallback(() => {
    active.current = false;
    cancelAnimationFrame(frame.current);
    setDragging(false);
  }, []);
  useEffect(() => {
    function tick(time: number) {
      if (!active.current) return;
      const delta = Math.min(32, time - lastTime.current || 16);
      lastTime.current = time;
      const top = innerWidth <= 1024 ? 64 : 0;
      const edge = Math.min(120, innerHeight / 5);
      const y = pointerY.current;
      const direction = y < top + edge
        ? -Math.min(1, Math.max(0, (top + edge - y) / edge))
        : y > innerHeight - edge
          ? Math.min(1, (y - innerHeight + edge) / edge)
          : 0;
      if (direction) window.scrollBy({ top: direction * delta * 1.1, behavior: "instant" });
      frame.current = requestAnimationFrame(tick);
    }
    function over(event: DragEvent) {
      if (!active.current) return;
      event.preventDefault();
      pointerY.current = event.clientY;
      if (!frame.current) {
        lastTime.current = performance.now();
        frame.current = requestAnimationFrame(tick);
      }
    }
    const end = () => { stop(); frame.current = 0; };
    window.addEventListener("dragover", over, { capture: true });
    window.addEventListener("dragend", end);
    window.addEventListener("drop", end);
    window.addEventListener("blur", end);
    return () => {
      active.current = false;
      cancelAnimationFrame(frame.current);
      window.removeEventListener("dragover", over, { capture: true });
      window.removeEventListener("dragend", end);
      window.removeEventListener("drop", end);
      window.removeEventListener("blur", end);
    };
  }, [stop]);
  return {
    dragging,
    start: (y: number) => { active.current = true; pointerY.current = y; frame.current = 0; setDragging(true); },
    stop,
  };
}
