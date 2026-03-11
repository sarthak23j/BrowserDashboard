import React, { useState, useEffect } from 'react';
import { useToast } from '../Components/Toast';
import '../Styles/Creds.css'; // Reuse Creds styling

const API_URL = '/api/search/bangs';

// Icons
const IconAdd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconDelete = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconSave = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconCancel = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconClose = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const Settings = () => {
  const { showToast } = useToast();
  const [bangs, setBangs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [selectedBang, setSelectedBang] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formC, setFormC] = useState('');
  const [formN, setFormN] = useState('');
  const [formU, setFormU] = useState('');
  const [formS, setFormS] = useState('');

  const fetchBangs = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBangs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBangs(); }, []);

  const filteredBangs = bangs.map((b, i) => ({ ...b, originalIndex: i })).filter(bang => {
    const term = searchTerm.toLowerCase();
    return bang.n.toLowerCase().includes(term) || bang.c.toLowerCase().includes(term);
  });

  const resetForm = () => {
    setFormC('');
    setFormN('');
    setFormU('');
    setFormS('');
  };

  const populateForm = (bang) => {
    setFormC(bang.c);
    setFormN(bang.n);
    setFormU(bang.u);
    setFormS(bang.s);
  };

  const getFormPayload = () => ({ c: formC, n: formN, u: formU, s: formS });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormPayload())
      });
      if (res.ok) {
        fetchBangs();
        setIsAddModalOpen(false);
        resetForm();
        showToast('Bang added', 'success');
      } else {
        showToast('Failed to add bang', 'error');
      }
    } catch (err) { console.error(err); showToast('Failed to add bang', 'error'); }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (selectedIndex === null) return;
    try {
      const res = await fetch(`${API_URL}/${selectedIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormPayload())
      });
      if (res.ok) {
        fetchBangs();
        setIsEditing(false);
        setSelectedBang(null);
        showToast('Bang updated', 'success');
      } else {
        showToast('Failed to update bang', 'error');
      }
    } catch (err) { console.error(err); showToast('Failed to update bang', 'error'); }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Delete this bang?')) return;
    try {
      const res = await fetch(`${API_URL}/${index}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBangs();
        setSelectedBang(null);
        showToast('Bang deleted', 'success');
      } else {
        showToast('Failed to delete bang', 'error');
      }
    } catch (err) { console.error(err); showToast('Failed to delete bang', 'error'); }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isEditing) setIsEditing(false);
        else { setSelectedBang(null); setIsAddModalOpen(false); }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isEditing]);

  const openEditMode = () => {
    populateForm(selectedBang);
    setIsEditing(true);
  };

  return (
    <div className="creds-container">
      <header className="creds-header">
        <h1 className="creds-title">Bangs Settings</h1>
        <div className="creds-controls">
          <input 
            type="text" 
            className="creds-search" 
            placeholder="Search bangs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-icon btn-primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }} title="Add New">
            <IconAdd />
          </button>
        </div>
      </header>

      <div className="creds-grid">
        {filteredBangs.map(bang => (
          <div key={bang.originalIndex} className="cred-tile" onClick={() => { setSelectedBang(bang); setSelectedIndex(bang.originalIndex); setIsEditing(false); }}>
            <div className="cred-service">{bang.n}</div>
            <div className="cred-tags">
              <span className="tag">{bang.c}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedBang && (
        <div className="modal-overlay" onClick={() => setSelectedBang(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? 'Edit Bang' : selectedBang.n}</h2>
              <button className="btn-icon" onClick={() => setSelectedBang(null)}><IconClose /></button>
            </div>
            
            {!isEditing ? (
              <div className="modal-body">
                <div className="data-list">
                  <div className="data-row"><span className="data-key">Shortcut</span><span className="data-value">{selectedBang.c}</span></div>
                  <div className="data-row"><span className="data-key">Name</span><span className="data-value">{selectedBang.n}</span></div>
                  <div className="data-row"><span className="data-key">URL</span><span className="data-value">{selectedBang.u}</span></div>
                  <div className="data-row"><span className="data-key">Search URL</span><span className="data-value">{selectedBang.s}</span></div>
                </div>
                <div className="modal-actions">
                   <button className="btn-icon btn-danger" onClick={() => handleDelete(selectedIndex)} title="Delete"><IconDelete /></button>
                   <button className="btn-icon btn-primary" onClick={openEditMode} title="Edit"><IconEdit /></button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateSubmit} className="modal-body">
                <div className="form-group">
                  <label>Shortcut (c)</label>
                  <input type="text" className="creds-input" value={formC} onChange={e => setFormC(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Name (n)</label>
                  <input type="text" className="creds-input" value={formN} onChange={e => setFormN(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Base URL (u)</label>
                  <input type="text" className="creds-input" value={formU} onChange={e => setFormU(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Search URL (s)</label>
                  <input type="text" className="creds-input" value={formS} onChange={e => setFormS(e.target.value)} required />
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

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Bang</h2>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}><IconClose /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="form-group">
                <label>Shortcut (c)</label>
                <input type="text" className="creds-input" value={formC} onChange={e => setFormC(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Name (n)</label>
                <input type="text" className="creds-input" value={formN} onChange={e => setFormN(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Base URL (u)</label>
                <input type="text" className="creds-input" value={formU} onChange={e => setFormU(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Search URL (s)</label>
                <input type="text" className="creds-input" value={formS} onChange={e => setFormS(e.target.value)} required />
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

export default Settings;
