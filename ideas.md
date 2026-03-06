# Pixel Rogue - Hướng Thiết Kế Game

## Response 1: Retro Arcade Cyberpunk (Xác suất: 0.08)

**Design Movement**: Retro-futurism với cảm hứng từ arcade 8-bit và cyberpunk 80s

**Core Principles**:
- Neon colors trên nền tối (tím, xanh lá, hồng)
- Pixelated aesthetic với font bitmap
- Giao diện giống terminal máy tính cũ
- Cảm giác "hacker" với scanline effect

**Color Philosophy**:
- Nền chính: Đen sâu (#0a0e27)
- Accent chính: Neon xanh lá (#00ff41), Neon tím (#ff00ff), Neon hồng (#ff006e)
- Mục đích: Tạo cảm giác retro-futuristic, năng lượng cao, hơi nguy hiểm

**Layout Paradigm**:
- Giao diện kiểu terminal với grid layout
- Thanh thông tin nằm trên cùng như HUD
- Phòng game ở giữa, thông tin quái vật trên, lựa chọn dưới
- Sử dụng border và divider kiểu ASCII art

**Signature Elements**:
- Scanline effect trên toàn màn hình
- Neon glow effect cho các button và text quan trọng
- Pixel art avatar cho nhân vật và quái vật
- Glitch effect khi nhân vật bị tấn công

**Interaction Philosophy**:
- Click/tap để chọn hành động
- Feedback tức thì với sound effects (nếu có)
- Hover effect với neon glow
- Transition smooth nhưng nhanh

**Animation**:
- Scanline animation chạy liên tục
- Neon glow pulse khi button được hover
- Glitch animation khi nhân vật bị hit
- Float-up text damage/heal với fade out

**Typography System**:
- Display: "Press Start 2P" hoặc "Courier New" (monospace)
- Body: "Courier New" hoặc monospace tương tự
- Tất cả text đều uppercase hoặc CamelCase
- Sử dụng text-shadow để tạo neon glow

---

## Response 2: Dark Fantasy Medieval (Xác suất: 0.07)

**Design Movement**: Dark fantasy aesthetic với cảm hứng từ medieval RPG

**Core Principles**:
- Màu sắc tối nhưng ấm áp (gỗ, đá, vàng)
- Texture và pattern từ vải, da, kim loại
- Typography serif cho cảm giác cổ điển
- Giao diện giống sách hoặc bản đồ cổ

**Color Philosophy**:
- Nền chính: Nâu tối (#1a1410)
- Accent chính: Vàng/Vàng ấm (#d4af37), Đỏ máu (#8b0000), Xanh đá (#2d5016)
- Mục đích: Tạo cảm giác medieval,神秘, hơi bí ẩn

**Layout Paradigm**:
- Giao diện giống trang sách với border trang trí
- Nhân vật ở bên trái, quái vật ở bên phải
- Thông tin ở giữa như một cuộn giấy
- Sử dụng ornate borders và decorative elements

**Signature Elements**:
- Ornate borders với pattern cổ điển
- Texture vải/da cho background
- Illuminated letters cho tiêu đề
- Parchment effect cho modal/dialog

**Interaction Philosophy**:
- Click để chọn hành động
- Hover effect với subtle glow
- Transition smooth và trang trọng
- Sound effects giống medieval

**Animation**:
- Subtle fade-in/fade-out
- Smooth slide transitions
- Glow effect khi button được hover
- Particle effect khi nhân vật bị hit (máu)

**Typography System**:
- Display: "Cinzel" hoặc serif cổ điển
- Body: "Crimson Text" hoặc serif đẹp
- Sử dụng text-shadow cho depth
- Decorative caps cho tiêu đề

---

## Response 3: Minimalist Modern Glassmorphism (Xác suất: 0.06)

**Design Movement**: Modern minimalism với glassmorphism và neumorphism

**Core Principles**:
- Màu sắc sạch, tối giản
- Transparent/frosted glass effect
- Whitespace rộng rãi
- Geometry đơn giản nhưng tinh tế

**Color Philosophy**:
- Nền chính: Gradient xám tối (#1a1a2e -> #16213e)
- Accent chính: Xanh dương nhạt (#64b5f6), Xanh lá nhạt (#81c784), Hồng nhạt (#f48fb1)
- Mục đích: Tạo cảm giác hiện đại, sạch sẽ, dễ sử dụng

**Layout Paradigm**:
- Card-based layout với glassmorphic panels
- Centered composition
- Generous padding và spacing
- Asymmetric grid layout

**Signature Elements**:
- Glassmorphic cards với backdrop blur
- Soft shadows thay vì hard borders
- Smooth gradient backgrounds
- Minimal icons từ Lucide

**Interaction Philosophy**:
- Smooth transitions giữa các state
- Subtle hover effects
- Floating action buttons
- Gesture-friendly design

**Animation**:
- Smooth fade transitions
- Subtle scale animations
- Blur effect transitions
- Gentle particle effects

**Typography System**:
- Display: "Poppins" hoặc "Outfit" (modern sans-serif)
- Body: "Inter" hoặc "Poppins"
- Sử dụng font weight variations
- Clean, readable hierarchy

---

## Lựa chọn cuối cùng

**Đã chọn: Retro Arcade Cyberpunk**

Lý do: Phù hợp với tên "Pixel Rogue" và tạo cảm giác game retro thú vị, năng lượng cao, thu hút người chơi. Neon colors và pixelated aesthetic sẽ làm game nổi bật và dễ nhớ.

---

## Ghi chú xử lý thông báo conflict cho các hạng mục 2, 4, 5, 6

Nếu PR hiển thị cảnh báo: `This branch has conflicts that must be resolved`, xử lý theo checklist sau để giảm rủi ro mất ý tưởng UI pixel art đã chốt:

1. **Ưu tiên giữ phần thiết kế nhận diện Consumable (mục 2)**
   - Giữ icon riêng cho `Thuốc Sức Mạnh` (dáng lọ thuốc + aura), **không** merge ngược về icon dạng kiếm.
   - Đảm bảo mapping icon của Consumable và Weapon không trùng silhouette chính.

2. **Ưu tiên giữ cấu trúc Background theo zone (mục 4)**
   - Giữ metadata nền theo zone (tile/layer/overlay) thay vì quay lại gradient chung một kiểu.
   - Nếu conflict ở component nền, ưu tiên nhánh có hỗ trợ parallax + overlay đọc chữ tốt.

3. **Ưu tiên giữ pixel UI cho inventory/shop/equipment (mục 5)**
   - Giữ frame theo type item (Consumable/Weapon/Armor/Accessory).
   - Nếu xung đột className, chọn phiên bản còn badge type + hierarchy thông tin rõ.

4. **Ưu tiên giữ bộ design token pixel-128 (mục 6)**
   - Không hardcode màu rời rạc nếu đã có token/palette tập trung.
   - Khi conflict giữa token mới và mã cũ, ưu tiên token mới để đồng bộ toàn game.

5. **Quy trình resolve khuyến nghị (CLI)**
   - `git fetch origin`
   - `git merge origin/main` *(hoặc base branch thực tế)*
   - Resolve từng file theo thứ tự: `consumable/icon` → `background` → `inventory UI` → `theme token`.
   - Chạy kiểm tra build/test, sau đó commit merge với message rõ phạm vi resolve.

6. **Tiêu chí nghiệm thu sau resolve conflict**
   - Người chơi nhìn nhanh có thể phân biệt ngay: Thuốc Sức Mạnh ≠ Kiếm.
   - UI giữa Shop, Inventory, Equipment dùng cùng ngôn ngữ pixel art.
   - Background theo zone vẫn đúng bối cảnh và không làm giảm readability của HUD/text.
