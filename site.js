async function loadImages() {
  const res = await fetch('images.json');
  return await res.json();
}

function uniq(arr){ return [...new Set(arr)].sort(); }

function buildCard(img){
  const card = document.createElement('div');
  card.className = 'card';

  const image = document.createElement('img');
  image.className = 'thumb';
  image.src = img.file;
  image.alt = img.title;

  image.addEventListener('click', () => openLightbox(img));

  const body = document.createElement('div');
  body.className = 'card-body';

  const h = document.createElement('div');
  h.style.fontWeight = '700';
  h.textContent = img.title;

  const s = document.createElement('div');
  s.className = 'small';
  s.textContent = `${img.location} • ${img.season} • ${img.category} • ${img.orientation}`;

  const tags = document.createElement('div');
  tags.className = 'tagrow';
  (img.keywords || []).slice(0,4).forEach(k => {
    const t = document.createElement('span');
    t.className = 'tag';
    t.textContent = k;
    tags.appendChild(t);
  });

  body.appendChild(h);
  body.appendChild(s);
  body.appendChild(tags);

  card.appendChild(image);
  card.appendChild(body);
  return card;
}

function openLightbox(img){
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbimg');
  const lbMeta = document.getElementById('lbmeta');

  lbImg.src = img.file;
  lbImg.alt = img.title;
  lbMeta.textContent = `${img.title} — ${img.location} • ${img.season} • ${img.category}`;

  lb.classList.add('open');
}

function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
}

function activeNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.links a').forEach(a=>{
    if(a.getAttribute('href') === path) a.classList.add('active');
  });
}

async function initGallery(){
  activeNav();

  const data = await loadImages();

  const grid = document.getElementById('grid');
  const q = document.getElementById('q');
  const loc = document.getElementById('loc');
  const season = document.getElementById('season');
  const cat = document.getElementById('cat');

  if(!grid) return;

  const locations = ['All', ...uniq(data.map(d=>d.location))];
  const seasons = ['All', ...uniq(data.map(d=>d.season))];
  const cats = ['All', ...uniq(data.map(d=>d.category))];

  for(const v of locations){ loc.appendChild(new Option(v,v)); }
  for(const v of seasons){ season.appendChild(new Option(v,v)); }
  for(const v of cats){ cat.appendChild(new Option(v,v)); }

  function matches(d){
    const text = (q.value || '').toLowerCase().trim();
    const inText = !text || (
      d.title.toLowerCase().includes(text) ||
      (d.keywords||[]).some(k=>k.toLowerCase().includes(text)) ||
      d.location.toLowerCase().includes(text) ||
      d.category.toLowerCase().includes(text)
    );

    const inLoc = loc.value === 'All' || d.location === loc.value;
    const inSeason = season.value === 'All' || d.season === season.value;
    const inCat = cat.value === 'All' || d.category === cat.value;
    return inText && inLoc && inSeason && inCat;
  }

  function render(){
    grid.innerHTML = '';
    data.filter(matches).forEach(d => grid.appendChild(buildCard(d)));
    document.getElementById('count').textContent = `${data.filter(matches).length} images`;
  }

  [q,loc,season,cat].forEach(el => el.addEventListener('input', render));
  render();

  // Lightbox close handlers
  const lb = document.getElementById('lightbox');
  lb.addEventListener('click', (e)=>{ if(e.target.id === 'lightbox') closeLightbox(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
}

document.addEventListener('DOMContentLoaded', initGallery);
