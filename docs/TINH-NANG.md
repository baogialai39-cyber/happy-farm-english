# TÍNH NĂNG — Happy Farm English

> Danh sách toàn bộ tính năng bắt buộc. Trạng thái: `TODO` · `IN PROGRESS` · `DONE`.
>
> **Luật của file này:**
> 1. Tính năng `DONE` **không được xóa** khỏi danh sách và **không được làm mất** trong code ở các vòng sau.
> 2. Tính năng mới → thêm dòng mới với mã tiếp theo (không dùng lại mã cũ), trạng thái `TODO`, **trước khi** code.
> 3. Muốn thay đổi/ngừng tính năng `DONE` → cần chủ dự án đồng ý và ghi vào "Nhật ký thay đổi".
> 4. Chỉ đánh `DONE` khi đạt tiêu chí nghiệm thu và vẫn tuân thủ `CLAUDE.md`.

---

## A. Nền tảng dự án

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-00 | Tài liệu dự án (`CLAUDE.md`, `docs/SPEC.md`, `docs/TINH-NANG.md`) | 3 file tồn tại, có luật an toàn, bảng Luật theo tuổi, danh sách tính năng | DONE |
| F-01 | Khởi tạo dự án (TypeScript + Vite + PWA) | `npm run dev` chạy được; build ra bản tĩnh | DONE |
| F-02 | Chạy offline (Service Worker cache toàn bộ tài nguyên) | Tắt mạng sau lần tải đầu → app vẫn chạy đầy đủ | TODO |
| F-03 | Cấu hình Luật theo tuổi tập trung (`src/config/ageRules.ts`) | Kích thước nút, cỡ chữ, phản hồi sai, thời lượng lượt/ngày lấy từ một nguồn duy nhất, khớp bảng trong SPEC | DONE |
| F-04 | Lớp lưu trữ cục bộ (IndexedDB, dự phòng localStorage) | Lưu/đọc hồ sơ, tiến độ, thời gian dùng; không có lệnh gọi mạng | DONE |

## B. An toàn trẻ em

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-10 | Cổng phụ huynh (giữ 3 giây + câu hỏi người lớn ngẫu nhiên) | Bé không vào được khu cài đặt; sai → quay về màn bé, không báo lỗi gây chú ý | DONE |
| F-11 | Bộ đếm thời gian mỗi lượt theo tuổi | Hết thời lượng lượt → xong câu hiện tại rồi sang tổng kết | TODO |
| F-12 | Giới hạn thời gian mỗi ngày theo tuổi (mặc định + trần) | Hết giờ → màn "Nông trại đi ngủ"; không bắt đầu lượt mới tới hôm sau; phụ huynh không thể đặt vượt trần | DONE |
| F-13 | Nhắc nhẹ khi sắp hết giờ (còn 2 phút) | Có lời nhắc bằng giọng con vật, không đếm ngược số giây | DONE |
| F-14 | Màn nghỉ ngơi giữa các lượt ("Stretch time!") | Xuất hiện đúng tần suất theo tuổi; không tự động bắt đầu lượt mới | TODO |
| F-15 | Bộ đếm chỉ tính khi app hiển thị; lưu theo hồ sơ + ngày | Ẩn app → tạm dừng; đổi hồ sơ không reset thời gian | DONE |
| F-16 | Kiểm tra an toàn tự động (script quét link ngoài / SDK cấm / `fetch` ra ngoài) | Script báo lỗi nếu phát hiện vi phạm luật A1–A7 | TODO |
| F-17 | Trang "Cam kết an toàn" trong khu phụ huynh (văn bản tĩnh) | Hiển thị trong app, không có link ra ngoài | TODO |

## C. Hồ sơ bé

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-20 | Tạo hồ sơ (biệt danh + năm sinh + nhân vật có sẵn); hồ sơ đầu tiên vào thẳng, hồ sơ thứ 2+ qua Cổng phụ huynh | Chỉ lưu đúng các trường cho phép trong SPEC mục 4; biệt danh không nhận số/`@`; nút CONFIRM chỉ bật khi hợp lệ | DONE |
| F-21 | Chọn hồ sơ bằng avatar to (không cần đọc) | Bé 2–3 tuổi chọn được bằng một lần chạm | DONE |
| F-22 | Sửa / xóa hồ sơ (sau Cổng phụ huynh) | Xóa hồ sơ xóa toàn bộ dữ liệu liên quan | TODO |
| F-23 | Tự tính nhóm tuổi từ năm sinh + phụ huynh ghi đè | Giao diện tự áp dụng đúng luật nhóm tuổi | IN PROGRESS |
| F-24 | Tối đa 4 hồ sơ / thiết bị | Không tạo được hồ sơ thứ 5 | DONE |
| F-25 | Chọn nhân vật Bạn trai / Bạn gái + 3 nhân vật hoạt hình mỗi nhóm | Chạm chọn được; lựa chọn chỉ lưu `avatarId`, không lưu giới tính | DONE |
| F-26 | Tự tải hồ sơ gần nhất khi nhấn PLAY ("Welcome back") | Tải lại trang vẫn hiện đúng nhân vật + biệt danh; tiếp tục chơi không cần tạo lại | DONE |

## D. Màn hình & điều hướng

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-30 | Màn chào (logo + nhạc nhẹ) | Không tự chuyển sang chơi; có nút "Play" to | DONE |
| F-31 | Nông trại (màn chính) với các biểu tượng hoạt động có giọng đọc | Chạm biểu tượng → đọc tên → vào hoạt động | DONE |
| F-32 | Màn tổng kết lượt + lời khen + nhận sao | Luôn tích cực; số sao dựa trên hoàn thành, không dựa trên số lần sai | DONE |
| F-33 | Màn "Nông trại đi ngủ" khi hết giờ trong ngày | Thân thiện, không gây buồn/áp lực | DONE |

## E. Hệ thống học

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-40 | Dữ liệu từ vựng tách khỏi code (`src/content/`) | Thêm từ mới không cần sửa logic | DONE |
| F-41 | Phát âm thanh từ vựng + nút loa nghe lại | Mọi câu hỏi có âm thanh chỉ dẫn tự động + nút nghe lại; tốc độ đọc theo tuổi | IN PROGRESS |
| F-42 | Phản hồi khi trả lời sai theo tuổi | Đúng bảng SPEC; không X đỏ, không âm thanh thất bại, không trừ điểm | DONE |
| F-43 | Phản hồi khi trả lời đúng (khen + hoạt hình) | Lời khen đa dạng, không lặp liên tục một câu | DONE |
| F-44 | Theo dõi tiến độ (từ đã gặp / đã thuộc) | Lưu cục bộ theo hồ sơ | IN PROGRESS |
| F-45 | Chọn câu hỏi phù hợp nhóm tuổi (số lựa chọn, chủ đề) | Nhóm 2–3 tối đa 3 lựa chọn; nhóm 4–5 tối đa 4; nhóm 6–8 tối đa 6 | DONE |

## F. Mini-game

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-50 | G1 — Find the Animal | Nghe tên con vật → chạm đúng; chạy được cho cả 3 nhóm tuổi | DONE |
| F-51 | G2 — Who Says That? | Nghe tiếng kêu → chạm con vật (2–5 tuổi) | DONE |
| F-52 | G3 — Color Garden | Nghe màu → chạm quả đúng màu | DONE |
| F-53 | G4 — Count the Eggs | Đếm và chạm số đúng; phạm vi số theo tuổi | DONE |
| F-54 | G5 — Feed the Animals | Kéo thả thức ăn đúng (4–8 tuổi), vùng thả rộng | TODO |
| F-55 | G6 — Word Match | Ghép hình với chữ (6–8 tuổi) | DONE |

## G. Phần thưởng

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-60 | Ngôi sao chăm chỉ | Nhận sau mỗi lượt; không quy đổi tiền thật | DONE |
| F-61 | Trang trí nông trại bằng sao | Mở khóa đồ trang trí, đặt lên nông trại, lưu lại | DONE |
| F-62 | Không có cơ chế ép chơi | Kiểm tra: không streak, không thông báo đẩy, không loot box, không phần thưởng giới hạn thời gian | DONE |

## H. Khu phụ huynh

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-70 | Chỉnh thời lượng mỗi ngày (trong trần theo tuổi) | Thanh trượt không vượt trần | DONE |
| F-71 | Xem tiến độ & thời gian dùng 7 ngày | Dữ liệu chỉ từ máy, hiển thị tiếng Việt | TODO |
| F-72 | Bật/tắt nhạc nền & âm thanh | Lưu theo hồ sơ | TODO |
| F-73 | Xóa toàn bộ dữ liệu (xác nhận 2 bước) | Sau khi xóa, app về trạng thái ban đầu | TODO |

## I. Giao diện & trải nghiệm

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-80 | Kích thước nút & cỡ chữ theo tuổi | Đo được đúng tối thiểu theo bảng SPEC trên mọi màn hình | IN PROGRESS |
| F-81 | Hiệu ứng an toàn (không nhấp nháy > 3 lần/giây, không âm thanh giật mình) | Rà soát toàn bộ hiệu ứng | TODO |
| F-82 | Responsive (máy tính bảng, điện thoại, máy tính; ưu tiên ngang) | Màn nhỏ giảm số lựa chọn, không thu nhỏ nút dưới mức tối thiểu | IN PROGRESS |
| F-83 | Nhạc nền nhẹ (Web Audio, không file nhạc) + nút bật/tắt | Bắt đầu ở lần chạm đầu; dừng khi ẩn app; nhớ trạng thái bật/tắt | IN PROGRESS |
| F-84 | Màn chờ kiểu 3D pastel có chuyển động nhẹ (mây, cối xay, con vật, nút PLAY) | Chuyển động chậm, không nhấp nháy; tắt khi `prefers-reduced-motion` | DONE |

## J. Thế giới nông trại (giai đoạn 2)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-90 | Bản đồ nông trại 2.5D có chiều sâu + camera theo nhân vật | Vẽ theo thứ tự chân; có cây, hoa, rào, đường; camera không vượt mép | DONE |
| F-91 | Chạm để đi (tìm đường A*) | Chạm ô/đồ vật → nhân vật tự đi tới, vòng qua vật cản | DONE |
| F-92 | Cần điều khiển ảo + chạy nhẹ (nhóm 4–8) | Đẩy nhẹ đi, đẩy hết chạy; ẩn với nhóm 2–3 | DONE |
| F-93 | Hoạt ảnh nhân vật (đứng, đi, chạy, hành động, ngồi, ngủ) + hiển thị phụ kiện | Nhìn rõ khác biệt khi đi/chạy/đứng | DONE |
| F-94 | Va chạm: không xuyên tường/đồ vật | Test tự động + chạy thử dọc tường | DONE |
| F-95 | Nút tương tác theo ngữ cảnh | Chỉ hiện khi đứng gần đồ vật; hiện tên tiếng Anh | DONE |
| F-96 | Phòng khách: sofa, kệ sách, piano màu, đồng hồ, đèn | Mỗi vật có hành động + thẻ từ | DONE |
| F-97 | Phòng ngủ: giường, tủ quần áo, hộp đồ chơi | Ngủ làm cây lớn; tủ đổi phụ kiện | DONE |
| F-98 | Nhà bếp: tủ lạnh, bếp nấu, bồn rửa, bàn ăn | Nấu theo công thức (trừ nguyên liệu, thêm món); ăn món | DONE |
| F-99 | Khu làm bánh: bàn trộn + lò nướng hẹn giờ | Trộn → nướng → lấy bánh | DONE |
| F-100 | Vườn: gieo – tưới – lớn – thu hoạch (mở rộng ở giai đoạn 3: mọi ô đất, 6 luống cũ tự chuyển) | Lưu trạng thái; tải lại vẫn đúng | DONE |
| F-101 | Chuồng vật nuôi: gà, bò, cừu, heo | Trứng/sữa vào túi; heo ăn cà rốt/ngô | DONE |
| F-102 | Cửa hàng phụ kiện | Mua bằng xu → đeo ngay trên nhân vật | DONE |
| F-103 | Cửa hàng hạt giống | Mua hạt bằng xu | DONE |
| F-104 | Cửa hàng thu mua nông sản (Fruit Market) | Bán nông sản lấy xu | DONE |
| F-105 | Cửa hàng đồ làm bánh & nấu ăn | Mua nguyên liệu bằng xu | DONE |
| F-106 | Hiệu ứng vào/ra cửa hàng | Vòng tròn thu/mở + chuông + lời chào | DONE |
| F-107 | Xu nông trại + túi đồ (chỉ kiếm trong game) | Không mua xu bằng tiền thật; xu không âm | DONE |
| F-108 | Thẻ từ + đọc từ bằng giọng cục bộ | Mọi tương tác hiện thẻ từ; chỉ dùng giọng `localService` | DONE |
| F-109 | Lưu tiến trình thế giới theo hồ sơ | Tải lại trang giữ xu, túi đồ, vườn, phụ kiện, vị trí | IN PROGRESS |

## K. Hệ thống hoạt động (giai đoạn 3)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-110 | Phụ kiện 6 loại (mũ, áo, quần, giày, ba lô, kính) + gương thử đồ | Thử → mua → mặc; nhân vật ngoài thế giới đổi đúng ngoại hình; tủ quần áo dùng chung | DONE |
| F-111 | Seed Shop giao diện gói hạt + hạt táo | Đủ 6 loại hạt yêu cầu; mua bằng xu | DONE |
| F-112 | Vườn: chọn vị trí trồng trên mọi ô đất | Chạm ô đất → gieo đúng ô đó; lưu theo toạ độ | DONE |
| F-113 | Vườn: bước chăm sóc (nhổ cỏ dại) | Cây dừng lớn ở nửa chừng tới khi nhổ cỏ | DONE |
| F-114 | Fruit Market: hoạt ảnh bán hàng | Món bay lên quầy, xu bay lên, người bán vui | DONE |
| F-115 | Bakery: 7 nguyên liệu + quầy trộn kết hợp tự do | Khớp công thức → ra món; sai → trả lại nguyên liệu, phản hồi tích cực | DONE |
| F-116 | Giao diện riêng cho từng cửa hàng | 4 cửa hàng khác nhau về màu, trang trí, bố cục | DONE |

## L. Học tiếng Anh qua hoạt động (giai đoạn 4)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-120 | Ô từ vựng cạnh nhân vật (hình + TỪ + IPA Mỹ + nghĩa Việt) | Hiện sau mọi thao tác; đi theo nhân vật; 1 ô mỗi lúc | DONE |
| F-121 | Bộ đọc: 3 lần, nghỉ theo tuổi, tự ẩn, một kênh giọng | Đọc đủ 3 lần rồi ô biến mất; thao tác mới hủy giọng cũ; không chồng giọng | DONE |
| F-122 | Nút nghe lại (chạm ô + nút 🔊 từ vừa học) | Bé tự nghe lại 3 lần | DONE |
| F-123 | Kho từ vựng đầy đủ (IPA Mỹ, nghĩa, hình) phủ mọi thứ trong game | Test: mọi vật phẩm/đồ vật/khu vực đều có mục từ | DONE |
| F-124 | Câu tiếng Anh ngắn theo hoạt động | 5 câu yêu cầu xuất hiện đúng lúc, không lặp dồn dập | DONE |
| F-125 | Sách tranh theo chủ đề: Farm, Gardening, Fruits, Baking, Animals, Sentences | Đủ từ theo yêu cầu; chạm → ô từ vựng | DONE |
| F-126 | Xử lý lỗi giọng đọc / không mạng | Không có giọng / lỗi / kẹt → ô vẫn chạy đủ rồi ẩn, hiện 🔇; không đọc tiếng Việt | DONE |

## M. Nhiệm vụ, mini-game & phần thưởng (giai đoạn 5)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-130 | Bảng Play & Learn (Quests · Games · Rewards) + nút sao trên HUD + bảng trò chơi ở sân | Mở được từ HUD và từ bảng 🎲 | DONE |
| F-131 | Nhiệm vụ hằng ngày theo tuổi, tự cộng tiến độ, nhận thưởng | 2/3/4 nhiệm vụ; không hết hạn; không đếm ngược; không streak | DONE |
| F-132 | Mini-game Find the Word | Hình → chọn chữ; 3 lựa chọn (6–8: 4); chơi hết lượt được | DONE |
| F-133 | Mini-game Listen and Choose | Nghe từ → chọn hình; nút nghe lại | DONE |
| F-134 | Mini-game Match the Words | Chạm chữ + chạm hình để nối; 2/3/4 cặp | DONE |
| F-135 | Mini-game Farm Quiz | Câu hỏi nông trại có giọng đọc; đếm trứng theo tuổi | DONE |
| F-136 | Con đường sao: mở khóa cây trồng, phụ kiện, vật trang trí | Mở theo tổng sao; trang trí tự đặt lên sân, không chắn đường | DONE |
| F-137 | Cho gà ăn (thóc miễn phí) | Đếm vào nhiệm vụ Feed chicken | DONE |

## N. Thời gian trong game & an toàn (giai đoạn 6)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-140 | Phiên chơi = một ngày trong game, độ dài theo tuổi (≤ giới hạn phụ huynh ≤ trần 60 phút) | 10/15/20 phút mặc định; lấy giá trị nhỏ nhất | DONE |
| F-141 | Ngày → hoàng hôn → chạng vạng: trời tối dần, mặt trời lặn trên HUD, nông trại ửng cam/tối | Đổi đúng mốc 75% / 92% / 100% | DONE |
| F-142 | Đèn trong nhà tự bật buổi tối + ánh đèn ấm | Bật từ hoàng hôn | DONE |
| F-143 | Nhạc nền giai điệu buổi tối | Chuyển nhạc khi hoàng hôn | DONE |
| F-144 | Màn kết thúc ngày + GOOD NIGHT → lưu, dừng, về màn chờ | Không chơi tiếp được trong cùng phiên; tải lại cũng không vượt | DONE |
| F-145 | Nghỉ bắt buộc giữa hai phiên theo tuổi + màn "nông trại đang ngủ" | 60/45/30 phút; hết giờ ngày → ngày mai | DONE |
| F-146 | Đếm ngày trong game (Day N) | Tăng mỗi phiên mới, lưu theo hồ sơ | DONE |
| F-147 | Lưu chống mất dữ liệu (ghi ngay + sao lưu đồng bộ khi đóng trang) | Tải lại / đóng app không mất xu, cây, vật phẩm, nhiệm vụ, sao, từ vựng | DONE |

## O. Đồ họa thực tế, em bé, vườn cây, đồ trong nhà (giai đoạn 7)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-150 | Thư viện hình vẽ gần thực tế (SVG) dùng chung mọi màn hình | Không còn emoji cho con vật, cây trái, đồ trong nhà; rõ nét, đúng hình dạng | DONE |
| F-151 | Nhân vật em bé: mắt to long lanh, áo liền thân, 8 màu áo, bạn trai/gái | Đồng nhất mọi màn hình; chọn màu khi tạo hồ sơ + đổi trong tủ đồ | DONE |
| F-152 | Tay chân chuyển động + hoạt ảnh đi, chạy, nhảy, vui mừng, ngạc nhiên | Thấy rõ từng hoạt ảnh | DONE |
| F-153 | 9 con vật vẽ riêng (thêm ngựa, thỏ, chó, mèo) + chuyển động + âm thanh đặc trưng | Chạm từng con → tiếng kêu + khung từ cạnh con vật + đọc 3 lần | DONE |
| F-154 | Vườn cây ăn quả: 8 cây vẽ riêng (táo, chuối, cam, xoài, dừa, dâu, dưa hấu, nho) | Phân biệt được từng cây; đi tới được | DONE |
| F-155 | Chạm trái lần 1: khung từ cạnh quả, đọc 3 lần, tự đóng | Đúng quả, đúng từ | DONE |
| F-156 | Chạm trái lần 2: quả rơi vào giỏ, đếm số tiếng Anh, cập nhật số lượng | Chỉ quả chín; không hái trùng; số đúng; quả non mọc lại | DONE |
| F-157 | Đồ vật phòng khách mới: table, chair, television, window | Chạm → khung từ cạnh vật | DONE |
| F-158 | Phòng ngủ: pillow, blanket (trên giường), lamp | Chạm đúng phần giường | DONE |
| F-159 | Nhà bếp: refrigerator + kệ bếp cận cảnh (spoon, fork, plate, cup, bowl, pan, pot) | Mỗi món có hình riêng, chạm được | DONE |
| F-160 | Phòng tắm mới: toothbrush, towel, soap, mirror | Đi vào được; 4 đồ vật chạm được | DONE |
| F-161 | Khung từ vựng 4×8 (2:1) đặt cạnh vật, không che vật, có loa, hiệu ứng vào/ra | Đúng tỉ lệ; tự né mép; tự đóng | DONE |
| F-162 | Giọng đọc em bé / nữ trẻ vui tươi, tốc độ vừa phải | Ưu tiên giọng trẻ em cục bộ; dự phòng giọng nữ pitch cao | DONE |
| F-163 | Kiểm tra giao diện điện thoại & máy tính bảng | Không vỡ bố cục; nút đủ lớn | DONE |

---

## P. HAPPY ZOO — Sở thú (giai đoạn 8)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-170 | Mini-game: không khen giữa chừng, khen một lần ở cuối lượt | Đúng → "ting" + sáng xanh, sang câu ngay; màn tổng kết có lời khen đọc to | DONE |
| F-171 | Bản đồ sở thú riêng: cổng HAPPY ZOO, đường đi, cây, hồ, cỏ, hoa, hàng rào | Đi tới được mọi khu; không thay thế nông trại | DONE |
| F-172 | Nút bản đồ 🗺️: Farm ↔ Happy Zoo, lưu nơi đang chơi | Chuyển qua lại không mất dữ liệu, không mở phiên chơi mới | DONE |
| F-173 | 5 khu có bảng tên tiếng Anh (Grassland, Forest, Ice Land, Ocean, Bird Garden) | Mỗi khu đủ loài theo SPEC 19.2 | DONE |
| F-174 | 22 loài vẽ riêng, gần thực tế | Không dùng chung mô hình; đúng bộ phận đặc trưng | DONE |
| F-175 | Hoạt động tự nhiên: đi lại, nghỉ/ngủ, ăn, uống, chơi, bơi, bay, leo | Thấy rõ từng hoạt động | DONE |
| F-176 | Chạm lần 1: khung từ (hình, tên Anh, nghĩa Việt, loa), đọc 3 lần, tự đóng | Đúng loài, đúng từ | DONE |
| F-177 | Chạm lần 2: hoạt động đặc trưng + tiếng kêu + câu ngắn tiếng Anh | VD "The lion is sleeping." | DONE |
| F-178 | Âm thanh tự nhiên cho các loài (tổng hợp Web Audio) | Âm lượng vừa, không giật mình | DONE |
| F-179 | Trạm chăm sóc: Feed (đúng thức ăn), Water, Play | Con vật tới máng ăn/uống/chơi thật | DONE |
| F-180 | Trò dọn dẹp chuồng | Chạm hết lá → sạch; không phạt | DONE |
| F-181 | Mini-game Find the Animal | Nghe tên → chọn hình | DONE |
| F-182 | Mini-game Animal Sounds | Nghe tiếng → chọn con vật | DONE |
| F-183 | Mini-game Animal Homes | Nối con vật ↔ nơi sống | DONE |
| F-184 | Mini-game Count the Animals | Đếm → chọn số → "Three monkeys." | DONE |
| F-185 | Zoo Book: 6 chủ đề từ vựng nâng cao | Mỗi từ có hình + đọc 3 lần | DONE |
| F-186 | Zoo Passport: dấu từng loài + huy hiệu khám phá (+⭐), lưu tiến trình | Không bắt buộc; tải lại không mất | DONE |

---

## Q. Bản đồ thế giới & thanh công cụ (giai đoạn 9) — ĐÃ GỠ theo yêu cầu chủ dự án (xem Nhật ký thay đổi)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-190 | Bản đồ thế giới isometric SVG (nền nổi, đường, đường ray + tàu, biển, thác, cây, đèn, mây) | Nét khi phóng to; chữ không méo; không chồng khu | ĐÃ GỠ |
| F-191 | 9 khu có kiến trúc & bảng tên riêng, nối bằng đường | Đủ 9 khu theo SPEC 20.2 | ĐÃ GỠ |
| F-192 | Chạm khu: sáng + nhún, bảng tên, đọc tên, bé đi tới, chuyển cảnh, xuất hiện tại khu | Mỗi khu vào đúng nơi & đúng điểm | ĐÃ GỠ |
| F-193 | Kéo / phóng to bản đồ (chuột, chụm 2 ngón, nút + −); kéo không tính là chạm | Máy tính thấy toàn cảnh; điện thoại kéo được | ĐÃ GỠ |
| F-194 | LET'S GO → bản đồ; nút MAP ở mọi nơi; đồng hồ thời gian vẫn chạy ở bản đồ | Không mở phiên mới khi đi lại | ĐÃ GỠ |
| F-195 | Thanh công cụ trái: avatar, tên, HOME, CHANGE CHARACTER, MAP, COLLECTION, SETTINGS | Nút ≥ cỡ theo tuổi; không che cần điều khiển | ĐÃ GỠ |
| F-196 | CHANGE CHARACTER: đổi nhân vật + màu áo, lưu hồ sơ | Chỉ lưu avatarId / onesie | ĐÃ GỠ |
| F-197 | COLLECTION: túi đồ, Zoo Passport, con đường sao, từ đã học | Mở được từ bản đồ và mọi nơi | ĐÃ GỠ |
| F-198 | SETTINGS sau Cổng phụ huynh: nhạc, giới hạn thời gian | Bé không tự vào được | ĐÃ GỠ |
| F-199 | HAPPY PET PARK: 5 thú cưng + trạm chăm sóc (Feed, Brush, Play) | Chạm từng bạn → tiếng + khung từ; chăm sóc chạy thật | ĐÃ GỠ |
| F-200 | HAPPY SCHOOL: bảng đen (8 game), bảng nhiệm vụ, kệ cúp, bảng ABC | Mở đúng chức năng | ĐÃ GỠ |
| F-201 | HAPPY LIBRARY: sách nông trại, Zoo Book, My Words | Chạm từ → đọc 3 lần | ĐÃ GỠ |
| F-202 | Lưu nơi đang chơi + vị trí từng nơi (chuyển dữ liệu cũ) | Tải lại về đúng nơi; save cũ không mất | ĐÃ GỠ |

---

## R. Âm thanh trên iPhone (Safari iOS, Chrome iOS)

| Mã | Tính năng | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| F-210 | Mở khóa Web Audio đúng chuẩn iOS: trong sự kiện chạm, resume cả `suspended` / `interrupted`, phát được khi gạt nút im lặng | Nhạc nền + hiệu ứng phát trên iPhone sau lần chạm đầu | IN PROGRESS (chờ thử trên iPhone thật) |
| F-211 | Mở khóa giọng đọc iOS + dự phòng giọng tiếng Anh mặc định khi iOS chưa trả danh sách giọng | Chạm Hello / con vật / trái cây / đồ vật nghe tên tiếng Anh trên iPhone | IN PROGRESS (chờ thử trên iPhone thật) |
| F-212 | TEST SOUND trong khu phụ huynh: kiểm tra AudioContext, HTMLAudioElement, giọng đọc; báo lỗi dễ hiểu | Kết quả thật (không giả), có gợi ý khắc phục | DONE |

---

## Tổng hợp trạng thái

| Trạng thái | Số lượng |
|---|---|
| DONE | 112 |
| IN PROGRESS | 9 |
| TODO | 11 |
| ĐÃ GỠ | 13 |

---

## Ghi chú phần còn dở (giai đoạn 1)

- F-04: (DONE ở giai đoạn 6) lưu hồ sơ, tiến trình thế giới, tiến độ học, thời gian dùng, giới hạn phụ huynh.
- F-23: đã tự tính nhóm tuổi; chưa có màn phụ huynh để ghi đè.
- F-31: đã thay khung chào bằng **thế giới nông trại** (giai đoạn 2): chạm đồ vật → nghe tên → hoạt động. Mini-game G1–G6 sẽ gắn vào thế giới ở giai đoạn sau.
- F-83: nhạc đã chạy được về mặt kỹ thuật; cần chủ dự án nghe thử để duyệt giai điệu/âm lượng.
- F-04: đã lưu thêm tiến trình thế giới (`world:<profileId>`); còn thiếu thời gian dùng.
- F-108: đã thay bằng ô từ vựng (F-120 → F-126). Đã nghe thử thật trên Windows (giọng Microsoft Zira en-US). Vẫn nên thử trên máy tính bảng/điện thoại thật vì mỗi máy có bộ giọng khác nhau.
- F-41: Listen and Choose và Farm Quiz có giọng đọc tự động + nút 🔊 nghe lại; Find the Word cố ý KHÔNG đọc đáp án (bé tự tìm chữ) nên chưa có nút nghe lại cho từng câu → còn IN PROGRESS.
- F-61: vật trang trí tự đặt ở vị trí cố định khi mở khóa (chưa cho bé tự chọn chỗ đặt).
- F-44: đã lưu số lần gặp từng từ/câu (`learn`); chưa có tiêu chí "đã thuộc" và màn xem tiến độ cho phụ huynh.
- F-109: lưu/đọc + sao lưu đồng bộ khi đóng trang đã chạy (giai đoạn 6); vẫn thiếu khóa "một hồ sơ chỉ mở ở một tab" — mở 2 tab cùng hồ sơ thì tab lưu sau sẽ ghi đè.
- F-14 (màn "Stretch time!" giữa các lượt mini-game) vẫn TODO; giờ nghỉ bắt buộc giữa hai **phiên** đã có (F-145).
- F-80 / F-82: các màn giai đoạn 1 đã dùng kích thước theo tuổi và co giãn được; cần rà lại khi có thêm màn mới.
- F-162 (giai đoạn 7): máy thử (Windows) không có giọng trẻ em cục bộ → app tự dùng giọng nữ Microsoft Zira, cao độ 1,3, tốc độ 0,85–0,95. Trên máy có giọng trẻ em (tên chứa child/kid/junior) app sẽ tự chọn giọng đó. Không dùng giọng trực tuyến (A4, A6).
- F-174 / F-178 (giai đoạn 8): hình 22 loài và tiếng kêu đều tự vẽ / tự tổng hợp trong app (offline, không tải file). Tiếng kêu là âm mô phỏng nhẹ nhàng, không phải bản ghi âm thật; loài dưới nước không có tiếng → tiếng bong bóng; con vật đang ngủ thì im lặng.
- F-185 (giai đoạn 8): tên con vật trong Zoo Book dùng hình vẽ thư viện; các từ khác (thức ăn, bộ phận, nơi sống, hoạt động, tiếng kêu) dùng biểu tượng hình (emoji hệ thống) làm minh họa.
- F-171 → F-186: đã chạy thử trong trình duyệt ở khung hẹp (~564 px) và bằng test tự động; nên thử thêm trên điện thoại / máy tính bảng thật.
- F-190 → F-202 (giai đoạn 9): đã gỡ khỏi code theo yêu cầu chủ dự án; giao diện trở lại như giai đoạn 8.
- F-163 (giai đoạn 7): đã kiểm 375×812, 812×375, 768×1024, 1024×768, 1280×800 bằng test tự động (vị trí khung từ) + đo trong trình duyệt (khung 224×112 trên điện thoại, 320×160 trên máy tính bảng, không cuộn ngang, nút ≥ 66 px). Nên thử thêm trên máy thật.

---

## Nhật ký thay đổi

| Ngày | Thay đổi | Lý do |
|---|---|---|
| 2026-11-08 | Tạo danh sách tính năng ban đầu (F-00 → F-82) | Khởi tạo dự án |
| 2026-11-08 | Thêm F-25, F-26, F-83, F-84. Sửa tiêu chí F-20 (chưa DONE): hồ sơ đầu tiên không cần Cổng phụ huynh | Giai đoạn 1 theo yêu cầu: nhấn PLAY lần đầu vào thẳng màn tạo hồ sơ |
| 2026-11-08 | Giai đoạn 1 xong: màn chờ, tạo hồ sơ, chào lại, Cổng phụ huynh, lưu IndexedDB. DONE: F-01, F-03, F-10, F-20, F-21, F-24, F-25, F-26, F-30, F-84 | Đã kiểm thử: 11 unit test + chạy thử trong trình duyệt |
| 2026-11-08 | Thêm F-90 → F-109 (thế giới nông trại). Cập nhật SPEC mục 1, 8, 13: cửa hàng dùng **xu nông trại chỉ kiếm trong game** | Giai đoạn 2 theo yêu cầu chủ dự án; vẫn tuân thủ A3 (không tiền thật) |
| 2026-11-08 | Giai đoạn 2 xong phần chính: DONE F-31, F-90 → F-107. F-108, F-109 còn IN PROGRESS (xem ghi chú) | Đã kiểm thử: 27 unit test (bản đồ, va chạm, tìm đường, kinh tế) + chạy thử 33 đồ vật trong trình duyệt |
| 2026-11-08 | Thêm F-110 → F-116. **Mở rộng tính năng DONE** (không xóa): F-100 từ 6 luống cố định → mọi ô đất (6 luống cũ tự chuyển) + thêm bước chăm sóc; F-102 thêm 6 loại phụ kiện (giữ đồ cũ); F-103 thêm hạt táo (giữ corn); F-105 thêm sữa/trứng/dâu + quầy trộn | Chủ dự án yêu cầu trực tiếp ở prompt giai đoạn 3 (chọn vị trí trồng, chăm sóc, phụ kiện 6 loại, nguyên liệu) |
| 2026-11-08 | Giai đoạn 3 xong: DONE F-110 → F-116. Hồi quy: F-100, F-102 → F-105, F-97 (tủ quần áo) vẫn chạy với giao diện mới | 34 unit test (thêm: chuyển save v1, chọn ô đất, chăm sóc, 6 loại phụ kiện, 6 hạt, 7 nguyên liệu, quầy trộn, công thức không trùng) + chạy thử 4 cửa hàng, vườn, tủ quần áo trong trình duyệt |
| 2026-11-08 | Thêm F-120 → F-126 (hệ thống học chính). F-108 (chưa DONE) được thay bằng ô từ vựng mới. SPEC: đọc 3 lần cho mọi nhóm tuổi (trước: nhóm 2–3 đọc 2 lần); cho phép dòng nghĩa tiếng Việt chỉ hiển thị | Chủ dự án yêu cầu ở prompt giai đoạn 4 |
| 2026-11-08 | Giai đoạn 4 xong: DONE F-120 → F-126, F-40, F-108. F-41, F-44 IN PROGRESS (xem ghi chú) | 47 unit test (thêm: phủ kho từ cho mọi thứ trong game + mọi lời gọi learn(); 5 chủ đề, 5 câu; bộ đọc giả: đọc 3 lần, nghỉ, không chồng giọng, kẹt/lỗi/không giọng) + nghe thử thật trong trình duyệt (SEED ×3 → "Let's plant a seed!" ×3 → tự ẩn) |
| 2026-11-08 | Thêm F-130 → F-137. Đổi danh sách mini-game chính theo yêu cầu (Find the Word, Listen and Choose, Match the Words, Farm Quiz); F-50 → F-53, F-55 (chưa DONE) được thực hiện bên trong 4 game này; F-54 vẫn TODO | Chủ dự án yêu cầu ở prompt giai đoạn 5 |
| 2026-11-08 | Giai đoạn 5 xong: DONE F-130 → F-137, F-32, F-42, F-43, F-45, F-50 → F-53, F-55, F-60 → F-62 | 60 unit test (thêm: nhiệm vụ theo tuổi & không hết hạn, sao/mở khóa/khóa khi mua, 4 game theo tuổi, đếm trứng theo phạm vi, phản hồi sai theo bảng tuổi, lời khen không lặp, trang trí không chắn đường) + chơi thử trọn 4 game, nhận thưởng nhiệm vụ, mở khóa trong trình duyệt |
| 2026-11-08 | Thêm F-140 → F-147. SPEC mục 2 thêm 2 dòng (phiên chơi, nghỉ giữa phiên) + mục 17. Yêu cầu "60 phút rồi trời tối" được áp dụng như **trần tuyệt đối**; thời điểm tối thực tế theo bảng tuổi & giới hạn phụ huynh (ngắn hơn) | Chủ dự án yêu cầu ở prompt giai đoạn 6, kèm yêu cầu không coi 60 phút là phù hợp cho mọi trẻ (A9) |
| 2026-11-08 | Giai đoạn 6 xong: DONE F-140 → F-147, F-04, F-12, F-13, F-15, F-33, F-70 | 73 unit test (thêm: giới hạn theo tuổi < 60 phút, phụ huynh chỉ giảm, hoàng hôn/chạng vạng/đêm, nghỉ giữa phiên, hết giờ ngày → ngày mai, tải lại không vượt, đóng app đúng lúc tối, bước nhảy thời gian, sao lưu mới nhất) + chạy thử trong trình duyệt (hoàng hôn, đèn, nhắc nhẹ, màn kết thúc ngày, nông trại đang ngủ sau tải lại, khu phụ huynh, sao lưu khi đóng trang) |
| 2026-11-08 | Thêm F-150 → F-163. **Cập nhật giao diện tính năng DONE theo yêu cầu (không xóa chức năng)**: F-25 (nhân vật → em bé áo liền thân, vẫn 6 nhân vật trai/gái), F-93 (hoạt ảnh thêm tay chân, nhảy, vui, ngạc nhiên), F-96/F-97/F-98 (đồ đạc vẽ lại; tủ quần áo dời sang trái để có chỗ cho phòng tắm), F-101 (con vật vẽ lại + tiếng kêu), F-120 (khung từ chuyển sang 4×8 nằm ngang, đặt cạnh vật). Bản đồ cao thêm 10 hàng (vườn cây ăn quả) | Chủ dự án yêu cầu ở prompt giai đoạn 7 |
| 2026-11-08 | Giai đoạn 7 xong: DONE F-150 → F-163. Hồi quy: F-25, F-93, F-96 → F-98, F-101, F-120 vẫn chạy với giao diện mới (giường vẫn ngủ được ở đầu giường/nút tương tác; gà/bò vẫn cho trứng/sữa; đèn vẫn bật/tắt; tủ quần áo vẫn thử đồ + thêm đổi màu áo) | 92 unit test (thêm: đủ hình 9 con vật/8 cây/8 quả/23 đồ vật, cây vẽ riêng, hái quả không trùng & đếm đúng, lưu/đọc trạng thái quả, đếm tiếng Anh số ít/nhiều, vị trí khung từ trên 4 cỡ màn hình, chọn giọng trẻ em/nữ, 6 nhân vật × 8 màu × 3 biểu cảm, màu áo trong hồ sơ) + chạy thử trong trình duyệt: chạm 2 lần cả 8 cây, chạm 9 con vật (tiếng kêu + khung), 23 đồ vật trong nhà, kệ bếp 7 món, đọc 3 lần & tự đóng, 6 tư thế nhân vật |
| 2026-11-08 | Thêm F-170 → F-186 (HAPPY ZOO). **Thay đổi tính năng DONE F-43 / F-32 theo yêu cầu**: lời khen không còn sau mỗi câu đúng mà dồn vào màn tổng kết cuối lượt (đúng chỉ có tiếng "ting" + sáng xanh). SPEC 16.3, mục 2 cập nhật; thêm mục 19 | Chủ dự án yêu cầu: "mỗi khi trả lời đúng không cần khen ngay lúc đó mà làm xong hết rồi mới khen để tối ưu trải nghiệm" + prompt giai đoạn 8 |
| 2026-11-08 | Giai đoạn 8 xong: DONE F-170 → F-186. Hồi quy: nông trại giữ nguyên (hái quả 2 lần, con vật, cửa hàng, giường, tủ đồ…); 4 game nông trại vẫn chơi được với cách khen mới | 111 unit test (thêm: 22 loài vẽ riêng & không trùng mô hình, đủ 5 khu, câu không bạo lực, bản đồ đi tới mọi trạm/biển/cổng nhưng KHÔNG vào được chuồng, mô phỏng 10 phút con vật luôn trong chuồng, từ vựng phủ đủ, khám phá/sao/huy hiệu, cho ăn đúng/sai, dọn chuồng, lưu/đọc nơi chơi & vị trí, 4 game sở thú theo 3 nhóm tuổi, số nhiều) + chạy thử trong trình duyệt: đi Farm ↔ Zoo (không mở phiên mới, giữ vị trí), chạm 2 lần cả 22 loài (khung tên + hoạt động + tiếng + câu), Feed/Water/Play/Clean, Zoo Book 6 chủ đề, Passport, chơi trọn 4 game sở thú + 2 game nông trại (không khen giữa chừng, khen ở cuối) |
| 2026-11-08 | Thêm F-190 → F-202 (bản đồ thế giới, 9 khu, thanh công cụ trái, Pet Park, School, Library). **Thay đổi tính năng DONE (không xóa chức năng)**: F-172 bảng Map 2 nơi → Bản đồ thế giới 9 khu; nút 🗺️ / 🏠 trên HUD → thanh công cụ trái; Zoo Passport chuyển vào COLLECTION; LET'S GO mở bản đồ thay vì vào thẳng nông trại; `place` thêm park/school/library. CLAUDE.md: thêm luật hình tham khảo & khu phải tương tác | Chủ dự án yêu cầu ở prompt giai đoạn 9 kèm ảnh tham khảo |
| 2026-11-08 | Giai đoạn 9 xong: DONE F-190 → F-202. Hồi quy: 9 khu vào đúng nơi; nông trại, sở thú, mini-game, cửa hàng, giường, tủ đồ, Zoo Passport (nay trong COLLECTION) vẫn chạy; nút HOME / MAP chuyển sang thanh công cụ trái | 132 unit test (thêm: 9 khu đủ tên & vùng chạm, không chồng nhau, mỗi khu vào được & đồ vật đi tới được, mọi đồ vật nơi mới có mục từ & hình, ABC 26 chữ, lưu nơi chơi + save cũ, đổi nhân vật chỉ id có sẵn) + chạy thử trong trình duyệt: LET'S GO → bản đồ → 9 khu → MAP quay lại, trạm thú cưng (Feed/Brush/Play), bảng đen / bảng nhiệm vụ / kệ cúp / ABC, 3 kệ sách thư viện, CHANGE CHARACTER, COLLECTION, SETTINGS (Cổng phụ huynh), điện thoại & máy tính bảng |
| 2026-11-08 | **Gỡ giai đoạn 9** (F-190 → F-202 → ĐÃ GỠ): bỏ bản đồ thế giới isometric, thanh công cụ trái, Pet Park, School, Library, đổi nhân vật từ thanh trái. **Khôi phục giao diện giai đoạn 8**: LET'S GO vào thẳng nơi đang chơi; nút 🏠 và 🗺️ trên HUD; bảng Map 2 nơi Farm ↔ Happy Zoo (F-172) + Zoo Passport; cổng sở thú mở bảng Map. CLAUDE.md và SPEC trở lại như trước giai đoạn 9. Save có `place` = park/school/library → tự về nông trại | Chủ dự án: "quay lại giao diện cũ đi bạn chứ cái này không ok" |
| 2026-11-08 | Thêm F-210 → F-212 (âm thanh trên iPhone + TEST SOUND). Không đổi giao diện của bé; nút bật/tắt nhạc giữ nguyên | Chủ dự án báo: bản Vercel không có âm thanh trên iPhone |
| 2026-11-08 | Sửa âm thanh iPhone: mở khóa Web Audio + giọng đọc ngay trong thao tác chạm (touchend/click/pointerup), resume cả `interrupted`, phát `silence.wav` qua thẻ <audio> + `audioSession = playback` để nghe được khi gạt im lặng, giọng mặc định en-US khi iOS chưa có danh sách giọng, mỗi lần chạm xóa khóa "tắt giọng sau 3 lỗi", sửa regex giọng trẻ em (ký tự backspace lạ). Thêm 2 file `public/sounds/*.wav`. DONE F-212 (TEST SOUND). F-210, F-211 chờ chủ dự án thử trên iPhone thật | 119 unit test (thêm 8: mở khóa giọng đồng bộ, giọng mặc định iOS, máy tính không dự phòng, gỡ khóa lỗi, TEST SOUND báo thật, 2 file WAV hợp lệ) + thử trên Chromium (bảng ứng dụng): TEST SOUND toàn ✅, Hello! đọc xong, chạm COW đọc tên, chạm làm AudioContext từ suspended → running, bật/tắt nhạc. Chưa thử được Safari iOS thật |
