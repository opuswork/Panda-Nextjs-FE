// app/articles/[id]/edit/loading.js
import Skeleton from "@/app/components/Skeleton";

export default function EditLoading() {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <Skeleton count={1} /> {/* 제목 부분 */}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Skeleton count={1} /> {/* 입력 필드 1 */}
        <Skeleton count={1} /> {/* 입력 필드 2 */}
        <Skeleton count={3} /> {/* 내용 영역 */}
        <div style={{ width: "150px", height: "150px" }}>
          <Skeleton count={1} /> {/* 이미지 영역 */}
        </div>
      </div>
    </div>
  );
}