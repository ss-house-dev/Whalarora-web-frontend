import * as React from 'react';

const HOLDING_DESKTOP_BREAKPOINT = 1389;
const HOLDING_DESKTOP_QUERY = `(min-width: ${HOLDING_DESKTOP_BREAKPOINT}px)`;

export function useHoldingDesktopBreakpoint() {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(HOLDING_DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isDesktop;
}

export { HOLDING_DESKTOP_BREAKPOINT };
