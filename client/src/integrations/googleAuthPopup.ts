/**
 * Opens a popup window for Google OAuth authentication
 * and handles the postMessage communication from the callback
 */
export const openGoogleAuthPopup = (authUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      'Google OAuth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      reject(new Error('Failed to open popup window'));
      return;
    }

    // Set up message listener
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'google-oauth-success') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        resolve();
      } else if (event.data.type === 'google-oauth-error') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        reject(new Error(event.data.error || 'OAuth authentication failed'));
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was closed by user
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        reject(new Error('OAuth popup was closed'));
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        popup.close();
        reject(new Error('OAuth timeout'));
      }
    }, 5 * 60 * 1000);
  });
};

/**
 * Opens a popup window for rube.app OAuth authentication
 */
export const openRubeAuthPopup = (authUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      'rube.app OAuth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      reject(new Error('Failed to open popup window'));
      return;
    }

    // Set up message listener
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'rube-oauth-success') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        resolve();
      } else if (event.data.type === 'rube-oauth-error') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        reject(new Error(event.data.error || 'OAuth authentication failed'));
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was closed by user
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        reject(new Error('OAuth popup was closed'));
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        popup.close();
        reject(new Error('OAuth timeout'));
      }
    }, 5 * 60 * 1000);
  });
};

export default {
  openGoogleAuthPopup,
  openRubeAuthPopup,
};
