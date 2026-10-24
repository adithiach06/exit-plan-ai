/**
 * Secure Backend Gateway & API Client
 * Note: Third-party API keys (e.g. OpenAI / Gemini / Claude) must reside on the backend
 * to prevent exposing credentials in client-side bundles.
 */

const BACKEND_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AI_BACKEND_URL) ||
  'http://localhost:5000/api';

/**
 * Check if the backend AI proxy service is reachable
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Request AI analysis for suspicious travel SMS/WhatsApp messages.
 * Sends payload to backend proxy rather than invoking external model APIs directly from the browser.
 */
export const analyzeTravelMessage = async (messageText) => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/analyze-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Return structured failure so UI can gracefully guide user
    return {
      success: false,
      error: error.message || 'Backend connection unavailable'
    };
  }
};

/**
 * Request AI Safety Advisor guidance through secure backend proxy.
 * Keeps model credentials secured server-side. Falls back gracefully when unconfigured.
 */
export const requestAdvisorGuidance = async (scenarioId, context = {}) => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/advisor-guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId, context })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      fallback: true,
      error: error.message || 'Backend proxy unavailable'
    };
  }
};
