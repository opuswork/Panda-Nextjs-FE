// app/products/[id]/loading.js
import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  // 상세 페이지의 뼈대에 맞게 Skeleton 개수를 조절하세요.
  return (
    <div style={{ padding: "40px" }}>
      <Skeleton /> 
    </div>
  );
}