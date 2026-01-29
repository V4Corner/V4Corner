import { useState, FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

function SearchBar({
  onSearch,
  placeholder = '搜索标题、内容...',
  defaultValue = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '700px', alignItems: 'stretch' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.6rem 1rem 0.6rem 2.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
        />
        <span
          style={{
            position: 'absolute',
            left: '0.8rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '0.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.5,
              padding: '0',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        style={{
          padding: '0.6rem 1.5rem',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        搜索
      </button>
    </form>
  );
}

export default SearchBar;
