import * as C from "@components";

import styles from "./index.module.css";

const Footer = () => {
  return (
    <footer className={styles.Footer}>
      <C.Content.Inner className={styles.Footer_content}>
        <div className={styles.Footer_content_left}></div>
      </C.Content.Inner>
    </footer>
  );
};

export default Footer;
