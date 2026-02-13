import React, { useState, useEffect } from 'react';
import '../Styles/Creds.css';

const MOCK_DATA = [
  {
    id: 1,
    service: 'GitHub',
    tags: ['dev', 'personal'],
    data: {
      username: 'cr1t',
      token: 'ghp_xxxxxxxxxxxx',
      email: 'cr1t@example.com'
    }
  },
  {
    id: 2,
    service: 'Spotify',
    tags: ['music', 'api'],
    data: {
      client_id: 'ab123456789',
      client_secret: 'zz987654321',
      redirect_uri: 'http://localhost:1337/callback'
    }
  },
  {
    id: 3,
    service: 'AWS S3',
    tags: ['cloud', 'work'],
    data: {
      access_key: 'AKIAIOSFODNN7EXAMPLE',
      secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      bucket: 'my-bucket-v2'
    }
  }
];

const Creds = () => {
  const [creds, setCreds] = useState(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCred, setSelectedCred] = useState(null);

  // Filter logic
  const filteredCreds = creds.filter(cred => {
    const term = searchTerm.toLowerCase();
    const matchesService = cred.service.toLowerCase().includes(term);
    const matchesTags = cred.tags.some(tag => tag.toLowerCase().includes(term));
    return matchesService || matchesTags;
  });

  // Close modal on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedCred(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="creds-container">
      <header className="creds-header">
        <h1 className="creds-title">Credentials</h1>
        <div className="creds-controls">
          <input 
            type="text" 
            className="creds-search" 
            placeholder="Search service or tag..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button className="btn-add">Add New</button>
        </div>
      </header>

      <div className="creds-grid">
        {filteredCreds.map(cred => (
          <div key={cred.id} className="cred-tile" onClick={() => setSelectedCred(cred)}>
            <div className="cred-service">{cred.service}</div>
            <div className="cred-tags">
              {cred.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCred && (
        <div className="modal-overlay" onClick={() => setSelectedCred(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedCred.service}</h2>
              <button className="btn-close" onClick={() => setSelectedCred(null)}>×</button>
            </div>
            <div className="modal-body">
              {Object.entries(selectedCred.data).map(([key, value]) => (
                <div key={key} className="data-row">
                  <span className="data-key">{key}</span>
                  <span className="data-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Creds;
