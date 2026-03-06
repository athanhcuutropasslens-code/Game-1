# Asset Guidelines (Pixel Rogue)

## 1) Chuẩn file asset icon
- **Base size cho icon item/entity**: chỉ dùng `16x16` hoặc `32x32`.
- **Scale runtime**: chỉ scale theo số nguyên (`1x`, `2x`, `3x`...), không dùng scale lẻ (`1.5x`) để tránh blur.
- **Naming convention**:
  - Tên file và key map theo `itemId/entityId` dạng `snake_case`.
  - Ví dụ: `pot_small.svg`, `w_sword.svg`, `z_forest.svg` (ưu tiên SVG text để tránh binary trong repo).
- **Thư mục chuẩn**:
  - Item icon: `client/public/assets/icons/items/`

## 2) Quy tắc render ảnh
- CSS class pixel art:
  - `.pixel-art` hoặc `[data-pixel-art="true"]` phải có `image-rendering: pixelated`.
- Khi cần scale có transform, dùng class `.pixel-art--scaled` và đặt `--pixel-scale` là số nguyên.
- Dùng helper `getPixelPerfectSize(baseSize, scale)` để đảm bảo chỉ dùng base size hợp lệ (16/32) + scale nguyên.

## 3) Checklist QA trực quan (1 giây)
Mục tiêu: người chơi nhìn vào icon và nhận diện **đúng nhóm item trong ≤ 1 giây**.

### Inventory
- [ ] Consumable nhận diện ngay (màu sắc + silhouette khác weapon/armor).
- [ ] Weapon và Armor không bị nhầm lẫn khi đứng cạnh nhau.
- [ ] Accessory có silhouette riêng, không giống potion.
- [ ] Icon ở mỗi rarity vẫn đọc được ở kích thước nhỏ.

### Combat
- [ ] Consumable quan trọng (heal/buff) nổi bật trong UI chiến đấu.
- [ ] Icon không bị mờ/nhòe ở scale đang dùng.
- [ ] Người test phân biệt được icon item với icon hiệu ứng trạng thái.

### Shop
- [ ] Trong danh sách mua bán, item cùng nhóm có style nhất quán.
- [ ] Item giá cao/hiếm vẫn nhận diện được ngay từ icon nhỏ.
- [ ] Không có icon rỗng hoặc fallback sai.

## 4) Validation trước build
- Chạy script: `pnpm lint:assets`
- Script sẽ kiểm tra:
  - Đủ key icon map cho toàn bộ `ITEMS_DB`.
  - Không có key thừa so với `ITEMS_DB`.
  - Key và tên file đúng format `snake_case` theo id.
  - File sprite thực tế tồn tại trong `client/public`.

## 5) CI
- Nếu dùng GitHub Actions, thêm bước `pnpm lint:assets` trong pipeline để chặn merge khi thiếu sprite/map sai.
