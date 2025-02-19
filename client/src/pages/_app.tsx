"use client";
import "@/app/globals.css";
import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "@/styles/app.css";
import { useAuth } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { SessionModalProvider } from "@/contexts/sessionModalContext";
import { ThemeProvider } from "@/contexts/theme-context";

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const noLayoutPages = ["/"];
  const isLayoutExcluded = noLayoutPages.includes(router.pathname);
  const { isAuthenticated, isLoading } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && loaded && !isAuthenticated && !isLayoutExcluded) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, isLayoutExcluded, loaded, router]);

  useEffect(() => {
    if (!isLoading) {
      setLoaded(true);
    }
  }, [isLoading]);

  if (!loaded) {
    console.log("Waiting for authentication state...");
    return null;
  }

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
          <ThemeProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
        </SessionModalProvider>
      )}
    </>
  );
};

export default MyApp;
