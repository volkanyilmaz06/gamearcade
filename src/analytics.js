export const analytics = {
  /**
   * Tracks a lightweight analytics event. Replace this with your
   * analytics provider (Google Analytics, Segment, etc.).
   * @param {string} eventName
   * @param {Record<string, unknown>} payload
   */
  trackEvent(eventName, payload = {}) {
    // For the purposes of this demo we log to the console.
    // In production this could call an analytics SDK.
    const timestamp = new Date().toISOString();
    console.info(`[analytics:${eventName}]`, { ...payload, timestamp });
  },
};
