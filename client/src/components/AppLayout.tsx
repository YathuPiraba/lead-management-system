"use client";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { setSessionTimeoutCallback } from "@/lib/api-client";
import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { notFound } from "next/navigation";
import SessionExpirationModal from "./SessionExpirationModal";

interface AppLayoutProps {
  children: React.ReactNode;
  subdomain: string | null;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, subdomain }) => {
  const { showModal, extendSession, modalType, showTokenExpiredModal } =
    useSessionTimeout();

  const { organization, isOrgLoading, fetchOrganization, clearOrganization } =
    useAppStore();

  useEffect(() => {
    // Set the callback for when refresh token expires
    setSessionTimeoutCallback(showTokenExpiredModal);
  }, [showTokenExpiredModal]);

  useEffect(() => {
    const loadOrganization = async () => {
      if (subdomain) {
        try {
          await fetchOrganization(subdomain);
        } catch (error) {
          console.error("Failed to fetch organization:", error);
          notFound(); // Trigger 404 if organization not found
        }
      } else {
        clearOrganization();
      }
    };

    loadOrganization();
  }, [subdomain, fetchOrganization, clearOrganization]);

  // Update document title and favicon when organization changes
  useEffect(() => {
    if (organization) {
      document.title = organization.name || "Lead Management System";

      // Update favicon
      const favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = organization.config?.brandingLogoUrl || "/favicon.ico";
      }
    }
  }, [organization]);

  // Show loading state while fetching organization
  if (subdomain && isOrgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If we have a subdomain but no organization after loading, show 404
  if (subdomain && !organization && !isOrgLoading) {
    notFound();
  }

  return (
    <>
      {children}
      <SessionExpirationModal
        isOpen={showModal}
        onExtendSession={extendSession}
        modalType={modalType}
      />
    </>
  );
};

export default AppLayout;
