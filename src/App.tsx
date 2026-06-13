import { useState, useEffect } from 'react';
import { Type, Star, Copy, Check, Search, Download } from 'lucide-react';

const GOOGLE_FONTS = [
  'Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Raleway','Nunito',
  'Source Sans 3','Ubuntu','Playfair Display','Merriweather','Lora','PT Serif',
  'Crimson Text','EB Garamond','Cormorant Garamond','Libre Baskerville',
  'Oswald','Bebas Neue','Anton','Black Han Sans','Kanit','Saira',
  'Fira Code','JetBrains Mono','Source Code Pro','IBM Plex Mono','Space Mono',
  'Dancing Script','Pacifico','Lobster','Sacramento','Great Vibes','Satisfy',
  'Righteous','Fredoka One','Baloo 2','Comfortaa','Quicksand','Nunito Sans',
  'Work Sans','DM Sans','Outfit','Syne','Space Grotesk','Plus Jakarta Sans',
];

const CATEGORIES = ['All','Sans-Serif','Serif','Monospace','Display','Handwriting'];

const getCat = (font:string):string => {
  if (['Fira Code','JetBrains Mono','Source Code Pro','IBM Plex Mono','Space Mono'].includes(font)) return 'Monospace';
  if (['Dancing Script','Pacifico','Lobster','Sacramento','Great Vibes','Satisfy'].includes(font)) return 'Handwriting';
  if (['Oswald','Bebas Neue','Anton','Black Han Sans','Righteous','Fredoka One'].includes(font)) return 'Display';
  if (['Playfair Display','Merriweather','Lora','PT Serif','Crimson Text','EB Garamond','Cormorant Garamond','Libre Baskerville'].includes(font)) return 'Serif';
  return 'Sans-Serif';
};

const SAVE = 'fe_favorites_v1';
const loadFavs = ():string[] => { try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return[]} };

export default function App() {
  const [previewText, setPreview] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize,    setFontSize]= useState(24);
  const [favorites,   setFavs]    = useState<string[]>(loadFavs);
  const [search,      setSearch]  = useState('');
  const [category,    setCategory]= useState('All');
  const [tab,         setTab]     = useState<'explore'|'favorites'>('explore');
  const [copied,      setCopied]  = useState('');
  const [loadedFonts, setLoaded]  = useState<Set<string>>(new Set());

  const filtered = GOOGLE_FONTS.filter(f => {
    const ms = !search || f.toLowerCase().includes(search.toLowerCase());
    const mc = category==='All' || getCat(f)===category;
    const mf = tab==='explore' || favorites.includes(f);
    return ms && mc && mf;
  });

  const loadFont = (font:string) => {
    if (loadedFonts.has(font)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + font.replace(/ /g,'+') + ':wght@400;700&display=swap';
    document.head.appendChild(link);
    setLoaded(prev => new Set([...prev, font]));
  };

  const toggleFav = (font:string) => {
    const updated = favorites.includes(font) ? favorites.filter(f=>f!==font) : [...favorites, font];
    setFavs(updated);
    localStorage.setItem(SAVE, JSON.stringify(updated));
  };

  const copyCSS = (font:string) => {
    const parts = ['@import url("https://fonts.googleapis.com/css2?family=' + font.replace(/ /g, '+') + ':wght@400;700&display=swap")', 'font-family: "' + font + '", sans-serif;'];
    const css = parts.join('\n\n');    navigator.clipboard.writeText(css);
    setCopied(font);
    setTimeout(()=>setCopied(''),2000);
  };

  const exportFavs = () => {
    if (!favorites.length) return;
    const importLines = favorites.map(f => {
      const family = f.replace(/ /g, '+');
      return '@import url("https://fonts.googleapis.com/css2?family=' + family + ':wght@400;700&display=swap");';
    });
    const fontLines = favorites.map(f => '/* ' + f + ' */\nfont-family: "' + f + '", sans-serif;');
    const css = importLines.join('\n') + '\n\n/* Font stack */\n' + fontLines.join('\n\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([css],{type:'text/css'})); a.download = 'my-fonts.css'; a.click();
  };

  return (
    <div style={{minHeight:'100vh',background:'#080808',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #1e0a3c',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #8b5cf630'}}><Type size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>FontExplorer Local</div>
          <div style={{fontSize:'11px',color:'#4a1d96',marginTop:'2px'}}>{favorites.length} favorites · {GOOGLE_FONTS.length} fonts</div></div>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          <button onClick={exportFavs} disabled={!favorites.length} style={{padding:'7px',borderRadius:'7px',background:'none',border:'none',cursor:favorites.length?'pointer':'not-allowed',color:favorites.length?'#4a1d96':'#2d1660',opacity:favorites.length?1:0.4}}><Download size={15}/></button>
          {(['explore','favorites'] as const).map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'6px 12px',borderRadius:'7px',background:tab===t?'#8b5cf620':'none',border:`1px solid ${tab===t?'#8b5cf6':'transparent'}`,color:tab===t?'#c4b5fd':'#4a1d96',fontSize:'12px',cursor:'pointer',fontFamily:'Inter',textTransform:'capitalize'}}>{t}{t==='favorites'?` (${favorites.length})`:''}</button>)}
        </div>
      </header>

      {/* Controls */}
      <div style={{padding:'12px 20px',borderBottom:'1px solid #1e0a3c',display:'flex',flexDirection:'column',gap:'10px'}}>
        <div style={{position:'relative'}}>
          <Search size={13} style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',color:'#4a1d96'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search fonts…"
            style={{width:'100%',background:'#100818',border:'1px solid #1e0a3c',borderRadius:'10px',padding:'9px 12px 9px 34px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter'}}
            onFocus={e=>e.target.style.borderColor='#8b5cf6'} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
        </div>
        <textarea value={previewText} onChange={e=>setPreview(e.target.value)} rows={2}
          style={{width:'100%',background:'#100818',border:'1px solid #1e0a3c',borderRadius:'10px',padding:'9px 12px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter',resize:'none',lineHeight:'1.5'}}
          onFocus={e=>e.target.style.borderColor='#8b5cf6'} onBlur={e=>e.target.style.borderColor='#1e0a3c'}/>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <input type="range" min={12} max={60} value={fontSize} onChange={e=>setFontSize(+e.target.value)} style={{flex:1,accentColor:'#8b5cf6'}}/>
          <span style={{fontSize:'12px',color:'#4a1d96',minWidth:'30px'}}>{fontSize}px</span>
          <div style={{display:'flex',gap:'4px',overflowX:'auto'}}>
            {CATEGORIES.map(c=><button key={c} onClick={()=>setCategory(c)} style={{flexShrink:0,padding:'3px 10px',borderRadius:'20px',border:`1px solid ${category===c?'#8b5cf6':'#1e0a3c'}`,background:category===c?'#8b5cf615':'transparent',color:category===c?'#c4b5fd':'#4a1d96',fontSize:'11px',cursor:'pointer',fontFamily:'Inter',whiteSpace:'nowrap'}}>{c}</button>)}
          </div>
        </div>
      </div>

      <div style={{flex:1,overflow:'auto',padding:'12px 20px',display:'flex',flexDirection:'column',gap:'8px'}}>
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>🔤</div>
            <p style={{color:'#4a1d96',fontSize:'14px'}}>{tab==='favorites'?'No favorites yet. Star fonts to save them.':'No fonts match your search.'}</p>
          </div>
        ):filtered.map(font=>{
          loadFont(font);
          return <div key={font} style={{background:'#100818',border:'1px solid #1e0a3c',borderRadius:'12px',padding:'16px',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='#8b5cf630'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e0a3c'}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
              <div>
                <span style={{fontSize:'13px',fontWeight:'600',color:'white'}}>{font}</span>
                <span style={{fontSize:'10px',color:'#4a1d96',marginLeft:'8px',background:'#1e0a3c',padding:'2px 7px',borderRadius:'4px'}}>{getCat(font)}</span>
              </div>
              <div style={{display:'flex',gap:'4px'}}>
                <button onClick={()=>copyCSS(font)} title="Copy CSS"
                  style={{padding:'5px',borderRadius:'6px',background:copied===font?'#10b98115':'none',border:'none',cursor:'pointer',color:copied===font?'#34d399':'#4a1d96',transition:'all 0.2s'}}>
                  {copied===font?<Check size={13}/>:<Copy size={13}/>}
                </button>
                <button onClick={()=>toggleFav(font)}
                  style={{padding:'5px',borderRadius:'6px',background:favorites.includes(font)?'#f59e0b15':'none',border:'none',cursor:'pointer',color:favorites.includes(font)?'#fcd34d':'#4a1d96'}}>
                  <Star size={13} fill={favorites.includes(font)?'#f59e0b':'none'}/>
                </button>
              </div>
            </div>
            <div style={{fontSize:fontSize+'px',color:'#e2e8f0',lineHeight:'1.4',fontFamily:'"'+font+'", sans-serif',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {previewText || 'Type something above…'}
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}
