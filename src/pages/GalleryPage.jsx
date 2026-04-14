import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import {
  fetchGalleryFolders,
  fetchGalleryPhotos,
  createGalleryFolder,
  createGalleryPhoto,
} from '../services/galleryService';
import './GalleryPage.css';

const DEFAULT_FOLDERS = [
  'Skill Development & Training (Vocational)',
  'Social & Community Empowerment',
  'Health & Wellness',
  'Success Stories & Impact',
  'Events & Activities',
  'Official & Financial Empowerment',
];

export default function GalleryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName = 'Admin', trust = null } = location.state || {};
  const trustId = trust?.id || null;

  const [folders, setFolders] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [showFolderDetail, setShowFolderDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!trustId) navigate('/dashboard', { replace: true, state: { userName, trust } });
  }, [trustId, userName, navigate, trust]);

  useEffect(() => {
    const load = async () => {
      if (!trustId) return;
      setLoading(true);
      setError('');
      const { data: folderData, error: folderErr } = await fetchGalleryFolders(trustId);
      if (folderErr) setError(folderErr.message || 'Unable to load folders.');

      const baseFolders = DEFAULT_FOLDERS.map((name) => ({ id: `default-${name}`, name, isDefault: true }));
      const dbFolders = folderData || [];
      const nameIndex = new Map(dbFolders.map((f) => [String(f.name || '').toLowerCase(), f]));
      const merged = [
        ...dbFolders,
        ...baseFolders.filter((f) => !nameIndex.has(String(f.name || '').toLowerCase())),
      ];

      setFolders(merged);

      const folderIds = dbFolders.map((f) => f.id).filter(Boolean);
      const { data: photoData, error: photoErr } = await fetchGalleryPhotos(folderIds);
      if (photoErr) setError(photoErr.message || 'Unable to load photos.');
      setPhotos(photoData || []);
      if (!selectedFolderId && merged[0]?.id) {
        setSelectedFolderId(merged[0].id);
      }
      setLoading(false);
    };
    load();
  }, [trustId, selectedFolderId]);

  const folderNameById = useMemo(() => {
    const map = new Map();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  const photoCountByFolderId = useMemo(() => {
    const map = new Map();
    photos.forEach((photo) => {
      const key = photo.folderId;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [photos]);

  const coverPhotoByFolderId = useMemo(() => {
    const map = new Map();
    photos.forEach((photo) => {
      if (!map.has(photo.folderId)) {
        map.set(photo.folderId, photo.url);
      }
    });
    return map;
  }, [photos]);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const filteredPhotos = useMemo(() => {
    if (!selectedFolderId) return [];
    return photos.filter((p) => p.folderId === selectedFolderId);
  }, [photos, selectedFolderId]);

  const handleFile = (file) => {
    if (!file) return;
    if (!selectedFolderId) {
      setError('Please select a folder before uploading.');
      return;
    }
    if (!file.type || !file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = reader.result;
      setUploading(true);
      const { data, error: createErr } = await createGalleryPhoto({
        imageUrl,
        folderId: selectedFolderId,
      });
      if (createErr) {
        setError(createErr.message || 'Unable to upload photo.');
      } else if (data) {
        setPhotos((prev) => [data, ...prev]);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddFolder = async () => {
    const name = window.prompt('Enter new folder name');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = folders.find((f) => (f.name || '').toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setSelectedFolderId(existing.id);
      return;
    }

    const { data, error: createErr } = await createGalleryFolder(trimmed, trustId);
    if (createErr) {
      setError(createErr.message || 'Unable to create folder.');
      return;
    }

    const newFolder = data || { id: `local-${trimmed}`, name: trimmed };
    setFolders((prev) => [newFolder, ...prev]);
    setSelectedFolderId(newFolder.id || trimmed);
    setShowFolderDetail(true);
  };

  const handleSelectFolder = async (folder) => {
    if (!folder?.id) return;
    if (String(folder.id).startsWith('default-')) {
      const { data, error: createErr } = await createGalleryFolder(folder.name, trustId);
      if (createErr) {
        setError(createErr.message || 'Unable to create folder.');
        return;
      }
      if (data) {
        setFolders((prev) =>
          prev.map((f) => (f.id === folder.id ? data : f))
        );
        setSelectedFolderId(data.id);
        setShowFolderDetail(true);
        return;
      }
    }
    setSelectedFolderId(folder.id);
    setShowFolderDetail(true);
  };

  return (
    <div className="gallery-root">
      <Sidebar
        trustName={trust?.name || 'Trust'}
        onDashboard={() => navigate('/dashboard', { state: { userName, trust } })}
        onLogout={() => navigate('/login')}
      />
      <main className="gallery-main">
        <PageHeader
          title="Gallery"
          subtitle="Upload and manage photo albums"
          onBack={() => navigate('/dashboard', { state: { userName, trust } })}
        />
        <div className="gallery-content">
          {error && <div className="gallery-error">{error}</div>}
          <div className="gallery-shell">
            <section className="gallery-hero">
              <div className="gallery-hero-copy">
                <span className="gallery-kicker">Visual archive</span>
                <h2>Build a gallery that feels curated, not cluttered.</h2>
                <p>
                  Organize albums, spotlight event memories, and upload fresh images into
                  beautifully grouped cards for {trust?.name || 'your trust'}.
                </p>
              </div>
              <div className="gallery-stats">
                <div className="gallery-stat-card">
                  <span className="gallery-stat-label">Albums</span>
                  <strong>{folders.length}</strong>
                </div>
                <div className="gallery-stat-card">
                  <span className="gallery-stat-label">Photos</span>
                  <strong>{photos.length}</strong>
                </div>
                <div className="gallery-stat-card">
                  <span className="gallery-stat-label">Selected</span>
                  <strong>{selectedFolder ? (photoCountByFolderId.get(selectedFolder.id) || 0) : 0}</strong>
                </div>
              </div>
            </section>

            <section className="gallery-folders">
              <div className="gallery-folders-head">
                <div>
                  <span className="gallery-section-title">Album cards</span>
                  <div className="gallery-section-sub">Pick a folder to open its photo board</div>
                </div>
                <button className="gallery-add-folder" onClick={handleAddFolder} title="Create folder">+ New</button>
              </div>
              <div className="gallery-folder-list">
                {folders.map((folder, index) => (
                  <button
                    key={folder.id || folder.name}
                    className={`gallery-folder-item ${selectedFolderId === folder.id ? 'active' : ''}`}
                    onClick={() => handleSelectFolder(folder)}
                    type="button"
                    style={{ ['--accent']: `var(--folder-${(index % 6) + 1})` }}
                  >
                    <div className="gallery-folder-preview">
                      {coverPhotoByFolderId.get(folder.id) ? (
                        <img src={coverPhotoByFolderId.get(folder.id)} alt={folder.name} />
                      ) : (
                        <div className="gallery-folder-art">
                          <div className="gallery-folder-dot" />
                          <div className="gallery-folder-art-line" />
                          <div className="gallery-folder-art-line short" />
                        </div>
                      )}
                    </div>
                    <div className="gallery-folder-meta">
                      <div className="gallery-folder-name">{folder.name}</div>
                      <div className="gallery-folder-count">
                        {photoCountByFolderId.get(folder.id) || 0} photos
                      </div>
                    </div>
                    <div className="gallery-folder-open">Open</div>
                  </button>
                ))}
              </div>
            </section>

            {showFolderDetail && (
              <section className="gallery-board">
                <div className="gallery-detail-head">
                  <div>
                    <div className="gallery-detail-title">
                      {folderNameById.get(selectedFolderId) || 'Folder'}
                    </div>
                    <div className="gallery-detail-sub">A focused card board for this album</div>
                  </div>
                  <button
                    className="gallery-back"
                    onClick={() => setShowFolderDetail(false)}
                    type="button"
                  >
                    Back to folders
                  </button>
                </div>

                <div className="gallery-detail-grid">
                  <div className="gallery-spotlight">
                    <div className="gallery-spotlight-top">
                      <span className="gallery-kicker">Selected album</span>
                      <span className="gallery-spotlight-badge">
                        {photoCountByFolderId.get(selectedFolderId) || 0} photos
                      </span>
                    </div>
                    <h3>{folderNameById.get(selectedFolderId)}</h3>
                    <p>
                      Keep uploads, event coverage, and visual storytelling for this folder in one
                      clear place.
                    </p>
                    <div className="gallery-spotlight-preview">
                      {coverPhotoByFolderId.get(selectedFolderId) ? (
                        <img
                          src={coverPhotoByFolderId.get(selectedFolderId)}
                          alt={folderNameById.get(selectedFolderId)}
                        />
                      ) : (
                        <div className="gallery-spotlight-empty">
                          No cover image yet. Upload the first photo to bring this card to life.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="gallery-upload">
                    <div className="gallery-upload-title">Add Photos</div>
                    <label
                      className={`gallery-drop ${dragOver ? 'drag' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                        disabled={uploading}
                      />
                      <div className="gallery-drop-inner">
                        <span>{uploading ? 'Uploading...' : 'Drag & drop image here'}</span>
                        <span className="gallery-drop-sub">or click to upload</span>
                      </div>
                    </label>
                    <div className="gallery-upload-note">
                      Uploads go to {folderNameById.get(selectedFolderId)}.
                    </div>
                  </div>
                </div>

                <div className="gallery-photos">
                  <div className="gallery-photos-head">
                    <div>
                      <div className="gallery-photos-title">Photo cards</div>
                      <div className="gallery-photos-sub">
                        {selectedFolderId
                          ? `Folder: ${folderNameById.get(selectedFolderId)}`
                          : 'Select a folder'}
                      </div>
                    </div>
                    <div className="gallery-photos-count">{filteredPhotos.length}</div>
                  </div>

                  {loading && <div className="gallery-loading">Loading photos...</div>}

                  {!loading && filteredPhotos.length === 0 && (
                    <div className="gallery-empty">
                      No photos yet. Drop your first image to get started.
                    </div>
                  )}

                  {!loading && filteredPhotos.length > 0 && (
                    <div className="gallery-grid">
                      {filteredPhotos.map((photo, index) => (
                        <div key={photo.id} className="gallery-photo">
                          <img src={photo.url} alt="Gallery" />
                          <div className="gallery-photo-overlay">
                            <div className="gallery-photo-index">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                            {photo.folderId && (
                              <div className="gallery-photo-tag">{folderNameById.get(photo.folderId)}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
