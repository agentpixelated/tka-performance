// Pengganti lokal untuk SafeAreaTopScrim dari @hatch/space-sdk/client.
// Di situs statis tidak ada chrome hosting Muse, jadi komponen ini hanya
// merender hamparan atas setinggi safe-area (atau nol) dengan warna latar
// yang diminta — tanpa dependensi SDK apa pun.
export function SafeAreaTopScrim({ backgroundColor }: { backgroundColor?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: "env(safe-area-inset-top, 0px)",
        backgroundColor: backgroundColor ?? "transparent",
      }}
    />
  );
}
