// app/articles/Loading.js

import Spinner from "@/app/components/Loading"; 

export default async function Loading() {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: "40px" 
    }}>
      <Spinner />  
    </div>
  );
}