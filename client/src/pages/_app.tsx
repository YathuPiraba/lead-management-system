import "@/app/globals.css";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "@/styles/app.css"

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const noLayoutPages = ["/"]; // Add more routes if needed
  const isLayoutExcluded = noLayoutPages.includes(router.pathname);

  return (
    <>
     <Toaster />
      <Head>
        <link
          rel="icon"
          href="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg"
        />
        <title>IMB Connect</title>
      </Head>
      {isLayoutExcluded ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
};
export default MyApp;
