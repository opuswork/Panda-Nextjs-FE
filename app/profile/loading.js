// app/profile/loading.js
import Skeleton from "@/app/components/Skeleton"; // 이제 undefined가 아닙니다.

export default function UsersLoading() {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <Skeleton count={1} /> {/* 이제 정상 작동합니다 */}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Skeleton count={1} />
        <Skeleton count={1} />
        <Skeleton count={1} />
      </div>
    </div>
  );
}