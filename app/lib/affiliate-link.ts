
export class AffiliateLinkGenerator {
  static generateAffiliateLink(baseUrl: string, originalUrl: string): string {
    try {
      // Remove any existing trailing parameters
      const cleanBaseUrl = baseUrl.includes('?') ? baseUrl : `${baseUrl}?`;
      
      // Add the desturl parameter with URL encoding
      const affiliateLink = `${cleanBaseUrl}&desturl=${encodeURIComponent(originalUrl)}`;
      
      return affiliateLink;
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      return originalUrl; // Fallback to original URL
    }
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
