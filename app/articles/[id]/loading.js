// app/articles/[id]/loading.js
import Skeleton from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div style={{ padding: "40px" }}>
      <Skeleton /> 
    </div>
  );
}