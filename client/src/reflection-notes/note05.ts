const note = String.raw`# No. 5 — Tumbukan: momentum yang kekal, bukan energinya

**Soal (F1-No.11).** Di atas rel licin, bola A bermassa 2 kg bergerak ke kanan dengan kecepatan 6 m/s sementara bola B bermassa 3 kg bergerak ke kiri dengan kecepatan 4 m/s. Setelah keduanya bertumbukan sentral, bola A bergerak ke kiri dengan kecepatan 3 m/s. Seorang siswa menghitung lalu menyimpulkan bahwa tumbukan ini lenting sempurna dan energi kinetiknya kekal. Apakah kesimpulan siswa itu tepat?

A. Tepat, karena energi kinetik sebelum dan sesudah tumbukan sama besar.
B. Tepat, karena jumlah momentum sebelum tumbukan adalah nol.
C. Tidak tepat, karena koefisien restitusinya bernilai 0,5.
D. Tidak tepat, karena bola A mengalami perubahan momentum.
E. Tidak tepat, karena energi kinetik sistem berkurang sebesar 15 joule.

*Sumber: Tryout TKA-1 Prosus Inten × Pusmendik 2026/2027 — youtu.be/TJx26hG4mmM*

---

## Dasarnya

Ada dua besaran yang sering dibingungkan saat benda bertumbukan: **momentum** dan **energi kinetik**. Mari kita bedah satu per satu, dengan tenang.

**Momentum** adalah massa kali kecepatan:

$$p = mv$$

Ia punya arah: ke kanan kita beri tanda positif, ke kiri negatif. Hukumnya sederhana dan tak kenal ampun: **dalam tumbukan, total momentum selalu kekal**, selama tidak ada gaya luar.

$$m_Av_A + m_Bv_B = m_Av'_A + m_Bv'_B$$

**Energi kinetik** adalah energi gerak:

$$E_k = \frac{1}{2}mv^2$$

Yang ini **tidak selalu kekal**. Sebagian energi gerak bisa berubah menjadi bunyi, panas, atau penyok pada bola. Hanya pada tumbukan **lenting sempurna** energi kinetik ikut kekal.

Jadi kebalikannya: momentum kekal itu wajib di semua tumbukan; energi kinetik kekal itu bonus yang hanya ada pada tumbukan lenting sempurna.

Untuk mengukur seberapa lenting sebuah tumbukan, fisikawan memakai **koefisien restitusi**, $e$:

$$e = \frac{v'_B-v'_A}{v_A-v_B}$$

Nilainya: $e=1$ berarti lenting sempurna, $e=0$ berarti kedua benda menempel, dan nilai di antaranya berarti lenting sebagian.

## Aplikasinya

**Diketahui:** $m_A=2\ \text{kg}$, $v_A=+6\ \text{m/s}$, $m_B=3\ \text{kg}$, $v_B=-4\ \text{m/s}$, dan $v'_A=-3\ \text{m/s}$.

**Langkah 1 — momentum kekal.** Total momentum sebelum:

$$p_{\text{awal}} = (2)(6) + (3)(-4) = 12-12 = 0$$

Sesudah tumbukan:

$$p_{\text{akhir}} = (2)(-3) + 3v'_B$$

Samakan dengan momentum awal:

$$-6 + 3v'_B = 0 \quad\Rightarrow\quad v'_B = 2\ \text{m/s}$$

**Langkah 2 — koefisien restitusi.**

$$e = \frac{2-(-3)}{6-(-4)} = \frac{5}{10} = 0{,}5$$

Karena $e=0{,}5$, tumbukan ini lenting **sebagian**, bukan lenting sempurna. Kesimpulan siswa salah.

**Cek energi kinetik:**

$$E_{k,\text{awal}} = \frac12(2)(6^2)+\frac12(3)(4^2)=60\ \text{J}$$

$$E_{k,\text{akhir}} = \frac12(2)(3^2)+\frac12(3)(2^2)=15\ \text{J}$$

Energi berkurang $45\ \text{J}$, bukan $15\ \text{J}$. Opsi E tetap salah.

**Kunci: C** — tumbukan tidak lenting sempurna karena koefisien restitusinya $0{,}5$.
`;
export default note;
