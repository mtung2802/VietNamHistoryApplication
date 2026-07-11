# Hướng Dẫn Sử Dụng Theme (Su Viet Theme)

Tài liệu này tổng hợp các quy chuẩn về màu sắc, typography và bóng đổ theo thiết kế mới (Su Viet Theme) để các thành viên trong team tham khảo và đồng bộ giao diện.

Tất cả các biến này được export từ file `src/constants/theme.ts`.

## 1. Màu Sắc (SuVietColors)
Bộ màu chủ đạo dựa trên phong cách cổ điển, sử dụng các tone đỏ son, vàng đồng và màu be (giấy cổ):

- **Màu chính (Primary):**
  - `son`: `#82151b` - Đỏ son (dùng cho nền Header, nút bấm chính)
  - `son2`: `#651310` - Đỏ son đậm (dùng cho gradient kết hợp với đỏ son)
  - `dong`: `#b49b6b` - Vàng đồng (dùng cho viền, line ngang, điểm nhấn)
  - `sao`: `#e9c46a` - Vàng sao (dùng cho icon ngôi sao, huy hiệu)
- **Màu nền (Background):**
  - `giay`: `#f4ebd8` - Nền trang tổng thể (màu giấy cổ)
  - `card`: `#fdf8ec` - Nền thẻ (card panel)
  - `rulesBg`: `#f4ead2` - Nền các khu vực hộp thông tin, nội dung phụ
- **Màu chữ (Text):**
  - `muc`: `#2a201a` - Mực đen (chữ chính)
  - `muc2`: `#7d6d5c` - Mực nhạt (chữ phụ, đoạn văn)
  - *Lưu ý:* Khi viết chữ trên nền Đỏ Son, khuyến nghị dùng mã màu be `#f6e9cf` (Màu kem) thay cho trắng `#ffffff` để có độ tương phản êm dịu, hoài cổ và sang trọng hơn.
- **Màu trạng thái (cho bài làm):**
  - `correct`: `#3d7a4e` (Đúng) / `correctBg`: `#e8f3ea`
  - `wrong`: `#a83232` (Sai) / `wrongBg`: `#f7e6e4`

## 2. Typography (Fonts)
Ứng dụng kết hợp font có chân (Serif) mang tính uy nghiêm lịch sử cho Tiêu đề và font không chân (Sans-serif) bo tròn hiện đại cho văn bản đọc.

- **Tiêu đề (Serif):**
  - `Fonts.serifExtraBold` (PlayfairDisplay_800ExtraBold): Tiêu đề chính, Tên người dùng, Số điểm nổi bật.
  - `Fonts.serifBold` (PlayfairDisplay_700Bold): Tiêu đề phụ, Section title.
- **Nội dung (Sans-serif):**
  - `Fonts.bold` (Nunito_700Bold): Text trong Nút bấm, nhãn dán quan trọng.
  - `Fonts.semibold` (Nunito_600SemiBold): Chữ label thông tin nhỏ.
  - `Fonts.regular` (Nunito_400Regular): Đoạn mô tả, đoạn văn bản dài.

## 3. Bóng Đổ (HTML_SHADOWS)
Để tái tạo cảm giác nổi khối (Neumorphism / Card nổi) đồng bộ với bản thiết kế HTML, toàn bộ shadow đã được setup sẵn. Các shadow này dùng màu đỏ son (`shadowColor: 'rgba(101,19,16,1)'`) tạo ra ánh đỏ đặc trưng thay vì bóng đen mờ đục thông thường:

- `HTML_SHADOWS.card`: Bóng mờ vừa cho các thẻ thông tin nhỏ nhắn.
- `HTML_SHADOWS.cardLarge`: Bóng đổ sâu, lan tỏa rộng cho các khối Card bự (ví dụ: màn hình bắt đầu Quiz).
- `HTML_SHADOWS.button`: Bóng đổ chuyên dụng cho các nút bấm Gradient đỏ.
- `HTML_SHADOWS.fab`: Bóng đổ mạnh cho các nút bấm nổi (Floating Action Button).

## 4. Code Snippets Thường Dùng
- **Tạo nền đỏ Gradient:** Thường dùng cho Header ở phía trên, hoặc Nút bấm lớn.
  ```tsx
  <LinearGradient
    colors={[SuVietColors.son, SuVietColors.son2]}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
  />
  ```
- **Xử lý khoảng cách tai thỏ (Notch) cho Header:** Khi custom Header đỏ, bắt buộc phải dùng `useSafeAreaInsets` để tránh chữ bị đè vào thanh status bar của iPhone/Android.
  ```tsx
  import { useSafeAreaInsets } from 'react-native-safe-area-context';

  const insets = useSafeAreaInsets();
  
  <LinearGradient
    // ...
    style={[styles.header, { paddingTop: insets.top + 12 }]}
  >
  ```
- **Nút Back Tròn trên Header đỏ:**
  ```tsx
  <TouchableOpacity style={{
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)', // Màu trắng trong suốt 10%
    alignItems: 'center', justifyContent: 'center' 
  }}>
    <Ionicons name="arrow-back" size={26} color="#f6e9cf" />
  </TouchableOpacity>
  ```
