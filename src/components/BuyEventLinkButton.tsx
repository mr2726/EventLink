
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

interface BuyEventLinkButtonProps {
  checkoutUrl: string;
  children: ReactNode;
  className?: string;
}

const BuyEventLinkButton = ({ checkoutUrl, children, className }: BuyEventLinkButtonProps) => {
  useEffect(() => {
    const scriptId = "lemonsqueezy-script";
    
    const initializeLemonSqueezy = () => {
      // @ts-ignore
      if (window.LemonSqueezy && typeof window.LemonSqueezy.Setup === 'function') {
        // @ts-ignore
        window.LemonSqueezy.Setup({
          eventHandler: (event: any) => {
            // console.log('Lemon Squeezy event:', event);
            // Useful for more advanced integrations, like tracking when the overlay is closed, etc.
            // For this flow, the redirect_url handles the success.
          }
        });
      }
      // @ts-ignore
      if (window.createLemonSqueezy) {
        // @ts-ignore
        window.createLemonSqueezy(); // This finds and initializes buttons with the lemonsqueezy-button class
      }
    };

    if (document.getElementById(scriptId)) {
      initializeLemonSqueezy(); // Re-initialize if script exists (e.g., on page navigation)
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://assets.lemonsqueezy.com/lemon.js";
    script.defer = true;
    script.onload = () => {
      initializeLemonSqueezy();
    };
    script.onerror = () => {
      console.error("Failed to load Lemon Squeezy script.");
    };
    document.body.appendChild(script);

    // Optional: Cleanup script on component unmount if it causes issues with multiple instances
    // or frequent re-renders. For a single button like this, it's often fine to leave.
    // return () => {
    //   const existingScript = document.getElementById(scriptId);
    //   if (existingScript) {
    //     document.body.removeChild(existingScript);
    //   }
    // };
  }, []);

  return (
    <a
      href={checkoutUrl}
      className={`lemonsqueezy-button ${className || ''}`.trim()}
    >
      {children}
    </a>
  );
};

export default BuyEventLinkButton;
