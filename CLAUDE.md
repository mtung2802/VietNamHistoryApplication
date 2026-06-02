# CLAUDE.md — Vietnam History App (React Native)

File này cung cấp đầy đủ ngữ cảnh cho Claude Code khi làm việc trong repo này.
**Mỗi thành viên đọc file này để hiểu project trước khi bắt đầu.**

---

## Tổng quan dự án

**Đồ án tốt nghiệp** — ứng dụng học lịch sử Việt Nam. Có 2 app dùng **chung Firestore backend**:

| App | Thư mục | Trạng thái |
|---|---|---|
| Android Java | `../VietnamHistoryJavaApp/` | Đầy đủ tính năng — dùng làm **tham chiếu** logic |
| **React Native (Expo)** | `./` (thư mục này) | **Đang phát triển** — mục tiêu chính |

> Khi migrate logic từ Java sang RN, đọc file Java tương ứng làm tham chiếu. Cả 2 app đọc/ghi cùng Firestore.

---

## Lệnh chạy

```bash
npx expo start              # Dev server (quét QR bằng Expo Go)
npx expo start --android    # Android emulator/thiết bị
npx expo start --web        # Chạy trên trình duyệt
npx tsc --noEmit            # Kiểm tra TypeScript
npx expo lint               # ESLint
```

> **Cần file `.env`** với các biến `EXPO_PUBLIC_FIREBASE_*` để kết nối Firebase.

---

## Kiến trúc

### Routing
Expo Router, file-based. Toàn bộ màn hình trong `src/app/`.
Tab chính: `src/app/(tabs)/` (5 tab: period, person, game, explore, profile).

### Data layer
- Firebase Firestore — mỗi collection có 1 service file trong `src/services/`
- **Không import Firebase trực tiếp trong component** — luôn qua service
- Models TypeScript trong `src/models/` khớp với cấu trúc Firestore

### Path alias
`@/*` → `src/*` (cấu hình trong `tsconfig.json`)

### State
- Không có global state manager
- Auth: `src/hooks/useAuth.ts`
- Theme (dark/light): `src/contexts/ThemeContext.tsx`
- User session: AsyncStorage

---

## Theme System (QUAN TRỌNG — đọc trước khi code)

### Không dùng `COLORS` tĩnh trong code mới

```typescript
// ❌ CŨ — không dùng
import { COLORS } from '@/constants/theme';
style={{ backgroundColor: COLORS.primary }}

// ✅ MỚI — luôn dùng hook
import { useThemeColors } from '@/contexts/ThemeContext';
const colors = useThemeColors();
style={{ backgroundColor: colors.primary }}
```

### Quy ước style
- **Layout tĩnh** → `StyleSheet.create({})` (padding, margin, flex, borderRadius...)
- **Màu sắc** → inline từ `useThemeColors()` (background, text, border, primary...)

### Palette
App hỗ trợ **Light + Dark** (toggle bằng nút ☀️/🌙 trên AppHeader, mặc định Dark).

| Token | Dark | Light | Dùng cho |
|---|---|---|---|
| `background` | `#121212` | `#FFFBF5` | Nền màn hình |
| `surface` | `#1E1E1E` | `#FFFFFF` | Card, panel |
| `surfaceElevated` | `#2A2A2A` | `#FFF7EA` | Header, modal |
| `primary` | `#D4AF37` | `#B8860B` | Gold — màu nhấn chính |
| `primaryBright` | `#FFD700` | `#D4AF37` | Highlight, icon |
| `primaryDim` | `rgba(212,175,55,0.16)` | — | Nền nhạt, chip |
| `onPrimary` | `#1A1A1A` | `#FFFFFF` | Chữ trên nền gold |
| `secondary` | `#C8102E` | `#C8102E` | Đỏ VN — lá cờ, badge lịch sử |
| `text` | `#F5F5F5` | `#1A1A1A` | Chữ chính |
| `textSecondary` | `#B0B0B0` | `#4B5563` | Chữ phụ |
| `textMuted` | `#6B6B6B` | `#9CA3AF` | Chữ mờ |
| `border` | `#333333` | `#E5E7EB` | Viền |

### Lỗi type đã biết — BỎ QUA
3 file template Expo cũ (dead code, không màn nào import) còn lỗi type không liên quan đến code ta:
- `src/components/app-tabs.tsx`
- `src/components/app-tabs.web.tsx`
- `src/components/ui/collapsible.tsx`

Khi `tsc --noEmit`, chỉ cần đảm bảo **không có lỗi nào ngoài 3 file này**.

---

## Thư viện Component `src/components/ui/`

**Luôn dùng lại component có sẵn trước khi viết mới.**

```typescript
import {
  Screen,        // wrapper nền + SafeArea theo theme
  AppHeader,     // header có nút back + toggle theme (☀️/🌙)
  Card,          // card surface bo góc, viền gold, shadow
  Button,        // primary (gold) / secondary (đỏ) / outline / ghost
  Badge,         // nhãn nhỏ: tone 'gold' | 'red' | 'neutral'
  SectionTitle,  // tiêu đề mục với thanh gold dọc
  HistoryImage,  // ảnh tự convert Google Drive URL + placeholder
  LoadingState,  // spinner trung tâm
  ErrorState,    // lỗi + nút retry
  EmptyState,    // trống + icon
} from '@/components/ui';
```

### Pattern một màn hình mới
```typescript
export default function MyScreen() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState([]);

  // load data...

  return (
    <Screen>
      <AppHeader title="Tiêu đề" />
      {loading ? <LoadingState /> :
       error ? <ErrorState message={error} onRetry={load} /> : (
        <FlatList data={data} renderItem={...} />
      )}
    </Screen>
  );
}
```

---

## Tiện ích

### HistoryImage — tự convert Google Drive
```typescript
<HistoryImage uri={item.coverMediaRef} style={styles.image} fallbackIcon="image-outline" />
// Port từ ImageLoader.java: /d/{id}/ → uc?export=download&id={id}
```

### YouTube utility (Phase 2+)
```typescript
import { extractYoutubeId } from '@/utils/youtube';
// Port từ YouTubeUtils.java — trích videoId từ nhiều dạng URL
```

---

## Cấu trúc Firestore (phải khớp tuyệt đối)

| Collection path | Field chính |
|---|---|
| `users/{uid}` | uid, name, username, email, photo, bio, **password** (plain-text — không đổi schema), createdAt |
| `periods/{slug}` | title, startDate, endDate (Timestamp), summary, coverMediaRef, description, sortOrder |
| `periods/{slug}/stages/{slug}` | title, startDate, endDate, overview, coverMediaRef, details[], result[], impactOnPresent, sortOrder |
| `periods/{slug}/stages/{slug}/events/{slug}` | title, summary, coverMediaRef, warCause[], object{vn[], usAllies[]}, youtubeId, content{warSummary[], result{vn[], usAllies[]}}, meaning[], impactOnPresent, startDate, endDate |
| `periods_person/{slug}/persons/{slug}` | name, title, overview, hometown, birth_year, death_year, horizontalImage, coverMediaRef, achievements[], lifetime[], video{link, content}, sortOrder |
| `periods_person/{slug}/persons/{slug}/events/{slug}` | title, (metadata) |
| `games/{gameId}/quizzes/{id}` | level, type, description, questionCount, eventID, settings{timeLimit, maxPlayers} |
| `games/{gameId}/quizzes/{id}/questions/{id}` | question, options[], correctAnswer (index), orderQuestion, explanation |
| `games/timelinepuzzle/eras/{eraId}` | title, description, events[]{name, year, desc, order, zone} |
| `forum/posts/all/{postId}` | title, content, authorId, authorName, authorPhoto, replyCount, likeCount, likes[], createdAt |
| `forum/posts/all/{postId}/replies/{id}` | content, authorId, authorName, authorPhoto, likeCount, likes[], createdAt |
| `explore/{slug}` | title, description, coverMediaRef, sortOrder |

> ⚠️ **Rủi ro field name:** Model RN `Event` dùng `content.forces` + `content.result.vn` nhưng Firestore thật có thể dùng `object` + `content.warSummary`. Trước khi code Phase 2 event detail, đối chiếu với `../full_periods_database.json` (366KB, dữ liệu thật).

---

## Tiến độ & Phân công (3 thành viên)

> **Cập nhật ô "Thành viên" khi bạn nhận phase** — viết tên vào và commit.

| Phase | Nội dung | File chính | Thành viên | Trạng thái |
|---|---|---|---|---|
| **P0** | Theme infra (Light/Dark toggle) | `constants/theme.ts`, `contexts/ThemeContext.tsx`, `app/_layout.tsx` | — | ✅ Xong |
| **P1** | Component lib + redesign 5 tab + splash | `components/ui/`, `app/(tabs)/*.tsx`, `app/index.tsx` | — | ✅ Xong |
| **P2a** | Event detail + Stage detail (multimedia, YouTube, 2 cột) | `app/event/.../index.tsx`, `app/stage-detail/.../index.tsx` | | ⏳ Cần làm |
| **P2b** | Person list + Person detail (section mở rộng + video) | `app/person-list/.../index.tsx`, `app/person/.../index.tsx` | | ⏳ Cần làm |
| **P2c** | Forum detail/reply/like + Explore article/museum | `app/forum/[postId].tsx`, `app/forum/new.tsx`, `app/explore/` | | ⏳ Cần làm |
| **P3a** | Quiz gameplay (chấm điểm, đếm giờ, màn kết quả) | `app/quiz/[quizSlug]/play.tsx` (mới), `services/quizService.ts` | | 📋 Pending |
| **P3b** | Timeline puzzle (kéo-thả, HP bar, dialog thắng/thua) | `app/timeline/[eraId]/play.tsx` (mới) | | 📋 Pending |
| **P4** | Google Sign-In + Profile overview + Edit profile + avatar upload | `app/profile-overview/`, `app/edit-profile/`, `services/authService.ts` | | 📋 Pending |

### Luồng đề xuất cho 3 người (song song)
- **TV1:** P2a → P3a
- **TV2:** P2b → P3b
- **TV3:** P2c → P4

---

## Hướng dẫn bắt đầu một phase mới

1. Đọc file Java tương ứng trong `../VietnamHistoryJavaApp/` để hiểu logic gốc
2. Đọc file RN hiện có để biết đã làm gì
3. Dùng component từ `@/components/ui` thay vì viết lại
4. Dùng `useThemeColors()` cho mọi màu sắc
5. Sau khi xong: `npx tsc --noEmit` — không được có lỗi mới ngoài 3 file dead code trên
6. Cập nhật bảng tiến độ ở trên (cột Trạng thái)

### Ví dụ bắt đầu session với Claude
```
Tôi làm Phase 2a — event detail và stage detail.
File Java tham chiếu: EventDetailFragment.java, StageDetailActivity.java
File RN cần sửa: src/app/event/[periodSlug]/[stageSlug]/[eventSlug]/index.tsx
                 src/app/stage-detail/[periodSlug]/[stageSlug]/index.tsx
Hãy bắt đầu với event detail.
```

---

## Firebase

- Project ID: `lichsuvietnam-d3c26`
- Services: Firestore, Auth (email/password + Google), Storage
- Config trong `.env` (`EXPO_PUBLIC_FIREBASE_*`)

---

## Lưu ý bảo mật

Dữ liệu hiện lưu **mật khẩu plain-text** (kế thừa từ bản Java, giữ tương thích).  
**Không thay đổi schema giữa chừng** — sẽ vỡ login của dữ liệu đã có.  
Ghi nhận để cải thiện sau khi hoàn thành đồ án.
