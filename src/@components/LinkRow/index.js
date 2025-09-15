import React from "react";
import clsx from "clsx";

import styles from "./index.module.css";
import githubIcon from "../../@assets/images/github.png";

const LinkRow = ({ className }) => {
  return (
    <div className={clsx(styles.row, className)}>
      <a
        href="https://github.com/HopeTS"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={githubIcon} alt="GitHub" className={styles.linkIcon} />
      </a>
    </div>
  );
};

export default LinkRow;
