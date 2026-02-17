import React, { useState, useRef, useEffect } from 'react';
import '../Styles/SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [bangs, setBangs] = useState([]);
  const [matchedBang, setMatchedBang] = useState(null);
  const [ghostText, setGhostText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch('/api/search/bangs')
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setBangs(data);
        } else {
          console.error('Bangs data is not an array:', data);
          setBangs([]);
        }
      })
      .catch(err => console.error('Failed to load bangs:', err));
  }, []);

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

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setMatchedBang(null);
      setGhostText('');
      return;
    }

    const lowerVal = val.toLowerCase();
    
    // Find a match
    // Prioritize exact alias match or name prefix match
    const match = bangs.find(b => 
      b.c === lowerVal || 
      b.n.toLowerCase().startsWith(lowerVal)
    );

    if (match) {
      setMatchedBang(match);
      // Only show ghost text if the input is a prefix of the full name
      if (match.n.toLowerCase().startsWith(lowerVal)) {
        // Ghost text is the rest of the name
        // careful with casing: we want the original name's casing
        setGhostText(match.n.slice(val.length));
      } else {
        setGhostText('');
      }
    } else {
      setMatchedBang(null);
      setGhostText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && ghostText) {
      e.preventDefault();
      setQuery(query + ghostText);
      setGhostText('');
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!query.trim()) return;

      const parts = query.trim().split(' ');
      const potentialBang = parts[0].toLowerCase();
      const restQuery = parts.slice(1).join(' ');

      // Case 1: Direct navigation (Input matches bang alias or name prefix, no extra query)
      if (matchedBang && !restQuery) {
        // If the user typed "y" and hit enter, matchedBang is YouTube -> go to main URL
        // Also if user typed "YouTu" (ghost "be") -> go to main URL
        window.location.href = matchedBang.u;
        return;
      }

      // Case 2: Explicit bang search (e.g. "y cats")
      // Check if the first word is a valid alias
      const explicitBang = bangs.find(b => b.c === potentialBang);
      if (explicitBang && restQuery) {
        window.location.href = `${explicitBang.s}${encodeURIComponent(restQuery)}`;
        return;
      }
      
      // Case 3: Explicit bang search using full name? (e.g. "youtube cats")
      // Usually users use aliases for search. Let's support alias only for search to keep it clean,
      // or check matchedBang if it matches the first word exactly?
      if (matchedBang && matchedBang.c === potentialBang && restQuery) {
         window.location.href = `${matchedBang.s}${encodeURIComponent(restQuery)}`;
         return;
      }

      // Case 4: Default Search
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="search-container">
      <div className="search-ghost" aria-hidden="true">
        <span className="invisible-text">{query}</span>
        <span className="visible-ghost">{ghostText}</span>
      </div>
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
