import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPE DEFINITIONS ---
interface Episode {
    number: number;
    title: string;
    url: string;
    thumbnail?: string;
    duration?: string;
    uploadDate?: string;
}

interface Anime {
    id: string;
    name: string;
    image: string;
    description: string;
    rating: string;
    genres: string[];
    year: string;
    status: string;
    totalEpisodes?: number;
    episodes?: Episode[];
}

interface SourceData {
    metadata: {
        sourceName: string;
        version: string;
        author: string;
        updateDate: string;
        url?: string; // For updates
    };
    animeList: Anime[];
}

type Theme = 'light' | 'dark';
type FontSize = 'small' | 'medium' | 'large';
interface Settings {
  theme: Theme;
  fontSize: FontSize;
}
type ActiveView = 'home' | 'search' | 'downloads' | 'sources' | 'settings';

const sampleData: SourceData = {
  "metadata": {
    "sourceName": "مصدر الأنمي",
    "version": "1.0",
    "author": "Lucifer",
    "updateDate": "2024-07-20"
  },
  "animeList": [
    {
      "id": "1",
      "name": "Attack on Titan",
      "image": "https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3OGYtNDdiMzNiNDZlMDAwXkEyXkFqcGdeQXVyNzI3NjY3NjQ@._V1_FMjpg_UX1000_.jpg",
      "description": "بعد تدمير مسقط رأسه ومقتل والدته، يتعهد الشاب إرين ييغر بتطهير الأرض من العمالقة البشرية العملاقة التي أوصلت البشرية إلى حافة الانقراض.",
      "rating": "9.1",
      "genres": ["أكشن", "دراما", "خيال"],
      "year": "2013",
      "status": "مكتمل",
      "totalEpisodes": 87,
        "episodes": [
            {
                "number": 1,
                "title": "إليك، بعد 2000 عام",
                "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "uploadDate": "2013-04-07"
            },
            {
                "number": 2,
                "title": "ذلك اليوم",
                "url": "#",
                "uploadDate": "2013-04-14"
            }
        ]
    },
    {
      "id": "2",
      "name": "Demon Slayer",
      "image": "https://m.media-amazon.com/images/M/MV5BZjYwMmI4ZWItNDBlMy00YjIzLWE0NzYtMWM3ZDc4NTEyMmIzXkEyXkFqcGdeQXVyMTM1MTE1NDM1._V1_FMjpg_UX1000_.jpg",
      "description": "فتى طيب القلب يبيع الفحم لكسب لقمة العيش يصبح قاتل شياطين بعد أن قُتلت عائلته على يد شيطان، وتحولت أخته الصغرى نيزوكو إلى واحدة منهم.",
      "rating": "8.7",
      "genres": ["أكشن", "مغامرة", "خارق للطبيعة"],
      "year": "2019",
      "status": "مستمر",
    },
    {
      "id": "3",
      "name": "Death Note",
      "image": "https://m.media-amazon.com/images/M/MV5BODkzMjhjYTQtYmQyOS00NmZlLTg3Y2UtYjkzN2JkNmRjY2FhXkEyXkFqcGdeQXVyNTM4MDQ5MDc@._V1_FMjpg_UX1000_.jpg",
      "description": "طالب في المدرسة الثانوية يكتشف مذكرة غامضة تمنحه القدرة على قتل أي شخص يكتب اسمه فيها.",
      "rating": "9.0",
      "genres": ["غموض", "نفسي", "إثارة"],
      "year": "2006",
      "status": "مكتمل",
    },
    {
      "id": "4",
      "name": "One Piece",
      "image": "https://m.media-amazon.com/images/M/MV5BODZmYjMwNzEtNzVhNC00ZTRmLWI0MDktYWNhxZDY2ZmQxNDIyXkEyXkFqcGdeQXVyMTxMNDE1NTg@._V1_FMjpg_UX1000_.jpg",
      "description": "يتبع مغامرات مونكي دي لوفي وطاقم قبعة القش في سعيهم للعثور على الكنز النهائي المعروف باسم 'ون بيس'.",
      "rating": "8.9",
      "genres": ["أكشن", "مغامرة", "كوميديا"],
      "year": "1999",
      "status": "مستمر",
    },
    {
        "id": "5",
        "name": "Jujutsu Kaisen",
        "image": "https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_FMjpg_UX1000_.jpg",
        "description": "فتى يبتلع تعويذة ملعونة - إصبع شيطان - ويصبح ملعونًا بنفسه. يدخل مدرسة للسحرة لإنقاذ نفسه.",
        "rating": "8.5",
        "genres": ["أكشن", "خارق للطبيعة", "خيال"],
        "year": "2020",
        "status": "مستمر",
    },
    {
        "id": "6",
        "name": "Naruto Shippuden",
        "image": "https://m.media-amazon.com/images/M/MV5BZGFiMWFhNDAtMDBjYS00NmQ2LTk2MjYtMzc2ZDIxYmY4ZjkyXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_FMjpg_UX1000_.jpg",
        "description": "يعود ناروتو أوزوماكي إلى قرية الورق المخفية بعد عامين ونصف من التدريب. يقرر تحقيق حلمه في أن يصبح الهوكاجي التالي.",
        "rating": "8.7",
        "genres": ["أكشن", "مغامرة", "فنون قتالية"],
        "year": "2007",
        "status": "مكتمل",
    }
  ]
};

const Header = () => {
    return(
      <header style={styles.header}>
        <h1 style={styles.logo} className="logo-font">Anmo</h1>
      </header>
    );
};

const BottomNavBar = ({ activeView, onHomeClick, onSearchClick, onDownloadsClick, onSourcesClick, onSettingsClick }) => {
    const navItems = [
        { id: 'home', label: 'الرئيسية', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4z"></path></svg>, onClick: onHomeClick },
        { id: 'search', label: 'بحث', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path></svg>, onClick: onSearchClick },
        { id: 'downloads', label: 'التنزيلات', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m12 16 4-5h-3V4h-2v7H8z"></path><path d="M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"></path></svg>, onClick: onDownloadsClick },
        { id: 'sources', label: 'المصادر', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 3.79 2 6v12c0 2.21 4.486 4 10 4s10-1.79 10-4V6c0-2.21-4.486-4-10-4zm0 18c-4.411 0-8-1.34-8-3V6.42C4.484 6.15 5.174 6 6 6c2.757 0 5 1.79 5 4s-2.243 4-5 4v-2c1.654 0 3-1.34 3-3s-1.346-3-3-3c-.175 0-.347.02-.516.05C8.423 4.441 10.133 4 12 4s3.577.441 5.516 1.05c-.169-.03-.341-.05-.516-.05c-1.654 0-3 1.34-3 3s1.346 3 3 3v2c-2.757 0-5-1.79-5-4s2.243-4 5-4c.826 0 1.516.15 2 .42V18c0 1.66-3.589 3-8 3z"></path><path d="M6 8c-1.654 0-3 1.34-3 3s1.346 3 3 3 3-1.34 3-3-1.346-3-3-3zm12 0c-1.654 0-3 1.34-3 3s1.346 3 3 3 3-1.34 3-3-1.346-3-3-3z"></path></svg>, onClick: onSourcesClick },
        { id: 'settings', label: 'الإعدادات', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>, onClick: onSettingsClick },
    ];

    return (
        <footer style={styles.bottomNav}>
            {navItems.map(item => {
                const isActive = activeView === item.id;
                return (
                    <button 
                        key={item.id} 
                        onClick={item.onClick}
                        style={{ ...styles.bottomNavButton, ...(isActive ? styles.bottomNavButtonActive : {}) }}
                        aria-label={item.label}
                        title={item.label}
                    >
                        <div style={{ ...styles.iconContainer, ...(isActive ? styles.bottomNavIconActiveContainer : {}) }}>
                           {item.icon}
                        </div>
                        <span style={styles.bottomNavLabel}>{item.label}</span>
                    </button>
                )
            })}
        </footer>
    );
};

const SearchBar = ({ query, onQueryChange, onClose }) => (
    <div style={styles.searchBar}>
        <input
            type="text"
            style={styles.searchInput}
            placeholder="ابحث عن أنمي..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
            aria-label="البحث عن أنمي"
        />
        <button onClick={onClose} style={styles.searchCloseButton} aria-label="إغلاق البحث" title="إغلاق البحث">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
        </button>
    </div>
);

const AnimeCard: React.FC<{ anime: Anime, onClick: () => void }> = ({ anime, onClick }) => (
  <div style={styles.card} className="card" tabIndex={0} role="button" aria-label={`عرض تفاصيل ${anime.name}`} onClick={onClick}>
    <img src={anime.image} alt={anime.name} style={styles.cardImage} className="cardImage" loading="lazy" />
    <div style={styles.cardOverlay}>
      <h3 style={{...styles.cardTitle, ...styles.logoFont}}>{anime.name}</h3>
      <div style={styles.cardInfo}>
        <span style={styles.cardRating}>
            ⭐ {anime.rating}
        </span>
        <span style={styles.cardYear}>{anime.year}</span>
      </div>
    </div>
  </div>
);

const FilterBar = () => {
    const filters = ['الأحدث', 'الأكثر مشاهدة', 'الأنواع'];
    const [active, setActive] = useState(filters[0]);

    return (
        <div style={styles.filterBar}>
            {filters.map(filter => (
                <button 
                    key={filter} 
                    style={{...styles.filterButton, ...(active === filter ? styles.activeFilter : {})}}
                    className="filterButton"
                    onClick={() => setActive(filter)}
                    aria-pressed={active === filter}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};

const AddSourceForm = ({ onAdd, onCancel }) => {
    const [addMethod, setAddMethod] = useState('url');
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndAddSource = (sourceText: string, sourceUrl?: string) => {
        try {
            const data: SourceData = JSON.parse(sourceText);
            if (!data.metadata || !data.metadata.sourceName || !Array.isArray(data.animeList)) {
                throw new Error("بنية JSON غير صالحة. تأكد من وجود 'metadata' و 'animeList'.");
            }
             if (sourceUrl) {
                data.metadata.url = sourceUrl;
            }
            onAdd(data);
            setInputValue('');
            setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    const handleAddFromUrl = async () => {
        if (!inputValue) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(inputValue);
            if (!response.ok) {
                throw new Error(`فشل في جلب المصدر. الحالة: ${response.status}`);
            }
            const text = await response.text();
            validateAndAddSource(text, inputValue);
        } catch (e) {
            setError(`خطأ في الشبكة أو CORS: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFromText = () => {
        if (!inputValue) return;
        validateAndAddSource(inputValue);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                validateAndAddSource(e.target?.result as string);
            };
            reader.onerror = () => {
                setError("فشل في قراءة الملف.");
            };
            reader.readAsText(file);
        }
    };

    return (
        <div style={styles.addSourceForm}>
            <div style={styles.addSourceTabs}>
                {['url', 'text', 'file'].map(method => (
                    <button key={method} onClick={() => setAddMethod(method)} style={{...styles.filterButton, ...(addMethod === method ? styles.activeFilter : {})}}>
                        {method === 'url' ? 'رابط' : method === 'text' ? 'نص' : 'ملف'}
                    </button>
                ))}
            </div>
            {error && <p style={styles.errorMessage}>{error}</p>}
            {addMethod === 'url' && (
                <div style={styles.addSourceContent}>
                    <input type="url" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="https://example.com/source.json" style={styles.modalInput} />
                    <button onClick={handleAddFromUrl} disabled={loading} style={styles.modalButton}>{loading ? 'جاري التحميل...' : 'إضافة'}</button>
                </div>
            )}
            {addMethod === 'text' && (
                 <div style={styles.addSourceContent}>
                    <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="الصق محتوى JSON هنا" style={{...styles.modalInput, height: '100px', resize: 'vertical'}} />
                    <button onClick={handleAddFromText} style={styles.modalButton}>إضافة</button>
                </div>
            )}
            {addMethod === 'file' && (
                <div style={styles.addSourceContent}>
                    <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={styles.modalButton}>اختر ملف JSON</button>
                </div>
            )}
            <button onClick={onCancel} style={{...styles.modalButton, ...styles.modalButtonSecondary}}>إلغاء</button>
        </div>
    );
};

const SourcesModal = ({ isOpen, onClose, sources, onAdd, onDelete, onMerge, onEdit, onCreate, updatesAvailable, onUpdate, onCheckForUpdates }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsAdding(false);
            setSelectedIds(new Set());
            setIsConfirmingDelete(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddSource = (newSource) => {
        const success = onAdd(newSource);
        if (success) {
            setIsAdding(false);
        }
    };

    const handleSelectionChange = (sourceName: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(sourceName)) {
            newSelection.delete(sourceName);
        } else {
            newSelection.add(sourceName);
        }
        setSelectedIds(newSelection);
    };

    const handleMergeClick = () => {
        const newSourceName = prompt("أدخل اسمًا للمصدر المدمج الجديد:");
        if (newSourceName) {
            onMerge(Array.from(selectedIds), newSourceName);
            setSelectedIds(new Set());
        }
    };

    const handleDeleteClick = () => {
        setIsConfirmingDelete(true);
    };
    
    const confirmDelete = () => {
        onDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsConfirmingDelete(false);
    };

    const handleExportClick = () => {
        const sourcesToExport = sources.filter(s => selectedIds.has(s.metadata.sourceName));
        if (sourcesToExport.length === 0) return;

        const dataToExport = sourcesToExport.length === 1 ? sourcesToExport[0] : sourcesToExport;
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = sourcesToExport.length === 1
            ? `anmo_source_${sourcesToExport[0].metadata.sourceName.replace(/\s/g, '_')}.json`
            : `anmo_sources_export.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div style={styles.modalBackdrop} className="modal-backdrop">
                <div style={styles.modalContent} className="modal-content" onClick={e => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h2 className="logo-font">إدارة المصادر</h2>
                         <div style={{display: 'flex', gap: '8px'}}>
                            <button onClick={onCheckForUpdates} style={styles.modalButtonSecondary}>التحقق من التحديثات</button>
                            <button onClick={onClose} style={styles.searchCloseButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                            </button>
                        </div>
                    </div>
                    <ul style={styles.sourceList}>
                        {sources.map(source => {
                            const isUpdateAvailable = !!updatesAvailable[source.metadata.sourceName];
                            return (
                            <li key={source.metadata.sourceName} style={{...styles.sourceListItem, ...(selectedIds.has(source.metadata.sourceName) ? styles.sourceListItemSelected : {})}}>
                                <input
                                    type="checkbox"
                                    style={styles.checkbox}
                                    checked={selectedIds.has(source.metadata.sourceName)}
                                    onChange={() => handleSelectionChange(source.metadata.sourceName)}
                                    aria-labelledby={`source-name-${source.metadata.sourceName}`}
                                />
                                <span id={`source-name-${source.metadata.sourceName}`} style={{ flex: 1, marginRight: '12px' }}>
                                    {source.metadata.sourceName}
                                </span>
                                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    {isUpdateAvailable && <span style={styles.updateAvailableBadge}>تحديث متاح!</span>}
                                    {isUpdateAvailable && <button onClick={() => onUpdate(source)} style={{...styles.modalButtonSecondary, color: 'var(--secondary-color)', borderColor: 'var(--secondary-color)'}}>تحديث</button>}
                                    <button onClick={() => onEdit(source)} style={styles.modalButtonSecondary}>تعديل</button>
                                </div>
                            </li>
                        )})}
                    </ul>

                    {selectedIds.size > 0 && (
                        <div style={styles.modalFooter}>
                             <button onClick={handleExportClick} style={{...styles.modalButton, ...styles.modalButtonSecondary}}>تصدير ({selectedIds.size})</button>
                             <button onClick={handleMergeClick} disabled={selectedIds.size < 2} style={styles.modalButton}>دمج ({selectedIds.size})</button>
                             <button onClick={handleDeleteClick} style={{...styles.modalButton, ...styles.modalButtonDanger}}>حذف ({selectedIds.size})</button>
                        </div>
                    )}
                    
                    <div style={styles.modalFooter}>
                        {!isAdding ? (
                             <button onClick={() => setIsAdding(true)} style={styles.modalButton}>استيراد مصدر</button>
                        ) : (
                            <AddSourceForm onAdd={handleAddSource} onCancel={() => setIsAdding(false)} />
                        )}
                        <button onClick={onCreate} style={styles.modalButton}>إنشاء مصدر جديد</button>
                    </div>
                </div>
            </div>
            <ConfirmationDialog
                isOpen={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف المصادر المحددة (${selectedIds.size})؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </>
    );
};

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange, onDeveloperInfoClick, onLogout }) => {
    if (!isOpen) return null;

    const SettingSection = ({ title, children }) => (
        <div style={styles.settingsSection}>
            <h3 style={{...styles.settingsSectionTitle, ...styles.logoFont}}>{title}</h3>
            <div style={styles.settingsSectionContent}>
                {children}
            </div>
        </div>
    );
    
    return (
        <div style={styles.modalBackdrop} className="modal-backdrop" onClick={onClose}>
            <div style={styles.modalContent} className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 className="logo-font">الإعدادات</h2>
                    <button onClick={onClose} style={styles.searchCloseButton}>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                    </button>
                </div>
                <SettingSection title="المظهر">
                    <button 
                        onClick={() => onSettingsChange({ ...settings, theme: 'light' })}
                        style={{...styles.filterButton, ...(settings.theme === 'light' ? styles.activeFilter : {})}}
                    >
                        فاتح
                    </button>
                    <button 
                        onClick={() => onSettingsChange({ ...settings, theme: 'dark' })}
                        style={{...styles.filterButton, ...(settings.theme === 'dark' ? styles.activeFilter : {})}}
                    >
                        داكن
                    </button>
                </SettingSection>
                <SettingSection title="حجم الخط">
                     <button 
                        onClick={() => onSettingsChange({ ...settings, fontSize: 'small' })}
                        style={{...styles.filterButton, ...(settings.fontSize === 'small' ? styles.activeFilter : {})}}
                    >
                        صغير
                    </button>
                    <button 
                        onClick={() => onSettingsChange({ ...settings, fontSize: 'medium' })}
                        style={{...styles.filterButton, ...(settings.fontSize === 'medium' ? styles.activeFilter : {})}}
                    >
                        متوسط
                    </button>
                     <button 
                        onClick={() => onSettingsChange({ ...settings, fontSize: 'large' })}
                        style={{...styles.filterButton, ...(settings.fontSize === 'large' ? styles.activeFilter : {})}}
                    >
                        كبير
                    </button>
                </SettingSection>
                <SettingSection title="الحساب">
                    <button onClick={onLogout} style={{...styles.filterButton, ...styles.modalButtonDanger}}>
                        تسجيل الخروج
                    </button>
                </SettingSection>
                 <SettingSection title="حول">
                    <button onClick={onDeveloperInfoClick} style={styles.filterButton}>
                        معلومات المطور
                    </button>
                </SettingSection>
            </div>
        </div>
    );
};

const DeveloperInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.modalBackdrop} className="modal-backdrop" onClick={onClose}>
            <div style={{...styles.modalContent, maxWidth: '450px', zIndex: 1100}} className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 className="logo-font">معلومات المطور</h2>
                    <button onClick={onClose} style={styles.searchCloseButton}>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                    </button>
                </div>
                <div style={styles.developerInfoContent}>
                    <div style={styles.developerInfoItem}>
                        <span style={styles.developerInfoLabel}>الاسم:</span>
                        <span>محمد الشاوني</span>
                    </div>
                    <div style={styles.developerInfoItem}>
                        <span style={styles.developerInfoLabel}>اللقب:</span>
                        <span>Lucifer</span>
                    </div>
                    <div style={styles.developerInfoItem}>
                        <span style={styles.developerInfoLabel}>الهاتف:</span>
                        <span>0697822311</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoPlayer: React.FC<{ episodeUrl: string, episodeTitle: string, onClose: () => void }> = ({ episodeUrl, episodeTitle, onClose }) => {
    const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url) || url.startsWith('blob:');

    let playerElement;
    if (isDirectVideo(episodeUrl)) {
        playerElement = <video src={episodeUrl} style={styles.videoElement} controls autoPlay />;
    } else {
        playerElement = <iframe
            src={episodeUrl}
            style={styles.videoElement}
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={episodeTitle}
        ></iframe>;
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div style={styles.videoPlayerBackdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="مشغل الفيديو">
            <div style={styles.videoPlayerContent} onClick={e => e.stopPropagation()}>
                <div style={styles.videoPlayerHeader}>
                    <h3 style={styles.videoPlayerTitle}>{episodeTitle}</h3>
                    <button onClick={onClose} style={styles.searchCloseButton} aria-label="إغلاق المشغل">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                    </button>
                </div>
                <div style={styles.videoContainer}>
                    {episodeUrl && episodeUrl !== '#' ? playerElement : <div style={styles.playerPlaceholder}><p>رابط الفيديو غير متوفر.</p></div>}
                </div>
            </div>
        </div>
    );
};

const AnimeDetail: React.FC<{ anime: Anime, onBack: () => void, downloads: any, onDownload: any, onPlayDownloaded: any }> = ({ anime, onBack, downloads, onDownload, onPlayDownloaded }) => {
    const [playingEpisode, setPlayingEpisode] = useState<{url: string, title: string} | null>(null);

    const getDownloadStatus = (animeId: string, episodeNumber: number) => {
        const key = `${animeId}-${episodeNumber}`;
        return downloads[key]?.status || 'none';
    };

    const handlePlay = (episode) => {
        const status = getDownloadStatus(anime.id, episode.number);
        if (status === 'downloaded') {
            onPlayDownloaded(anime.id, episode.number, episode.title);
        } else {
            setPlayingEpisode({ url: episode.url, title: episode.title });
        }
    };
    
    return (
        <div style={styles.detailView} className="detailView">
            <header style={styles.detailHeaderContainer}>
                <img src={anime.image} alt="" style={styles.detailBannerImage} aria-hidden="true" />
                <div style={styles.detailBannerOverlay}></div>
                <button onClick={onBack} style={styles.backButton} className="backButton" aria-label="العودة إلى القائمة الرئيسية" title="رجوع">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px', transform: 'scaleX(-1)'}}>
                        <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path>
                    </svg>
                </button>
            </header>
            <div style={styles.detailContent}>
                <div style={styles.detailPrimaryInfo} className="detailPrimaryInfo">
                    <img src={anime.image} alt={anime.name} style={styles.detailPosterImage} />
                    <div style={styles.detailMetaContainer}>
                        <h2 style={{...styles.detailTitle, ...styles.logoFont}}>{anime.name}</h2>
                        <div style={styles.detailMeta}>
                            <span style={styles.detailMetaItem}>⭐ {anime.rating}</span>
                            <span style={styles.detailMetaItem}>{anime.year}</span>
                            <span style={styles.detailMetaItem}>{anime.status === 'Ongoing' ? 'مستمر' : 'مكتمل'}</span>
                            {anime.totalEpisodes && <span style={styles.detailMetaItem}>{anime.totalEpisodes} حلقة</span>}
                        </div>
                        <div style={styles.genreContainer}>
                            {anime.genres.map(genre => <span key={genre} style={styles.genreTag} className="genreTag">{genre}</span>)}
                        </div>
                    </div>
                </div>
                
                <section style={styles.detailSection}>
                    <h3 style={{...styles.sectionTitle, ...styles.logoFont}}>القصة</h3>
                    <p style={styles.detailDescription}>{anime.description}</p>
                </section>

                <section style={styles.detailSection}>
                    <h3 style={{...styles.sectionTitle, ...styles.logoFont}}>الحلقات</h3>
                    {anime.episodes && anime.episodes.length > 0 ? (
                        <ul style={styles.episodeList}>
                            {anime.episodes.map(ep => {
                                const status = getDownloadStatus(anime.id, ep.number);
                                return (
                                <li key={ep.number} style={styles.episodeItem} className="episodeItem">
                                    <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer'}} onClick={() => handlePlay(ep)} tabIndex={0} role="button" aria-label={`تشغيل الحلقة ${ep.number}: ${ep.title}`}>
                                        <span style={styles.episodeNumber}>{ep.number}</span>
                                        <div style={styles.episodeInfo}>
                                            <span style={styles.episodeTitle}>{ep.title}</span>
                                            {ep.uploadDate && <span style={styles.episodeDate}>{ep.uploadDate}</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDownload(anime, ep)}
                                        style={{...styles.iconButton, ...styles.downloadButton}}
                                        disabled={status === 'downloading' || status === 'downloaded'}
                                        aria-label={status === 'downloaded' ? 'تم التنزيل' : 'تنزيل الحلقة'}
                                        title={status === 'downloaded' ? 'تم التنزيل' : 'تنزيل الحلقة'}
                                    >
                                        {status === 'none' && <svg style={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m12 16 4-5h-3V4h-2v7H8z"></path><path d="M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"></path></svg>}
                                        {status === 'downloading' && <div style={styles.loader}></div>}
                                        {status === 'downloaded' && <svg style={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>}
                                    </button>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <p style={styles.noResults}>لا توجد حلقات متاحة بعد.</p>
                    )}
                </section>
            </div>
            {playingEpisode && <VideoPlayer episodeUrl={playingEpisode.url} episodeTitle={playingEpisode.title} onClose={() => setPlayingEpisode(null)} />}
        </div>
    );
};

const createBlankSource = (): SourceData => ({
    metadata: {
        sourceName: '',
        version: '1.0',
        author: 'محرر Anmo',
        updateDate: new Date().toISOString().split('T')[0],
    },
    animeList: [],
});

const createBlankAnime = (): Anime => ({
    id: Date.now().toString(),
    name: '',
    image: '',
    description: '',
    rating: '',
    genres: [],
    year: '',
    status: 'Ongoing',
    episodes: [],
});

const createBlankEpisode = (): Episode => ({
    number: 1,
    title: '',
    url: '',
});

const ConfirmationDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmButtonStyle?: React.CSSProperties;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'تأكيد الحذف', confirmButtonStyle = styles.modalButtonDanger }) => {
    if (!isOpen) return null;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div style={styles.modalBackdrop} className="modal-backdrop" onClick={onClose}>
            <div style={{...styles.modalContent, maxWidth: '450px', zIndex: 1300}} className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={{margin: 0}} className="logo-font">{title}</h2>
                </div>
                <p style={{color: 'var(--text-secondary-color)', lineHeight: 1.6, margin: '16px 0'}}>{message}</p>
                <div style={{...styles.modalFooter, borderTop: 'none', paddingTop: 0, justifyContent: 'flex-end'}}>
                    <button onClick={onClose} style={{...styles.modalButton, ...styles.modalButtonSecondary}}>إلغاء</button>
                    <button onClick={onConfirm} style={{...styles.modalButton, ...confirmButtonStyle}}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const SourceEditor = ({ initialSource, onSave, onCancel }) => {
    const [source, setSource] = useState<SourceData>(initialSource ? JSON.parse(JSON.stringify(initialSource)) : createBlankSource());
    const [originalName] = useState(initialSource?.metadata.sourceName || null);
    const [activeAnimeIndex, setActiveAnimeIndex] = useState<number | null>(null);
    const [animeToDelete, setAnimeToDelete] = useState<{ index: number; name: string } | null>(null);

    const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSource(prev => ({...prev, metadata: {...prev.metadata, [name]: value }}));
    };

    const handleAnimeChange = (index: number, updatedAnime: Anime) => {
        const newAnimeList = [...source.animeList];
        newAnimeList[index] = updatedAnime;
        setSource(prev => ({ ...prev, animeList: newAnimeList }));
    };

    const addAnime = () => {
        setSource(prev => ({ ...prev, animeList: [...prev.animeList, createBlankAnime()] }));
        setActiveAnimeIndex(source.animeList.length);
    };

    const removeAnime = (index: number) => {
        const animeName = source.animeList[index]?.name || 'أنمي جديد';
        setAnimeToDelete({ index, name: animeName });
    };

    const confirmRemoveAnime = () => {
        if (animeToDelete === null) return;
        setSource(prev => ({ ...prev, animeList: prev.animeList.filter((_, i) => i !== animeToDelete.index) }));
        setAnimeToDelete(null);
    };
    
    const handleSave = () => {
        if (!source.metadata.sourceName) {
            alert("اسم المصدر مطلوب.");
            return;
        }
        onSave(source, originalName);
    };
    
    const handleExport = () => {
        if (!source.metadata.sourceName.trim()) {
            alert("يرجى إدخال اسم للمصدر قبل التصدير.");
            return;
        }

        const jsonString = JSON.stringify(source, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Sanitize filename
        const fileName = `anmo_source_${source.metadata.sourceName.replace(/[\s/\\?%*:|"<>]/g, '_')}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const AnimeForm = ({ anime, index, onChange }) => {
        const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            const newGenres = name === 'genres' ? value.split(',').map(g => g.trim()) : anime.genres;
            onChange(index, { ...anime, [name]: name === 'genres' ? newGenres : value });
        };
        
        const handleEpisodeChange = (epIndex: number, updatedEpisode: Episode) => {
            const newEpisodes = [...(anime.episodes || [])];
            newEpisodes[epIndex] = updatedEpisode;
            onChange(index, { ...anime, episodes: newEpisodes });
        };

        const addEpisode = () => {
            const newEpisodeNumber = anime.episodes && anime.episodes.length > 0 ? Math.max(...anime.episodes.map(e => e.number)) + 1 : 1;
            const newEpisodes = [...(anime.episodes || []), {...createBlankEpisode(), number: newEpisodeNumber }];
            onChange(index, { ...anime, episodes: newEpisodes });
        };

        const removeEpisode = (epIndex: number) => {
            const newEpisodes = (anime.episodes || []).filter((_, i) => i !== epIndex);
            onChange(index, { ...anime, episodes: newEpisodes });
        };

        return (
            <div style={styles.editorForm}>
                <div style={styles.editorGrid}>
                    <input name="name" value={anime.name} onChange={handleFieldChange} placeholder="اسم الأنمي" style={styles.modalInput} />
                    <input name="image" value={anime.image} onChange={handleFieldChange} placeholder="رابط الصورة" style={styles.modalInput} />
                    <input name="rating" value={anime.rating} onChange={handleFieldChange} placeholder="التقييم" style={styles.modalInput} />
                    <input name="year" value={anime.year} onChange={handleFieldChange} placeholder="السنة" style={styles.modalInput} />
                    <input name="genres" value={anime.genres.join(', ')} onChange={handleFieldChange} placeholder="الأنواع (مفصولة بفاصلة)" style={styles.modalInput} />
                    <select name="status" value={anime.status} onChange={handleFieldChange} style={styles.modalInput}>
                        <option value="Ongoing">مستمر</option>
                        <option value="Completed">مكتمل</option>
                    </select>
                </div>
                <textarea name="description" value={anime.description} onChange={handleFieldChange} placeholder="الوصف" style={{...styles.modalInput, gridColumn: '1 / -1', minHeight: '80px'}} />
                
                <h4 style={{...styles.editorSubHeader, ...styles.logoFont}}>الحلقات</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {(anime.episodes || []).map((ep, epIndex) => (
                        <div key={epIndex} style={styles.episodeEditorItem}>
                            <input type="number" value={ep.number} onChange={(e) => handleEpisodeChange(epIndex, {...ep, number: parseInt(e.target.value,10) || 0})} placeholder="رقم" style={{...styles.modalInput, width: '60px'}} />
                            <input value={ep.title} onChange={(e) => handleEpisodeChange(epIndex, {...ep, title: e.target.value})} placeholder="عنوان الحلقة" style={{...styles.modalInput, flex: 1}} />
                            <input value={ep.url} onChange={(e) => handleEpisodeChange(epIndex, {...ep, url: e.target.value})} placeholder="رابط الفيديو" style={{...styles.modalInput, flex: 2}} />
                            <button onClick={() => removeEpisode(epIndex)} style={styles.editorDeleteButton}>X</button>
                        </div>
                    ))}
                </div>
                <button onClick={addEpisode} style={{...styles.modalButtonSecondary, alignSelf: 'flex-start'}}>إضافة حلقة</button>
            </div>
        );
    };

    return (
        <>
            <div style={styles.editorBackdrop}>
                <div style={styles.editorContent}>
                    <header style={styles.editorHeader}>
                        <h2 className="logo-font">{initialSource ? 'تعديل المصدر' : 'إنشاء مصدر جديد'}</h2>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={onCancel} style={styles.modalButtonSecondary}>إلغاء</button>
                            <button onClick={handleExport} style={styles.modalButtonSecondary}>تصدير</button>
                            <button onClick={handleSave} style={styles.modalButton}>حفظ المصدر</button>
                        </div>
                    </header>
                    <div style={styles.editorMeta}>
                        <input name="sourceName" value={source.metadata.sourceName} onChange={handleMetaChange} placeholder="اسم المصدر" style={styles.modalInput} />
                        <input name="author" value={source.metadata.author} onChange={handleMetaChange} placeholder="المؤلف" style={styles.modalInput} />
                    </div>
                    <div style={styles.editorAnimeList}>
                        {source.animeList.map((anime, index) => (
                             <details key={anime.id || index} style={styles.editorAccordion} open={activeAnimeIndex === index}>
                                <summary style={styles.editorAccordionSummary} onClick={(e) => { e.preventDefault(); setActiveAnimeIndex(activeAnimeIndex === index ? null : index); }}>
                                    <span>{anime.name || 'أنمي جديد'}</span>
                                    <button onClick={(e) => { e.stopPropagation(); removeAnime(index); }} style={styles.editorDeleteButton}>حذف الأنمي</button>
                                </summary>
                                <AnimeForm anime={anime} index={index} onChange={handleAnimeChange} />
                             </details>
                        ))}
                    </div>
                    <button onClick={addAnime} style={styles.modalButton}>إضافة أنمي جديد</button>
                </div>
            </div>
            <ConfirmationDialog
                isOpen={animeToDelete !== null}
                onClose={() => setAnimeToDelete(null)}
                onConfirm={confirmRemoveAnime}
                title="تأكيد حذف الأنمي"
                message={`هل أنت متأكد من رغبتك في حذف الأنمي "${animeToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            />
        </>
    );
};

const DownloadsModal = ({ isOpen, onClose, downloads, onPlay, onDelete, onClearAll }) => {
    if (!isOpen) return null;

    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    const downloadedAnime = Object.values(downloads).reduce((acc: any, download: any) => {
        if(download.status === 'downloaded') {
            const { anime, episode } = download;
            if (!acc[anime.id]) {
                acc[anime.id] = { ...anime, downloadedEpisodes: [] };
            }
            acc[anime.id].downloadedEpisodes.push(episode);
        }
        return acc;
    }, {});

    const handleDelete = (animeId, episodeNumber) => {
        onDelete(animeId, episodeNumber);
    };

    return (
       <>
            <div style={styles.modalBackdrop} className="modal-backdrop" onClick={onClose}>
                <div style={styles.modalContent} className="modal-content" onClick={e => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h2 className="logo-font">التنزيلات</h2>
                        <button onClick={onClose} style={styles.searchCloseButton}>
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                        </button>
                    </div>

                    {Object.keys(downloadedAnime).length === 0 ? (
                        <p style={styles.noResults}>لم تقم بتنزيل أي حلقات بعد.</p>
                    ) : (
                        <div style={styles.downloadedList}>
                            {Object.values(downloadedAnime).map((anime: any) => (
                                <div key={anime.id} style={styles.downloadedAnimeSection}>
                                    <h3 style={{...styles.downloadedAnimeTitle, ...styles.logoFont}}>{anime.name}</h3>
                                    <ul style={styles.episodeList}>
                                        {anime.downloadedEpisodes.map(ep => (
                                            <li key={ep.number} style={styles.episodeItem}>
                                                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onPlay(anime.id, ep.number, ep.title)}>
                                                    <span style={styles.episodeNumber}>{ep.number}</span>
                                                    <span style={styles.episodeTitle}>{ep.title}</span>
                                                </div>
                                                <button onClick={() => handleDelete(anime.id, ep.number)} style={{...styles.iconButton, ...styles.downloadDeleteButton}}>
                                                    <svg style={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-l-1h-5l-1 1H5v2h14V4z"></path></svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {Object.keys(downloadedAnime).length > 0 && (
                        <div style={styles.modalFooter}>
                            <button onClick={() => setIsConfirmingClear(true)} style={{...styles.modalButton, ...styles.modalButtonDanger}}>مسح الكل</button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationDialog
                isOpen={isConfirmingClear}
                onClose={() => setIsConfirmingClear(false)}
                onConfirm={() => { onClearAll(); setIsConfirmingClear(false); }}
                title="تأكيد المسح"
                message="هل أنت متأكد من رغبتك في حذف جميع الحلقات التي تم تنزيلها؟ لا يمكن التراجع عن هذا الإجراء."
            />
       </>
    );
};

const LoginScreen = ({ onLogin, onSkip }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLoginClick = () => {
        if (!email || !password) {
            setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }
        setLoading(true);
        setError('');
        // Mock API call
        setTimeout(() => {
            onLogin();
        }, 1000);
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginBox}>
                <h1 style={{...styles.logo, fontSize: '3rem'}} className="logo-font">Anmo</h1>
                <h2 style={{...styles.loginTitle, ...styles.logoFont}}>تسجيل الدخول</h2>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    style={styles.modalInput}
                    disabled={loading}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    style={styles.modalInput}
                    disabled={loading}
                />
                <button onClick={handleLoginClick} disabled={loading} style={{...styles.modalButton, width: '100%', marginTop: '10px'}}>
                    {loading ? '...جاري الدخول' : 'تسجيل الدخول'}
                </button>
                <button onClick={onSkip} disabled={loading} style={{...styles.modalButton, ...styles.modalButtonSecondary, width: '100%', marginTop: '8px' }}>
                    تخطي والدخول كضيف
                </button>
            </div>
        </div>
    );
};


const DB_NAME = 'anmo-downloads';
const STORE_NAME = 'episodes';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject("Error opening DB");
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as any).result;
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
    });
};

const dbGet = (db: IDBDatabase, key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error getting data from DB");
    });
};

const dbGetAll = (db: IDBDatabase): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error getting all data from DB");
    });
};

const dbPut = (db: IDBDatabase, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value);
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Error putting data in DB");
    });
};

const dbDelete = (db: IDBDatabase, key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Error deleting data from DB");
    });
};

const dbClear = (db: IDBDatabase): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Error clearing DB");
    });
};


const App = () => {
  const [sources, setSources] = useState<SourceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSourcesModalVisible, setIsSourcesModalVisible] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sourceToEdit, setSourceToEdit] = useState<SourceData | null>(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isDeveloperInfoModalVisible, setIsDeveloperInfoModalVisible] = useState(false);
  const [isDownloadsModalVisible, setIsDownloadsModalVisible] = useState(false);
  const [settings, setSettings] = useState<Settings>({
      theme: 'dark',
      fontSize: 'medium',
  });
  const [downloads, setDownloads] = useState({});
  const [playingDownloadedEpisode, setPlayingDownloadedEpisode] = useState<{url: string, title: string} | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [updatesAvailable, setUpdatesAvailable] = useState<Record<string, SourceData>>({});
  const [sourceToUpdate, setSourceToUpdate] = useState<SourceData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const checkForUpdates = useCallback(async (currentSources: SourceData[]) => {
      const sourcesWithUrls = currentSources.filter(s => s.metadata.url);
      if (sourcesWithUrls.length === 0) return;

      console.log(`Checking for updates on ${sourcesWithUrls.length} sources...`);
      const updates: Record<string, SourceData> = {};
      
      for (const source of sourcesWithUrls) {
          try {
              const response = await fetch(source.metadata.url!, { cache: "no-store" });
              if (!response.ok) continue;
              
              const remoteSource: SourceData = await response.json();

              if (!remoteSource.metadata?.updateDate || !remoteSource.metadata?.sourceName) {
                  continue;
              }
              
              if (new Date(remoteSource.metadata.updateDate) > new Date(source.metadata.updateDate)) {
                  remoteSource.metadata.url = source.metadata.url; // Preserve original URL
                  updates[source.metadata.sourceName] = remoteSource;
              }
          } catch (error) {
              console.error(`Failed to check for updates for ${source.metadata.sourceName}:`, error);
          }
      }

      if (Object.keys(updates).length > 0) {
          console.log("Updates found:", Object.keys(updates));
          setUpdatesAvailable(prev => ({ ...prev, ...updates }));
      }
  }, []);

  // --- DB and Initial Load ---
  useEffect(() => {
    openDB().then(db => {
        dbRef.current = db;
        dbGetAll(db).then(allDownloads => {
            const downloadsMap = {};
            allDownloads.forEach(item => {
                downloadsMap[item.id] = {
                    ...item,
                    status: 'downloaded', // Assume all stored items are downloaded
                };
            });
            setDownloads(downloadsMap);
        });
    });

    try {
        const savedSourcesText = localStorage.getItem('anmo-sources');
        const initialSources = savedSourcesText ? JSON.parse(savedSourcesText) : [sampleData];
        setSources(initialSources);
        
        if (navigator.onLine) {
            checkForUpdates(initialSources);
        }

        const savedSettings = localStorage.getItem('anmo-settings');
        if(savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        
        const loggedInStatus = localStorage.getItem('anmo-loggedIn');
        const isGuest = localStorage.getItem('anmo-isGuest');
        if (loggedInStatus === 'true' || isGuest === 'true') {
            setIsLoggedIn(true);
        }

    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setSources([sampleData]);
    } finally {
        setAppInitialized(true);
    }
  }, [checkForUpdates]);
  
  // --- Online Status Change Handler ---
  useEffect(() => {
    const handleOnline = () => {
        setToastMessage("تم استعادة الاتصال. جارٍ التحقق من التحديثات...");
        checkForUpdates(sources);
        setTimeout(() => setToastMessage(null), 4000);
    };

    window.addEventListener('online', handleOnline);

    return () => {
        window.removeEventListener('online', handleOnline);
    };
  }, [sources, checkForUpdates]);


  useEffect(() => {
      if (!appInitialized) return;
      if (sources.length > 0) {
          localStorage.setItem('anmo-sources', JSON.stringify(sources));
      } else {
          localStorage.removeItem('anmo-sources');
      }
  }, [sources, appInitialized]);

  useEffect(() => {
      localStorage.setItem('anmo-settings', JSON.stringify(settings));
      document.body.className = '';
      document.body.classList.add(`theme-${settings.theme}`);
      document.body.classList.add(`font-size-${settings.fontSize}`);
  }, [settings]);
  
  const handleEnterAsUser = () => {
    setIsLoggedIn(true);
    localStorage.setItem('anmo-loggedIn', 'true');
  };
  
  const handleEnterAsGuest = () => {
    localStorage.setItem('anmo-isGuest', 'true');
    setIsLoggedIn(true);
    setToastMessage("لقد دخلت كضيف. سيتم حفظ جميع بياناتك وإعداداتك محليًا.");
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('anmo-loggedIn');
    localStorage.removeItem('anmo-isGuest');
  };
  
  // --- Download Handlers ---
  const handleDownloadEpisode = async (anime: Anime, episode: Episode) => {
    const key = `${anime.id}-${episode.number}`;
    if (!episode.url || episode.url === '#') {
        alert("لا يمكن تنزيل هذه الحلقة لأن الرابط غير متوفر.");
        return;
    }
    setDownloads(prev => ({ ...prev, [key]: { status: 'downloading', anime, episode } }));
    try {
        const response = await fetch(episode.url);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const blob = await response.blob();
        
        if (dbRef.current) {
            await dbPut(dbRef.current, { id: key, blob, anime, episode });
            setDownloads(prev => ({ ...prev, [key]: { ...prev[key], status: 'downloaded' } }));
        }
    } catch (error) {
        console.error("Download failed:", error);
        alert(`فشل تنزيل الحلقة: ${error.message}`);
        setDownloads(prev => {
            const newDownloads = { ...prev };
            delete newDownloads[key];
            return newDownloads;
        });
    }
  };

  const handlePlayDownloaded = async (animeId, episodeNumber, episodeTitle) => {
      const key = `${animeId}-${episodeNumber}`;
      if (dbRef.current) {
          const storedItem = await dbGet(dbRef.current, key);
          if (storedItem && storedItem.blob) {
              const url = URL.createObjectURL(storedItem.blob);
              setPlayingDownloadedEpisode({ url, title: episodeTitle });
          }
      }
  };

  const handleDeleteDownload = async (animeId, episodeNumber) => {
      const key = `${animeId}-${episodeNumber}`;
      if (dbRef.current) {
          await dbDelete(dbRef.current, key);
          setDownloads(prev => {
              const newDownloads = { ...prev };
              delete newDownloads[key];
              return newDownloads;
          });
      }
  };

  const handleClearAllDownloads = async () => {
      if (dbRef.current) {
          await dbClear(dbRef.current);
          setDownloads({});
      }
  };

  const handleAddSource = (newSource: SourceData) => {
    if (sources.some(s => s.metadata.sourceName === newSource.metadata.sourceName)) {
        alert('يوجد مصدر بنفس الاسم بالفعل.');
        return false;
    }
    const newSources = [...sources, newSource];
    setSources(newSources);
    return true;
  };
  
  const handleSaveSource = (editedSource: SourceData, originalName: string | null) => {
    setSources(prevSources => {
        const sourceExists = prevSources.some(s => s.metadata.sourceName === editedSource.metadata.sourceName && s.metadata.sourceName !== originalName);
        if (sourceExists) {
            alert('يوجد مصدر بنفس الاسم بالفعل.');
            return prevSources;
        }
        
        const newSources = [...prevSources];
        const existingIndex = originalName ? newSources.findIndex(s => s.metadata.sourceName === originalName) : -1;

        if (existingIndex > -1) {
            newSources[existingIndex] = editedSource;
        } else {
            newSources.push(editedSource);
        }
        
        return newSources;
    });
    closeEditor();
  };

    const confirmUpdateSource = () => {
        if (!sourceToUpdate) return;
        
        const newSourceData = updatesAvailable[sourceToUpdate.metadata.sourceName];
        if (!newSourceData) {
            console.error("Update data not found for:", sourceToUpdate.metadata.sourceName);
            setSourceToUpdate(null);
            return;
        }

        setSources(prevSources => 
            prevSources.map(s => 
                s.metadata.sourceName === sourceToUpdate.metadata.sourceName 
                ? newSourceData 
                : s
            )
        );

        setUpdatesAvailable(prev => {
            const newUpdates = { ...prev };
            delete newUpdates[sourceToUpdate.metadata.sourceName];
            return newUpdates;
        });

        setSourceToUpdate(null);
    };

  const handleBulkDelete = (sourceIds: string[]) => {
      if (sources.length <= sourceIds.length) {
          alert('لا يمكنك حذف جميع المصادر.');
          return;
      }
      const newSources = sources.filter(s => !sourceIds.includes(s.metadata.sourceName));
      setSources(newSources);
  };

  const handleMergeSources = (sourceIds: string[], newSourceName: string) => {
      if (sources.some(s => s.metadata.sourceName === newSourceName)) {
          alert("يوجد مصدر بنفس الاسم بالفعل.");
          return;
      }
      
      const sourcesToMerge = sources.filter(s => sourceIds.includes(s.metadata.sourceName));
      const mergedAnimeList: Anime[] = [];
      const animeNames = new Set<string>();

      sourcesToMerge.forEach(source => {
          source.animeList.forEach(anime => {
              if (!animeNames.has(anime.name)) {
                  mergedAnimeList.push(anime);
                  animeNames.add(anime.name);
              }
          });
      });

      const newSource: SourceData = {
          metadata: {
              sourceName: newSourceName,
              version: '1.0',
              author: 'Anmo Merged',
              updateDate: new Date().toISOString().split('T')[0],
          },
          animeList: mergedAnimeList,
      };

      const remainingSources = sources.filter(s => !sourceIds.includes(s.metadata.sourceName));
      setSources([...remainingSources, newSource]);
  };
  
  const handleSelectAnime = (anime: Anime) => {
      setSelectedAnime(anime);
      setIsSearchVisible(false);
      window.scrollTo(0, 0);
  };
  
  const closeEditor = () => {
    setIsEditorOpen(false);
    setSourceToEdit(null);
  };

  const openEditorForEdit = (source: SourceData) => {
    setSourceToEdit(source);
    setIsEditorOpen(true);
    setIsSourcesModalVisible(false);
  };
  
  const openEditorForCreate = () => {
      setSourceToEdit(null);
      setIsEditorOpen(true);
      setIsSourcesModalVisible(false);
  };

  const handleBackFromDetail = () => {
      setSelectedAnime(null);
      setActiveView('home');
  };

  const allAnime = sources.flatMap(s => s.animeList);
  const uniqueAnimeList = Array.from(new Map(allAnime.map(anime => [anime.name, anime])).values());

  const filteredAnime = uniqueAnimeList.filter(anime =>
    anime.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const closeAllModals = () => {
    setIsSearchVisible(false);
    setIsDownloadsModalVisible(false);
    setIsSourcesModalVisible(false);
    setIsSettingsModalVisible(false);
    setIsDeveloperInfoModalVisible(false);
  };

  if (!appInitialized) {
      return <div style={{ ...styles.loginContainer, alignItems: 'center' }}><div style={styles.loader}></div></div>;
  }

  if (!isLoggedIn) {
      return <LoginScreen onLogin={handleEnterAsUser} onSkip={handleEnterAsGuest} />;
  }


  return (
    <div style={{...styles.container, ...(selectedAnime ? styles.containerFullWidth : {})}}>
      <Header />
      <div style={{...styles.searchContainer, ...(isSearchVisible ? styles.searchContainerVisible : {})}}>
          <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onClose={() => {
                  setIsSearchVisible(false);
                  setSearchQuery('');
                  setActiveView('home');
              }}
          />
      </div>
      <main style={styles.main}>
        {selectedAnime ? (
            <AnimeDetail 
                anime={selectedAnime} 
                onBack={handleBackFromDetail}
                downloads={downloads}
                onDownload={handleDownloadEpisode}
                onPlayDownloaded={handlePlayDownloaded}
            />
        ) : (
            <>
                <FilterBar />
                {filteredAnime.length > 0 ? (
                    <div style={styles.grid} className="grid-container">
                        {filteredAnime.map(anime => <AnimeCard key={`${anime.id}-${anime.name}`} anime={anime} onClick={() => handleSelectAnime(anime)} />)}
                    </div>
                ) : (
                    searchQuery ? 
                    <p style={styles.noResults}>لم يتم العثور على نتائج لـ "{searchQuery}"</p> :
                    <p style={styles.noResults}>لم يتم العثور على مصادر، أو أن المصادر فارغة. يرجى إضافة مصدر جديد.</p>
                )}
            </>
        )}
      </main>
      <BottomNavBar 
          activeView={activeView}
          onHomeClick={() => {
              handleBackFromDetail();
              closeAllModals();
          }}
          onSearchClick={() => {
              if (selectedAnime) setSelectedAnime(null);
              setIsSearchVisible(!isSearchVisible);
              setActiveView(isSearchVisible ? 'home' : 'search');
          }}
          onDownloadsClick={() => { setIsDownloadsModalVisible(true); setActiveView('downloads'); }}
          onSourcesClick={() => { setIsSourcesModalVisible(true); setActiveView('sources'); }}
          onSettingsClick={() => { setIsSettingsModalVisible(true); setActiveView('settings'); }}
      />
      <SourcesModal
        isOpen={isSourcesModalVisible}
        onClose={() => { setIsSourcesModalVisible(false); setActiveView('home'); }}
        sources={sources}
        onAdd={handleAddSource}
        onDelete={handleBulkDelete}
        onMerge={handleMergeSources}
        onEdit={openEditorForEdit}
        onCreate={openEditorForCreate}
        updatesAvailable={updatesAvailable}
        onUpdate={setSourceToUpdate}
        onCheckForUpdates={() => checkForUpdates(sources)}
      />
      <SettingsModal
        isOpen={isSettingsModalVisible}
        onClose={() => { setIsSettingsModalVisible(false); setActiveView('home'); }}
        settings={settings}
        onSettingsChange={setSettings}
        onDeveloperInfoClick={() => setIsDeveloperInfoModalVisible(true)}
        onLogout={handleLogout}
      />
      <DeveloperInfoModal
        isOpen={isDeveloperInfoModalVisible}
        onClose={() => setIsDeveloperInfoModalVisible(false)}
      />
      <DownloadsModal
        isOpen={isDownloadsModalVisible}
        onClose={() => { setIsDownloadsModalVisible(false); setActiveView('home'); }}
        downloads={downloads}
        onPlay={handlePlayDownloaded}
        onDelete={handleDeleteDownload}
        onClearAll={handleClearAllDownloads}
      />
      {isEditorOpen && (
          <SourceEditor 
            initialSource={sourceToEdit}
            onSave={handleSaveSource}
            onCancel={closeEditor}
          />
      )}
      {playingDownloadedEpisode && (
          <VideoPlayer 
            episodeUrl={playingDownloadedEpisode.url}
            episodeTitle={playingDownloadedEpisode.title}
            onClose={() => {
                URL.revokeObjectURL(playingDownloadedEpisode.url);
                setPlayingDownloadedEpisode(null);
            }}
          />
      )}
       <ConfirmationDialog
            isOpen={!!sourceToUpdate}
            onClose={() => setSourceToUpdate(null)}
            onConfirm={confirmUpdateSource}
            title="تأكيد التحديث"
            message={`هل أنت متأكد من رغبتك في تحديث المصدر "${sourceToUpdate?.metadata.sourceName}"؟ سيتم استبدال النسخة المحلية.`}
            confirmText="تحديث"
            confirmButtonStyle={{}}
        />
        {toastMessage && (
            <div style={styles.toast} className="toast-anim">
                {toastMessage}
            </div>
        )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '0 24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  containerFullWidth: {
    padding: 0,
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--primary-color)'
  },
  logo: {
    fontSize: '2.2rem',
    color: 'var(--secondary-color)',
    margin: 0,
    fontWeight: '800',
    letterSpacing: '1px'
  },
  logoFont: {
    fontFamily: "'Tajawal', sans-serif",
  },
  headerActions: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
  },
  iconButton: {
      background: 'transparent',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease-in-out',
  },
  icon: {
      width: '24px',
      height: '24px',
      fill: 'var(--text-secondary-color)',
      transition: 'fill 0.2s ease-in-out',
  },
  searchContainer: {
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'max-height 0.4s ease-out, padding 0.4s ease-out',
      padding: '0 24px'
  },
  searchContainerVisible: {
      maxHeight: '100px',
      paddingTop: '20px',
  },
  searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'var(--surface-color)',
      borderRadius: '28px',
      padding: '4px 20px 4px 8px',
      border: '1px solid var(--primary-color)'
  },
  searchInput: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      color: 'var(--text-color)',
      fontSize: '1.1rem',
      padding: '10px 0',
      outline: 'none',
      fontFamily: "'Roboto', sans-serif",
  },
  searchCloseButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary-color)',
      borderRadius: '50%',
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  },
  main: {
    padding: '24px 0 80px 0',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterButton: {
    fontFamily: "'Roboto', sans-serif",
    padding: '8px 16px',
    fontSize: '1em',
    border: '1px solid var(--primary-color)',
    borderRadius: '20px',
    background: 'transparent',
    color: 'var(--text-secondary-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  },
  activeFilter: {
    backgroundColor: 'var(--secondary-color)',
    color: '#ffffff',
    borderColor: 'var(--secondary-color)',
    fontWeight: '700'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    backgroundColor: 'var(--surface-color)',
    aspectRatio: '2 / 3',
    border: '1px solid var(--primary-color)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 10%, rgba(0,0,0,0) 100%)',
    padding: '40px 16px 16px 16px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.1em',
    fontWeight: '700',
    lineHeight: '1.3',
    color: 'var(--text-color)',
  },
  cardInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.85em',
      color: 'var(--text-secondary-color)',
  },
  cardRating: {
    backgroundColor: 'rgba(247, 37, 133, 0.8)',
    padding: '3px 8px',
    borderRadius: '6px',
    color: 'white',
    fontWeight: 'bold',
    backdropFilter: 'blur(5px)',
  },
  cardYear: {
      fontWeight: '500'
  },
  noResults: {
      textAlign: 'center',
      fontSize: '1.2em',
      color: 'var(--text-secondary-color)',
      padding: '40px 0',
  },
  // --- Modal Styles ---
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'var(--surface-color)',
    padding: '24px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid var(--primary-color)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--secondary-color)',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--primary-color)',
  },
  sourceList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sourceListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--background-color)',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    border: '1px solid var(--primary-color)',
  },
  sourceListItemSelected: {
    backgroundColor: 'rgba(247, 37, 133, 0.2)',
    borderColor: 'var(--secondary-color)',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--secondary-color)',
    marginLeft: '12px',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--primary-color)',
  },
  updateAvailableBadge: {
      color: 'var(--secondary-color)',
      fontWeight: 'bold',
      fontSize: '0.9em'
  },
  modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      borderTop: '1px solid var(--primary-color)',
      paddingTop: '16px',
      marginTop: 'auto',
      flexWrap: 'wrap',
  },
  modalButton: {
    fontFamily: "'Roboto', sans-serif",
    padding: '10px 20px',
    fontSize: '1em',
    border: 'none',
    borderRadius: '20px',
    background: 'var(--secondary-color)',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease-in-out'
  },
  modalButtonSecondary: {
    background: 'transparent',
    border: '1px solid var(--primary-color)',
    color: 'var(--text-secondary-color)',
  },
  modalButtonDanger: {
    background: 'rgba(248, 81, 73, 0.1)',
    border: '1px solid var(--danger-color)',
    color: 'var(--danger-color)',
  },
  addSourceForm: {
      padding: '16px',
      border: '1px solid var(--primary-color)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: 'var(--background-color)'
  },
  addSourceTabs: {
      display: 'flex',
      gap: '10px',
  },
   addSourceContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  modalInput: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'var(--background-color)',
      border: '1px solid var(--primary-color)',
      borderRadius: '8px',
      color: 'var(--text-color)',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '1em',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorMessage: {
      color: 'var(--danger-color)',
      backgroundColor: 'rgba(248, 81, 73, 0.1)',
      border: '1px solid var(--danger-color)',
      padding: '10px',
      borderRadius: '8px',
      textAlign: 'center'
  },
  // --- Detail View Styles ---
  detailView: {},
  detailHeaderContainer: {
    position: 'relative',
    height: '40vh',
    minHeight: '300px',
    maxHeight: '450px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detailBannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'blur(12px) brightness(0.4)',
    transform: 'scale(1.1)',
  },
  detailBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, var(--background-color) 10%, rgba(0,0,0,0.3) 100%)',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 10,
    background: 'rgba(22, 27, 34, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    backdropFilter: 'blur(5px)',
    transition: 'background-color 0.2s',
  },
  detailContent: {
    padding: '0 24px 24px 24px',
    maxWidth: '1200px',
    margin: '-150px auto 0 auto',
    position: 'relative',
    zIndex: 2,
  },
  detailPrimaryInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: '24px',
  },
  detailPosterImage: {
    width: '220px',
    height: '330px',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    border: '2px solid var(--surface-color)',
    flexShrink: 0,
  },
  detailMetaContainer: {
    flex: 1,
    paddingBottom: '12px',
  },
  detailTitle: {
    fontSize: '3.2em',
    fontWeight: 800,
    color: 'var(--text-color)',
    margin: '0 0 16px 0',
    lineHeight: 1.1,
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
  },
  detailMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    alignItems: 'center',
    color: 'var(--text-secondary-color)',
    marginBottom: '16px',
  },
  detailMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--surface-color)',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '0.9em',
    border: '1px solid var(--primary-color)',
  },
  genreContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  genreTag: {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--text-secondary-color)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.9em',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  detailSection: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '1.8em',
    fontWeight: 700,
    color: 'var(--secondary-color)',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid var(--primary-color)',
    display: 'inline-block',
  },
  detailDescription: {
    fontSize: '1.1em',
    lineHeight: 1.8,
    color: 'var(--text-secondary-color)',
  },
  episodeList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  episodeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: '12px',
    transition: 'background-color 0.2s, transform 0.2s',
    border: '1px solid var(--primary-color)',
  },
  episodeNumber: {
    fontSize: '1.2em',
    color: 'var(--secondary-color)',
    fontWeight: '700',
    width: '40px',
    textAlign: 'center',
    flexShrink: 0,
  },
  episodeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  episodeTitle: {
    fontSize: '1.1em',
    fontWeight: 500,
    color: 'var(--text-color)',
  },
  episodeDate: {
    fontSize: '0.8em',
    color: 'var(--text-secondary-color)',
  },
  // --- Video Player Styles ---
    videoPlayerBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        animation: 'fadeIn 0.3s ease',
    },
    videoPlayerContent: {
        backgroundColor: 'var(--background-color)',
        width: '90%',
        maxWidth: '1200px',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
    },
    videoPlayerHeader: {
        padding: '8px 16px',
        backgroundColor: 'var(--surface-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
    },
    videoPlayerTitle: {
        color: 'var(--text-color)',
        margin: 0,
        fontSize: '1.1em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    videoContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        backgroundColor: '#000',
    },
    videoElement: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
    },
    playerPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--text-secondary-color)',
        fontSize: '1.2rem',
    },
    // --- Source Editor Styles ---
    editorBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.3s ease',
    },
    editorContent: {
        width: '95%',
        height: '90%',
        maxWidth: '1200px',
        backgroundColor: 'var(--background-color)',
        borderRadius: '12px',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 10px 50px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    editorHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--surface-color)',
        flexShrink: 0,
        borderBottom: '1px solid var(--primary-color)',
    },
    editorMeta: {
        display: 'flex',
        gap: '16px',
        padding: '16px 24px',
        borderBottom: '1px solid var(--primary-color)',
    },
    editorAnimeList: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    editorAccordion: {
        border: '1px solid var(--primary-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--surface-color)',
    },
    editorAccordionSummary: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1.1em',
    },
    editorForm: {
        padding: '16px',
        borderTop: '1px solid var(--primary-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    editorGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px',
    },
    editorSubHeader: {
        color: 'var(--secondary-color)',
        margin: '8px 0',
        borderBottom: '1px solid var(--primary-color)',
        paddingBottom: '8px'
    },
    episodeEditorItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    editorDeleteButton: {
        background: 'transparent',
        border: '1px solid var(--primary-color)',
        color: 'var(--text-secondary-color)',
        padding: '6px 12px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    // --- Settings Modal ---
    settingsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    settingsSectionTitle: {
        margin: 0,
        fontSize: '1.2em',
        color: 'var(--text-secondary-color)',
        fontWeight: 500,
    },
    settingsSectionContent: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    // --- Developer Info Modal ---
    developerInfoContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontSize: '1.1em',
    },
    developerInfoItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: 'var(--background-color)',
        borderRadius: '8px',
    },
    developerInfoLabel: {
        fontWeight: 'bold',
        color: 'var(--secondary-color)',
    },
    // --- Downloads ---
    downloadButton: {
        position: 'relative',
        width: '40px',
        height: '40px',
    },
    loader: {
        border: '3px solid var(--primary-color)',
        borderTop: '3px solid var(--secondary-color)',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        animation: 'spin 1s linear infinite',
    },
    downloadedList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    downloadedAnimeSection: {

    },
    downloadedAnimeTitle: {
        margin: '0 0 12px 0',
        color: 'var(--secondary-color)',
        borderBottom: '1px solid var(--primary-color)',
        paddingBottom: '8px',
    },
    downloadDeleteButton: {
        color: 'var(--text-secondary-color)'
    },
    // --- Bottom Nav ---
    bottomNav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65px',
        backgroundColor: 'var(--surface-color)',
        borderTop: '1px solid var(--primary-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 900,
        boxShadow: '0 -5px 20px rgba(0,0,0,0.3)',
    },
    bottomNavButton: {
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
        cursor: 'pointer',
        transition: 'color 0.2s ease-in-out',
        padding: '8px 0',
        gap: '4px',
    },
    bottomNavButtonActive: {
        color: 'var(--secondary-color)',
    },
    iconContainer: {
      width: '28px',
      height: '28px',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    bottomNavIconActiveContainer: {
        // Future styling for active icon container
    },
    bottomNavLabel: {
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    // --- Login Screen ---
    loginContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(160deg, var(--background-color) 0%, #111b33 100%)',
    },
    loginBox: {
        backgroundColor: 'var(--surface-color)',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        width: '90%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center',
    },
    loginTitle: {
        color: 'var(--text-color)',
        margin: '0 0 8px 0',
    },
    // --- Toast ---
    toast: {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--secondary-color)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '24px',
      zIndex: 1500,
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      fontWeight: 'bold',
    },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes toast-in-out {
    0% { transform: translate(-50%, 100px); opacity: 0; }
    15% { transform: translate(-50%, 0); opacity: 1; }
    85% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, 100px); opacity: 0; }
  }
  .toast-anim { animation: toast-in-out 5s ease-in-out forwards; }
  
  .grid-container .card {
    animation: slideInUp 0.5s ease-out backwards;
  }
  .grid-container .card:nth-child(1) { animation-delay: 0.05s; }
  .grid-container .card:nth-child(2) { animation-delay: 0.1s; }
  .grid-container .card:nth-child(3) { animation-delay: 0.15s; }
  .grid-container .card:nth-child(4) { animation-delay: 0.2s; }
  .grid-container .card:nth-child(5) { animation-delay: 0.25s; }

  .modal-backdrop { animation: fadeIn 0.3s ease; }
  .modal-content { animation: slideInUp 0.4s ease; }
  .detailView { animation: fadeIn 0.4s ease-in-out; }

  .iconButton:hover { background-color: var(--primary-color); }
  .iconButton:hover .icon { fill: var(--secondary-color); }
  .iconButton:disabled { cursor: not-allowed; opacity: 0.5; }
  .iconButton:disabled .icon { fill: var(--primary-color); }
  .iconButton[disabled] svg { fill: var(--success-color) !important; }

  .searchCloseButton:hover {
      background-color: var(--primary-color);
      color: var(--secondary-color);
  }
  .filterButton:hover {
    background-color: var(--primary-color);
    color: var(--text-color);
  }
  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(247, 37, 133, 0.2), 0 0 40px rgba(247, 37, 133, 0.1);
    border-color: rgba(247, 37, 133, 0.5);
  }
  .card:hover .cardImage { transform: scale(1.05); }

  .modalButton:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(247, 37, 133, 0.3);
  }
  .modalButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .modalButtonSecondary:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: var(--text-color);
  }
   .modalButtonDanger:hover:not(:disabled) {
      background-color: var(--danger-color);
      color: white;
  }
  input:focus, textarea:focus {
      outline: none;
      border-color: var(--secondary-color);
      box-shadow: 0 0 0 3px rgba(247, 37, 133, 0.3);
  }
  .backButton:hover {
    background-color: var(--secondary-color);
  }
  .episodeItem:hover {
      background-color: var(--primary-color);
      transform: translateX(-4px);
  }
  .genreTag:hover {
      background-color: var(--secondary-color);
      color: white;
  }
  .editorAccordionSummary::marker { color: var(--secondary-color); }
  .editorDeleteButton:hover {
      background-color: rgba(248, 81, 73, 0.1);
      color: var(--danger-color);
      border-color: var(--danger-color);
  }
  .downloadDeleteButton:hover .icon { fill: var(--danger-color); }

  @media (max-width: 768px) {
    .detailPrimaryInfo {
        flex-direction: column !important;
        align-items: center !important;
        text-align: center;
    }
    .detailPosterImage {
        width: 180px !important;
        height: 270px !important;
        margin-top: -80px; /* Pull it up a bit */
    }
    .detailTitle {
        font-size: 2.2em !important;
    }
    .detailMetaContainer { width: 100%; }
    .genreContainer { justify-content: center; }
    .detailContent {
        margin-top: -40px !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
    }
    .container { padding: 0 16px; }
    .grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
        gap: 16px !important;
    }
  }
`;
document.head.appendChild(styleSheet);


const root = createRoot(document.getElementById('root'));
root.render(<App />);