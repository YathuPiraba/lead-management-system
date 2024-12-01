"use client";
import "@/app/globals.css";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "@/styles/app.css";
import { useAuth } from "@/stores/auth-store";
import { useEffect } from "react";
import { SessionModalProvider } from "@/contexts/sessionModalContext";

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const noLayoutPages = ["/"]; // Add more routes if needed
  const isLayoutExcluded = noLayoutPages.includes(router.pathname);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLayoutExcluded) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
        <SessionModalProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionModalProvider>
      )}
    </>
  );
};
export default MyApp;
