// Klien data versi bisa-diisi: dulu api.getDashboard() memanggil RPC server
// Muse lewat @hatch/space-sdk/client (server/src/actions.ts, bun:sqlite).
// Sekarang ia membaca store lokal browser (localStore.ts). Bentuk responsnya
// sama persis (Dashboard), jadi App.tsx tidak perlu diubah kecuali impor
// SafeAreaTopScrim dan penambahan editor — lihat DataEditor.tsx.
import { loadDashboard, type Dashboard } from "./localStore";

export const api = {
  getDashboard: async (_args: Record<string, never>): Promise<Dashboard> => loadDashboard(),
};

export type { Dashboard };
