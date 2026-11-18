import { useSyncExternalStore } from 'react';
import { mockStore, StoreState } from '../mocks/store';

export function useStoreState(): StoreState {
  return useSyncExternalStore(
    (onStoreChange) => mockStore.subscribe(onStoreChange),
    () => mockStore.getState()
  );
}
