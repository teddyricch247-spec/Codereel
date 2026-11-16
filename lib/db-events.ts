let listeners: Array<() => void> = [];
let dbVersion = 0;

export function emitMockDbChange(): void {
  dbVersion += 1;
  for (const listener of listeners) {
    listener();
  }
}

export function getMockDbVersion(): number {
  return dbVersion;
}

export function subscribeMockDb(listener: () => void): () => void {
  listeners.push(listener);
  const onStorage = () => {
    dbVersion += 1;
    listener();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}
