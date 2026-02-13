import React, { useState, useRef, useEffect } from 'react';
import '../Styles/SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim()) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-container">
      <textarea
        ref={textareaRef}
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
        rows={1}
        spellCheck="false"
        autoCorrect="off"
        autoComplete="off"
        autoCapitalize="off"
      />
    </div>
  );
};

export default SearchBar;
