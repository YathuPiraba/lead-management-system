import "@/app/globals.css";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const noLayoutPages = ["/"]; // Add more routes if needed
  const isLayoutExcluded = noLayoutPages.includes(router.pathname);

  return isLayoutExcluded ? (
    <Component {...pageProps} />
  ) : (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};
export default MyApp;
