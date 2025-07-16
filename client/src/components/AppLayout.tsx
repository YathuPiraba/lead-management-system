"use client";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { setSessionTimeoutCallback } from "@/lib/api-client";
import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { notFound, usePathname } from "next/navigation";
import SessionExpirationModal from "./SessionExpirationModal";
import { PUBLIC_PATHS } from "@/constants/routes";

interface AppLayoutProps {
  children: React.ReactNode;
  subdomain: string | null;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, subdomain }) => {
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.some((path: string) =>
    pathname.startsWith(path)
  );

  const { showModal, extendSession, modalType, showTokenExpiredModal } =
    useSessionTimeout({ enabled: !isPublicPath });

  const { organization, isOrgLoading, fetchOrganization, clearOrganization } =
    useAppStore();

  useEffect(() => {
    if (!isPublicPath) {
      setSessionTimeoutCallback(showTokenExpiredModal);
    }
  }, [isPublicPath, showTokenExpiredModal]);

  useEffect(() => {
    const loadOrganization = async () => {
      if (subdomain) {
        try {
          await fetchOrganization(subdomain);
        } catch (error) {
          console.error("Failed to fetch organization:", error);
          notFound();
        }
      } else {
        clearOrganization();
      }
    };

    loadOrganization();
  }, [subdomain, fetchOrganization, clearOrganization]);

  useEffect(() => {
    if (organization) {
      document.title = organization.name || "Lead Management System";
      const favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = organization.config?.brandingLogoUrl || "/favicon.ico";
      }
    }
  }, [organization]);

  if (subdomain && isOrgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (subdomain && !organization && !isOrgLoading) {
    notFound();
  }

  return (
    <>
      {children}
      {!isPublicPath && (
        <SessionExpirationModal
          isOpen={showModal}
          onExtendSession={extendSession}
          modalType={modalType}
        />
      )}
    </>
  );
};

export default AppLayout;
