import clsx from "clsx";

export const Inner = ({ children, className }) => {
  return <div className={clsx("InnerContent", className)}>{children}</div>;
};

export default Inner;
