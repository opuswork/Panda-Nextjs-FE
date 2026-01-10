// app/components/Loading.jsx
export default function Loading() {
    // You can add any UI inside Loading, including a custom spinner component
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999
      }}>
        {/* A simple CSS spinner or a library component */}
        <div className="spinner"></div> 
      </div>
    );
  }