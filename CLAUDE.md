# CLAUDE.md — Happy Farm English

> Tên tạm thời: **Happy Farm English** — game học tiếng Anh tương tác cho trẻ 2–8 tuổi, chủ đề nông trại.
> File này là **luật của dự án**. Mọi giai đoạn phát triển đều phải tuân thủ. Khi có mâu thuẫn, **Luật an toàn trẻ em (mục 2) luôn thắng**.

---

## 1. Quy trình bắt buộc

1. **Trước MỖI giai đoạn phát triển**, đọc kỹ cả 3 file theo thứ tự:
   1. `CLAUDE.md` (file này)
   2. `docs/SPEC.md`
   3. `docs/TINH-NANG.md`
2. **Không viết code** khi 3 file trên chưa tồn tại và chưa đầy đủ.
3. Chỉ làm đúng phạm vi của prompt hiện tại. Không tự ý phát triển toàn bộ ứng dụng hay thêm tính năng ngoài yêu cầu.
4. **Tính năng mới** → thêm vào `docs/TINH-NANG.md` (mã mới, trạng thái `TODO`) **trước khi** code. Nếu tính năng ảnh hưởng hành vi/giao diện → cập nhật `docs/SPEC.md`.
5. **Không xóa tính năng cũ.** Tính năng có trạng thái `DONE` không được xóa khỏi `docs/TINH-NANG.md` và không được làm mất/hỏng trong code ở các vòng sau. Muốn thay đổi hoặc ngừng một tính năng `DONE` → phải được người dùng (chủ dự án) đồng ý rõ ràng, và ghi lại lý do trong mục "Nhật ký thay đổi" của `docs/TINH-NANG.md`.
6. Cập nhật trạng thái tính năng khi bắt đầu (`IN PROGRESS`) và khi hoàn thành (`DONE`). Chỉ đánh `DONE` khi đã kiểm tra chạy được và đạt tiêu chí nghiệm thu.
7. Cuối mỗi giai đoạn: kiểm tra lại toàn bộ tính năng `DONE` vẫn hoạt động (kiểm thử hồi quy), và rà lại Checklist an toàn (mục 4).

---

## 2. Luật an toàn trẻ em (KHÔNG ĐƯỢC VI PHẠM)

| # | Luật | Diễn giải khi làm code |
|---|------|------------------------|
| A1 | **Không quảng cáo** | Không tích hợp bất kỳ SDK quảng cáo nào (AdMob, Unity Ads, …). Không banner, không video thưởng, không "xem quảng cáo để nhận quà", không quảng bá app khác. |
| A2 | **Không có đường link ra ngoài** | Không có thẻ `<a href>` ra ngoài, không mở trình duyệt, không nút chia sẻ mạng xã hội, không deep-link sang store. Mọi nội dung nằm trong app. Nếu bắt buộc có (VD: chính sách bảo mật) thì chỉ hiển thị **nội dung tĩnh trong app**, đặt sau Cổng phụ huynh. |
| A3 | **Không mua bán bằng tiền thật trên màn hình của bé** | Không In-App Purchase, không cửa hàng tiền thật, không "gói kim cương". Đồ vật trong game chỉ mở khóa bằng việc học (sao/ngôi sao chăm chỉ). Không có tiền ảo quy đổi từ tiền thật. |
| A4 | **Không thu thập dữ liệu cá nhân** | Không analytics/tracking bên thứ ba, không định danh thiết bị (IDFA/GAID), không định vị, không danh bạ, không camera, không lưu/gửi giọng nói. Không gửi bất kỳ dữ liệu nào lên máy chủ. |
| A5 | **Hồ sơ bé chỉ có biệt danh + năm sinh** | Trường dữ liệu hồ sơ được phép: `nickname` (biệt danh), `birthYear` (năm sinh), cùng dữ liệu kỹ thuật không định danh (id ngẫu nhiên nội bộ, avatar chọn từ bộ hình có sẵn, tiến độ học, cài đặt). **Cấm**: họ tên đầy đủ, ngày/tháng sinh, ảnh thật, email, số điện thoại, địa chỉ, trường lớp, giọng nói. |
| A6 | **Lưu dữ liệu trên thiết bị** | Chỉ dùng bộ nhớ cục bộ (IndexedDB / localStorage / file nội bộ). Không đồng bộ đám mây, không tài khoản đăng nhập. App phải chạy **hoàn toàn offline**. |
| A7 | **Không trò chuyện trực tuyến với người lạ** | Không chat, không bình luận, không bảng xếp hạng online, không kết bạn, không nhiều người chơi qua mạng. |
| A8 | **Không nội dung bạo lực, đáng sợ, không phù hợp** | Không đánh nhau, vũ khí, máu, quái vật đáng sợ, âm thanh giật mình, nhấp nháy mạnh (tránh kích thích động kinh: không nháy > 3 lần/giây). Con vật luôn vui vẻ, thân thiện. Không chê bai, không mỉa mai. |
| A9 | **Giới hạn thời gian chơi theo độ tuổi** | Thực hiện đúng bảng "Luật theo tuổi" trong `docs/SPEC.md` (thời lượng lượt chơi + thời lượng mỗi ngày). Hết giờ → màn hình "Nghỉ ngơi" nhẹ nhàng, khóa chơi đến hôm sau (phụ huynh có thể điều chỉnh qua Cổng phụ huynh, nhưng **không vượt trần** theo tuổi). |
| A10 | **Không ép bé chơi liên tục** | Cấm dark pattern: không chuỗi ngày (streak) bị mất, không phạt khi nghỉ, không đồng hồ đếm ngược gây áp lực, không thông báo đẩy kêu gọi quay lại, không phần thưởng "chỉ hôm nay", không tự động chuyển màn vô tận (autoplay). Kết thúc lượt luôn có điểm dừng tự nhiên và lời khen. |

### Luật bổ sung (hệ quả từ các luật trên)
- **Cổng phụ huynh (Parent Gate)**: mọi khu vực cài đặt, xóa dữ liệu, thay đổi thời gian đều nằm sau Cổng phụ huynh (VD: giữ nút 3 giây + giải phép tính dành cho người lớn). Bé không tự vào được.
- **Phản hồi khi sai luôn tích cực**: không dấu X đỏ, không âm thanh "thất bại", không trừ điểm, không mất mạng. Xem cách phản hồi theo tuổi trong `docs/SPEC.md`.
- **Quyền hệ thống**: không xin quyền nào ngoài những gì bắt buộc để chạy offline. Nếu tương lai cần micro (luyện phát âm) → chỉ xử lý tại chỗ, không lưu, không gửi, phải bật qua Cổng phụ huynh, và phải cập nhật SPEC + TINH-NANG trước.
- **Thư viện bên thứ ba**: trước khi thêm, kiểm tra thư viện không gọi mạng, không thu thập dữ liệu. Không dùng CDN lúc chạy — mọi tài nguyên đóng gói sẵn.

---

## 3. Quy tắc kỹ thuật & code

- **Ngôn ngữ giao tiếp/tài liệu**: tiếng Việt. **Nội dung học** trong game: tiếng Anh (kèm hình + âm thanh). Tên biến/hàm trong code: tiếng Anh.
- **Kiến trúc**: xem `docs/SPEC.md` mục "Kiến trúc kỹ thuật". Không thay đổi stack khi chưa được đồng ý.
- **Cấu hình theo tuổi tập trung một chỗ** (VD: `src/config/ageRules.ts`). Không hard-code kích thước nút, cỡ chữ, thời lượng rải rác trong code — phải đọc từ cấu hình theo nhóm tuổi.
- **Nội dung học (từ vựng, bài) tách khỏi logic** — để dạng dữ liệu (JSON/TS) để dễ mở rộng.
- **Không có mã mạng**: không `fetch` tới domain ngoài, không WebSocket. (Ngoại lệ duy nhất: service worker cache tài nguyên của chính app.)
- **Khả năng tiếp cận**: vùng chạm tối thiểu theo bảng tuổi; tương phản màu tốt; mọi chỉ dẫn có **âm thanh** (bé 2–5 tuổi chưa biết đọc).
- **Kiểm thử**: mỗi tính năng có tiêu chí nghiệm thu trong `docs/TINH-NANG.md`; viết test cho logic quan trọng (bộ đếm thời gian, luật theo tuổi, lưu hồ sơ).
- Commit nhỏ, mô tả rõ, ghi mã tính năng (VD: `F-05: thêm màn chọn hồ sơ`).

---

## 4. Checklist an toàn (rà lại cuối mỗi giai đoạn)

- [ ] Không có SDK quảng cáo / analytics / tracking trong dependencies.
- [ ] Tìm trong code: không có `http://`, `https://` trỏ ra ngoài, không `window.open`, không `<a href` ra ngoài.
- [ ] Không có mã thanh toán / IAP.
- [ ] Hồ sơ chỉ chứa `nickname`, `birthYear` (+ dữ liệu kỹ thuật không định danh).
- [ ] Dữ liệu chỉ lưu cục bộ; app chạy được khi tắt mạng.
- [ ] Không có chat / tính năng online.
- [ ] Nội dung, hình, âm thanh mới đã được rà: không bạo lực, không đáng sợ.
- [ ] Bộ đếm thời gian lượt chơi và thời gian mỗi ngày hoạt động đúng theo tuổi.
- [ ] Không có streak, thông báo đẩy, đếm ngược áp lực hay autoplay vô tận.
- [ ] Cài đặt nằm sau Cổng phụ huynh.
- [ ] Mọi tính năng `DONE` vẫn còn và hoạt động.
