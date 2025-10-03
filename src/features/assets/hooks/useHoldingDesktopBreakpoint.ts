import * as React from 'react';

const HOLDING_DESKTOP_BREAKPOINT = 1389;
const HOLDING_DESKTOP_QUERY = `(min-width: ${HOLDING_DESKTOP_BREAKPOINT}px)`;

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  return window.matchMedia(HOLDING_DESKTOP_QUERY);
}

export function useHoldingDesktopBreakpoint() {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mediaQuery = getMediaQuery();

    if (!mediaQuery) {
      return;
    }

    const updateMatch = () => setIsDesktop(mediaQuery.matches);

    updateMatch();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMatch);
      return () => mediaQuery.removeEventListener('change', updateMatch);
    }

    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, []);

  return isDesktop;
}

export { HOLDING_DESKTOP_BREAKPOINT };
