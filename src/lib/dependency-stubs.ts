// Fallow dependency stubs — these packages are used transitively via ignored files.
// src/components/cockpit/** uses react-markdown (DossierViewer.tsx)
// src/lib/theme.ts and src/stores/cockpit-store.ts use zustand
// Keeping imports here satisfies fallow's unused-dependencies check.
import 'react-markdown';
import 'remark-gfm';
import 'zustand';
