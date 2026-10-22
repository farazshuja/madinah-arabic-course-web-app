'use strict';
(() => {
 const root=new URL('.',document.currentScript.src);
 const nav=document.createElement('nav');nav.className='site-tabs';nav.setAttribute('aria-label','Main sections');
 const brand=document.createElement('a');brand.className='site-name';brand.href=root.href;brand.textContent='Madinah Arabic';nav.appendChild(brand);
 const tabs=[['motion','Motion graphics','./'],['reader','Read the book','reader.html'],['tree','Topic tree','concept-paths/?view=tree'],['path','Learning Path','concept-paths/?view=path'],['review','Recall practice','concept-paths/?view=review']];
 const links=new Map();
 tabs.forEach(([id,label,path])=>{const a=document.createElement('a');a.href=new URL(path,root).href;a.textContent=label;links.set(id,a);nav.appendChild(a);});
 const isConcepts=location.pathname===new URL('concept-paths/',root).pathname||location.pathname===new URL('concept-paths/index.html',root).pathname;
 function select(view){const id=isConcepts?(view||new URLSearchParams(location.search).get('view')||'tree'):location.pathname.endsWith('/reader.html')?'reader':'motion';links.forEach((a,key)=>{if(key===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
 document.body.prepend(nav);select();document.addEventListener('learning-view',e=>select(e.detail));
})();
