import clsx from "clsx";

import styles from "./index.module.css";

export const Outer = ({ children, className }) => {
  return <div className={clsx(styles.Outer, className)}>{children}</div>;
};

export default Outer;
