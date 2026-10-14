import hari02No03 from "./assets/reflection-images/hari02-no03-sayap.png";
import hari02No07 from "./assets/reflection-images/hari02-no07-glbb.png";
import hari02No08 from "./assets/reflection-images/hari02-no08-katrol.png";
import hari02No09 from "./assets/reflection-images/hari02-no09-newton1.png";
import hari02No13 from "./assets/reflection-images/hari02-no13-roundrobin.png";
import hari02No17 from "./assets/reflection-images/hari02-no17-menabung.png";
import hari02No19 from "./assets/reflection-images/hari02-no19-jarak3d.png";
import hari02No27 from "./assets/reflection-images/hari02-no27-energi.png";
import hari02No28 from "./assets/reflection-images/hari02-no28-bandul.png";
import hari02No30 from "./assets/reflection-images/hari02-no30-intensitas.png";
import hari02No31 from "./assets/reflection-images/hari02-no31-mesinkalor.png";
import hari02No32 from "./assets/reflection-images/hari02-no32-kalorimetri.png";
import hari02No34 from "./assets/reflection-images/hari02-no34-jurusan.png";
import hari02No35 from "./assets/reflection-images/hari02-no35-peluang.png";
import hari02No39 from "./assets/reflection-images/hari02-no39-vieta.png";
import hari02No41 from "./assets/reflection-images/hari02-no41-refleksi.png";
import hari02No43 from "./assets/reflection-images/hari02-no43-rotasi.png";
import hari03No03 from "./assets/reflection-images/hari03-no03-entropi.png";
import hari03No06 from "./assets/reflection-images/hari03-no06-katrol.png";
import hari03No07 from "./assets/reflection-images/hari03-no07-proyektil-sar.png";
import hari03No14 from "./assets/reflection-images/hari03-no14-diagram-batang.png";
import hari03No17 from "./assets/reflection-images/hari03-no17-kenaikan-mom.png";
import hari03No22 from "./assets/reflection-images/hari03-no22-matriks-invers.png";
import hari03No24 from "./assets/reflection-images/hari03-no24-vektor.png";
import hari03No27 from "./assets/reflection-images/hari03-no27-transfer-daya.png";
import hari03No30 from "./assets/reflection-images/hari03-no30-gesek-dua-benda.png";
import hari03No31 from "./assets/reflection-images/hari03-no31-melingkar-vertikal.png";
import hari03No32 from "./assets/reflection-images/hari03-no32-carnot.png";
import hari03No33 from "./assets/reflection-images/hari03-no33-tikungan.png";
import hari03No34 from "./assets/reflection-images/hari03-no34-spltv.png";
import hari03No39 from "./assets/reflection-images/hari03-no39-turunan-implisit.png";
import hari03No40 from "./assets/reflection-images/hari03-no40-rasionalisasi.png";
import hari03No41 from "./assets/reflection-images/hari03-no41-nilai-mutlak.png";
import hari03No43 from "./assets/reflection-images/hari03-no43-titik-puncak.png";
import hari03No44 from "./assets/reflection-images/hari03-no44-getaran.png";
import hari03No46 from "./assets/reflection-images/hari03-no46-garis-singgung.png";

export type ReflectionImage = {
  src: string;
  alt: string;
};

export const reflectionImages: Readonly<Record<string, ReflectionImage>> = {
  "2-3": { src: hari02No03, alt: "Visualisasi aliran udara dan perbedaan tekanan pada sayap pesawat" },
  "2-7": { src: hari02No07, alt: "Visualisasi gerak lurus berubah beraturan saat pengereman" },
  "2-8": { src: hari02No08, alt: "Diagram gaya pada sistem katrol bermassa" },
  "2-9": { src: hari02No09, alt: "Diagram Hukum I Newton dan resultan gaya nol" },
  "2-13": { src: hari02No13, alt: "Visualisasi pasangan pertandingan dalam sistem round-robin" },
  "2-17": { src: hari02No17, alt: "Visualisasi pola menabung sebagai barisan dan deret" },
  "2-19": { src: hari02No19, alt: "Visualisasi jarak dalam geometri ruang tiga dimensi" },
  "2-27": { src: hari02No27, alt: "Grafik energi pada gerak harmonik sederhana" },
  "2-28": { src: hari02No28, alt: "Diagram periode ayunan bandul sederhana" },
  "2-30": { src: hari02No30, alt: "Visualisasi taraf intensitas bunyi" },
  "2-31": { src: hari02No31, alt: "Diagram aliran kalor pada mesin kalor" },
  "2-32": { src: hari02No32, alt: "Diagram pertukaran kalor dalam kalorimetri" },
  "2-34": { src: hari02No34, alt: "Visualisasi jurusan arah dan aturan cosinus" },
  "2-35": { src: hari02No35, alt: "Visualisasi ruang sampel peluang bersyarat dua dadu" },
  "2-39": { src: hari02No39, alt: "Visualisasi hubungan akar persamaan dengan rumus Vieta" },
  "2-41": { src: hari02No41, alt: "Visualisasi refleksi geometri dan perubahan luas" },
  "2-43": { src: hari02No43, alt: "Visualisasi rotasi terhadap pusat satu koma satu" },
  "3-3": { src: hari03No03, alt: "Visualisasi penyebaran gas dan kenaikan entropi" },
  "3-6": { src: hari03No06, alt: "Diagram gaya dua balok pada katrol licin" },
  "3-7": { src: hari03No07, alt: "Lintasan proyektil bantuan dari pesawat SAR" },
  "3-14": { src: hari03No14, alt: "Diagram batang dengan satu data kota yang belum diketahui" },
  "3-17": { src: hari03No17, alt: "Diagram perubahan produksi pakaian dari bulan ke bulan" },
  "3-22": { src: hari03No22, alt: "Visualisasi langkah mengalikan invers pada persamaan matriks" },
  "3-24": { src: hari03No24, alt: "Visualisasi kesamaan komponen pada persamaan vektor" },
  "3-27": { src: hari03No27, alt: "Grafik daya beban terhadap hambatan untuk kondisi maksimum" },
  "3-30": { src: hari03No30, alt: "Diagram gaya dua benda bertumpuk dengan gesek statis" },
  "3-31": { src: hari03No31, alt: "Diagram gaya benda dalam gerak melingkar vertikal" },
  "3-32": { src: hari03No32, alt: "Diagram aliran kalor dan efisiensi mesin Carnot" },
  "3-33": { src: hari03No33, alt: "Diagram gaya kendaraan pada tikungan miring tanpa gesekan" },
  "3-34": { src: hari03No34, alt: "Visualisasi eliminasi bertahap sistem persamaan linear tiga variabel" },
  "3-39": { src: hari03No39, alt: "Visualisasi garis singgung pada kurva implisit" },
  "3-40": { src: hari03No40, alt: "Langkah rasionalisasi bentuk akar" },
  "3-41": { src: hari03No41, alt: "Grafik pecahan kasus fungsi nilai mutlak" },
  "3-43": { src: hari03No43, alt: "Parabola dengan titik puncak pada koordinat m koma m" },
  "3-44": { src: hari03No44, alt: "Osilator pegas dengan amplitudo dan simpangan" },
  "3-46": { src: hari03No46, alt: "Dua kurva yang berbagi titik dan garis singgung" },
};
