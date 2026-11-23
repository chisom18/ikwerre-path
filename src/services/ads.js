const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';
const slotId = import.meta.env.VITE_ADSENSE_SLOT_PRIMARY || '';

export function getAdMarkup() {
  if (!clientId || !slotId) {
    return `<aside class="ad-slot ad-slot-placeholder" aria-label="Advertisement">
      <span class="ad-label">Advertisement</span>
      <p>Ad space is ready. Configure your AdSense publisher and slot IDs to serve ads.</p>
    </aside>`;
  }

  return `<aside class="ad-slot" aria-label="Advertisement">
    <span class="ad-label">Advertisement</span>
    <ins class="adsbygoogle"
      style="display:block;min-height:90px"
      data-ad-client="${clientId}"
      data-ad-slot="${slotId}"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  </aside>`;
}

export function loadAdSense() {
  if (!clientId || !slotId) return;

  let script = document.querySelector('script[data-adsense-client]');
  if (!script) {
    script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.adsenseClient = clientId;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    document.head.appendChild(script);
  }

  const initializeSlots = () => {
    const ads = window.adsbygoogle || (window.adsbygoogle = []);
    document.querySelectorAll('.adsbygoogle:not([data-react-ad-initialized])')
      .forEach((slot) => {
        slot.dataset.reactAdInitialized = 'true';
        try {
          ads.push({});
        } catch (error) {
          slot.removeAttribute('data-react-ad-initialized');
          console.error('Could not initialize the AdSense slot.', error);
        }
      });
  };

  if (script.dataset.loaded === 'true') {
    initializeSlots();
  } else {
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      initializeSlots();
    }, { once: true });
    script.addEventListener('error', () => {
      console.error('AdSense could not be loaded. Check the publisher ID and site approval.');
    }, { once: true });
  }
}
