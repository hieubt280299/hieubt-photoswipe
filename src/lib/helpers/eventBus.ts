type CustomEventType = Event & {
  detail?: any;
};

export const EventBus = {
  on(event: string, callback: (detail?: any) => void) {
    document.addEventListener(event, (e: CustomEventType) => callback(e.detail));
  },
  dispatch(event: string, data?: any) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  off(event: string, callback: (detail: any) => void) {
    document.removeEventListener(event, callback);
  },
};
