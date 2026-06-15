'use client';

export default function CopyLinkButton() {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('링크가 복사되었습니다!'))
      .catch(() => alert('링크 복사에 실패했습니다.'));
  };

  return (
    <button 
      onClick={copyToClipboard} 
      style={{
        padding: '0.5rem 1rem', 
        backgroundColor: '#FF8C42', 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold'
      }}
    >
      🔗 링크 복사
    </button>
  );
}
