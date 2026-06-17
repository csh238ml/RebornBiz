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
          <div className="mobile-only" style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/images/rebornbiz_main_mobile.jpg" 
              alt="RebornBiz Banner (Mobile)" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain', 
                objectPosition: 'left center'
              }} 
            />
          </div>
        </>
      )}
      {children}
    </div>
  );
}


