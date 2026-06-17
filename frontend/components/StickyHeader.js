import React from 'react';

export default function StickyHeader({ children, showBanner = false }) {
  return (
    <div className="sticky-header-pc">
      {showBanner && (
        <img 
          src="/images/rebornbiz_main.jpg" 
          alt="RebornBiz Banner" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            maxHeight: '200px',
            objectFit: 'cover', 
            borderRadius: '12px', 
            marginBottom: '1rem' 
          }} 
        />
      )}
      {children}
    </div>
  );
}


