// app/articles/addArticle/loading.js

import Spinner from "@/app/components/Loading"; 

export default function Loading() {
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