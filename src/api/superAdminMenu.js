import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

export const superAdminInitialState = {
  openedItem: 'super-dashboard',
  openedComponent: 'dashboard',
  openedHorizontalItem: null,
  isDashboardDrawerOpened: false,
  isComponentDrawerOpened: true
};

export const superAdminEndpoints = {
  key: 'api/superadmin-menu',
  master: 'master',
  dashboard: '/super-admin/dashboard'
};

export function useGetSuperAdminMenuMaster() {
  const { data, isLoading } = useSWR(
    superAdminEndpoints.key + superAdminEndpoints.master,
    () => superAdminInitialState,
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // -------- guarantee a concrete object from the first paint ----------
  const safeData = data ?? superAdminInitialState;

  return useMemo(
    () => ({
      menuMaster: safeData,
      menuMasterLoading: isLoading
    }),
    [safeData, isLoading]
  );
}

/* ---------- helpers keep the same shape even if cache empty ---------- */
export function handlerSuperAdminDrawerOpen(isDashboardDrawerOpened) {
  mutate(
    superAdminEndpoints.key + superAdminEndpoints.master,
    (curr) => ({ ...(curr ?? superAdminInitialState), isDashboardDrawerOpened }),
    false
  );
}

export function handlerSuperAdminActiveItem(openedItem) {
  mutate(
    superAdminEndpoints.key + superAdminEndpoints.master,
    (curr) => ({ ...(curr ?? superAdminInitialState), openedItem }),
    false
  );
}

export function handlerSuperAdminHorizontalActiveItem(openedHorizontalItem) {
  mutate(
    superAdminEndpoints.key + superAdminEndpoints.master,
    (curr) => ({ ...(curr ?? superAdminInitialState), openedHorizontalItem }),
    false
  );
}
