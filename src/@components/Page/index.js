import clsx from "clsx";

import styles from "./index.module.css";

export const Page = ({ className, children }) => {
  return <div className={clsx(className, styles.Page)}>{children}</div>;
};

export default Page;
