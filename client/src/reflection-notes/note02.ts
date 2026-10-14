const note = String.raw`# No. 2 — Menyusul: posisi, bukan kecepatan

**Soal (F1-No.2).** Mobil A dan mobil B berangkat dari titik yang sama, pada saat yang sama, dan ke arah yang sama. Mobil A bergerak lurus beraturan dengan kecepatan 20 m/s, sedangkan mobil B mulai dari keadaan diam lalu dipercepat secara konstan sebesar 2 m/s². Seorang siswa ingin menentukan kapan dan di mana B menyusul A. Analisis manakah yang paling tepat?

A. Mobil B tidak akan pernah menyusul A karena A sudah bergerak lebih dulu.
B. B menyusul A pada detik ke-10 di jarak 100 m, sebab saat itu kecepatan keduanya sama.
C. B menyusul A pada detik ke-20 di jarak 400 m, sebab saat itu posisi keduanya sama.
D. B menyusul A pada detik ke-40 di jarak 800 m, sebab percepatan B lebih kecil daripada kecepatan A.
E. B menyusul A pada detik ke-5 di jarak 50 m, sebab B bergerak dipercepat.

*Sumber: Tryout TKA-1 Prosus Inten × Pusmendik 2026/2027 — youtu.be/TJx26hG4mmM*

---

## Dasarnya

Di sinilah kebanyakan orang tergelincir: **menyusul itu soal posisi, bukan soal kecepatan.**

GLB memakai kecepatan tetap, sehingga posisinya:

$$x = vt$$

GLBB memakai percepatan tetap, sehingga posisinya:

$$x = v_0t + \frac12at^2$$

Cara menyelesaikan soal menyusul selalu sama: tulis posisi kedua benda, lalu samakan.

$$x_A = x_B$$

Itulah definisi menyusul—keduanya berada di tempat yang sama pada saat yang sama.

## Aplikasinya

**Diketahui:** $v_A=20\ \text{m/s}$, $v_{0B}=0$, dan $a_B=2\ \text{m/s}^2$.

**Posisi mobil A:**

$$x_A = v_At = 20t$$

**Posisi mobil B:**

$$x_B = v_{0B}t + \frac12a_Bt^2 = 0 + \frac12(2)t^2 = t^2$$

**Samakan posisi keduanya:**

$$20t = t^2$$

$$t^2-20t=0$$

$$t(t-20)=0$$

$t=0$ adalah saat keduanya mulai bersama. Waktu menyusul yang dicari adalah:

$$t=20\ \text{s}$$

Posisinya:

$$x = 20(20)=400\ \text{m}$$

Pada $t=10\ \text{s}$, kecepatan B memang sudah sama dengan A:

$$v_B = at = 2(10)=20\ \text{m/s}$$

Tetapi posisinya belum sama: $x_A=200\ \text{m}$ sedangkan $x_B=100\ \text{m}$. Jadi menyamakan kecepatan adalah jebakan.

**Kunci: C** — B menyusul A pada detik ke-20 di posisi 400 m.
`;
export default note;
