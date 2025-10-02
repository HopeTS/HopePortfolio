import { useEffect, useState } from "react";

import styles from "./index.module.css";
import * as C from "@components";
import * as assets from "@assets";
import * as data from "@data";

// Convert data dictionary to list for timeline
let xp = [];
for (const key in data.XP) {
  xp.push(data.XP[key]);
}

export const Home = () => {
  return (
    <C.Page>
      {/* Hero landing */}
      <C.Content.Outer>
        <C.AnimatedBackground fadeDown={true} />
        <C.Content.Outer className={styles.Home_splash}>
          <C.Content.Inner className={styles.Home_splash_content}>
            <div className={styles.Home_splash_name}>
              Jenna <span>[HopeTS]</span>
            </div>
            <div className={styles.Home_splash_tagline}>
              Full-Stack Developer
            </div>
            <C.LinkRow />
          </C.Content.Inner>
        </C.Content.Outer>
      </C.Content.Outer>

      {/* Transition between hero and info*/}
      <C.Content.Outer className={styles.Home_transition}>
        <div className={styles.Home_transition_block} />
      </C.Content.Outer>

      {/* Timeline section */}
      <C.Content.Outer className={styles.Home_timeline}>
        <C.Timeline items={xp} />
      </C.Content.Outer>

      {/* Info section */}
      <C.Content.Outer className={styles.Home_info}>
        Home page <C.ThemeToggler />
        <img src={assets.pfp} className={styles.Home_splash_pfp} />
      </C.Content.Outer>
    </C.Page>
  );
};

export default Home;
