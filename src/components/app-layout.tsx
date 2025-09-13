import type { ReactNode } from "react";
import Footer from "./app-footer";
import Header from "./app-header";

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default AppLayout;
