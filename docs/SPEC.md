# SPEC — Happy Farm English

> Phiên bản đặc tả: 0.9 (2026-11-08) · Trạng thái: giai đoạn 8 — HAPPY ZOO (mục 19), khen ở cuối lượt mini-game (16.3). (Bản đồ thế giới giai đoạn 9 đã gỡ theo yêu cầu chủ dự án.)
> Luôn đọc cùng `CLAUDE.md` (luật an toàn) và `docs/TINH-NANG.md` (danh sách tính năng).

---

## 1. Tổng quan

| Mục | Nội dung |
|-----|----------|
| Tên tạm | Happy Farm English |
| Đối tượng | Trẻ 2–8 tuổi (người Việt, mới làm quen tiếng Anh) |
| Người hỗ trợ | Phụ huynh / giáo viên mầm non – tiểu học |
| Mục tiêu học | Nghe – nhận biết – nhắc lại từ vựng tiếng Anh cơ bản qua bối cảnh nông trại |
| Nguyên tắc | Vui, an toàn, ngắn gọn, khen ngợi; học qua chơi, không áp lực |
| Nền tảng | Ứng dụng web cài đặt được (PWA), chạy offline trên máy tính bảng / điện thoại / máy tính |
| Kết nối mạng | **Không cần**. Toàn bộ tài nguyên đóng gói sẵn |

### Ý tưởng chơi
Bé là chủ một nông trại nhỏ. Mỗi lượt chơi bé giúp các bạn con vật (gà, bò, heo, vịt, cừu…) làm việc: tìm con vật, đếm trứng, hái quả đúng màu, cho con vật ăn. Mỗi hoạt động là một câu hỏi tiếng Anh có **âm thanh + hình ảnh**. Hoàn thành lượt → nhận **ngôi sao chăm chỉ** để trang trí nông trại.

Từ giai đoạn 2, bé đi lại tự do trong **thế giới nông trại** (mục 13): ngôi nhà 4 phòng, vườn, chuồng vật nuôi và 4 cửa hàng đồ chơi dùng **xu nông trại** — loại xu **chỉ kiếm được trong game**, không bao giờ mua bằng tiền thật (xem mục 13.6).

---

## 2. Luật theo tuổi

Nhóm tuổi được tính tự động: `tuổi = năm hiện tại − birthYear`. Tuổi < 2 → xếp vào nhóm 2–3 (và hiển thị khuyến cáo cho phụ huynh). Tuổi > 8 → xếp vào nhóm 6–8. Phụ huynh có thể chọn nhóm khác qua Cổng phụ huynh.

| Tiêu chí | 🐣 Nhóm 2–3 tuổi | 🐥 Nhóm 4–5 tuổi | 🐔 Nhóm 6–8 tuổi |
|---|---|---|---|
| **Kích thước nút / vùng chạm** | Tối thiểu **120 × 120 px** (≈ 20 mm); khoảng cách giữa nút ≥ 32 px; tối đa **2–3 lựa chọn** trên màn hình | Tối thiểu **96 × 96 px** (≈ 16 mm); khoảng cách ≥ 24 px; tối đa **3–4 lựa chọn** | Tối thiểu **72 × 72 px** (≈ 12 mm); khoảng cách ≥ 16 px; tối đa **4–6 lựa chọn** |
| **Cỡ chữ** | Gần như không dùng chữ — chỉ hình + âm thanh. Nếu có chữ: ≥ **40 px**, chữ in thường, 1 từ | Từ khóa tiếng Anh ≥ **32 px** kèm hình; chỉ dẫn hoàn toàn bằng giọng nói | Từ / cụm từ ngắn ≥ **24 px** (tiêu đề ≥ 32 px); có thể có câu ngắn 3–5 từ, luôn kèm âm thanh |
| **Phản hồi khi trả lời sai** | Không có khái niệm "sai": con vật lắc đầu dễ thương + âm thanh nhẹ "Hmm?"; đáp án đúng **phát sáng/nảy lên** ngay và đọc lại từ; bé chạm đáp án đúng để đi tiếp | Giọng nói "Try again!" + gợi ý (đáp án đúng nhún nhẹ). Sau **2 lần** chưa đúng → tự hiện đáp án, đọc to, bé chạm để đi tiếp | Giọng nói "Almost! Try again!". Lần 2 → gợi ý (loại bớt 1 đáp án / phát lại âm thanh). Sau **3 lần** → hiện đáp án kèm giải thích ngắn bằng hình |
| **Quy tắc chung khi sai (mọi tuổi)** | Không dấu X đỏ, không âm thanh thất bại, không trừ sao, không mất mạng, không bị đuổi về đầu. Mỗi câu luôn kết thúc bằng việc bé chạm đúng; lời khen dồn vào cuối lượt | ← | ← |
| **Thời lượng mỗi lượt chơi** | **3–5 phút** (≈ 4–5 câu hỏi) | **5–8 phút** (≈ 6–8 câu hỏi) | **8–12 phút** (≈ 8–12 câu hỏi) |
| **Thời lượng sử dụng mỗi ngày (trần tối đa)** | Mặc định **15 phút**, trần **20 phút** | Mặc định **20 phút**, trần **30 phút** | Mặc định **30 phút**, trần **45 phút** |
| **Một phiên chơi = một ngày trong game** (mục 17) | Mặc định **10 phút**, phụ huynh chỉnh **5–15 phút** | Mặc định **15 phút**, chỉnh **5–20 phút** | Mặc định **20 phút**, chỉnh **5–30 phút** |
| **Nghỉ bắt buộc giữa hai phiên** | **60 phút** | **45 phút** | **30 phút** |
| **Nghỉ giữa các lượt** | Sau mỗi lượt: màn hình nghỉ "Stretch time!" (vươn vai cùng con vật) ≥ 30 giây | Sau mỗi lượt: nghỉ ≥ 30 giây | Sau 2 lượt liên tiếp: nghỉ ≥ 60 giây |
| **Kiểu tương tác** | Chỉ **chạm** (tap). Không kéo thả, không giữ lâu | Chạm + kéo thả đơn giản (vật to, vùng thả rộng) | Chạm, kéo thả, ghép cặp, sắp xếp thứ tự |
| **Tốc độ giọng đọc** (ô từ vựng: luôn đọc **3 lần**, mục 15) | Chậm (≈ 0.85×), nghỉ **1,2 s** giữa 2 lần đọc | Bình thường chậm (≈ 0.9×), nghỉ **1,0 s** | Vừa phải (0.95×), nghỉ **0,8 s** (giai đoạn 7: giọng em bé không đọc nhanh — mục 18.8) |
| **Nội dung tiêu biểu** | Con vật, tiếng kêu con vật, 3 màu cơ bản, số 1–3 | Con vật, màu sắc, số 1–10, trái cây/rau, hình dạng | Thêm động từ (eat, run, sleep), tính từ (big/small), câu ngắn "This is a cow", số 1–20 |

### Ghi chú về giới hạn thời gian
- Căn cứ khuyến nghị chung: trẻ 2–5 tuổi nên dùng màn hình ≤ 1 giờ/ngày **tổng cộng** cho mọi thiết bị, nên app chọn mức thấp hơn nhiều.
- Phụ huynh có thể **giảm** thời lượng mỗi ngày tùy ý, nhưng **không thể vượt trần** của nhóm tuổi.
- Còn **2 phút** → con vật nói nhẹ nhàng "Almost time to rest!" (không đếm ngược số giây).
- Hết thời gian lượt → hoàn thành câu hỏi hiện tại rồi chuyển sang màn tổng kết + khen.
- Hết thời gian ngày → màn hình "Nông trại đi ngủ rồi 🌙 – Hẹn gặp lại ngày mai!", không thể bắt đầu lượt mới cho tới ngày hôm sau (theo giờ thiết bị), trừ khi phụ huynh điều chỉnh qua Cổng phụ huynh.
- Bộ đếm chỉ tính thời gian app **đang mở và hiển thị** (tạm dừng khi app chạy nền).
- Chống lách: thời gian dùng được lưu cục bộ theo từng hồ sơ và theo ngày; đổi hồ sơ không reset thời gian của hồ sơ cũ.

---

## 3. Đối tượng người dùng & vai trò

| Vai trò | Quyền |
|---|---|
| **Bé** | Chọn hồ sơ của mình (bằng avatar), chơi, xem nông trại, xem bộ sưu tập sao |
| **Phụ huynh** | Qua Cổng phụ huynh: thêm hồ sơ mới (từ hồ sơ thứ 2), sửa/xóa hồ sơ, chỉnh thời lượng (trong trần), xem tiến độ, xóa toàn bộ dữ liệu |

> **Ngoại lệ hồ sơ đầu tiên:** khi thiết bị chưa có hồ sơ nào, nhấn PLAY sẽ vào thẳng màn tạo hồ sơ (không qua Cổng phụ huynh) để bố mẹ ngồi cùng bé tạo hồ sơ ngay. Màn này có dòng nhắc "Bố mẹ giúp bé nhé". Từ hồ sơ thứ 2 trở đi, nút "+" phải qua Cổng phụ huynh.
> **Nút nhạc** (bật/tắt nhạc nền) hiển thị ở góc màn hình chờ và màn chào lại — việc tắt/bật nhạc vô hại nên không cần cổng.

### Cổng phụ huynh (Parent Gate)
- Kích hoạt: giữ biểu tượng ổ khóa nhỏ ở góc màn hình **3 giây**, sau đó giải một phép tính dành cho người lớn (VD: "17 + 26 = ?", nhập số), hoặc chỉ dẫn bằng chữ ("Chạm vào ngôi sao thứ ba từ bên trái").
- Câu hỏi thay đổi ngẫu nhiên mỗi lần. Sai → quay lại màn hình bé, không báo lỗi gây chú ý.

---

## 4. Hồ sơ bé & dữ liệu

### Mô hình dữ liệu (lưu cục bộ)
```ts
ChildProfile {
  id: string          // id ngẫu nhiên nội bộ, không định danh
  nickname: string    // biệt danh, 1–12 ký tự
  birthYear: number   // năm sinh, VD 2021
  avatarId: string    // id nhân vật hoạt hình có sẵn (VD 'boy-straw', 'girl-bow'), không phải ảnh
  onesie?: string     // (giai đoạn 7) id màu áo liền thân: sky | pink | mint | sun | lilac | peach | red | cream — chỉ là trang phục
  ageGroupOverride?: '2-3' | '4-5' | '6-8'   // do phụ huynh chọn
  createdAt: number
}
Progress   { profileId, lessonId, stars, wordsSeen[], wordsMastered[], lastPlayedDate }
UsageLog   { profileId, date: 'YYYY-MM-DD', secondsUsed }
Settings   { profileId, dailyLimitMinutes, musicOn, soundOn }
FarmState  { profileId, decorationsUnlocked[], placedItems[] }
AppMeta    { lastProfileId?, musicOn }   // cấp thiết bị, dùng trước khi chọn hồ sơ
```

- **Không** có trường nào khác cho thông tin cá nhân (xem `CLAUDE.md` A5).
- Tối đa **4 hồ sơ** trên một thiết bị.
- Lưu bằng IndexedDB (dự phòng localStorage). Xóa hồ sơ → xóa toàn bộ dữ liệu liên quan.
- Không xuất/nhập dữ liệu qua mạng.

### Tạo hồ sơ (giai đoạn 1)
- **Biệt danh**: 1–12 ký tự, chỉ chữ cái (có dấu tiếng Việt), khoảng trắng, dấu gạch ngang. Không cho nhập số, `@` → chặn việc vô tình nhập số điện thoại/email. Có dòng nhắc "Dùng biệt danh, không dùng họ tên thật".
- **Năm sinh**: chọn bằng nút to, chỉ các năm ứng với tuổi 2–8 (năm hiện tại − 8 … năm hiện tại − 2), mỗi nút ghi kèm "x tuổi".
- **Nhân vật**: chọn "Bạn trai / Boy" hoặc "Bạn gái / Girl", rồi chọn 1 trong 3 nhân vật nông dân nhí của nhóm đó (khác màu da, tóc, trang phục). Lựa chọn trai/gái **chỉ là kiểu nhân vật**, không lưu thành trường giới tính riêng.
- Nút **CONFIRM** chỉ bật khi đủ 3 thông tin hợp lệ. Có ô xem trước nhân vật + biệt danh.
- Khi đọc dữ liệu, hồ sơ luôn được lọc qua danh sách trường cho phép (trường lạ bị loại bỏ).

### Chào lại (đã có hồ sơ)
- Nhấn PLAY → tự tải hồ sơ chơi gần nhất (`lastProfileId`), hiện nhân vật + "Welcome back, <biệt danh>!" và nút tiếp tục to.
- Các hồ sơ khác hiện thành hàng avatar để chạm đổi; nút "+" thêm bé (qua Cổng phụ huynh, ẩn khi đủ 4 hồ sơ).

---

## 5. Luồng màn hình

```
Mở app
  └─▶ Màn chờ (logo + nông trại + nút PLAY + nhạc nhẹ)
        └─(PLAY)─┬─(chưa có hồ sơ)──▶ Tạo hồ sơ (bố mẹ giúp) ──CONFIRM──┐
                 └─(đã có hồ sơ)───▶ Chào lại: tự tải hồ sơ gần nhất ◀──┘
                                       ├─ chạm avatar khác → đổi hồ sơ
                                       └─ "+" → 🔒 Cổng phụ huynh → Tạo hồ sơ
              └─(tiếp tục)─▶ Kiểm tra thời gian ngày còn lại
                    ├─(hết)──▶ Màn "Nông trại đi ngủ"
                    └─(còn)──▶ Nông trại (màn chính)
                                 ├─▶ Chọn hoạt động (biểu tượng to, có giọng đọc)
                                 │     └─▶ Lượt chơi (N câu hỏi theo tuổi)
                                 │           └─▶ Tổng kết + khen + nhận sao
                                 │                 └─▶ Màn nghỉ ngơi (Stretch time)
                                 │                       └─▶ Nông trại
                                 ├─▶ Trang trí nông trại (dùng sao)
                                 └─▶ 🔒 Cổng phụ huynh ▶ Khu phụ huynh
```

---

## 6. Nội dung học (giai đoạn đầu)

| Chủ đề | Từ vựng (ví dụ) | Nhóm tuổi |
|---|---|---|
| Animals | cow, pig, chicken, duck, sheep, horse, dog, cat | 2–8 |
| Animal sounds | moo, oink, cluck, quack, baa, neigh | 2–5 |
| Colors | red, yellow, blue, green, orange, pink, purple, brown | 2–8 (2–3: 3 màu) |
| Numbers | one → ten (6–8: → twenty) | 2–8 (2–3: 1–3) |
| Fruits & Vegetables | apple, banana, carrot, corn, tomato, pumpkin | 4–8 |
| Shapes | circle, square, triangle, star, heart | 4–8 |
| Actions & Adjectives | eat, run, sleep, jump; big, small, happy | 6–8 |

- Mỗi từ có: hình minh họa, âm thanh phát âm (giọng bản ngữ, ghi âm sẵn hoặc tổng hợp sẵn và đóng gói), câu ví dụ (6–8 tuổi).
- Dữ liệu từ vựng lưu ở dạng file dữ liệu tách khỏi code (`src/content/`).

---

## 7. Các hoạt động (mini-game)

| Mã | Tên | Mô tả | Tuổi |
|---|---|---|---|
| G1 | **Find the Animal** | Nghe "Where is the cow?" → chạm đúng con vật | 2–8 |
| G2 | **Who Says That?** | Nghe tiếng kêu → chạm con vật tương ứng | 2–5 |
| G3 | **Color Garden** | Nghe "Pick a red apple" → chạm quả đúng màu | 2–8 |
| G4 | **Count the Eggs** | Đếm trứng trong ổ, chạm số đúng | 2–8 |
| G5 | **Feed the Animals** | Kéo thức ăn đúng cho con vật ("The rabbit eats a carrot") | 4–8 |
| G6 | **Word Match** | Ghép hình với chữ tiếng Anh | 6–8 |

Mỗi câu hỏi: phát âm thanh chỉ dẫn tự động + nút loa to để nghe lại bất cứ lúc nào.

> **Giai đoạn 5** (mục 16): theo yêu cầu chủ dự án, 4 mini-game chính là **Find the Word, Listen and Choose, Match the Words, Farm Quiz**. G1 (nghe tên con vật) nằm trong Listen and Choose; G2 (tiếng kêu), G3 (màu), G4 (đếm trứng) là các dạng câu hỏi trong Farm Quiz; G6 = Match the Words. G5 (kéo thả cho ăn) vẫn để sau.

---

## 8. Phần thưởng & động lực (không gây nghiện)

- Mỗi lượt hoàn thành nhận 1–3 **ngôi sao chăm chỉ** — dựa vào việc **hoàn thành**, không dựa vào tốc độ hay số lần sai.
- Sao dùng để mở khóa đồ trang trí nông trại (hàng rào, hoa, cối xay gió…). **Không** có tiền thật.
- **Xu nông trại** (thế giới game, mục 13.6) chỉ kiếm bằng hoạt động trong game; cửa hàng trong game chỉ nhận xu này.
- **Không**: streak, bảng xếp hạng, thông báo đẩy, phần thưởng giới hạn thời gian, hộp quà ngẫu nhiên (loot box).
- Lời khen đa dạng: "Great job!", "Well done!", "You're a super farmer!" kèm hoạt hình con vật nhảy múa.

---

## 9. Giao diện & âm thanh

- Phong cách: hoạt hình **kiểu 3D mềm** (vẽ SVG với gradient khối, điểm sáng, bóng đổ mềm — như đồ chơi đất sét), **màu pastel** dịu mắt, nét tròn, con vật luôn mỉm cười. Không dùng ảnh/tài nguyên tải từ mạng.
- **Giai đoạn 7 (mục 18.1) nâng cấp**: con vật, cây trái, đồ vật trong nhà vẽ **gần thực tế, rõ nét, màu tươi sáng**, ánh sáng tự nhiên từ trên-trái, giữ đúng hình dạng nhận dạng ngoài đời (không biến dạng); thay emoji bằng hình vẽ riêng của game để mọi máy hiển thị giống nhau.
- Font chữ: Baloo 2 (hỗ trợ tiếng Việt), đóng gói cục bộ qua npm, không tải từ CDN.
- Không nhấp nháy > 3 lần/giây; hiệu ứng chuyển cảnh mềm. Chuyển động nền chậm (mây trôi, cối xay quay, con vật nhún nhẹ, nút PLAY "thở" chu kỳ ≥ 2 giây). Tôn trọng cài đặt `prefers-reduced-motion` (tắt chuyển động).
- Âm lượng hiệu ứng vừa phải, không âm thanh giật mình. Nhạc nền nhẹ, có thể tắt.
- **Nhạc nền** được tạo bằng Web Audio ngay trong app (giai điệu ngũ cung chậm, âm lượng thấp, không cần file nhạc). Trình duyệt chặn tự phát nhạc nên nhạc bắt đầu ở **lần chạm đầu tiên**. Tự dừng khi app bị ẩn. Trạng thái bật/tắt lưu trên thiết bị.
- Hỗ trợ hướng ngang (landscape) là chính; màn hình nhỏ vẫn đảm bảo kích thước nút theo tuổi (giảm số lựa chọn thay vì thu nhỏ nút).
- Ngôn ngữ giao diện khu phụ huynh: tiếng Việt. Màn hình của bé: tiếng Anh + hình + âm thanh.
- **Ngoại lệ (giai đoạn 4, theo yêu cầu chủ dự án):** ô từ vựng có thêm dòng chữ nhỏ "Nghĩa: …" bằng tiếng Việt để bố mẹ đọc cùng bé. Tiếng Việt **chỉ hiển thị, không bao giờ được đọc to** — giọng đọc luôn là tiếng Anh.

---

## 10. Khu phụ huynh

- Quản lý hồ sơ (tạo / sửa biệt danh, năm sinh, avatar / xóa).
- Chỉnh thời lượng mỗi ngày (thanh trượt, giới hạn bởi trần theo tuổi).
- Xem tiến độ: số từ đã học, chủ đề đã chơi, thời gian dùng 7 ngày gần nhất (dữ liệu chỉ trên máy).
- Bật/tắt nhạc nền, âm thanh.
- Xóa toàn bộ dữ liệu (xác nhận 2 bước).
- Trang "Cam kết an toàn" (văn bản tĩnh trong app): không quảng cáo, không thu thập dữ liệu, chạy offline.

---

## 11. Kiến trúc kỹ thuật (đã áp dụng từ giai đoạn 1)

| Thành phần | Lựa chọn đề xuất | Lý do |
|---|---|---|
| Ngôn ngữ | TypeScript | An toàn kiểu, dễ bảo trì |
| Build | Vite | Nhanh, đơn giản |
| Giao diện / game | HTML5 + CSS + Canvas/SVG (có thể dùng thư viện game 2D nhẹ, đóng gói cục bộ) | Chạy mọi thiết bị, không cần cài đặt |
| Offline | PWA + Service Worker (cache toàn bộ tài nguyên) | Chạy không cần mạng |
| Lưu trữ | IndexedDB (dự phòng localStorage) | Dữ liệu trên thiết bị |
| Kiểm thử | Vitest (logic) | Test luật theo tuổi, bộ đếm thời gian, lưu hồ sơ |

### Cấu trúc thư mục dự kiến
```
happy-farm-english/
├── CLAUDE.md
├── docs/
│   ├── SPEC.md
│   └── TINH-NANG.md
├── public/                # hình, âm thanh, manifest PWA
└── src/
    ├── config/ageRules.ts # bảng Luật theo tuổi (nguồn duy nhất)
    ├── content/           # dữ liệu từ vựng, bài học
    ├── storage/           # lớp lưu trữ cục bộ
    ├── systems/           # bộ đếm thời gian, phần thưởng, parent gate, âm thanh
    ├── art/               # hình vẽ SVG (nông trại, nhân vật)
    ├── scenes/            # các màn hình
    ├── world/             # thế giới nông trại: bản đồ, va chạm, tìm đường, vẽ, tương tác
    └── games/             # các mini-game G1–G6
```

---

## 12. Tiêu chí chất lượng chung

- Bé 3 tuổi có thể tự chơi một lượt mà không cần đọc chữ.
- Mọi vùng chạm đạt kích thước tối thiểu theo bảng tuổi.
- App chạy đầy đủ khi tắt mạng.
- Không có yêu cầu mạng nào ra ngoài (kiểm tra bằng tab Network).
- Thời gian tải lần đầu < 5 giây trên máy tính bảng tầm trung; chuyển cảnh mượt (≥ 30 fps).

---

## 13. Thế giới nông trại (giai đoạn 2)

Sau "LET'S GO", bé vào **thế giới nông trại**: bản đồ nhìn từ trên xuống có chiều sâu (2.5D), bé điều khiển nhân vật đã chọn khi tạo hồ sơ.

### 13.1 Bản đồ
- Lưới ô vuông 44 × 44 ô (mỗi ô 64 px thế giới; giai đoạn 7 mở rộng thêm 10 hàng phía dưới cho **vườn cây ăn quả**). Camera đi theo nhân vật, không vượt mép bản đồ, tự co theo màn hình.
- **Chiều sâu**: vật thể cao (tường, cây, đồ đạc, nhà, nhân vật) vẽ theo thứ tự chân từ trên xuống → nhân vật đi sau tường/cây bị che đúng; mọi vật có bóng đổ mềm.
- Trang trí: cây, bụi hoa, hàng rào, đường đất, ao nước, biển tên khu vực.

| Khu vực | Vị trí | Vật tương tác (đều hoạt động thật) |
|---|---|---|
| **Nhà — Living room** | trong nhà, dưới trái (có cửa chính) | sofa (ngồi), kệ sách (sách tranh từ vựng), đàn piano màu (7 phím = 7 màu + nốt nhạc), đồng hồ (nói giờ), đèn (bật/tắt) |
| **Nhà — Bedroom** | trong nhà, trên trái | giường (đi ngủ → sáng dậy, cây trong vườn lớn hết), tủ quần áo (đeo/tháo phụ kiện đã có), hộp đồ chơi (từ vựng đồ chơi) |
| **Nhà — Kitchen** | trong nhà, dưới phải | tủ lạnh (xem đồ ăn đang có), bếp nấu (nấu món theo công thức), bồn rửa (rửa tay), bàn ăn (ăn món đã nấu/nướng) |
| **Nhà — Baking corner** | trong nhà, trên phải | bàn trộn bột (chọn công thức bánh), lò nướng (nướng có hẹn giờ ngắn, lấy bánh ra) |
| **Garden** | ngoài, dưới trái, có rào | **mọi ô đất** đều trồng được (bé tự chọn vị trí): gieo hạt → tưới nước → chăm sóc (nhổ cỏ) → thu hoạch; giếng nước (mục 14.3) |
| **Animal pen** | ngoài, bên phải, có rào | gà (nhặt trứng), bò (vắt sữa), cừu (vuốt ve), heo (cho ăn cà rốt/ngô) — có thời gian chờ ngắn giữa 2 lần |
| **Accessory Shop** | dãy cửa hàng phía dưới | 6 loại: mũ, áo, quần, giày, ba lô, kính (+ nơ, khăn) — gương thử đồ, mua, mặc (mục 14.1) |
| **Seed Shop** | dãy cửa hàng | gói hạt: apple, carrot, tomato, strawberry, sunflower, watermelon (+ corn) (mục 14.2) |
| **Fruit Market** | dãy cửa hàng | bán nông sản (rau, quả, hoa, trứng, sữa) lấy xu, có hoạt ảnh bán hàng (mục 14.4) |
| **Baking & Cooking Shop** | dãy cửa hàng | mua 7 nguyên liệu + quầy trộn: kết hợp nguyên liệu thành bánh kem / món ăn (mục 14.5) |
| Ao, biển tên khu vực | rải rác | vịt trong ao, đọc tên khu vực |

### 13.2 Điều khiển (tối ưu cảm ứng)
- **Chạm để đi** (mọi tuổi): chạm vào ô muốn đến → nhân vật tự tìm đường ngắn nhất (Dijkstra trên lưới, 8 hướng, không cắt góc tường; đường đi luôn bắt đầu từ tâm ô hiện tại). Chạm vào đồ vật → nhân vật đi tới cạnh đồ vật. Có vòng tròn đánh dấu đích.
- **Cần điều khiển ảo** (joystick, góc dưới trái): chỉ hiện với nhóm 4–5 và 6–8 (nhóm 2–3 theo luật tuổi chỉ chạm, không kéo). Đẩy nhẹ = đi bộ, đẩy hết = **chạy nhẹ**. Kích thước theo `--btn-min`.
- Chạm để đi quãng xa (> 7 ô) → tự chạy nhẹ.
- **Nút tương tác** (góc dưới phải, ≥ `--btn-min`): chỉ hiện khi đứng gần đồ vật, có biểu tượng + tên tiếng Anh của đồ vật. Không có nút trang trí.
- Bàn phím (tùy chọn cho máy tính): phím mũi tên/WASD đi, Space/Enter tương tác. Không bắt buộc.

### 13.3 Va chạm
- Ô tường, nước, chân đồ đạc, cây, hàng rào, thân nhà/cửa hàng là **ô cứng**. Nhân vật là hình tròn bán kính 0.3 ô, di chuyển tách trục X/Y → trượt dọc tường, không xuyên tường/đồ vật.
- Có test tự động: mọi đồ vật tương tác đều có ít nhất một ô đứng được kề bên và **đi tới được** từ điểm xuất phát.

### 13.4 Nhân vật & hoạt ảnh
- Dùng đúng nhân vật (`avatarId`) của hồ sơ, vẽ kèm phụ kiện đang đeo.
- Hoạt ảnh: đứng (thở nhẹ), đi (nhún + chân bước + nghiêng), chạy (nhanh hơn + bụi nhỏ), hành động (nhảy vui + biểu tượng hoạt động trên đầu), ngồi, ngủ. Quay trái/phải theo hướng đi.

### 13.5 Cửa hàng
- Đi vào cửa → **hiệu ứng vào cửa hàng**: vòng tròn thu nhỏ quanh nhân vật, tiếng chuông cửa, rồi mở cảnh bên trong (kệ hàng, người bán là thú dễ thương chào "Welcome to the Seed Shop!"). Nút EXIT to → hiệu ứng ngược lại, nhân vật đứng trước cửa.
- Thẻ hàng: hình + tên tiếng Anh + giá xu. Chạm thẻ → đọc tên. Nút BUY/SELL to.
- Không đủ xu → thông báo nhẹ nhàng "Let's grow more! 🌱", không âm thanh thất bại.
- Số thẻ mỗi trang = `maxChoices` của nhóm tuổi (2–3: 3 thẻ/trang), có nút trang tiếp.

### 13.6 Xu nông trại & túi đồ (tuân thủ CLAUDE.md A3)
- Xu **chỉ** kiếm được bằng hoạt động trong game có kèm từ vựng (thu hoạch, nhặt trứng, vắt sữa → bán ở Fruit Market). **Không** có cách nào mua xu bằng tiền thật, không quảng cáo đổi xu, không ưu đãi giới hạn thời gian, không hộp quà ngẫu nhiên.
- Khởi đầu: 15 xu, 2 hạt cà rốt, 1 hạt hướng dương.
- Túi đồ (nút 🎒 trên HUD): xem vật phẩm + số lượng, chạm để nghe tên.

### 13.7 Từ vựng trong thế giới
- Mọi lần tương tác đều hiện **ô từ vựng** (giai đoạn 4 thay thẻ từ cũ — xem mục 15).
- Giọng đọc: tạm dùng giọng tổng hợp **có sẵn trên máy** (`speechSynthesis`, chỉ chọn giọng `localService` tiếng Anh — không gửi chữ lên máy chủ). Máy không có giọng cục bộ → chỉ hiện chữ. Sau này thay bằng file ghi âm đóng gói sẵn (mục 6).
- Biểu tượng vật phẩm/đồ đạc/con vật tạm dùng emoji hệ thống (có sẵn trong máy, không tải mạng). **Giai đoạn 7**: con vật, cây trái, đồ trong nhà đã có hình vẽ riêng (mục 18); emoji chỉ còn là dự phòng cho vật phẩm nhỏ trong túi/cửa hàng.

### 13.7b Ghi chú hành vi
- Giếng nước: tưới một lần cho mọi luống chưa tưới.
- Giường: màn "Good night!" → "Good morning!"; sáng dậy mọi cây đã gieo lớn xong, gà/bò sẵn sàng, lò nướng xong.
- Mỗi hồ sơ chỉ nên mở ở **một tab** cùng lúc (hai tab cùng hồ sơ sẽ ghi đè tiến trình của nhau — sẽ thêm khóa ở giai đoạn sau).

### 13.8 Lưu tiến trình thế giới
```ts
WorldSave {            // key: world:<profileId>, chỉ trên thiết bị
  v: 2
  coins: number
  inv: Record<itemId, number>
  plots: Record<'x,y', { crop, plantedAt, wateredAt?, caredAt? }>   // v2: ô đất bất kỳ trong vườn (v1: mảng 6 luống → tự chuyển)
  owned: accessoryId[]; equipped: { head?, face?, neck?, body?, legs?, feet?, back? }
  oven?: { recipe, doneAt }
  animalAt: Record<animalId, number>          // lần nhặt/vắt gần nhất
  pos?: { x, y }
  orchard: Record<treeId, number[]>           // (giai đoạn 7) thời điểm chín lại của từng quả; 0 = đang chín
}
```
- Dữ liệu được lọc khi đọc (id lạ, số âm, kiểu sai bị loại). Không chứa thông tin cá nhân.

---

## 14. Hệ thống hoạt động (giai đoạn 3)

Mọi giao dịch chỉ dùng **xu nông trại** kiếm được từ hoạt động trong game (CLAUDE.md A3, SPEC 13.6). Không có giao dịch tiền thật ở bất kỳ đâu.
Mỗi cửa hàng có **giao diện riêng**: màu, đồ trang trí, bố cục và người bán khác nhau.

### 14.1 Accessory Shop — "Boutique" 🐰
- 6 nhóm (tab biểu tượng lớn): **Hats, Shirts, Pants, Shoes, Bags, Glasses** + "More" (nơ, khăn — đồ cũ vẫn giữ).
- **Gương thử đồ** bên trái: chạm thẻ → nhân vật trong gương **mặc thử** ngay (chưa mất xu) + đọc tên. BUY → mua & mặc. Đồ đã có: WEAR / TAKE OFF.
- Chỗ mặc (slot): head (mũ), face (kính), neck, body (áo), legs (quần/yếm), feet (giày), back (ba lô). Mỗi chỗ 1 món.
- Nhân vật ngoài thế giới vẽ đúng áo, quần, giày (màu chân), ba lô, kính, mũ. Tủ quần áo ở nhà cũng dùng chung gương này.

### 14.2 Seed Shop — "Garden Center" 🐹
- Giao diện **gói hạt** (giấy kraft, hình cây, thời gian lớn ⏱, giá). Hạt: apple, carrot, tomato, strawberry, sunflower, watermelon; giữ thêm corn (dùng trong công thức cũ).
- Táo trồng trong vườn thành cây táo nhỏ (giữ đơn giản cho trẻ).

### 14.3 Khu vườn
- **Chọn vị trí**: bất kỳ ô đất nâu nào trong vườn (trừ giếng). Chạm ô đất → bé đi tới → bảng chọn hạt. Đứng trên ô đất trống → nút tương tác "plant". Tối đa 24 cây cùng lúc.
- Các bước: **gieo** → **tưới** 💧 → lớn tới nửa → **chăm sóc**: cỏ dại 🌿 mọc, cây tạm ngừng lớn tới khi bé **nhổ cỏ** → lớn tiếp → **thu hoạch** (×2).
- Lưu theo toạ độ ô; tải lại trang vẫn thấy cây đúng chỗ, đúng giai đoạn. Save cũ (6 luống) tự chuyển sang toạ độ tương ứng.
- Giếng: tưới mọi cây chưa tưới. Ngủ: mọi cây lớn xong (kể cả bước chăm sóc).

### 14.4 Fruit Market — "Fruit Stand" 🐻
- Bên trái: **giỏ của bé** (nông sản đang có). Bên phải: quầy + cân + hộp tiền.
- SELL → **hoạt ảnh**: món hàng bay từ giỏ lên quầy, cân nhún, đồng xu bay lên ô xu "+3 🪙", người bán nhảy vui, tiếng xu.
- Không có gì để bán → "Bring me fruit and vegetables!".

### 14.5 Baking & Cooking Shop — "Bakery" 🐼
- Kệ 7 nguyên liệu: **Flour, Sugar, Milk, Egg, Butter, Strawberry, Chocolate** (mua bằng xu; trứng/sữa/dâu cũng tự làm ra ở nông trại).
- **Quầy trộn (Mixing Counter)**: bé chạm nguyên liệu trong túi để cho vào bát (tối đa 5), rồi MIX!
  - Khớp đúng một công thức → hoạt ảnh trộn + món mới vào túi + đọc tên món.
  - Không khớp → "Hmm, let's try another mix!" (nhẹ nhàng, không âm thanh thất bại), nguyên liệu **trả lại** túi.
  - Sách công thức (Recipe Book) gợi ý bằng hình.
- Công thức có thể làm: cake, strawberry cake, chocolate cupcake, cookies, pancake, milkshake, hot chocolate (+ bread, pie, omelette… đã có).

---

## 15. Học tiếng Anh qua mọi hoạt động (giai đoạn 4 — hệ thống học chính)

### 15.1 Ô từ vựng (Vocabulary Card)
Mỗi khi bé thực hiện một thao tác (mua hạt, tưới cây, thu hoạch, mua mũ, làm bánh, cho vật nuôi ăn, chạm đồ vật…), một **ô từ vựng nhỏ** hiện **ngay cạnh nhân vật** (bên phải; sát mép phải thì sang trái; trong cửa hàng thì ở giữa bên phải màn hình) và đi theo nhân vật khi bé di chuyển.

```
 🍎             ← hình minh họa (hỗ trợ nghĩa)
 APPLE          ← từ tiếng Anh, chữ IN HOA, to
 /ˈæp.əl/       ← phiên âm IPA giọng Mỹ
 Nghĩa: Quả táo. ← nghĩa tiếng Việt (chữ nhỏ, chỉ để đọc, không đọc to)
 ● ● ○          ← đã đọc mấy lần
```
- Câu ngắn dùng cùng ô nhưng **không** có dòng IPA (tránh quá nhiều chữ): hình + câu + nghĩa.
- **Chỉ một ô tại một thời điểm.** Thao tác mới → ô cũ biến mất ngay, giọng cũ dừng.
- Chạm vào ô = nghe lại. Sau khi ô biến mất, nút 🔊 (góc dưới, ≥ `--btn-min`) có hình của từ vừa học → chạm để hiện lại ô và đọc lại 3 lần.

### 15.2 Bộ đọc
- Ưu tiên **giọng Mỹ (en-US)**, rồi en-GB, rồi giọng tiếng Anh khác. **Không bao giờ** dùng giọng không phải tiếng Anh (không đọc tiếng Việt thay tiếng Anh).
- **Tự đọc 3 lần**, nghỉ giữa các lần theo luật tuổi (1,2 s / 1,0 s / 0,8 s). Đọc xong lần 3 → chờ 1,2 s → ô tự biến mất.
- **Một kênh giọng duy nhất**: mọi lời nói trong game đi qua một hàng đợi; lời mới hủy lời cũ → không bao giờ chồng giọng.
- Chỉ dùng giọng **có sẵn trên máy** (`localService`) → chạy được **khi không có mạng** và không gửi chữ lên máy chủ (CLAUDE.md A4, A6).
- Xử lý lỗi: không có giọng tiếng Anh / giọng báo lỗi / trình duyệt "kẹt" (không báo xong) → mỗi lần đọc có hạn giờ dự phòng; ô vẫn hiện đủ thời gian rồi tự ẩn; hiện biểu tượng 🔇 nhỏ trên ô để bố mẹ biết máy chưa có giọng đọc. Không hiện thông báo lỗi đáng sợ.

### 15.3 Khi nào dạy gì
| Thao tác | Ô từ vựng | Câu ngắn (sau ô từ, tối đa 1 lần / 3 phút cho mỗi câu) |
|---|---|---|
| Vào thế giới | — | **Hello!** |
| Mua hạt giống X | tên quả/rau X (VD APPLE) | — |
| Gieo hạt | SEED | **Let's plant a seed!** |
| Tưới cây / giếng | WATER | **Water the flowers!** |
| Chạm cây đang lớn | GROW | — |
| Nhổ cỏ | WEEDS | — |
| Thu hoạch táo / X | APPLE / X | **I have an apple!** (với táo) · "I have a carrot!"… |
| Mua phụ kiện | tên món (HAT, SUN HAT…) | — |
| Trộn/nướng bánh | tên bánh (CAKE…) | **Let's make a cake!** (khi làm bánh kem) |
| Mua nguyên liệu | tên nguyên liệu (FLOUR…) | — |
| Cho vật nuôi ăn / nhặt trứng / vắt sữa | PIG / EGG / MILK | — |
| Chạm đồ đạc, con vật, cây, hoa, biển tên | tên đồ vật | — |
| Bước vào khu vực mới | tên khu vực (GARDEN, KITCHEN, FARM…) — chỉ khi đang không có ô nào, 1 lần mỗi lượt chơi | — |

### 15.4 Chủ đề từ vựng (sách tranh 📚 + hoạt động)
- **Farm**: farm, tree, flower, garden, water — **Gardening**: seed, plant, water, grow, harvest
- **Fruits**: apple, banana, orange, strawberry, watermelon — **Baking**: cake, milk, egg, sugar, flour
- **Animals**: cow, chicken, duck, pig, sheep (+ horse, dog, cat) — **Sentences**: 5 câu ở 15.3
- Kho từ (`src/content/vocab.ts`) phủ **mọi** vật phẩm, phụ kiện, đồ đạc, con vật, màu, số, khu vực trong game — có test tự động bắt buộc mỗi từ có IPA + nghĩa + hình.
- Cây ở sân (🌳) và bụi hoa trước nhà (🌸) trở thành đồ vật chạm được để dạy TREE / FLOWER.

### 15.5 Theo dõi
- `WorldSave.learn: Record<từ, { n: số lần gặp, t: lần cuối }>` — chỉ lưu trên máy, dùng cho khu phụ huynh sau này (F-44, F-71).

---

## 16. Nhiệm vụ, mini-game & phần thưởng (giai đoạn 5)

### 16.1 Bảng "Play & Learn" ⭐
- Mở bằng **nút sao ⭐ trên HUD** (hiện tổng số sao) hoặc chạm **bảng trò chơi 🎲** ở sân trước nhà. 3 tab: **Quests · Games · Rewards**.

### 16.2 Nhiệm vụ hằng ngày (không bắt buộc — CLAUDE.md A10)
| Nhóm | Số nhiệm vụ | Ví dụ (số lượng nhỏ) |
|---|---|---|
| 2–3 | 2 | Water 1 flower · Feed 1 chicken · Play 1 game · Read the book |
| 4–5 | 3 | Plant 2 seeds · Water 2 flowers · Collect 1 egg · Harvest 1 plant · Play 1 game |
| 6–8 | 4 | Plant 3 seeds · Water 2 flowers · Collect 2 apples · Make 1 cake · Feed 1 chicken · Sell 3 things · Play 2 games |
- Tiến độ tự cộng khi bé làm việc thật trong nông trại (sự kiện: plant, water, harvest, harvest:apple, make:cake, feed:chicken, feed:pig, egg, sell, game, book).
- Hoàn thành → nút **CLAIM** → ⭐ sao + 🪙 xu. Chạm thẻ nhiệm vụ → ô câu đọc to câu tiếng Anh (VD "Plant 3 seeds").
- **Không ép chơi**: không đồng hồ đếm ngược, không streak, **nhiệm vụ chưa xong không hết hạn** (sang ngày mới vẫn giữ nguyên, chỉ thay chỗ của nhiệm vụ đã nhận thưởng). Không thông báo nhắc nhở.
- Cho gà ăn: chạm gà → gà ăn thóc (miễn phí) → đếm "feed:chicken"; trứng vẫn nhặt như cũ.

### 16.3 Mini-game (chơi thật, câu hỏi theo tuổi)
| Game | Cách chơi | Số câu / lượt |
|---|---|---|
| **Find the Word** 🔤 | Hiện hình (VD 🍎), 3 lựa chọn chữ (6–8: 4) → chọn APPLE | theo luật tuổi: 4 / 6 / 8 |
| **Listen and Choose** 👂 | Máy đọc 1 từ (nút 🔊 to để nghe lại) → chọn hình đúng | 4 / 6 / 8 |
| **Match the Words** 🧩 | Chạm chữ rồi chạm hình để nối (chỉ chạm — hợp nhóm 2–3); 2 / 3 / 4 cặp mỗi bảng, 2 bảng | 2 bảng |
| **Farm Quiz** ❓ | Câu hỏi nông trại có giọng đọc: tiếng kêu con vật, con nào cho sữa/trứng, màu, **đếm trứng** (2–3: 1–3, 4–5: 1–5, 6–8: 1–10), cây cần gì… | 4 / 6 / 8 |
- Từ dùng trong game lấy từ kho từ (SPEC 15), lọc theo tuổi (2–3: con vật, quả cơ bản, 3 màu; 4–5: + trái cây/rau, làm bánh; 6–8: + quần áo, đồ trong nhà).
- Đúng → **chỉ một tiếng "ting" nhẹ + ô đúng sáng xanh**, rồi sang câu tiếp ngay (giai đoạn 8: **không khen giữa chừng** để lượt chơi liền mạch). Từ đã trả lời đúng được ghi lại.
- **Khen một lần ở cuối lượt** (màn tổng kết): âm vui + lời khen tiếng Anh đọc to (Great job!, Well done!, Super!, You did it!, Awesome!, Yay!, Good job!, You're a super farmer! — không lặp lại câu ngay trước) + số câu đã làm + danh sách từ vừa học.
- Sai → **không trừ điểm, không X đỏ, không âm thanh thất bại**; lựa chọn sai chỉ lắc nhẹ + mờ đi; gợi ý bằng **hình + âm thanh** theo bảng luật tuổi (mục 2):
  - 2–3: "Hmm?" + đáp án đúng phát sáng/nảy ngay + đọc từ → bé chạm để đi tiếp.
  - 4–5: "Try again!" + đáp án đúng nhún nhẹ; sai lần 2 → phát sáng + đọc từ.
  - 6–8: "Almost! Try again!"; lần 2 → loại bớt 1 lựa chọn sai + phát lại âm thanh; lần 3 → phát sáng + đọc từ.
- Mỗi câu luôn kết thúc bằng việc bé chọn đúng. Màn **tổng kết**: lời khen, ⭐⭐⭐ (luôn đủ khi hoàn thành — không dựa vào số lần sai), 🪙 xu, danh sách từ vừa học (chạm để nghe), nút PLAY AGAIN / BACK (không tự chơi tiếp).

### 16.4 Phần thưởng & mở khóa (Rewards)
- **Sao ⭐**: tổng số sao chỉ tăng, **không bao giờ bị tiêu hay trừ**. Hoàn thành mini-game: +3 ⭐ +5 🪙; nhận thưởng nhiệm vụ: +1–2 ⭐ +3–5 🪙.
- **Con đường sao** (mở khóa theo tổng sao, nhận ngay — không mua bằng tiền thật, A3):

| ⭐ | Mở khóa | Loại |
|---|---|---|
| 3 | Orange seeds 🍊 | cây trồng |
| 6 | Flower pot 🪴 | trang trí |
| 9 | Star glasses ⭐ | phụ kiện (tặng luôn) |
| 12 | Banana seeds 🍌 | cây trồng |
| 15 | Bench 🪑 | trang trí |
| 18 | Rainbow shirt 🌈 | phụ kiện |
| 22 | Fountain ⛲ | trang trí |
| 26 | Grape seeds 🍇 | cây trồng |
| 30 | Hero cape 🦸 | phụ kiện |
| 35 | Birdhouse 🐦 | trang trí |
| 40 | Rainbow 🌈 | trang trí |
- Mở khóa → màn chúc mừng "New!" + ô từ vựng. Cây mới hiện trong Seed Shop (trước đó hiện 🔒 ⭐n), phụ kiện mới vào tủ đồ & mặc thử được, vật trang trí **tự đặt lên sân** ở vị trí cố định (không chắn đường — có test), chạm được để học từ.
- `WorldSave` thêm: `stars`, `unlocked[]`, `quests { day, list[] }`, `games` (số lượt đã chơi từng game).

---

## 17. Thời gian trong game, ngày & đêm (giai đoạn 6)

### 17.1 Nguyên tắc an toàn (ưu tiên hơn yêu cầu "60 phút")
- **60 phút KHÔNG phải thời lượng phù hợp cho trẻ 2–8 tuổi.** Trong code, 60 phút chỉ là **trần kỹ thuật tuyệt đối** của một phiên; thực tế phiên luôn ngắn hơn theo bảng tuổi (mục 2) — 10 / 15 / 20 phút mặc định.
- Thứ tự ưu tiên khi tính thời điểm trời tối: **giới hạn phụ huynh** (nếu đặt) → **bảng tuổi** → **phần thời gian còn lại trong ngày** → trần 60 phút. Lấy **giá trị nhỏ nhất**. Phụ huynh chỉ được **giảm**, không vượt trần theo tuổi.
- Chỉ đếm khi app **đang hiển thị** (ẩn tab / tắt màn hình → dừng đếm). Lưu theo **từng hồ sơ + từng ngày**; đổi hồ sơ không xóa thời gian đã dùng.
- Không có đồng hồ đếm ngược số giây trên màn hình bé (A10). Bé thấy **bầu trời** thay đổi dần.

### 17.2 Ngày & đêm
| Tiến độ phiên | Trạng thái | Hiển thị |
|---|---|---|
| 0 – 75 % | ☀️ Ban ngày | trời xanh, mặt trời trên ô trời ở HUD |
| 75 – 92 % | 🌇 Hoàng hôn | mặt trời lặn dần (ô trời cam/hồng), cả nông trại ửng cam; **đèn trong nhà tự bật**; **nhạc chuyển sang giai điệu buổi tối** (chậm, êm) |
| 92 – 100 % | 🌆 Chạng vạng | trời tím xanh, nông trại tối dần, ánh đèn vàng ấm trong nhà và cửa hàng |
| 100 % | 🌙 Đêm | màn **kết thúc ngày** |
- Còn ~2 phút: con vật nói nhẹ "Almost time to rest!" (một lần, không đếm ngược).
- Ô trời trên HUD hiện **"Day N"** — số ngày trong game của hồ sơ (tăng mỗi phiên mới).

### 17.3 Màn kết thúc ngày
- Chữ lớn: **"Trời tối rồi, chúng ta ngủ thôi nào!"** (tiếng Việt chỉ hiển thị); giọng đọc tiếng Anh: "It's night time. Let's go to sleep!".
- Hình ngôi nhà nông trại ban đêm (trăng, sao lấp lánh chậm, cửa sổ sáng đèn). Nút to **GOOD NIGHT!**
- Khi màn hiện: **tạm dừng mọi hoạt động** (đóng bảng, mini-game, cửa hàng), **lưu tiến trình**. GOOD NIGHT → kết thúc phiên → **về màn chờ**.
- Hồ sơ chuyển sang **"nông trại đang ngủ"**: màn chào lại hiện 🌙 thay cho nút LET'S GO, kèm dòng cho bố mẹ "Bé có thể chơi lại lúc HH:MM" (hết giờ nghỉ) hoặc "ngày mai" (hết giờ trong ngày). Tải lại trang cũng không vượt qua được.
- Mở lại sau giờ nghỉ / ngày hôm sau: tiếp tục hồ sơ cũ, mọi dữ liệu còn nguyên, **Day N+1**.

### 17.4 Khu phụ huynh — thời gian (sau Cổng phụ huynh)
- Nút 🔒 trên màn chào lại → Cổng phụ huynh → bảng tiếng Việt cho hồ sơ đang chọn: đã chơi hôm nay, còn lại, trạng thái nghỉ.
- Thanh trượt **phút mỗi ngày** (5 → trần tuổi) và **phút mỗi phiên** (5 → trần phiên tuổi). Áp dụng ngay cả khi bé đang chơi.
- Nút **"Cho bé chơi tiếp"** chỉ kết thúc sớm **giờ nghỉ giữa phiên**; không vượt được giới hạn trong ngày.

### 17.5 Lưu dữ liệu chống mất
- Lưu: hồ sơ, xu, cây trồng, vật phẩm, nhiệm vụ, thành tích (sao, mốc mở khóa, số lượt game), tiến trình từ vựng, thời gian dùng.
- Ghi IndexedDB ngay sau mỗi thay đổi (gộp trong ~0,5 s) + **bản sao đồng bộ trong localStorage** khi trang bị ẩn / đóng (`pagehide`). Khi mở lại, chọn bản **mới nhất** (`savedAt`).

---

## 18. Đồ họa gần thực tế, nhân vật em bé, vườn cây ăn quả, đồ vật trong nhà (giai đoạn 7)

### 18.1 Phong cách đồ họa
- Hoạt hình 3D đáng yêu nhưng **giữ đúng đặc điểm nhận dạng ngoài đời**: tỉ lệ cơ thể con vật đúng, hình dạng quả đúng, đồ vật đúng công năng. Không trừu tượng, không biến dạng.
- **Màu tươi sáng, rõ nét**: viền tối nhẹ quanh hình để nổi trên nền; ánh sáng tự nhiên từ **trên-trái** (điểm sáng + bóng đổ mềm phía dưới-phải) → có chiều sâu.
- Mọi hình vẽ bằng **SVG vector** ngay trong app (`src/art/library/`) → sắc nét ở mọi độ phân giải, chạy offline, giống nhau trên mọi máy. Không tải ảnh từ mạng.
- Một hình cho mỗi sự vật, dùng chung ở **mọi nơi** (thế giới, khung từ vựng, mini-game, sách tranh) → đồng nhất.

### 18.2 Nhân vật em bé
- Mắt **to, tròn, long lanh** (2 điểm sáng), má hồng, miệng cười; **áo liền thân (onesie)** có khóa kéo/nút, mũ trùm tai thú tùy kiểu.
- Bạn trai / bạn gái (giữ 6 nhân vật cũ: màu da, tóc khác nhau) + **8 màu áo liền thân** chọn khi tạo hồ sơ và đổi lại trong tủ quần áo (lưu `onesie` — chỉ là màu áo, không phải thông tin cá nhân).
- **Tay chân vẽ rời** và chuyển động tự nhiên: đi (tay chân đánh ngược nhau), chạy (biên độ lớn + nghiêng người), **nhảy** (co chân, giơ tay), **vui mừng** (giơ hai tay, mắt cười), **ngạc nhiên** (mắt to tròn, miệng "O", tay dang).
- Cùng một hàm vẽ cho mọi màn hình → mặt và trang phục **không đổi ngẫu nhiên**; phụ kiện đã mua vẫn mặc chồng lên (không mất tính năng cũ).

### 18.3 Động vật (9 con)
| Con | Vị trí | Hình đặc trưng | Âm thanh (tạo bằng Web Audio) |
|---|---|---|---|
| Cow – Bò | chuồng | thân trắng đốm đen, mõm hồng, sừng nhỏ, bầu vú | "moo" trầm, ngân |
| Chicken – Gà | chuồng | thân trắng, mào & yếm đỏ, mỏ vàng | "cluck" lách cách |
| Duck – Vịt | ao | thân trắng, mỏ & chân cam | "quack" mũi |
| Pig – Heo | chuồng | hồng, mõm tròn 2 lỗ mũi, tai cụp, đuôi xoăn | "oink" ụt ịt |
| Sheep – Cừu | chuồng | lông xoăn trắng, mặt & chân xám | "baa" rung |
| Horse – Ngựa | chuồng | nâu, chân dài, bờm & đuôi sẫm | hí "neigh" |
| Rabbit – Thỏ | chuồng | xám-trắng, tai dài, đuôi bông | "thump" nhẹ |
| Dog – Chó | sân | vàng nâu, tai cụp, vòng cổ | "woof" |
| Cat – Mèo | phòng khách | cam vằn, tai nhọn, ria | "meow" lên-xuống |
- Chuyển động: thở (phập phồng), bước nhẹ tại chỗ, thỉnh thoảng quay đầu; con vật luôn vui vẻ (A8).
- Chạm con vật → âm thanh đặc trưng → **khung từ vựng cạnh con vật** (hình + tên Anh + nghĩa Việt) → đọc tên 3 lần. Hành động cũ (nhặt trứng, vắt sữa, cho heo/gà ăn) **vẫn giữ**.

### 18.4 Vườn cây ăn quả (Orchard)
- Khu mới ở phía nam bản đồ (đi xuống từ phố cửa hàng). **8 cây, mỗi cây vẽ riêng** (thân, cành, lá, quả, màu tự nhiên, hình dáng đặc trưng — không dùng chung một mẫu rồi đổi màu):

| Cây | Đặc trưng nhận dạng |
|---|---|
| Apple tree | thân nâu chia cành, tán tròn xanh, táo đỏ có cuống & lá nhỏ |
| Banana tree | thân giả xanh, lá rất to dài xé tua, buồng chuối vàng-xanh + bắp chuối tím |
| Orange tree | tán dày xanh đậm hình cầu, quả cam tròn có vỏ sần |
| Mango tree | tán rộng, lá dài nhọn, quả xoài thuôn vàng-cam treo trên cuống dài |
| Coconut tree | thân cong có vòng đốt, tàu lá dừa xòe, chùm dừa nâu-xanh dưới tán |
| Strawberry plant | cây thấp, lá 3 chét răng cưa, hoa trắng, quả đỏ chấm hạt vàng |
| Watermelon plant | dây bò trên đất, lá xẻ thùy, tua cuốn, quả to sọc xanh |
| Grapevine | giàn gỗ, dây leo, lá nho hình tim xẻ thùy, chùm nho tím |
- Mỗi cây có **các vị trí quả cố định** (3–5 quả). Quả chín hiện to, đúng màu; quả vừa hái → **quả non nhỏ xanh** mọc lại tại chỗ (không biến mất vô lý), chín lại sau ~1 phút.

### 18.5 Chạm trái cây 2 lần
1. **Lần 1** chạm một quả → nhân vật đi tới → **khung từ vựng cạnh quả** (hình quả + APPLE + /IPA/ + "Quả táo.") → đọc "Apple!" ×3 (nghỉ giữa) → khung **tự đóng**. Quả được đánh dấu (viền sáng).
2. **Lần 2** chạm **lại đúng quả đó** → quả **rơi** xuống giỏ dưới gốc (rơi có trọng lực + nảy nhẹ) → giỏ +1 → khung hiện **"3 APPLES"** và đọc "Three apples." (số đếm tiếng Anh, số nhiều đúng: 1 apple, 2 apples; grapes, mangoes…).
- Chỉ hái được quả **đã chín**; chạm lần 2 vào quả non → "Not yet!" nhẹ nhàng, không hái.
- **Không hái trùng**: quả đang rơi/đã hái không nhận chạm; trạng thái từng quả lưu trong `WorldSave.orchard`.
- Số lượng = số quả trong túi (cập nhật chính xác, dùng chung với Fruit Market). Câu đếm đọc **1 lần** (từ vựng ở lần 1 đã đọc 3 lần).
- Quả chưa chín / đang rơi: chạm không có tác dụng hái. Ngủ qua đêm (giường) → sáng ra mọi quả chín lại.
- Con vật cho sản phẩm (gà → trứng, bò → sữa): khung từ đọc tên con vật trước (CHICKEN ×3) rồi tới sản phẩm (EGG ×3).

### 18.6 Đồ vật trong nhà
| Phòng | Đồ vật (đều chạm được, có hình riêng) |
|---|---|
| Living room | sofa, **table**, **chair**, **television**, clock, **window** (+ kệ sách, piano, đèn — giữ nguyên) |
| Bedroom | bed (ngủ), **pillow**, **blanket** (chạm trên giường), wardrobe, **lamp** (+ hộp đồ chơi) |
| Kitchen | **refrigerator**, **kitchen shelf** → spoon, fork, plate, cup, bowl, pan, pot (+ bếp, bồn rửa, bàn ăn) |
| **Bathroom** (phòng mới) | **toothbrush**, **towel**, **soap**, **mirror** |
- Chạm → khung từ vựng (hình nhỏ + tên Anh + nghĩa Việt) **cạnh đồ vật** → đọc 3 lần → tự đóng. Đồ nhỏ trong bếp mở **bảng cận cảnh** với hình to (đạt kích thước chạm theo tuổi).

### 18.7 Khung từ vựng 4×8
- **Tỉ lệ 8 (ngang) × 4 (dọc)** = 2:1, đặt trong một hằng số CSS duy nhất (`--vc-unit`; rộng = 8u, cao = 4u; u = 28 px điện thoại → 40 px máy tính bảng/máy tính).
- Bố cục: **hình minh họa vuông** bên trái (4u × 4u) · bên phải: **TÊN TIẾNG ANH** to đậm, /IPA/ nhỏ, **nghĩa tiếng Việt** nhỏ hơn, chấm đếm lần đọc, **biểu tượng loa** (chạm để nghe lại).
- Bo góc tròn, nền sáng, viền vàng nhạt, đuôi chỉ về vật. Xuất hiện: phóng nhẹ + mờ dần vào; biến mất: thu nhỏ + mờ ra.
- **Đặt cạnh vật được chạm** (con vật / quả / đồ vật / nhân vật), tự né mép màn hình, **không che vật**: đặt sang trái/phải vật; quá sát thì lên trên/xuống dưới.

### 18.8 Giọng đọc em bé
- Ưu tiên **giọng trẻ em tiếng Anh-Mỹ có sẵn trên máy** (tên chứa child/kid/junior hoặc "Ana" của Microsoft) — giọng đi kèm hệ điều hành, được phép dùng; **không giả giọng một em bé cụ thể**.
- Dự phòng: **giọng nữ trẻ, vui tươi** (Samantha, Ava, Allison, Aria, Jenny, Zira…) nâng cao độ nhẹ (pitch ≈ 1,3) cho trong trẻo; tốc độ **0,85 / 0,9 / 0,95** theo nhóm tuổi (không đọc nhanh).
- Đọc "Apple!" — nghỉ — "Apple!" — nghỉ — "Apple!" (có dấu chấm than cho ngữ điệu vui). Vẫn chỉ giọng cục bộ, offline (SPEC 15.2).

---

## 19. HAPPY ZOO — Sở thú (giai đoạn 8)

### 19.1 Vị trí & di chuyển
- Sở thú là **một khu riêng** (bản đồ riêng 40×34 ô), **không thay thế** nông trại. Nông trại giữ nguyên mọi thứ.
- **Nút bản đồ 🗺️** trên HUD (cả nông trại lẫn sở thú) → bảng "Map" có 2 nơi: 🏡 **Farm** và 🦁 **Happy Zoo** + **Zoo Passport** (thành tích). Chạm nơi muốn đến → chuyển cảnh vòng tròn → tới nơi.
- Chuyển nơi **không** bắt đầu phiên chơi mới: đồng hồ phiên/ngày (SPEC 17) chạy tiếp, giới hạn theo tuổi giữ nguyên.
- Lưu `WorldSave.place` ('farm' | 'zoo'): tải lại trang → về đúng nơi đang chơi. Vị trí nông trại (`pos`) và sở thú (`zooPos`) lưu riêng.

### 19.2 Bố cục sở thú
- **Cổng lớn** ở phía nam có bảng **HAPPY ZOO**; vào cổng là đường chính chạy dọc và đường vòng ngang nối mọi khu.
- Cây xanh, **hồ nước**, bãi cỏ, bụi hoa, ghế đá; **hàng rào bảo vệ** quanh mỗi chuồng (bé luôn ở ngoài rào — không tiếp xúc trực tiếp với thú nguy hiểm).
- 5 khu, mỗi khu có **bảng tên tiếng Anh**, nền riêng (cỏ khô, đất rừng, băng tuyết, nước biển, vườn chim) và **trạm chăm sóc** ở mép đường:

| Khu (bảng tên) | Con vật |
|---|---|
| **Grassland** | lion, elephant, giraffe, zebra, rhinoceros |
| **Forest** | monkey, tiger, bear, deer, fox |
| **Ice Land** | penguin, polar bear, seal |
| **Ocean** | dolphin, shark, turtle, octopus, clownfish |
| **Bird Garden** | parrot, peacock, flamingo, owl |
- Thêm **Zoo Book** (ki-ốt sách tranh) gần cổng: 6 chủ đề từ vựng nâng cao (19.6).

### 19.3 Hình & chuyển động con vật
- 22 loài vẽ **riêng từng loài** (không dùng chung mô hình): đúng tỉ lệ (voi to, hươu cao cổ cổ dài, cá hề nhỏ…), đúng bộ phận đặc trưng (vòi, bờm, sừng, sọc, vây, mai, xúc tu, lông đuôi công…), màu tự nhiên, mắt long lanh, vẻ hiền (A8: không nhe nanh, không vẻ hung dữ).
- Mỗi con có vòng hoạt động tự nhiên: **đi lại** trong chuồng, **nghỉ / ngủ** (nằm, thở chậm, 💤), **ăn** (tới máng, cúi đầu), **uống nước** (tới chỗ nước, cúi đầu), **chơi** (nhảy nhẹ). Loài dưới nước **bơi** lượn; chim **vỗ cánh / bay thấp**; khỉ **leo**. Không có cảnh săn mồi, đánh nhau.

### 19.4 Chạm con vật
- Chạm con vật (từ ngoài rào, không cần đi vào chuồng):
  1. **Lần 1** → khung từ 4×8 cạnh con vật: hình + **LION** + /IPA/ + "Sư tử." + loa → đọc "Lion!" ×3 → tự đóng. Ghi "đã gặp" vào Zoo Passport.
  2. **Lần 2** → con vật làm **hoạt động đặc trưng** + **tiếng kêu tự nhiên** (nếu loài có tiếng; loài dưới nước: tiếng bong bóng) + **câu ngắn** ("The lion is sleeping.", "The elephant is drinking water.", "The monkey is eating a banana.") đọc to, kèm nghĩa Việt.
  3. Chạm tiếp → lại tên (lần lẻ) / hoạt động kế tiếp của loài (lần chẵn).

### 19.5 Chăm sóc động vật (trạm chăm sóc mỗi khu)
- **Feed**: chọn con vật → chọn thức ăn (3 lựa chọn). Đúng loài → thức ăn đặt ở máng, con vật tới ăn + câu "The elephant is eating hay." Chọn chưa đúng → nhẹ nhàng "Hmm! Elephants like hay." và gợi ý món đúng (không chê, không trừ điểm).
- **Water**: đổ nước sạch → các con trong khu lần lượt ra uống.
- **Play**: đồ chơi phù hợp (bóng, khối băng, bong bóng, cành cây…) → các con vui chơi.
- **Clean**: trò dọn dẹp đơn giản — chạm từng chiếc lá / đốm bẩn (5–6 cái) cho sạch → "So clean! Thank you!". Chuồng chỉ bám lá lại sau ~15 phút chơi; **không phạt**, không nhắc nhở gây áp lực.
- Thông điệp: con vật cần được yêu thương và bảo vệ ("Animals need love and care.").

### 19.6 Từ vựng nâng cao (Zoo Book)
6 chủ đề, mỗi từ có hình minh họa (hình thư viện hoặc biểu tượng) + đọc 3 lần:
**Animal names** · **Animal sounds** (roar, trumpet, growl, hoot, squawk, honk, bark, neigh…) · **Animal food** (meat, hay, leaves, fish, honey, banana, bamboo, seeds…) · **Body parts** (trunk, mane, horn, neck, tail, wings, beak, fin, shell, tentacles, stripes, paw, feathers) · **Habitats** (grassland, forest, ice, ocean, nest) · **Actions** (eating, drinking, sleeping, swimming, flying, climbing, playing, walking).

### 19.7 Mini-game sở thú (trong bảng Play & Learn, mục Games)
| Game | Cách chơi |
|---|---|
| **Find the Animal** | Nghe tên tiếng Anh (nút loa) → chọn đúng hình con vật |
| **Animal Sounds** | Nghe tiếng kêu → chọn con vật tương ứng |
| **Animal Homes** | Nối con vật với nơi sống (Grassland / Forest / Ice / Ocean / Trees) |
| **Count the Animals** | Đếm số con vật trên màn hình → chọn số → nghe "Three monkeys." (phạm vi số theo tuổi: 1–3 / 1–5 / 1–10) |
- Số câu, số lựa chọn, phản hồi khi sai theo bảng tuổi (mục 2, 16.3). Khen theo 16.3 (khen ở cuối lượt).

### 19.8 Thành tích khám phá (Zoo Passport)
- Mỗi loài gặp lần đầu → đóng **dấu** trong hộ chiếu + **+1 ⭐** (chỉ 1 lần mỗi loài).
- Huy hiệu (mỗi cái +2 ⭐, một lần): **First Friend** (gặp 1 loài), mỗi khu đã gặp đủ loài (**Grassland / Forest / Ice Land / Ocean / Bird Garden Explorer**), **Zoo Explorer** (đủ 22 loài), **Kind Keeper** (cho ăn đúng 5 lần), **Clean Zoo** (dọn sạch cả 5 khu).
- **Không bắt buộc**, không thời hạn, không streak (A10).
- Lưu trong `WorldSave.zoo`: `{ seen: Record<animalId, số lần chạm>, fedOk: number, cleanAt: Record<khu, ms>, badges: string[] }`.
