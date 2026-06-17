import React from 'react';

export default function StickyHeader({ children, showBanner = false }) {
  return (
    <div className="sticky-header">
      {showBanner && (
        <>
          <img 
            className="pc-only"
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
          <img 
            className="mobile-only"
            src="/images/rebornbiz_main_mobile.jpg" 
            alt="RebornBiz Banner (Mobile)" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxHeight: '200px',
              objectFit: 'contain', 
              marginBottom: '1rem' 
            }} 
          />
        </>
      )}
      {children}
    </div>
  );
}


