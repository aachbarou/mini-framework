const eventManager = {
  listeners: new Map(),
  nativeHandlers: new Map(),
  nativeEvents: new Set([
    'click', 'keydown', 'keyup', 'input', 'change', 'submit',
    'mousedown', 'mouseup', 'mouseover', 'mouseout', 'scroll',
    'focus', 'blur', 'dblclick', 'beforeunload', 'load'
  ])
};

export function on(eventName, callback, element = document) {
  if (!eventManager.listeners.has(eventName)) {
    eventManager.listeners.set(eventName, []);

    if (eventManager.nativeEvents.has(eventName)) {
      const handler = (event) => emit(eventName, event);
      element.addEventListener(eventName, handler);
      eventManager.nativeHandlers.set(eventName, { element, handler });
    }
  }

  eventManager.listeners.get(eventName).push(callback);
}

export function off(eventName, callback) {
  if (!eventManager.listeners.has(eventName)) {
    return;
  }

  const updatedListeners = eventManager.listeners.get(eventName).filter(
    (cb) => cb !== callback
  );

  if (updatedListeners.length > 0) {
    eventManager.listeners.set(eventName, updatedListeners);
  } else {
    eventManager.listeners.delete(eventName);
    const nativeHandler = eventManager.nativeHandlers.get(eventName);
    if (nativeHandler) {
      nativeHandler.element.removeEventListener(eventName, nativeHandler.handler);
      eventManager.nativeHandlers.delete(eventName);
    }
  }
}

export function emit(eventName, data) {
  if (!eventManager.listeners.has(eventName)) {
    return;
  }

  for (const callback of eventManager.listeners.get(eventName)) {
    callback(data);
  }
}

export function onGlobal(eventName, callback) {
  const target = (eventName === 'beforeunload' || eventName === 'load') ? window : document;
  on(eventName, callback, target);
}