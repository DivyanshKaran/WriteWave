// Passive Event Listener Hook
import { useEffect, useRef } from 'react';

export const usePassiveEventListener = (
  eventName: string,
  handler: (event: Event) => void,
  element: Element | Window | Document = window,
  options: AddEventListenerOptions = { passive: true }
) => {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (event: Event) => handlerRef.current(event);
    
    element.addEventListener(eventName, eventHandler, options);
    
    return () => {
      element.removeEventListener(eventName, eventHandler, options);
    };
  }, [eventName, element, options]);
};
