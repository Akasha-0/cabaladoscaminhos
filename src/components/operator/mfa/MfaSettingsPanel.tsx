// src/components/operator/mfa/MfaSettingsPanel.tsx
// Client wrapper para MfaSetup — expõe status para o parent via callback.
'use client';

import { useCallback } from 'react';
import { MfaSetup } from './MfaSetup';

interface MfaSettingsPanelProps {
  initialMfaEnabled: boolean;
  operatorRole: 'ADMIN' | 'OPERATOR';
}

export function MfaSettingsPanel({
  initialMfaEnabled,
  operatorRole,
}: MfaSettingsPanelProps) {
  const handleStatusChange = useCallback((enabled: boolean) => {
    // Could trigger a re-render of parent via router.refresh() or a store
    // For now, the component manages its own state
    // eslint-disable-next-line no-console
    console.debug('[MfaSettings] MFA status changed:', enabled);
  }, []);

  return (
    <MfaSetup
      initialStatus={{ mfaEnabled: initialMfaEnabled, role: operatorRole }}
      onStatusChange={handleStatusChange}
    />
  );
}
