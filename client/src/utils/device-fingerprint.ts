import FingerprintJS, {
  Agent,
  GetResult,
  LoadOptions,
} from "@fingerprintjs/fingerprintjs";

type FingerprintResult = {
  visitorId: string;
  confidence: GetResult["confidence"];
  components: GetResult["components"];
};

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    platform: string;
  };
}

class DeviceFingerprint {
  private static instance: DeviceFingerprint;
  private fingerprint: string = "";
  private fpPromise: Promise<Agent> | null = null;

  public static getInstance(): DeviceFingerprint {
    if (!DeviceFingerprint.instance) {
      DeviceFingerprint.instance = new DeviceFingerprint();
    }
    return DeviceFingerprint.instance;
  }

  private async initializeFingerprintJS(): Promise<Agent> {
    if (!this.fpPromise) {
      const options: Partial<LoadOptions> = {};
      this.fpPromise = FingerprintJS.load(options);
    }
    return this.fpPromise;
  }

  public async generateFingerprint(): Promise<string> {
    if (this.fingerprint) {
      return this.fingerprint;
    }

    try {
      const fp = await this.initializeFingerprintJS();
      const result = await fp.get();

      this.fingerprint = result.visitorId;
      return this.fingerprint;
    } catch (error) {
      console.error("Failed to generate device fingerprint:", error);
      // Fallback
      const platform =
        (navigator as NavigatorWithUserAgentData).userAgentData?.platform ||
        "unknown";

      const fallbackData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: Date.now(),
      };

      const fallbackString = JSON.stringify(fallbackData);
      this.fingerprint = this.simpleHash(fallbackString);
      return this.fingerprint;
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  public async getDetailedFingerprint(): Promise<FingerprintResult | null> {
    try {
      const fp = await this.initializeFingerprintJS();
      const result = await fp.get();
      return {
        visitorId: result.visitorId,
        confidence: result.confidence,
        components: result.components,
      };
    } catch (error) {
      console.error("Failed to get detailed fingerprint:", error);
      return null;
    }
  }

  public clearFingerprint(): void {
    this.fingerprint = "";
  }
}

export const deviceFingerprint = DeviceFingerprint.getInstance();
