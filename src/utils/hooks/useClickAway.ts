import { RefObject, useEffect } from "react";

const useClickAway = (
  ref: RefObject<HTMLElement>, // Execute callback if clicked outside of element
  /**
    Callback function to execute when clicked outside of element
   */ callback: () => void
) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
};

export default useClickAway;
