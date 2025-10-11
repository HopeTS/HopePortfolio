import React, { useState, useEffect, useRef } from "react";

import styles from "./index.module.css";
import * as C from "@components";

function getBreakpoint(w) {
  if (w < 768) return "phone";
  if (w < 1200) return "tablet";
  return "desktop";
}

function getVantaConfig() {
  const w = window.innerWidth;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  const bp = getBreakpoint(w);

  // Base per-breakpoint
  var points = bp === "desktop" ? 20 : bp === "tablet" ? 16 : 12;
  var maxDistance = bp === "desktop" ? 22 : bp === "tablet" ? 20 : 16;
  var spacing = bp === "desktop" ? 14 : bp === "tablet" ? 15 : 16;

  // Soften on very high-DPI devices
  var dprFactor = Math.min(1, 1.25 / dpr);
  points = Math.max(4, Math.round(points * dprFactor));
  maxDistance = Math.max(10, Math.round(maxDistance * dprFactor));

  return {
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    scale: 1.2,
    zoom: 1.2,
    scaleMobile: 1.0,
    backgroundColor: 0x2b3137,
    color: 0x2dba4e,
    points: points,
    maxDistance: maxDistance,
    spacing: spacing,
    chaos: 10.0,
  };
}

export const AnimatedBackground = (fadeDown = true) => {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (effectRef.current) {
      effectRef.current.destroy();
      effectRef.current = null;
    }

    if (!vantaEffect && window.VANTA && window.VANTA.NET) {
      effectRef.current = window.VANTA.NET({
        el: vantaRef.current,
        ...getVantaConfig(),
      });
      setVantaEffect(effectRef.current);
    }

    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <C.Content.Outer className={styles.AnimatedBackground}>
      <div className={styles.AnimatedBackground_content} ref={vantaRef} />
      {fadeDown && <div className={styles.AnimatedBackground_fade} />}
    </C.Content.Outer>
  );
};

export default AnimatedBackground;
