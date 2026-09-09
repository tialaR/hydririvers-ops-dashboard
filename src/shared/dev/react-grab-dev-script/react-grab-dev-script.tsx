'use client';

import { useEffect } from 'react';

const REACT_GRAB_SELECTOR = 'script[data-hydri-react-grab="true"]';
const REACT_GRAB_SRC = 'https://unpkg.com/react-grab/dist/index.global.js';

export function ReactGrabDevScript() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return undefined;
    }

    if (document.querySelector(REACT_GRAB_SELECTOR)) {
      return undefined;
    }

    const script = document.createElement('script');
    script.src = REACT_GRAB_SRC;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.dataset.hydriReactGrab = 'true';
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
