import React, { useState, useEffect } from 'react';
import '../Styles/Creds.css';

const API_URL = 'http://localhost:1336/api/creds';

// Icons
const IconAdd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconDelete = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconSave = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconCancel = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconClose = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const Creds = () => {
  const [creds, setCreds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedCred, setSelectedCred] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Add/Edit Form State
  const [formService, setFormService] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formDataPairs, setFormDataPairs] = useState([{ key: '', value: '' }]);

  const fetchCreds = async () => {
    try {
      const res = await fetch(`${API_URL}/get`);
      const data = await res.json();
      setCreds(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCreds(); }, []);

  // Filter
  const filteredCreds = creds.filter(cred => {
    const term = searchTerm.toLowerCase();
    const matchesService = cred.service.toLowerCase().includes(term);
    const matchesTags = Array.isArray(cred.tags) && cred.tags.some(tag => tag.toLowerCase().includes(term));
    return matchesService || matchesTags;
  });

  // Helpers for Form
  const resetForm = () => {
    setFormService('');
    setFormTags('');
    setFormDataPairs([{ key: '', value: '' }]);
  };

  const populateForm = (cred) => {
    setFormService(cred.service);
    setFormTags(Array.isArray(cred.tags) ? cred.tags.join(', ') : '');
    const pairs = Object.entries(cred.data || {}).map(([key, value]) => ({ key, value }));
    setFormDataPairs(pairs.length ? pairs : [{ key: '', value: '' }]);
  };

  const getFormPayload = () => {
    const dataObj = formDataPairs.reduce((acc, pair) => {
      if (pair.key && pair.value) acc[pair.key] = pair.value;
      return acc;
    }, {});
    return {
      service: formService,
      tags: formTags.split(',').map(t => t.trim()).filter(t => t),
      data: dataObj
    };
  };

  // Actions
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormPayload())
      });
      if (res.ok) {
        fetchCreds();
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCred) return;
    try {
      const res = await fetch(`${API_URL}/update/${selectedCred.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormPayload())
      });
      if (res.ok) {
        fetchCreds();
        setIsEditing(false);
        setSelectedCred(null); // Close modal or refresh it? Close for now.
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this credential?')) return;
    try {
      const res = await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCreds(creds.filter(c => c.id !== id));
        setSelectedCred(null);
      }
    } catch (err) { console.error(err); }
  };

  const updateDataPair = (index, field, value) => {
    const newPairs = [...formDataPairs];
    newPairs[index][field] = value;
    setFormDataPairs(newPairs);
  };

  // Keyboard
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isEditing) setIsEditing(false);
        else { setSelectedCred(null); setIsAddModalOpen(false); }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isEditing]);

  const openEditMode = () => {
    populateForm(selectedCred);
    setIsEditing(true);
  };

  return (
    <div className="creds-container">
      <header className="creds-header">
        <h1 className="creds-title">Credentials</h1>
        <div className="creds-controls">
          <input 
            type="text" 
            className="creds-search" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-icon btn-primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }} title="Add New">
            <IconAdd />
          </button>
        </div>
      </header>

      <div className="creds-grid">
        {filteredCreds.map(cred => (
          <div key={cred.id} className="cred-tile" onClick={() => { setSelectedCred(cred); setIsEditing(false); }}>
            <div className="cred-service">{cred.service}</div>
            <div className="cred-tags">
              {cred.tags && cred.tags.slice(0, 2).map((tag, i) => <span key={i} className="tag">{tag}</span>)}
              {cred.tags && cred.tags.length > 2 && <span className="tag">+{cred.tags.length - 2}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Detail / Edit Modal */}
      {selectedCred && (
        <div className="modal-overlay" onClick={() => setSelectedCred(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? 'Edit Credential' : selectedCred.service}</h2>
              <button className="btn-icon" onClick={() => setSelectedCred(null)}><IconClose /></button>
            </div>
            
            {!isEditing ? (
              // VIEW MODE
              <div className="modal-body">
                <div className="data-list">
                  {selectedCred.data && Object.entries(selectedCred.data).map(([key, value]) => (
                    <div key={key} className="data-row">
                      <span className="data-key">{key}</span>
                      <span className="data-value">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                   <button className="btn-icon btn-danger" onClick={() => handleDelete(selectedCred.id)} title="Delete"><IconDelete /></button>
                   <button className="btn-icon btn-primary" onClick={openEditMode} title="Edit"><IconEdit /></button>
                </div>
              </div>
            ) : (
              // EDIT MODE
              <form onSubmit={handleUpdateSubmit} className="modal-body">
                <div className="form-group">
                  <label>Service</label>
                  <input type="text" className="creds-input" value={formService} onChange={e => setFormService(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <input type="text" className="creds-input" value={formTags} onChange={e => setFormTags(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Data</label>
                  {formDataPairs.map((pair, index) => (
                    <div key={index} className="pair-row">
                      <input type="text" placeholder="Key" className="creds-input pair-key" value={pair.key} onChange={e => updateDataPair(index, 'key', e.target.value)} />
                      <input type="text" placeholder="Value" className="creds-input pair-value" value={pair.value} onChange={e => updateDataPair(index, 'value', e.target.value)} />
                      <button type="button" className="btn-icon-small btn-danger" onClick={() => setFormDataPairs(formDataPairs.filter((_, i) => i !== index))}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn-text-small" onClick={() => setFormDataPairs([...formDataPairs, { key: '', value: '' }])}>+ Add Field</button>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-icon" onClick={() => setIsEditing(false)} title="Cancel"><IconCancel /></button>
                  <button type="submit" className="btn-icon btn-success" title="Save"><IconSave /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Credential</h2>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}><IconClose /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="form-group">
                <label>Service</label>
                <input type="text" className="creds-input" value={formService} onChange={e => setFormService(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <input type="text" className="creds-input" value={formTags} onChange={e => setFormTags(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Data</label>
                {formDataPairs.map((pair, index) => (
                  <div key={index} className="pair-row">
                    <input type="text" placeholder="Key" className="creds-input pair-key" value={pair.key} onChange={e => updateDataPair(index, 'key', e.target.value)} />
                    <input type="text" placeholder="Value" className="creds-input pair-value" value={pair.value} onChange={e => updateDataPair(index, 'value', e.target.value)} />
                    <button type="button" className="btn-icon-small btn-danger" onClick={() => setFormDataPairs(formDataPairs.filter((_, i) => i !== index))}>×</button>
                  </div>
                ))}
                <button type="button" className="btn-text-small" onClick={() => setFormDataPairs([...formDataPairs, { key: '', value: '' }])}>+ Add Field</button>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-icon" onClick={() => setIsAddModalOpen(false)} title="Cancel"><IconCancel /></button>
                <button type="submit" className="btn-icon btn-success" title="Save"><IconSave /></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Creds;
