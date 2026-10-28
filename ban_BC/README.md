# Bản trình bày B+C (nhận diện "men ngọc – chàm – son – vàng thếp") — Phản biện đồ án WiFi Mesh Drone và Robot

Slide 16:9 (1280×720, tự co theo màn hình). **Nội dung giữ đúng bản gốc `../ban_slide_16x9/index.html`**, chỉ đổi cách trình bày:
khung tạp chí (C: giấy kem, chữ serif, dải tàu điện tiến độ) + sơ đồ cơ cấu isometric có chuyển động (B).

Hai chế độ, cùng một nội dung (build.js sinh cả hai):
- `index.html` = **cuộn dọc**: cuộn chuột/phím ↓ → mỗi lần cuộn hiện một ý, hết ý thì sang slide kế tiếp; bấm ga trên dải tàu điện để nhảy phần.
- `trinh-chieu.html` = **trình chiếu** 16:9: phím ← → (hoặc click) chuyển bước/slide.
Phím (không hiện trên màn hình): N ghi chú nói · F toàn màn hình · M đổi chế độ · B mở/đóng 4 slide dự phòng A–D (← → chuyển giữa A–D, Esc hoặc B để quay lại đúng chỗ đang nói; hoặc bấm thẳng A, C, D). Slide dự phòng không nằm trong dòng chảy của bài nên cuộn/bấm tới hết slide 16 sẽ dừng, không rơi vào phần dự phòng.
`index.html?static` = đứng yên, hiện đủ mọi bước (dùng để in PDF: Ctrl+P).

## Cấu trúc
```
style.css        khung + linh kiện dùng chung (KHÔNG sửa khi viết slide; cần kiểu riêng thì viết vào parts/NN-*.css)
app.js           engine: chuyển slide, bước hiện dần, dải tàu điện, ghi chú
iso.js           thư viện isometric (hộp, trụ, đường, chữ, khối chuyển động)
parts/NN-ten.html|css|js   MỖI SLIDE một bộ file; build.js ghép theo thứ tự tên
build.js         node build.js  ->  index.html, parts.css, scenes.js (đã sinh sẵn, commit luôn)
kiem_tra_noi_dung.js   so từng slide với bản gốc (xem dưới)
chup_slide.js    chụp một slide để xem
```
## Nhận diện (đã đổi so với bản đầu)
Nền men ngọc, mực chàm, chữ Bricolage Grotesque (tiêu đề, số lớn, biến `--serif` — tên cũ, không còn là chữ serif) + Onest (thân) + IBM Plex Mono (nhãn), đều có tiếng Việt. Nền phẳng, đơn giản, không họa tiết. Bìa nền đêm xanh chàm + vàng, có sóng vô tuyến vàng lan từ Root.
**Màu viết trong `parts/*` vẫn là bảng màu cũ (kem/đen); `build.js` tự đổi sang bảng mới qua `theme.js`** (nên cứ dùng `var(--ink)`, `var(--red)`… hoặc hex cũ). `style.css` và `iso.js` đã là màu mới. Chữ nghiêng chỉ dùng cho công thức (`var(--math)`); Bricolage không có nghiêng thật, đừng dùng `font-style:italic` cho tiêu đề.
Hình động làm chậm so với thực tế phải có chú thích ngắn trong hình (`.slow`: "hình động làm chậm").

Quy ước: slide `sN` ↔ id trùng với bản gốc (`s1`…`s16`, dự phòng `b1`…`b4`). File đặt tên `NN-ten` với NN = số slide 2 chữ số (dự phòng: `17-du-phong-a`…).

## Khung một slide
```html
<section class="slide" id="s9" data-sec="2">      <!-- data-sec: 0..4 = phần của bài, để sáng đúng ga trên dải tàu điện; bìa/nội dung/dự phòng thì bỏ -->
  <div class="hd"><span class="k">03 · Phân mảnh ảnh</span><span class="pg"></span></div>   <!-- kick GIỮ NGUYÊN chữ gốc -->
  <h2 class="t">Header gói phân mảnh 16 byte</h2>  <!-- tiêu đề GIỮ NGUYÊN; <em> để nhấn 1 cụm; .m / .s để nhỏ chữ khi dài -->
  <div class="body"> ... </div>
  <span class="src">chuong3.tex, Bảng 3.3</span>   <!-- nguồn: giữ nguyên chữ gốc -->
  <aside>…ghi chú nói, GIỮ NGUYÊN từng chữ…</aside>
</section>
```
Phần: 0 = Đặt vấn đề và mục tiêu (s3,s4) · 1 = Cơ sở lý thuyết (s5,s6) · 2 = Thiết kế hệ thống (s7–s11) · 3 = Kết quả (s12–s15) · 4 = Kết luận (s16). Slide dự phòng: `<section class="slide" id="b1" data-backup>` (không có data-sec, kick dùng `<span class="k w">Dự phòng A</span>`).

Bước hiện dần: thêm `class="st" data-s="1"` (2, 3, …) vào phần tử; bấm → hiện lần lượt. Dùng để mỗi lần bấm là một ý, KHÔNG để giấu nội dung. Slide dày chữ nên chia 2–4 bước.

Linh kiện có sẵn (xem style.css): `.row .col .f1 .f2 .f3 .grow`, `.ru` (kẻ trên; `.r .b .g .a` đổi màu), `.lab` (nhãn mono), `.tg` (thẻ nhỏ), `.tb` (bảng tạp chí), `.stats/.stat` (số lớn), `.shot` (ảnh chụp), `.warnbox`, `.note`, `ul.l`, `.fig-wrap` (khung sơ đồ). Màu: `--red` Lớp 1/Mesh · `--blue` Lớp 2/UART · `--green` Lớp 3/PC · `--amber` cảnh báo · `--ink --muted --paper`.

## Chữ
Tiêu đề Bricolage Grotesque (biến `--serif`, tên cũ), thân Onest, nhãn/số liệu IBM Plex Mono; công thức nghiêng dùng Newsreader (`--math`). Cỡ chữ trên khung 1280×720: tiêu đề 38–52px · nội dung đọc ≥ 17px · nhãn mono ≥ 13px · **không có chữ nào dưới 13px**. Chữ nhỏ phải đạt tương phản AA: dùng `var(--red)`, `var(--amber)`, `var(--muted)` (đã chọn đủ đậm).

## CHUẨN KỸ THUẬT (bắt buộc)
1. Không đổi, không làm tròn, không thêm số liệu/thuật ngữ so với bản gốc. Không thêm kết luận mới.
2. Sơ đồ phải đúng bản chất kỹ thuật của đề tài:
   - Hệ chỉ có **1 Root + 3 Leaf**. KHÔNG vẽ thêm node/trụ relay riêng: Leaf cũng là node chuyển tiếp; vai trò chuyển tiếp tự hình thành theo vị trí và RSSI.
   - painlessMesh là **cây động, KHÔNG phải full mesh**: mỗi cặp node một đường; không nối mọi node với nhau; nối theo cây. Đã thử 1 chặng và 3 chặng (chuỗi test22: Root → …449329 → …433521 → …369673).
   - Leaf gửi `sendSingle` thẳng tới Root (logic), mạng chuyển tiếp từng cạnh (store-and-forward, TCP). Root cố định (node nối PC), không bầu Root động.
   - Gói: payload tối đa 1024 B + header 16 B (node_id u32, frame_id u16, chunk_index u16, total_chunks u16, payload_len u16, capture_us u32), Base64 → tối đa 1388 ký tự (< ~1400 B). Root ghép bằng **4 slot** (bitmap + timeout 2 s), supersede, LRU.
   - UART 921600 bps, khung `AA 55 | TYPE | LEN | PAYLOAD | CRC16`; middleware Node.js (serialport) → Socket.IO → Dashboard React.
   - Số chunk trên hình chỉ minh họa (khung QVGA trung bình ≈ 4,6 KB ≈ 5 chunk): không viết "5 chunk" thành số liệu.
   - Biểu đồ vẽ **đúng tỉ lệ** với số liệu gốc (cột 7 cao gấp đôi cột 3,5…). Có trục/mốc 0.
3. Hình động chỉ để giải thích cơ chế; không thêm nhãn/số liệu không có trong bản gốc. Nhãn trong hình dùng đúng chữ gốc (có thể rút gọn nhưng không đổi nghĩa).
4. Kiểm tra: `node build.js`, rồi `NODE_PATH=$(npm root -g) node kiem_tra_noi_dung.js s9` phải ra ✓ (từng slide của bạn). Ghi chú nói `<aside>` phải trùng bản gốc từng chữ.

## Sơ đồ isometric (B) — `iso.js`
```js
var sc = Iso.scene(svg, { az:22, el:30, rect:[x,y,w,h] /* vùng trong viewBox */, pts:[[x,y,z],...] /* điểm quyết định khung nhìn */ });
sc.box(g,x,y,z,w,d,h,Iso.T.pcb)  sc.cyl(g,cx,cy,z,h,r,'#3b3a35','#6d6b62','#8b887c')  sc.path(g,pts,z,stroke,w)
sc.line  sc.circle  sc.text(g,x,y,'chữ',cỡ,đậm,'middle',màu,'mo'|'sf')  sc.items(g,[{x,y,z,w,d,h,t}])  sc.faceMatrix(x,y,z)  sc.clear(g)
Deck.frames.s9 = function(t){ ... }   // t = giây kể từ lúc hiện slide; vẽ lại phần động mỗi khung; Deck.steps.s9 = function(step){...} nếu cần
```
Xem mẫu đầy đủ: `parts/07-kien-truc.js` (cây 1/3 chặng, 4 slot, UART, màn hình) và `parts/01-bia.js`.
Quy tắc Anatomy: vật thể là khối đặc có chi tiết (ốc, rãnh, ống kính), không phải ô chữ; chữ trong hình rất ít; mọi đường phải kết thúc trên một vật; thứ tự vẽ xa→gần (khối động dùng `sc.items`); khối chuyển động không xuyên qua vật khác; mọi số hiển thị lấy từ cùng mô hình với phần chuyển động.
Khối chunk: ô lập phương nhỏ màu theo Leaf (`Iso.LEAF[i]`: Leaf1 cam, Leaf2 xanh dương, Leaf3 xanh lá).

## Kiểm tra bằng mắt
`NODE_PATH=$(npm root -g) node chup_slide.js s9 6 /tmp/s9.png` (slide, thời điểm t giây, file ra, [bước]). Xem ảnh bằng công cụ Read. Kiểm: chữ đè nhau, chữ bị cắt/tràn, khối xuyên nhau, không còn chỗ trống lớn, mỗi bước (0,1,2…) đều gọn. Không có lỗi console.

## CHỮ TỪ KHÓA (bắt buộc cho mọi slide)
Bài trình bày chỉ hiện **từ khóa** để người xem không bị ngợp; câu gốc đầy đủ vẫn nằm trong DOM và hiện khi bấm **K** (chế độ chi tiết, `?detail`).
- Mỗi khối chữ dài hơn ~5 từ (gạch đầu dòng, đoạn văn, định nghĩa trong bảng, chữ trong thẻ, chú thích) viết thành cặp: `<span class="kw">từ khóa</span><span class="fl">câu gốc NGUYÊN VĂN (kể cả <b>, <code> bên trong)</span>`.
- `kw` ≤ 6 từ (tốt nhất 2–4), CHỈ dùng chữ/số/ký hiệu có trong slide gốc (`kiem_tra_noi_dung.js` bắt chữ mới); giữ nguyên thuật ngữ và số (1024 B, 921600 bps, 4 slot, CRC16, ~200 ms…). Không thêm sự kiện mới.
- Giữ nguyên, KHÔNG rút gọn: tiêu đề (`h2.t`), kick, `.src`, nhãn trong sơ đồ SVG, số liệu trong bảng/biểu đồ, số lớn. `<aside>` ghi chú nói giữ nguyên.
- Vì chữ ít đi: tăng cỡ `kw` (nội dung chính ≥ 22px, phụ ≥ 19px), phóng to sơ đồ để dùng chỗ trống, bỏ khoảng trắng thừa. `fl` (chi tiết) giữ cỡ cũ (≥ 17px) và vẫn không được tràn/đè. Kiểm tra cả hai: `chup_slide.js s9 6 /tmp/a.png` và `chup_slide.js s9 6 /tmp/b.png "" detail`.
- Thứ tự DOM = thứ tự đọc.
