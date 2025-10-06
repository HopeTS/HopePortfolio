import clsx from "clsx";

import styles from "./index.module.css";

export const Inner = ({ children, className }) => {
  return <div className={clsx(styles.Inner, className)}>{children}</div>;
};

export default Inner;
