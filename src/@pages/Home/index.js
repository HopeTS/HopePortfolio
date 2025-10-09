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
    <C.Page className={styles.Home}>
      {/* Hero landing */}
      <C.Content.Outer>
        <C.AnimatedBackground fadeDown={true} />
        <C.Content.Outer className={styles.Home_splash}>
          <C.Content.Inner className={styles.Home_splash_content}>
            <div className={styles.Home_splash_pfp_wrapper}>
              <img
                src={assets.pfp}
                className={styles.Home_splash_pfp}
                alt="Selfie of Jenna"
              />
            </div>

            <div className={styles.Home_splash_text}>
              <div className={styles.Home_splash_name}>
                Jenna <span>[HopeTS]</span>
              </div>
              <div className={styles.Home_splash_tagline}>
                Full-Stack Developer
              </div>
            </div>
          </C.Content.Inner>
          <C.Content.Inner className={styles.Home_splash_bottom}>
            <C.LinkRow />

            <div className={styles.Home_bottom_text}>
              <p className={styles.Home_bottom_text_content}>
                Currently maintaining{" "}
                <a href="https://github.com/peardrive/PearDriveCore">
                  PearDrive Core
                </a>
              </p>

              <p className={styles.Home_bottom_text_content}>
                <span>Full-stack developer</span>, specializing in{" "}
                <span>Node.js</span> and <span>React</span> applications.
              </p>

              <p className={styles.Home_bottom_text_content}>
                Around 5 years of professional experience, and a BSc in Computer
                Science.
              </p>

              <p className={styles.Home_bottom_text_content}>
                I love building modules and applications that make the internet
                more accessible and giving users more control over their digital
                lives.
              </p>
              <div className={styles.Home_bottom_text_bg} />
            </div>
          </C.Content.Inner>
        </C.Content.Outer>
      </C.Content.Outer>

      {/* Transition between hero and info*/}
      <C.Content.Outer className={styles.Home_transition}>
        <div className={styles.Home_transition_block_top} />
      </C.Content.Outer>

      {/* Timeline section */}
      <C.Content.Outer className={styles.Home_timeline}>
        <div className={styles.Home_timeline_bg} />
        <C.Timeline items={xp} />
        <div className={styles.Home_timeline_bottom_padding} />
      </C.Content.Outer>

      {/* Footer transition */}
      <C.Content.Outer className={styles.Home_transition_bottom}>
        <div className={styles.Home_transition_block_bottom} />
      </C.Content.Outer>

      <C.Footer />
    </C.Page>
  );
};

export default Home;
