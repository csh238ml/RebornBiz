import Link from 'next/link';

export default function Pagination({ currentPage, totalPages, basePath, search }) {
  if (totalPages <= 1) return null;

  const getPageLink = (page) => {
    let url = `${basePath}?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  };

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
      {currentPage > 1 && (
        <Link href={getPageLink(currentPage - 1)} style={buttonStyle(false)}>
          &laquo; 이전
        </Link>
      )}
      
      {startPage > 1 && (
        <>
          <Link href={getPageLink(1)} style={buttonStyle(false)}>1</Link>
          {startPage > 2 && <span style={{ padding: '0.5rem', color: '#888' }}>...</span>}
        </>
      )}

      {pages.map(page => (
        <Link key={page} href={getPageLink(page)} style={buttonStyle(page === currentPage)}>
          {page}
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={{ padding: '0.5rem', color: '#888' }}>...</span>}
          <Link href={getPageLink(totalPages)} style={buttonStyle(false)}>{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={getPageLink(currentPage + 1)} style={buttonStyle(false)}>
          다음 &raquo;
        </Link>
      )}
    </div>
  );
}

const buttonStyle = (isActive) => ({
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: isActive ? '1px solid #1E3A8A' : '1px solid #e2e8f0',
  backgroundColor: isActive ? '#1E3A8A' : '#ffffff',
  color: isActive ? '#ffffff' : '#475569',
  textDecoration: 'none',
  fontWeight: isActive ? 'bold' : 'normal',
  transition: 'all 0.2s',
  fontSize: '0.95rem'
});
