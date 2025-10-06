import React, { useState, useEffect, useRef } from "react";

import styles from "./index.module.css";
import * as C from "@components";

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
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        scale: 1.5,
        zoom: 1.5,
        scaleMobile: 1.3,
        backgroundColor: 0x2b3137,
        color: 0x2dba4e,
        points: 20.0,
        maxDistance: 22.0,
        chaos: 10.0,
      });
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
