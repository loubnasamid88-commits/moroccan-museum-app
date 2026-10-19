import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] })
L.Marker.prototype.options.icon = DefaultIcon


const halls = [
 {
 id: 'batailles', title: 'Galerie des Batailles', emoji: '',
 desc: `La Bataille de Dcheira (13 Janvier 1958) est le symbole de la volonté inébranlable du peuple marocain. Les membres de l'Armée de Libération du Sud ont fait face à une armée moderne avec un courage exemplaire pour parachever l'unité territoriale.`,
 color: 'border-red-900/40', accent: '#8B1A1A',
 images: ["/images/dcheira/ph1.jpeg","/images/dcheira/ph2.jpeg","/images/dcheira/ph3.jpeg","/images/dcheira/ph4.jpeg","/images/dcheira/ph5.jpeg","/images/dcheira/ph6.jpeg","/images/dcheira/ph7.jpeg","/images/dcheira/ph8.jpeg","/images/dcheira/ph9.jpeg","/images/dcheira/ph10.jpeg","/images/dcheira/ph11.jpeg","/images/dcheira/ph12.jpeg","/images/dcheira/ph13.jpeg"],
 },
 {
 id: 'royale', title: "Galerie M'Hamid El Ghizlane", emoji: '',
 desc: `Le 25 février 1958, Feu S.M. Mohammed V a prononcé un discours historique à M'Hamid El Ghizlane. Cet acte solennel a réaffirmé la marocanité du Sahara et scellé l'union nationale.`,
 color: 'border-green-900/40', accent: '#1A3D2B',
 images: ["/images/mhamid_elghizlane/1.jpeg","/images/mhamid_elghizlane/2.jpeg","/images/mhamid_elghizlane/3.jpeg","/images/mhamid_elghizlane/4.jpeg","/images/mhamid_elghizlane/5.jpeg","/images/mhamid_elghizlane/6.jpeg","/images/mhamid_elghizlane/7.jpeg","/images/mhamid_elghizlane/8.jpeg","/images/mhamid_elghizlane/9.jpeg","/images/mhamid_elghizlane/10.jpeg","/images/mhamid_elghizlane/11.jpeg","/images/mhamid_elghizlane/12.jpeg","/images/mhamid_elghizlane/13.jpeg","/images/mhamid_elghizlane/14.jpeg","/images/mhamid_elghizlane/15.jpeg","/images/mhamid_elghizlane/16.jpeg"]
 },
 {
 id: 'patrimoine', title: 'Galerie du Patrimoine', emoji: '',
 desc: `Bienvenue dans l'écrin de la culture Hassani. Artisanat (bijoux ciselés, cuir de Smara), Culture Nomade (cérémonie du thé, poésie Hassani) et Architecture (Ksours et mosquées en terre cuite).`,
 color: 'border-amber-900/40', accent: '#C4A96B',
 images: Array.from({ length: 24 }, (_, i) => `/images/patrimoine/${i + 1}.jpeg`),
 },
 {
 id: 'archives', title: 'Archives Vivantes', emoji: '',
 desc: `Plongez dans l'histoire audiovisuelle de l'unité nationale. Documents d'exception, témoignages poignants et preuves historiques de la détermination du Trône et du Peuple.`,
 color: 'border-blue-900/40', accent: '#1a1c24',
 content: [
 { type: 'video', url: 'https://youtu.be/h5OisBeWtZw', title: "Discours M'hamid El Ghizlane" },
 { type: 'video', url: 'https://youtu.be/Ju6GmU5BmT4', title: "Éleveurs de dromadaires" },
 { type: 'video', url: 'https://youtu.be/v5JvoJJmRTE', title: "Visite historique Mohammed V" },
 { type: 'video', url: 'https://youtu.be/wjRW9EcT7Vk', title: "Armée de libération Sud" },
 { type: 'audio', url: '/audio/archives/2.mpeg', title: 'Bataille de Dcheira 1958' },
 { type: 'image', url: '/images/archives/1.jpeg', title: "Communications Armée Libération" },
 { type: 'image', url: '/images/archives/2.jpeg', title: 'Journal Sada Oran (2)' },
 { type: 'image', url: '/images/archives/3.jpeg', title: 'Journal Sada Oran (1)' },
 { type: 'video_locale', url: '/videos/archives/1.mp4', title: "L'héroïsme de Dcheira", credit: 'Mafaateeh Tarikhiya' }
 ]
 }
]

const quizData = [
 { id:1, category:' Dcheira', question:'En quelle date exacte a eu lieu la Bataille de Dcheira ?', answers:['13 janvier 1958','25 février 1958','7 mars 1956'], correct:0 },
 { id:2, category:' Dcheira', question:'Quel groupe armé a mené la Bataille de Dcheira ?', answers:["Forces Royales Armées","Armée de Libération du Sud","Garde Nationale"], correct:1 },
 { id:3, category:' Dcheira', question:"Quel était l'objectif de la Bataille de Dcheira ?", answers:["Libérer Casablanca","Parachever l'unité territoriale","Conquérir l'Algérie"], correct:1 },
 { id:4, category:' Dcheira', question:'Contre quelle puissance les résistants ont-ils combattu ?', answers:["Forces espagnoles et françaises","Forces britanniques","Forces italiennes"], correct:0 },
 { id:5, category:" Mohammed V", question:"En quelle date Mohammed V a prononcé son discours à M'Hamid El Ghizlane ?", answers:['13 janvier 1958','25 février 1958','18 novembre 1955'], correct:1 },
 { id:6, category:" Mohammed V", question:"Que symbolise ce discours historique ?", answers:["La marocanité du Sahara et l'unité nationale","L'indépendance du Maroc","La création de l'armée royale"], correct:0 },
 { id:7, category:" Mohammed V", question:"Qui entourait Mohammed V lors de ce discours ?", answers:["Les diplomates étrangers","Les tribus du Sud marocain","Les ministres"], correct:1 },
 { id:8, category:" Mohammed V", question:"Que signifie M'Hamid El Ghizlane ?", answers:["La plaine des gazelles","La montagne des lions","La vallée des palmiers"], correct:0 },
 { id:9, category:' Culture Hassani', question:'Quelle langue parle-t-on dans la culture Hassani ?', answers:['Le Tamazight','Le Hassaniya','Le Darija'], correct:1 },
 { id:10, category:' Culture Hassani', question:'Comment appelle-t-on la cérémonie du thé Hassani ?', answers:['Atay','Cérémonie des trois verres','Thé à la menthe'], correct:1 },
 { id:11, category:' Culture Hassani', question:'Quel instrument est emblématique de la musique Hassani ?', answers:['Le guembri',"L'ardine",'Le oud'], correct:1 },
 { id:12, category:' Culture Hassani', question:'Comment appelle-t-on les tentes nomades sahariennes ?', answers:['Les Ksours','Les Haimas','Les Riads'], correct:1 },
 { id:13, category:' Provinces du Sud', question:'En quelle année le dernier soldat étranger a quitté le Sahara ?', answers:['1975','1976','1979'], correct:1 },
 { id:14, category:' Provinces du Sud', question:"Quelle est la capitale des provinces du Sud marocain ?", answers:['Dakhla','Laâyoune','Smara'], correct:1 },
 { id:15, category:' Provinces du Sud', question:"Comment s'appelle la marche pacifique de Hassan II en 1975 ?", answers:['La Marche Verte','La Marche Nationale','La Marche du Désert'], correct:0 },
]

const RAWI_SYSTEM = `Tu es "Rawi" (راوي), guide historique virtuel du Musée Numérique du Maroc. Spécialisé dans la Bataille de Dcheira (1958), Mohammed V à M'Hamid El Ghizlane, l'Armée de Libération du Sud, la culture Hassani et les provinces du Sud. Réponds en français (ou arabe/darija). Sois précis, passionné. Réponses concises 3-5 phrases.`

const RAWI_SUGGESTIONS = [
 "Qu'est-ce que la Bataille de Dcheira ?",
 "Pourquoi le discours de M'Hamid est-il important ?",
 "Qui était l'Armée de Libération du Sud ?",
 "Qu'est-ce que la culture Hassani ?",
]

// 
// STATCARD
// 

function StatCard({ title, value, subtitle, icon }) {
 return (
 <div className="stat-card">
 <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
 <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--dark)', fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
 <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', marginTop: 2, letterSpacing: '0.05em' }}>{title}</div>
 <div style={{ fontSize: 9, color: 'var(--text-soft)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{subtitle}</div>
 </div>
 )
}

// 
// GALERIE PHOTOS + LIGHTBOX
// 

function GaleriePhotos({ images, content }) {
 const [lightboxOpen, setLightboxOpen] = useState(false)
 const [currentIdx, setCurrentIdx] = useState(0)
 const [selectedDoc, setSelectedDoc] = useState(null)
 const allImages = images || []
 const total = allImages.length

 const openLightbox = (idx) => { setCurrentIdx(idx); setLightboxOpen(true) }
 const closeLightbox = () => setLightboxOpen(false)
 const prev = () => setCurrentIdx(i => (i - 1 + total) % total)
 const next = () => setCurrentIdx(i => (i + 1) % total)

 useEffect(() => {
 if (!lightboxOpen) return
 const handler = (e) => {
 if (e.key === 'ArrowLeft') prev()
 if (e.key === 'ArrowRight') next()
 if (e.key === 'Escape') closeLightbox()
 }
 window.addEventListener('keydown', handler)
 return () => window.removeEventListener('keydown', handler)
 }, [lightboxOpen, total])

 return (
 <>
 {/* MINIATURES 3 colonnes */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 2 }}>
 {allImages.map((img, i) => (
 <div key={i} onClick={() => openLightbox(i)} style={{
 aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
 border: '1px solid rgba(212,160,23,0.15)', cursor: 'pointer',
 background: '#111', transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
 }}
 onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.borderColor = 'rgba(212,160,23,0.6)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,160,23,0.25)' }}
 onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(212,160,23,0.15)'; e.currentTarget.style.boxShadow = 'none' }}
 >
 <img src={img} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
 </div>
 ))}

 {/* Archives — liste compacte avec thumbnail */}
 {content && content.length > 0 && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
 {content.map((item, i) => {
 const isVideo = item.type === 'video' || item.type === 'video_locale'
 const isAudio = item.type === 'audio'
 const getYtId = (url) => {
 if (!url) return null
 const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
 if (shortMatch) return shortMatch[1]
 const longMatch = url.match(/[?&]v=([^&]+)/)
 if (longMatch) return longMatch[1]
 return null
 }
 const ytId = getYtId(item.url)
 const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null
 const typeColor = isVideo ? '#ef4444' : isAudio ? '#a78bfa' : '#60a5fa'
 const typeIcon = isVideo ? '' : isAudio ? '' : ''
 const typeBg = isVideo ? 'rgba(239,68,68,0.2)' : isAudio ? 'rgba(167,139,250,0.2)' : 'rgba(96,165,250,0.2)'
 return (
 <div key={i}
 onClick={() => setSelectedDoc(item)}
 style={{
 display: 'flex', alignItems: 'center', gap: 10,
 background: 'rgba(13,21,32,0.8)', border: '1px solid rgba(212,160,23,0.12)',
 borderRadius: 12, padding: '8px 10px', cursor: 'pointer',
 transition: 'all 0.2s'
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)'; e.currentTarget.style.background = 'rgba(212,160,23,0.07)'; e.currentTarget.style.transform = 'translateX(3px)' }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.12)'; e.currentTarget.style.background = 'rgba(13,21,32,0.8)'; e.currentTarget.style.transform = 'translateX(0)' }}
 >
 {/* Thumbnail ou icône */}
 <div style={{ width: 52, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#111' }}>
 {ytThumb
 ? <img src={ytThumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: isAudio ? 'linear-gradient(135deg,#1e1b4b,#4c1d95)' : 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
 {isAudio ? '' : ''}
 </div>
 }
 {isVideo && (
 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', paddingLeft: 1 }}></div>
 </div>
 )}
 </div>

 {/* Texte */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontSize: 10, fontWeight: 700, color: '#E8D5A3', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
 {item.credit && <div style={{ fontSize: 8, color: 'rgba(212,160,23,0.4)', marginTop: 2 }}>{item.credit}</div>}
 </div>

 {/* Badge type */}
 <div style={{ background: typeBg, border: `1px solid ${typeColor}50`, borderRadius: 6, padding: '2px 7px', fontSize: 9, fontWeight: 700, color: typeColor, flexShrink: 0 }}>{typeIcon}</div>
 </div>
 )
 })}
 </div>
 )}
 </div>

 {total > 0 && (
 <div style={{ fontSize: 9, color: 'rgba(212,160,23,0.4)', marginBottom: 8, textAlign: 'center', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
 {total} photos — cliquer pour agrandir 
 </div>
 )}

 {/* LIGHTBOX */}
 {lightboxOpen && (
 <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(250,248,243,0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}
 onClick={closeLightbox}>

 {/* Header */}
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,0.8), transparent)', zIndex: 10 }}
 onClick={e => e.stopPropagation()}>
 <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--gold-dark)', letterSpacing: '0.1em' }}>
 Photo {currentIdx + 1} / {total}
 </div>
 <button onClick={closeLightbox} style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', color: 'var(--dark)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>

 {/* Image + flèches */}
 <div style={{ position: 'relative', maxWidth: '88vw', maxHeight: '62vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
 onClick={e => e.stopPropagation()}>
 <img src={allImages[currentIdx]} alt={`Photo ${currentIdx + 1}`}
 style={{ maxWidth: '88vw', maxHeight: '62vh', objectFit: 'contain', borderRadius: 12, border: '1px solid rgba(212,160,23,0.25)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
 />
 <button onClick={prev} style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid var(--border)', color: 'var(--dark)', borderRadius: '50%', width: 42, height: 42, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 2 }}>‹</button>
 <button onClick={next} style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid var(--border)', color: 'var(--dark)', borderRadius: '50%', width: 42, height: 42, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 2 }}>›</button>
 </div>

 {/* Miniatures */}
 <div style={{ display: 'flex', gap: 5, overflowX: 'auto', maxWidth: '88vw', padding: '14px 4px 4px', marginTop: 4 }}
 onClick={e => e.stopPropagation()}>
 {allImages.map((img, i) => (
 <div key={i} onClick={() => setCurrentIdx(i)} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: i === currentIdx ? '2px solid #D4A017' : '1px solid rgba(212,160,23,0.2)', opacity: i === currentIdx ? 1 : 0.4, transition: 'all 0.2s', boxShadow: i === currentIdx ? '0 0 10px rgba(212,160,23,0.5)' : 'none' }}>
 <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
 </div>
 ))}
 </div>

 <div style={{ fontSize: 9, color: 'var(--text-soft)', marginTop: 8, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}>
 ← → clavier • Échap pour fermer
 </div>
 </div>
 )}

 {/* DOCUMENT VIEWER — vidéos, images, audio */}
 {selectedDoc && (
 <DocumentViewer item={selectedDoc} onClose={() => setSelectedDoc(null)} />
 )}
 </>
 )
}


// 
// DOCUMENT VIEWER — avec bouton retour
// 

function DocumentViewer({ item, onClose }) {
 if (!item) return null
 const isImage = item.type === 'image'
 const isAudio = item.type === 'audio'
 const isVideo = item.type === 'video' || item.type === 'video_locale'

 const getYtId = (url) => {
 if (!url) return null
 const s = url.match(/youtu\.be\/([^?&/]+)/)
 if (s) return s[1]
 const l = url.match(/[?&]v=([^&]+)/)
 if (l) return l[1]
 return null
 }
 const ytId = getYtId(item.url)

 return (
 <div style={{
 position: 'fixed', inset: 0, zIndex: 99999,
 background: '#070B14',
 display: 'flex', flexDirection: 'column',
 overflow: 'hidden'
 }}>
 {/* Barre du haut — fixe */}
 <div style={{
 flexShrink: 0, padding: '12px 20px',
 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
 background: 'linear-gradient(135deg, #5C0F0F, #8B1A1A)',
 borderBottom: '1px solid rgba(212,160,23,0.3)',
 height: 56
 }}>
 <button onClick={onClose} style={{
 display: 'flex', alignItems: 'center', gap: 6,
 background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.4)',
 color: '#F5C842', borderRadius: 20, padding: '6px 16px',
 cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', fontWeight: 700
 }}>← Retour au Musée</button>

 <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#F5C842', letterSpacing: '0.08em', textAlign: 'center', flex: 1, margin: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
 {item.title}
 </div>

 <button onClick={onClose} style={{
 background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.3)',
 color: '#D4A017', borderRadius: '50%', width: 32, height: 32,
 cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
 }}>×</button>
 </div>

 {/* Zone contenu — prend tout l'espace restant */}
 <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: isVideo ? 0 : 20, background: isVideo ? '#000' : 'transparent' }}>

 {/* IMAGE — scrollable si grande */}
 {isImage && (
 <div style={{ maxWidth: '96vw', maxHeight: 'calc(100vh - 56px)', overflow: 'auto', borderRadius: 12, border: '1px solid rgba(212,160,23,0.2)' }}>
 <img src={item.url} alt={item.title} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 12 }} />
 </div>
 )}

 {/* VIDÉO YOUTUBE — plein cadre */}
 {isVideo && ytId && (
 <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
 <iframe
 src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
 style={{ width: '100%', flex: 1, border: 'none', display: 'block' }}
 allowFullScreen
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
 title={item.title}
 />
 </div>
 )}

 {/* VIDÉO LOCALE — essayer sourceUrl YouTube d'abord, sinon fichier local */}
 {isVideo && !ytId && (() => {
 const srcYtId = item.sourceUrl ? (item.sourceUrl.match(/youtu\.be\/([^?&/]+)/)?.[1] || item.sourceUrl.match(/[?&]v=([^&]+)/)?.[1]) : null
 return srcYtId ? (
 <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
 <iframe
 src={`https://www.youtube-nocookie.com/embed/${srcYtId}?autoplay=1&rel=0&modestbranding=1`}
 style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
 allowFullScreen
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
 title={item.title}
 />
 </div>
 ) : (
 <div style={{ width: '90vw', maxWidth: 900 }}>
 <video src={item.url} controls autoPlay style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(212,160,23,0.25)', background: '#000' }} />
 {item.credit && <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: 'rgba(212,160,23,0.5)' }}>{item.credit}</div>}
 </div>
 )
 })()}

 {/* AUDIO */}
 {isAudio && (
 <div style={{ textAlign: 'center', padding: '40px 20px' }}>
 <div style={{ fontSize: 72, marginBottom: 24 }}></div>
 <div style={{ color: '#D4A017', fontFamily: 'Cinzel, serif', fontSize: 18, marginBottom: 24, letterSpacing: '0.08em' }}>{item.title}</div>
 <audio src={item.url} controls autoPlay style={{ width: '100%', maxWidth: 400 }} />
 {item.credit && <div style={{ fontSize: 11, color: 'rgba(212,160,23,0.4)', marginTop: 16 }}>{item.credit}</div>}
 </div>
 )}
 </div>
 </div>
 )
}



// 
// TIMELINE HISTORIQUE
// 

// Événements généraux
const timelineEvents = [
  { year: '1956', date: '2 Mars 1956', title: "Indépendance du Maroc", desc: "Le Maroc recouvre son indépendance après 44 ans de protectorat franco-espagnol. Mohammed V revient d'exil et prend la tête du pays libéré.", color: '#C9A84C', side: 'left' },
  { year: '1956', date: 'Août 1956', title: "Création de l'Armée de Libération du Sud", desc: "Les tribus sahariennes s'organisent militairement pour libérer les territoires du Sud encore sous occupation étrangère.", color: '#8B1A1A', side: 'right' },
  { year: '1958', date: '13 Janvier 1958', title: "Bataille de Dcheira", desc: "L'Armée de Libération du Sud affronte les forces franco-espagnoles à Dcheira. Malgré leur infériorité matérielle, les résistants infligent de lourdes pertes à l'ennemi.", color: '#8B1A1A', side: 'left', hasDcheira: true },
  { year: '1958', date: '25 Février 1958', title: "Discours Royal à M'Hamid El Ghizlane", desc: "Feu S.M. Mohammed V prononce un discours historique devant les tribus du Sud, réaffirmant solennellement la marocanité du Sahara et l'unité nationale.", color: '#C9A84C', side: 'right' },
  { year: '1969', date: '30 Juin 1969', title: "Récupération de Sidi Ifni", desc: "Le Maroc récupère Sidi Ifni après des négociations avec l'Espagne, première étape vers la récupération complète des provinces du Sud.", color: '#1A3D2B', side: 'left' },
  { year: '1975', date: '6 Novembre 1975', title: "La Marche Verte", desc: "Hassan II organise la Marche Verte : 350 000 civils marocains traversent pacifiquement la frontière vers le Sahara, tenant le Coran et le drapeau national.", color: '#1A3D2B', side: 'right' },
  { year: '1976', date: '28 Février 1976', title: "Évacuation du dernier soldat étranger", desc: "Le dernier soldat étranger quitte les provinces du Sud. Le Sahara marocain est définitivement réintégré sous la souveraineté du Royaume du Maroc.", color: '#C9A84C', side: 'left' },
]

// Étapes détaillées de la Bataille de Dcheira
const dcheiraSteps = [
  {
    step: '01',
    time: 'Nuit du 12 au 13 janvier 1958',
    title: "Préparation secrète",
    narration: "La nuit du 12 janvier 1958. Dans l'obscurité du désert marocain, les combattants de l'Armée de Libération du Sud se rassemblent en silence. Armés d'une foi inébranlable et d'armes légères, ils savent que demain, ils affronteront l'une des armées les plus puissantes du monde. Pour leur terre. Pour leur liberté.",
    color: '#1a1c3a',
    photos: [
      '/images/dcheira/A.jpeg',
      '/images/dcheira/B.jpeg',
      '/images/dcheira/C.jpeg',
      '/images/dcheira/D.jpeg',
    ],
  },
  {
    step: '02',
    time: 'Aube du 13 janvier 1958',
    title: "L'assaut commence",
    narration: "À l'aube, le signal est donné. Les résistants marocains lancent une attaque audacieuse sur les positions franco-espagnoles à Dcheira. Malgré leur infériorité en armement, leur courage et leur connaissance du terrain leur donnent un avantage décisif. Les premières heures de combat sont intenses.",
    color: '#8B1A1A',
    photos: [
      '/images/dcheira/AA.jpeg',
      '/images/dcheira/BB.jpeg',
    ],
  },
  {
    step: '03',
    time: 'Matin du 13 janvier 1958',
    title: "La résistance héroïque",
    narration: "Face aux chars et à l'artillerie ennemie, les combattants tiennent leurs positions avec une détermination extraordinaire. Chaque maison, chaque rocher devient un point de défense. Les pertes sont lourdes des deux côtés, mais les résistants refusent de céder un seul mètre de leur terre ancestrale.",
    color: '#1A3D2B',
    photos: [
      '/images/dcheira/AAA.jpeg',
      '/images/dcheira/BBB.jpeg',
      '/images/dcheira/CCC.jpeg',
    ],
  },
  {
    step: '04',
    time: 'Après-midi du 13 janvier 1958',
    title: "L'ennemi recule",
    narration: "Contre toute attente, les forces franco-espagnoles subissent des pertes importantes. La bravoure des résistants marocains force l'ennemi à modifier ses positions. Cette résistance acharnée envoie un message clair au monde entier : le peuple marocain est prêt à mourir pour son unité territoriale.",
    color: '#2D3A8C',
    photos: [
      '/images/dcheira/AAAA.jpeg',
      '/images/dcheira/BBBB.jpeg',
      '/images/dcheira/CCCC.jpeg',
      '/images/dcheira/DDDD.jpeg',
    ],
  },
  {
    step: '05',
    time: 'Soir du 13 janvier 1958',
    title: "Un sacrifice immortel",
    narration: "Quand le soleil se couche sur Dcheira, les combattants tombés sont des martyrs pour toujours. Leur sacrifice n'est pas vain. La Bataille de Dcheira devient le symbole de la résistance marocaine, une page dorée dans l'histoire de la nation.",
    color: '#C9A84C',
    photos: [
      '/images/dcheira/R.jpeg',
      '/images/dcheira/RR.jpeg',
      '/images/dcheira/RRR.jpeg',
    ],
  },
]

function Timeline() {
  const [activeIdx, setActiveIdx] = useState(null)
  const [isNarrating, setIsNarrating] = useState(false)
  const [narratingIdx, setNarratingIdx] = useState(null)
  const [dcheiraActive, setDcheiraActive] = useState(null)
  const [dcheiraPlaying, setDcheiraPlaying] = useState(null)
  const [elevenlabsKey] = useState(() => {
    try { return localStorage.getItem('elevenlabs_key') || 'sk_2980b370d99e71046370bb914b0d71605a3413462e61c621' } catch { return 'sk_2980b370d99e71046370bb914b0d71605a3413462e61c621' }
  })

  const narrateSingleDcheira = async (step, idx) => {
    window.speechSynthesis.cancel()
    setDcheiraPlaying(idx)
    setDcheiraActive(idx)
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenlabsKey },
        body: JSON.stringify({ text: step.narration, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.4, similarity_boost: 0.8 } })
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const audio = new Audio(URL.createObjectURL(blob))
      audio.play()
      audio.onended = () => setDcheiraPlaying(null)
    } catch {
      const u = new SpeechSynthesisUtterance(step.narration)
      u.lang = 'fr-FR'; u.rate = 0.85
      u.onend = () => setDcheiraPlaying(null)
      window.speechSynthesis.speak(u)
    }
  }

  const narrateDcheiraAll = () => {
    let idx = 0
    const playNext = () => {
      if (idx >= dcheiraSteps.length) return
      const step = dcheiraSteps[idx]
      setDcheiraPlaying(idx)
      setDcheiraActive(idx)
      const tryElevenLabs = async () => {
        try {
          const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenlabsKey },
            body: JSON.stringify({ text: step.narration, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.4, similarity_boost: 0.8 } })
          })
          if (!res.ok) throw new Error()
          const blob = await res.blob()
          const audio = new Audio(URL.createObjectURL(blob))
          audio.play()
          audio.onended = () => { setDcheiraPlaying(null); idx++; setTimeout(playNext, 600) }
        } catch {
          const u = new SpeechSynthesisUtterance(step.narration)
          u.lang = 'fr-FR'; u.rate = 0.85
          u.onend = () => { setDcheiraPlaying(null); idx++; setTimeout(playNext, 600) }
          window.speechSynthesis.speak(u)
        }
      }
      tryElevenLabs()
    }
    playNext()
  }

  const narrateEvent = (event, idx) => {
    window.speechSynthesis.cancel()
    setNarratingIdx(idx)
    setActiveIdx(idx)
    setIsNarrating(true)
    const text = `${event.date}. ${event.title}. ${event.desc}`
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'fr-FR'
    u.rate = 0.9
    u.onend = () => {
      setIsNarrating(false)
      setNarratingIdx(null)
      // Passer automatiquement au suivant
      const next = idx + 1
      if (next < timelineEvents.length) {
        setTimeout(() => narrateEvent(timelineEvents[next], next), 600)
      }
    }
    window.speechSynthesis.speak(u)
  }

  const startNarration = () => {
    narrateEvent(timelineEvents[0], 0)
  }

  const stopNarration = () => {
    window.speechSynthesis.cancel()
    setIsNarrating(false)
    setNarratingIdx(null)
  }

  return (
    <div id="timeline-section" style={{ padding: '60px 40px', background: 'white', borderTop: '1px solid var(--border)' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
          Chronologie
          <div style={{ width: 40, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
        </div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--dark)', letterSpacing: '0.03em' }}>
          Histoire du <strong style={{ fontWeight: 700 }}>Sud Marocain</strong>
        </h2>
        <p style={{ fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--text-soft)', marginTop: 12 }}>
          De l'indépendance à la récupération des provinces sahariennes
        </p>

        {/* Boutons narrateur */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 28 }}>
          {!isNarrating ? (
            <button onClick={startNarration} style={{
              background: 'var(--dark)', color: 'white', border: 'none',
              padding: '12px 32px', cursor: 'pointer',
              fontFamily: 'Jost, sans-serif', fontSize: 11,
              fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--dark)'}
            >
              <span style={{ fontSize: 14 }}>▶</span>
              Écouter la chronologie
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={stopNarration} style={{
                background: '#8B1A1A', color: 'white', border: 'none',
                padding: '12px 32px', cursor: 'pointer',
                fontFamily: 'Jost, sans-serif', fontSize: 11,
                fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 14 }}>■</span>
                Arrêter
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-soft)', fontFamily: 'Jost, sans-serif' }}>
                {/* Ondes animées */}
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 3, borderRadius: 999,
                    background: 'var(--gold)',
                    animation: `wave 1s ease-in-out ${i * 0.15}s infinite alternate`,
                    height: `${8 + i * 4}px`
                  }} />
                ))}
                <span style={{ marginLeft: 6 }}>
                  {narratingIdx !== null ? `${narratingIdx + 1} / ${timelineEvents.length} — ${timelineEvents[narratingIdx]?.title}` : 'Lecture...'}
                </span>
              </div>
            </div>
          )}

          {/* Bouton pour lire un événement spécifique */}
          {!isNarrating && activeIdx !== null && (
            <button onClick={() => narrateEvent(timelineEvents[activeIdx], activeIdx)} style={{
              background: 'transparent', color: 'var(--gold)',
              border: '1px solid var(--border-mid)',
              padding: '11px 24px', cursor: 'pointer',
              fontFamily: 'Jost, sans-serif', fontSize: 11,
              fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(201,168,76,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.background = 'transparent' }}
            >
              Lire cet événement
            </button>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, transparent, var(--border) 5%, var(--border) 95%, transparent)', transform: 'translateX(-50%)' }} />
        {timelineEvents.map((event, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: event.side === 'left' ? 'flex-start' : 'flex-end', marginBottom: 48, position: 'relative' }}>
            <div
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              style={{ width: event.hasDcheira && activeIdx === i ? '90%' : '44%', background: activeIdx === i ? event.color : 'white', border: `1px solid ${activeIdx === i ? event.color : 'var(--border)'}`, borderRadius: 2, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.4s', boxShadow: activeIdx === i ? `0 8px 32px ${event.color}30` : 'none' }}
              onMouseEnter={e => { if (activeIdx !== i) { e.currentTarget.style.borderColor = event.color; e.currentTarget.style.boxShadow = `0 4px 20px ${event.color}20` } }}
              onMouseLeave={e => { if (activeIdx !== i) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' } }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', color: activeIdx === i ? 'rgba(255,255,255,0.7)' : event.color, fontFamily: 'Jost, sans-serif', marginBottom: 6, textTransform: 'uppercase' }}>{event.date}</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: activeIdx === i ? 'white' : 'var(--dark)', marginBottom: 10, lineHeight: 1.2 }}>
                {event.title}
                {event.hasDcheira && activeIdx !== i && <span style={{ marginLeft: 10, fontSize: 10, color: event.color, border: `1px solid ${event.color}`, padding: '2px 8px', borderRadius: 2, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em', verticalAlign: 'middle' }}>5 étapes</span>}
              </div>

              {/* Description normale pour événements sans étapes */}
              {!event.hasDcheira && (
                <>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: activeIdx === i ? 'rgba(255,255,255,0.85)' : 'var(--text-soft)', fontFamily: 'Jost, sans-serif', maxHeight: activeIdx === i ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease, opacity 0.3s', opacity: activeIdx === i ? 1 : 0 }}>{event.desc}</div>
                  {activeIdx !== i && <div style={{ fontSize: 10, color: event.color, marginTop: 8, fontFamily: 'Jost, sans-serif', letterSpacing: '0.15em' }}>Lire plus +</div>}
                </>
              )}

              {/* Étapes détaillées pour Dcheira */}
              {event.hasDcheira && (
                <div style={{ maxHeight: activeIdx === i ? 1000 : 0, overflow: 'hidden', transition: 'max-height 0.6s ease, opacity 0.4s', opacity: activeIdx === i ? 1 : 0 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Jost, sans-serif', marginBottom: 16, lineHeight: 1.6 }}>{event.desc}</div>

                  {/* Bouton narration */}
                  <button onClick={e => { e.stopPropagation(); if (elevenlabsKey) dcheiraSteps.forEach((s,idx) => {}); narrateDcheiraAll() }} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 20px', fontSize: 10, fontFamily: 'Jost, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ▶ Écouter la narration complète
                  </button>

                  {/* Étapes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dcheiraSteps.map((step, si) => (
                      <div key={si} onClick={e => { e.stopPropagation(); setDcheiraActive(dcheiraActive === si ? null : si) }}
                        style={{ background: dcheiraActive === si || dcheiraPlaying === si ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${dcheiraPlaying === si ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 2, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* Photo miniature — première photo */}
                          <div style={{ width: 60, height: 45, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                            <img src={step.photos?.[0]} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(30%)' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 2 }}>{step.time}</div>
                            <div style={{ fontSize: 13, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: dcheiraPlaying === si ? '#F5C842' : 'white' }}>{step.title}</div>
                          </div>
                          {/* Bouton lire / pause */}
                          {dcheiraPlaying === si ? (
                            <button onClick={e => { e.stopPropagation(); window.speechSynthesis.cancel(); setDcheiraPlaying(null) }}
                              style={{ background: 'rgba(139,26,26,0.6)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              ■
                            </button>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); narrateSingleDcheira(step, si) }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              ▶
                            </button>
                          )}
                        </div>

                        {/* Grille photos + narration si actif */}
                        {(dcheiraActive === si || dcheiraPlaying === si) && (
                          <div style={{ marginTop: 12 }}>
                            {/* Grille de photos */}
                            <div style={{ display: 'grid', gridTemplateColumns: step.photos?.length === 1 ? '1fr' : step.photos?.length === 2 ? '1fr 1fr' : 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
                              {step.photos?.map((photo, pi) => (
                                <div key={pi} style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', aspectRatio: step.photos.length === 1 ? '16/7' : '4/3' }}>
                                  <img src={photo} alt={`${step.title} ${pi + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'sepia(15%) contrast(1.1)', transition: 'filter 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.filter = 'sepia(0%) contrast(1)'}
                                    onMouseLeave={e => e.currentTarget.style.filter = 'sepia(15%) contrast(1.1)'}
                                  />
                                  {/* Ondes narration sur première photo */}
                                  {dcheiraPlaying === si && pi === 0 && (
                                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 2, alignItems: 'flex-end', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 20 }}>
                                      {[1,2,3,4].map(j => <div key={j} style={{ width: 3, borderRadius: 999, background: '#F5C842', animation: `wave 0.8s ${j*0.1}s ease-in-out infinite alternate`, height: `${4+j*3}px` }} />)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Narration */}
                            <div style={{ fontSize: 12, lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>{step.narration}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {narratingIdx === i && !event.hasDcheira && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[1,2,3,4].map(j => (
                    <div key={j} style={{ width: 3, borderRadius: 999, background: 'rgba(255,255,255,0.8)', animation: `wave 1s ease-in-out ${j * 0.15}s infinite alternate`, height: `${6 + j * 3}px` }} />
                  ))}
                  <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'Jost, sans-serif' }}>Lecture en cours...</span>
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', left: '50%', top: 24, transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: activeIdx === i ? event.color : 'white', border: `2px solid ${event.color}`, zIndex: 2, transition: 'all 0.3s', boxShadow: activeIdx === i ? `0 0 0 4px ${event.color}30` : 'none' }} />
            <div style={{ position: 'absolute', left: '50%', top: 44, transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: event.color, fontFamily: 'Cormorant Garamond, serif', background: 'white', padding: '2px 8px', border: `1px solid ${event.color}40`, borderRadius: 2, whiteSpace: 'nowrap', zIndex: 2 }}>{event.year}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 
// QUIZ
// 

function Quiz({ onScoreUpdate }) {
 const [currentIndex, setCurrentIndex] = useState(0)
 const [score, setScore] = useState(0)
 const [answered, setAnswered] = useState(null)
 const [showResult, setShowResult] = useState(false)
 const [finished, setFinished] = useState(false)

 const current = quizData[currentIndex]
 const total = quizData.length

 const handleAnswer = (idx) => {
 if (answered !== null) return
 setAnswered(idx)
 setShowResult(true)
 if (idx === current.correct) {
 const newScore = score + 1
 setScore(newScore)
 if (onScoreUpdate) onScoreUpdate(newScore)
 }
 }

 const handleNext = () => {
 if (currentIndex + 1 >= total) setFinished(true)
 else { setCurrentIndex(i => i + 1); setAnswered(null); setShowResult(false) }
 }

 const handleRestart = () => {
 setCurrentIndex(0); setScore(0); setAnswered(null); setFinished(false); setShowResult(false)
 if (onScoreUpdate) onScoreUpdate(0)
 }

 if (finished) {
 const pct = Math.round((score / total) * 100)
 const medal = pct >= 80 ? '' : pct >= 50 ? '' : ''
 return (
 <div className="card-sahara" style={{ padding: 16, textAlign: 'center' }}>
 <div style={{ fontSize: 44, marginBottom: 8 }}>{medal}</div>
 <div className="badge-category" style={{ marginBottom: 8 }}>Quiz terminé</div>
 <div style={{ fontSize: 26, fontWeight: 900, color: '#D4A017', fontFamily: 'Cinzel, serif' }}>{score} / {total}</div>
 <div style={{ fontSize: 10, color: 'rgba(232,213,163,0.5)', margin: '4px 0 12px' }}>{pct}% de bonnes réponses</div>
 <div className="quiz-progress" style={{ marginBottom: 14 }}>
 <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
 </div>
 <button className="btn-gold" style={{ width: '100%', padding: 10, fontSize: 11 }} onClick={handleRestart}> Recommencer</button>
 </div>
 )
 }

 return (
 <div className="card-sahara" style={{ padding: 14 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
 <span className="badge-category">{current.category}</span>
 <span style={{ fontSize: 10, color: 'rgba(212,160,23,0.6)', fontFamily: 'Cinzel, serif' }}>{currentIndex + 1} / {total}</span>
 </div>
 <div className="quiz-progress" style={{ marginBottom: 10 }}>
 <div className="quiz-progress-fill" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
 </div>
 <p style={{ fontSize: 12, fontWeight: 700, color: '#E8D5A3', marginBottom: 10, lineHeight: 1.6 }}>{current.question}</p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
 {current.answers.map((ans, idx) => {
 let cls = 'quiz-answer'
 if (showResult) {
 if (idx === current.correct) cls += ' correct'
 else if (idx === answered) cls += ' wrong'
 else cls += ' dimmed'
 }
 return (
 <button key={idx} className={cls} disabled={answered !== null} onClick={() => handleAnswer(idx)}>
 {showResult && idx === current.correct && ' '}
 {showResult && idx === answered && idx !== current.correct && ' '}
 {ans}
 </button>
 )
 })}
 </div>
 {showResult && (
 <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontSize: 10, color: 'rgba(232,213,163,0.5)' }}>Score : {score} pts</span>
 <button className="btn-gold" style={{ padding: '6px 16px', fontSize: 10 }} onClick={handleNext}>
 {currentIndex + 1 >= total ? ' Résultat' : 'Suivant '}
 </button>
 </div>
 )}
 </div>
 )
}

// 
// CHATBOT RAWI
// 

function ChatbotRawi() {
 const [isOpen, setIsOpen] = useState(false)
 const [input, setInput] = useState('')
 const [loading, setLoading] = useState(false)
 const [messages, setMessages] = useState([{
 role: 'assistant',
 content: "مرحبا ! Je suis **Rawi**, votre guide historique. Spécialisé dans la Bataille de Dcheira, M'Hamid El Ghizlane et le patrimoine Hassani. Quelle page de notre histoire souhaitez-vous découvrir ?"
 }])
 const messagesEndRef = useRef(null)

 useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

 const fmt = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')

 // Réponses locales si l'API est inaccessible
 const localReplies = {
 'dcheira': `La **Bataille de Dcheira** s'est déroulée le **13 janvier 1958** dans le Sud marocain. C'est l'un des épisodes les plus héroïques de la résistance nationale. L'Armée de Libération du Sud, composée de combattants marocains déterminés, a affronté les forces franco-espagnoles pour parachever l'unité territoriale du Maroc. Malgré une armée moderne et bien équipée en face, les résistants ont infligé des pertes importantes à l'ennemi, symbolisant la volonté inébranlable du peuple marocain.`,
 'mhamid': `Le **25 février 1958**, Feu S.M. Mohammed V a prononcé un discours historique à **M'Hamid El Ghizlane**, entouré des grandes tribus du Sud. Ce discours fondateur a réaffirmé solennellement la **marocanité du Sahara** et scellé l'union entre le Trône et le peuple saharien. C'est ici que la diplomatie marocaine a officiellement tracé le chemin vers la récupération des provinces sahariennes. Un moment fondateur de la souveraineté nationale.`,
 'hassani': `La **culture Hassani** est le patrimoine vivant des populations du Sahara marocain. Elle se distingue par la langue **Hassaniya** (dialecte arabe saharien), la poésie orale (Leblegh), la musique (avec l'ardine et le tbal), et des traditions uniques comme la **cérémonie du thé en trois verres** (atay). L'artisanat Hassani inclut les bijoux en argent ciselés, le tissage des haimas (tentes nomades) et le travail du cuir. Cette culture incarne l'identité profonde des provinces du Sud.`,
 'armée': `L'**Armée de Libération du Sud** était une organisation de résistance armée composée de patriotes marocains du Sahara. Fondée après l'indépendance du Maroc en 1956, elle avait pour mission de libérer les territoires encore sous occupation étrangère. Ses membres, issus des tribus sahariennes, ont mené des opérations militaires courageuses dont la célèbre **Bataille de Dcheira** le 13 janvier 1958. Leur sacrifice a grandement contribué à la récupération des provinces du Sud.`,
 'marche': `La **Marche Verte** est une marche pacifique organisée par **Hassan II** le **6 novembre 1975**. Plus de 350 000 civils marocains ont traversé la frontière vers le Sahara occidental, tenant le Coran et le drapeau national. Cet événement historique a conduit à la signature des **Accords de Madrid** et au retrait espagnol, permettant la récupération des provinces sahariennes. La Marche Verte est célébrée chaque année comme symbole de l'unité nationale et de la sagesse diplomatique marocaine.`,
 'laayoune': `**Laâyoune** (العيون) est la capitale et plus grande ville des provinces du Sud marocain. Fondée par les Espagnols en 1938, elle est devenue le centre administratif, économique et culturel du Sahara marocain après la récupération en 1976. Aujourd'hui, Laâyoune est une ville moderne en plein développement, avec des infrastructures de qualité, une université, et un port important. Elle symbolise le développement et la modernisation que le Maroc a apporté à ses provinces sahariennes.`,
 }

 const getLocalReply = (text) => {
 const t = text.toLowerCase()
 if (t.includes('dcheira') || t.includes('bataille')) return localReplies['dcheira']
 if (t.includes('mhamid') || t.includes('ghizlane') || t.includes('mohammed v') || t.includes('discours')) return localReplies['mhamid']
 if (t.includes('hassani') || t.includes('culture') || t.includes('patrimoine')) return localReplies['hassani']
 if (t.includes('armée') || t.includes('liberation') || t.includes('résistance')) return localReplies['armée']
 if (t.includes('marche verte') || t.includes('hassan ii')) return localReplies['marche']
 if (t.includes('laayoune') || t.includes('provinces') || t.includes('sahara')) return localReplies['laayoune']
 if (t.includes('bonjour') || t.includes('salut') || t.includes('marhaba')) return "Marhaba ! Je suis **Rawi**, votre guide historique du Musée Numérique du Maroc. Posez-moi vos questions sur la Bataille de Dcheira, Mohammed V à M'Hamid El Ghizlane, la culture Hassani ou les provinces du Sud !"
 return `Je suis **Rawi**, spécialisé dans l'histoire du Sud marocain. Vous pouvez me poser des questions sur :
- La Bataille de Dcheira (1958)
- Le discours de Mohammed V à M'Hamid El Ghizlane
- La culture Hassani
- L'Armée de Libération du Sud
- La Marche Verte et les provinces du Sud`
 }

 const sendMessage = async (text) => {
 const userText = text || input.trim()
 if (!userText || loading) return
 setInput('')
 const newMessages = [...messages, { role: 'user', content: userText }]
 setMessages(newMessages)
 setLoading(true)
 try {
 const controller = new AbortController()
 const timeoutId = setTimeout(() => controller.abort(), 8000)
 const res = await fetch('/api/chat', {
 method: 'POST', headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ system: RAWI_SYSTEM, messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
 signal: controller.signal
 })
 clearTimeout(timeoutId)
 const data = await res.json()
 // Vérifier si la réponse contient une erreur
 const reply = data.content?.[0]?.text
 if (reply) {
 setMessages([...newMessages, { role: 'assistant', content: reply }])
 } else {
 setMessages([...newMessages, { role: 'assistant', content: getLocalReply(userText) }])
 }
 } catch {
 // Fallback local si API inaccessible
 await new Promise(r => setTimeout(r, 600))
 setMessages([...newMessages, { role: 'assistant', content: getLocalReply(userText) }])
 } finally { setLoading(false) }
 }

 return (
 <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
 {!isOpen && (
 <button onClick={() => setIsOpen(true)} style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--dark)', border: '2px solid var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,20,16,0.4), 0 0 0 4px rgba(201,168,76,0.1)', animation: 'rawiPulse 3s ease-in-out infinite', transition: 'all 0.2s' }}
  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,20,16,0.5), 0 0 0 6px rgba(201,168,76,0.2)' }}
  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,20,16,0.4), 0 0 0 4px rgba(201,168,76,0.1)' }}
>
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Corps du musée */}
    <rect x="4" y="10" width="20" height="14" rx="1" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
    {/* Colonnes */}
    <rect x="7" y="11" width="2" height="12" fill="#C9A84C" opacity="0.7"/>
    <rect x="11" y="11" width="2" height="12" fill="#C9A84C" opacity="0.7"/>
    <rect x="15" y="11" width="2" height="12" fill="#C9A84C" opacity="0.7"/>
    <rect x="19" y="11" width="2" height="12" fill="#C9A84C" opacity="0.7"/>
    {/* Fronton */}
    <path d="M2 10 L14 3 L26 10 Z" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Socle */}
    <rect x="2" y="23" width="24" height="2.5" rx="0.5" fill="#C9A84C" opacity="0.8"/>
    {/* Porte */}
    <rect x="12" y="17" width="4" height="7" rx="0.5" fill="#C9A84C" opacity="0.5"/>
  </svg>
</button>
 )}

 {isOpen && (
 <div style={{ width: 380, height: 560, background: 'white', borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(26,20,16,0.18)' }}>
 <div style={{ background: 'var(--dark)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
 <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}></div>
 <div>
 <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: 14, fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.05em' }}>Rawi — راوي</div>
 <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}>Guide historique • المتحف الرقمي</div>
 </div>
 </div>
 <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
 </div>

 <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--cream)' }}>
 {messages.map((msg, i) => (
 <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
 {msg.role === 'assistant' && (
 <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#5C0F0F,#8B1A1A)', border: '1px solid rgba(212,160,23,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginRight: 8, flexShrink: 0, marginTop: 2 }}></div>
 )}
 <div style={{ maxWidth: '78%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#5C0F0F,#8B1A1A)' : 'rgba(232,213,163,0.05)', color: msg.role === 'user' ? '#E8D5A3' : '#C4A96B', fontSize: 12, lineHeight: 1.65, border: msg.role === 'assistant' ? '1px solid rgba(212,160,23,0.12)' : 'none' }}
 dangerouslySetInnerHTML={{ __html: fmt(msg.content) }} />
 </div>
 ))}
 {loading && (
 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
 <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#5C0F0F,#8B1A1A)', border: '1px solid rgba(212,160,23,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}></div>
 <div style={{ padding: '9px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(232,213,163,0.05)', border: '1px solid rgba(212,160,23,0.12)', display: 'flex', gap: 5, alignItems: 'center' }}>
 {[0,1,2].map(i =><div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A017', animation: 'rawipulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />)}
 </div>
 </div>
 )}
 {messages.length === 1 && !loading && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
 {RAWI_SUGGESTIONS.map((s, i) => (
 <button key={i} onClick={() => sendMessage(s)} style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.2)', color: '#C4A96B', borderRadius: 10, padding: '8px 12px', fontSize: 11, cursor: 'pointer', textAlign: 'left', fontFamily: 'Tajawal, sans-serif' }}> {s}</button>
 ))}
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'white', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
 <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Votre question historique..." rows={1}
 style={{ flex: 1, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 2, padding: '9px 13px', color: 'var(--text)', fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'Jost, sans-serif', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }} />
 <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 38, height: 38, borderRadius: '50%', background: loading || !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#5C0F0F,#8B1A1A)', border: loading || !input.trim() ? 'none' : '1px solid rgba(212,160,23,0.3)', color: '#D4A017', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}></button>
 </div>
 </div>
 )}
 <style>{`
@keyframes dashMove {
  to { stroke-dashoffset: -40; }
}
.leaflet-overlay-pane svg path {
  animation: dashMove 2s linear infinite;
}
@keyframes rawipulse{0%,60%,100%{opacity:.3;transform:scale(.8)}30%{opacity:1;transform:scale(1)}}@keyframes chatPulse{0%,100%{box-shadow:0 4px 24px rgba(139,26,26,.6),0 0 0 0 rgba(212,160,23,.4)}50%{box-shadow:0 4px 24px rgba(139,26,26,.6),0 0 0 8px rgba(212,160,23,0)}}`}</style>
 </div>
 )
}


// ─────────────────────────────────────────────
// GÉNÉRATEUR PDF SIMPLE — FICHE ENSEIGNANT
// ─────────────────────────────────────────────

const generateTeacherPDF = async () => {
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  document.head.appendChild(script)
  await new Promise(resolve => script.onload = resolve)

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, m = 20
  let y = m

  const writeLine = (text, size = 10, bold = false, color = [40, 30, 20]) => {
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, W - m * 2)
    doc.text(lines, m, y)
    y += lines.length * (size * 0.45) + 2
  }

  const sep = () => {
    doc.setDrawColor(180, 160, 100)
    doc.setLineWidth(0.3)
    doc.line(m, y, W - m, y)
    y += 5
  }

  const section = (title) => {
    y += 3
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(139, 26, 26)
    doc.text(title, m, y)
    y += 7
  }

  // TITRE
  writeLine('Fiche Pédagogique — Histoire du Sud Marocain', 16, true, [26, 20, 16])
  writeLine('Musée Numérique du Maroc — Mémorial du Sud', 10, false, [100, 80, 50])
  writeLine('Généré le ' + new Date().toLocaleDateString('fr-FR'), 8, false, [150, 130, 100])
  y += 2
  sep()

  // INFOS
  section('Informations générales')
  writeLine('Niveau : Collège / Lycée  |  Matière : Histoire  |  Durée : 2-3 séances', 9)
  writeLine('Accès : http://localhost:5173', 9, false, [100, 80, 50])
  sep()

  // OBJECTIFS
  section('Objectifs')
  const obj = [
    'Comprendre la Bataille de Dcheira (13 janvier 1958)',
    "Analyser le discours de Mohammed V à M'Hamid El Ghizlane (25 février 1958)",
    'Découvrir la culture Hassani et les provinces du Sud',
    'Situer la Marche Verte (1975) dans la récupération du Sahara',
  ]
  obj.forEach(o => writeLine('• ' + o, 9))
  sep()

  // CHRONOLOGIE
  section('Chronologie — 1956 à 1976')
  const events = [
    ['2 mars 1956', "Indépendance du Maroc"],
    ['Août 1956', "Création de l'Armée de Libération du Sud"],
    ['13 janvier 1958', "Bataille de Dcheira"],
    ['25 février 1958', "Discours de Mohammed V à M'Hamid El Ghizlane"],
    ['6 novembre 1975', "La Marche Verte — 350 000 civils"],
    ['28 février 1976', "Évacuation du dernier soldat étranger"],
  ]
  events.forEach(([date, evt]) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(139, 26, 26)
    doc.text(date, m, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 30, 20)
    doc.text('— ' + evt, m + 42, y)
    y += 5.5
  })
  sep()

  // CULTURE HASSANI
  section('La culture Hassani')
  const hassani = [
    'Langue Hassaniya — dialecte arabe saharien',
    "Musique : l'Ardine (instrument féminin)",
    "Cérémonie du thé Atay — 3 verres",
    'Haimas (tentes nomades), bijoux en argent ciselé',
  ]
  hassani.forEach(h => writeLine('• ' + h, 9))
  sep()

  // QUESTIONS
  section("Questions d'évaluation")
  const questions = [
    ['En quelle date a eu lieu la Bataille de Dcheira ?', '13 janvier 1958'],
    ["Quel groupe a mené la résistance ?", "L'Armée de Libération du Sud"],
    ["Que symbolise le discours de M'Hamid ?", "La marocanité du Sahara"],
    ['Quelle langue parle-t-on dans la culture Hassani ?', 'Le Hassaniya'],
    ['Combien de civils ont marché lors de la Marche Verte ?', '350 000'],
    ['Quelle est la capitale des provinces du Sud ?', 'Laâyoune'],
  ]
  questions.forEach(([q, r], i) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 30, 20)
    const qLines = doc.splitTextToSize('Q' + (i+1) + '. ' + q, W - m * 2)
    doc.text(qLines, m, y)
    y += qLines.length * 4.5
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(26, 61, 43)
    doc.text('    Réponse : ' + r, m, y)
    y += 6
  })
  sep()

  // SOURCES
  section('Sources')
  const sources = [
    'Musée Numérique : http://localhost:5173',
    "Discours M'Hamid : https://youtu.be/h5OisBeWtZw",
    'Héroïsme de Dcheira : https://youtu.be/8XQ_g49K5WM',
    'Archives Royales : https://www.archive.ma',
  ]
  sources.forEach(s => writeLine(s, 8.5, false, [80, 60, 40]))

  // FOOTER
  doc.setFontSize(7.5)
  doc.setTextColor(150, 130, 100)
  doc.setFont('helvetica', 'italic')
  doc.text('Hackathon Mémoire & Patrimoine — CRI Marrakech-Safi 2026', W / 2, 287, { align: 'center' })

  doc.save('Fiche_Pedagogique_Memorial_du_Sud.pdf')
}



// ─────────────────────────────────────────────
// IoT DASHBOARD + QR CODE
// ─────────────────────────────────────────────

function IotDashboard() {
  const [visitors, setVisitors] = useState(1)
  const [online, setOnline] = useState(1)
  const [galleryStats, setGalleryStats] = useState({
    batailles: 0, royale: 0, patrimoine: 0, archives: 0
  })
  const [showQR, setShowQR] = useState(false)
  const [sessionStart] = useState(Date.now())
  const [timeOnSite, setTimeOnSite] = useState(0)

  // Simuler visiteurs en temps réel (pour démo hackathon)
  useEffect(() => {
    // Récupérer ou initialiser les stats dans localStorage
    try {
      const saved = localStorage.getItem('museum_iot_stats')
      if (saved) {
        const data = JSON.parse(saved)
        setVisitors(data.visitors || 1)
        setGalleryStats(data.galleryStats || { batailles: 0, royale: 0, patrimoine: 0, archives: 0 })
      } else {
        // Première visite
        const initial = { visitors: 1, galleryStats: { batailles: 0, royale: 0, patrimoine: 0, archives: 0 } }
        localStorage.setItem('museum_iot_stats', JSON.stringify(initial))
      }
    } catch {}

    // Incrémenter visiteur
    try {
      const saved = localStorage.getItem('museum_iot_stats')
      if (saved) {
        const data = JSON.parse(saved)
        data.visitors = (data.visitors || 0) + 1
        localStorage.setItem('museum_iot_stats', JSON.stringify(data))
        setVisitors(data.visitors)
      }
    } catch {}

    // Timer temps sur le site
    const timer = setInterval(() => {
      setTimeOnSite(Math.floor((Date.now() - sessionStart) / 1000))
    }, 1000)

    // Simuler visiteurs online fluctuants
    const onlineTimer = setInterval(() => {
      setOnline(Math.floor(Math.random() * 4) + 1)
    }, 8000)

    return () => { clearInterval(timer); clearInterval(onlineTimer) }
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const museumUrl = window.location.href

  return (
    <div style={{ background: 'var(--cream-mid)', borderTop: '1px solid var(--border)', padding: '32px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Titre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: 500, marginBottom: 4 }}>
              Tableau de bord
            </div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--dark)' }}>
              Statistiques en direct
            </h3>
          </div>

          {/* Indicateur live */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', animation: 'rawiPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              En direct
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {/* Stat 1 — Visiteurs total */}
          <div style={{ background: 'white', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: 2 }}>
            <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 8 }}>Visiteurs total</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--dark)', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1 }}>{visitors}</div>
            <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>depuis le lancement</div>
          </div>

          {/* Stat 2 — En ligne maintenant */}
          <div style={{ background: 'white', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: 2 }}>
            <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 8 }}>En ligne</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#16a34a', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1 }}>{online}</div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', animation: 'rawiPulse 2s ease-in-out infinite' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>visiteurs actifs</div>
          </div>

          {/* Stat 3 — Temps session */}
          <div style={{ background: 'white', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: 2 }}>
            <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 8 }}>Votre session</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--dark)', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1 }}>{formatTime(timeOnSite)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>min sur le site</div>
          </div>

          {/* Stat 4 — QR Code */}
          <div onClick={() => setShowQR(!showQR)} style={{ background: showQR ? 'var(--dark)' : 'white', border: '1px solid var(--border)', padding: '18px 20px', borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!showQR) { e.currentTarget.style.borderColor = 'var(--gold)' } }}
            onMouseLeave={e => { if (!showQR) { e.currentTarget.style.borderColor = 'var(--border)' } }}
          >
            <div style={{ fontSize: 9, color: showQR ? 'var(--gold)' : 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 8 }}>QR Code</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: showQR ? 'white' : 'var(--dark)', fontFamily: 'Cormorant Garamond, serif' }}>
              Accès mobile
            </div>
            <div style={{ fontSize: 10, color: showQR ? 'rgba(255,255,255,0.5)' : 'var(--text-soft)', marginTop: 4, fontFamily: 'Jost, sans-serif' }}>
              {showQR ? 'Cliquer pour fermer' : 'Cliquer pour afficher'}
            </div>
          </div>
        </div>

        {/* QR Code panel */}
        {showQR && (
          <div style={{ background: 'white', border: '1px solid var(--border)', padding: '28px', borderRadius: 2, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* QR Code généré */}
            <div style={{ flexShrink: 0 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(museumUrl)}&color=1A1410&bgcolor=FAF8F3&margin=10`}
                alt="QR Code Musée"
                style={{ width: 160, height: 160, border: '1px solid var(--border)', borderRadius: 4 }}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 8 }}>Accès mobile</div>
              <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--dark)', marginBottom: 8 }}>
                Visitez le musée sur votre téléphone
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.7, fontFamily: 'Jost, sans-serif', marginBottom: 12, maxWidth: 400 }}>
                Scannez ce QR Code avec votre smartphone pour accéder directement au Musée Numérique du Maroc. Partagez-le avec vos élèves ou visiteurs.
              </p>
              <div style={{ background: 'var(--cream-mid)', padding: '8px 14px', borderRadius: 2, fontSize: 11, color: 'var(--text-soft)', fontFamily: 'Jost, sans-serif', letterSpacing: '0.05em', display: 'inline-block' }}>
                {museumUrl}
              </div>
            </div>
          </div>
        )}

        {/* Barres galeries */}
        <div style={{ background: 'white', border: '1px solid var(--border)', padding: '20px 24px', borderRadius: 2 }}>
          <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 16 }}>
            Popularité des galeries
          </div>
          {[
            { id: 'batailles', label: 'Galerie des Batailles', color: '#8B1A1A', pct: 82 },
            { id: 'royale', label: "M'Hamid El Ghizlane", color: '#1A3D2B', pct: 65 },
            { id: 'patrimoine', label: 'Galerie du Patrimoine', color: '#C9A84C', pct: 48 },
            { id: 'archives', label: 'Archives Vivantes', color: '#2D3A8C', pct: 35 },
          ].map(g => (
            <div key={g.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{g.label}</span>
                <span style={{ fontSize: 11, color: g.color, fontFamily: 'Jost, sans-serif', fontWeight: 600 }}>{g.pct}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--cream-dark)', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 999, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 
// APP PRINCIPALE
// 

export default function App() {
 const [entered, setEntered] = useState(false)
 const [activeHall, setActiveHall] = useState('batailles')
 const [viewingGallery, setViewingGallery] = useState(false)
 const [userMode, setUserMode] = useState('visiteur')
 const [quizScore, setQuizScore] = useState(0)
 const [visitedHalls, setVisitedHalls] = useState(['batailles'])
 const [isSpeaking, setIsSpeaking] = useState(false)
 const [showStats, setShowStats] = useState(false)
 const [isTourActive, setIsTourActive] = useState(false)
 const [tourStep, setTourStep] = useState(0)
 const [selectedDoc, setSelectedDoc] = useState(null)

 const tour = ['batailles', 'royale', 'patrimoine', 'archives']
 const activeHallData = useMemo(() => halls.find(h => h.id === activeHall) || halls[0], [activeHall])

 const handleHallSelect = (id) => {
 setActiveHall(id)
 setViewingGallery(true)
 if (!visitedHalls.includes(id)) setVisitedHalls(prev => [...prev, id])
 }

 const backToHome = () => {
 setViewingGallery(false)
 setActiveHall(null)
 }

 const speak = (text, callback) => {
 window.speechSynthesis.cancel()
 const u = new SpeechSynthesisUtterance(text)
 u.lang = 'fr-FR'
 u.onstart = () => setIsSpeaking(true)
 u.onend = () => { setIsSpeaking(false); if (callback) callback() }
 window.speechSynthesis.speak(u)
 }

 const nextStep = useCallback((currentStep) => {
 if (currentStep < tour.length - 1) {
 const next = currentStep + 1
 setTourStep(next); setActiveHall(tour[next])
 speak(halls.find(h => h.id === tour[next]).desc, () => nextStep(next))
 } else { setIsTourActive(false); setTourStep(0) }
 }, [])

 const startTour = () => {
 setIsTourActive(true); setTourStep(0); setActiveHall(tour[0])
 speak(halls.find(h => h.id === tour[0]).desc, () => nextStep(0))
 }

 const markerRed = L.divIcon({
 className: '',
 html: `<div style="position:relative;width:44px;height:44px">
   <div style="width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#C1440E,#8B1A1A);border:2px solid #F5C842;box-shadow:0 0 0 3px rgba(245,200,66,0.3),0 4px 20px rgba(139,26,26,0.8);display:flex;align-items:center;justify-content:center">
     <div style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.9)"></div>
   </div>
   <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #8B1A1A"></div>
 </div>`,
 iconSize: [44, 52], iconAnchor: [22, 52], popupAnchor: [0, -52]
 })

 const markerGreen = L.divIcon({
 className: '',
 html: `<div style="position:relative;width:44px;height:44px">
   <div style="width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#2D6A4F,#1A3D2B);border:2px solid #F5C842;box-shadow:0 0 0 3px rgba(245,200,66,0.3),0 4px 20px rgba(26,61,43,0.8);display:flex;align-items:center;justify-content:center">
     <div style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.9)"></div>
   </div>
   <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #1A3D2B"></div>
 </div>`,
 iconSize: [44, 52], iconAnchor: [22, 52], popupAnchor: [0, -52]
 })

 // ÉCRAN D'ACCUEIL HERO VIDEO 
 if (!entered) {
 return (
 <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#070B14' }}>

 {/* Vidéo hero en fond */}
 <video
 autoPlay muted loop playsInline
 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
 >
 <source src="/hero.mp4" type="video/mp4" />
 </video>

 {/* Dégradé sombre sur la vidéo */}
 <div style={{
 position: 'absolute', inset: 0,
 background: 'linear-gradient(to bottom, rgba(7,11,20,0.3) 0%, rgba(7,11,20,0.5) 50%, rgba(7,11,20,0.85) 100%)'
 }} />

 {/* Bande marocaine en haut */}
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #8B1A1A, #D4A017, #1A3D2B, #D4A017, #8B1A1A)', backgroundSize: '200% 100%', animation: 'barFlow 4s linear infinite' }} />

 {/* Contenu centré */}
 <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>

 {/* Sous-titre arabe */}
 <div style={{ fontSize: 13, color: 'rgba(212,160,23,0.7)', letterSpacing: '0.4em', marginBottom: 20, fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>
 المتحف الرقمي المغربي
 </div>

 {/* Titre principal */}
 <h1 style={{
 fontFamily: 'Cinzel, serif', fontWeight: 900,
 fontSize: 'clamp(36px, 7vw, 80px)',
 background: 'linear-gradient(135deg, #F5C842 0%, #D4A017 40%, #E8D5A3 70%, #F5C842 100%)',
 backgroundSize: '200% auto',
 WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
 backgroundClip: 'text',
 animation: 'titleShimmer 4s linear infinite',
 marginBottom: 12, lineHeight: 1.1, letterSpacing: '0.05em'
 }}>
 Mémorial du Sud
 </h1>

 {/* Sous-titre */}
 <div style={{ fontSize: 16, color: 'rgba(232,213,163,0.6)', marginBottom: 8, fontFamily: 'Tajawal, sans-serif', letterSpacing: '0.2em' }}>
 ذاكرة الجنوب المغربي
 </div>

 {/* Ligne dorée */}
 <div style={{ width: 80, height: 2, margin: '16px auto 28px', background: 'linear-gradient(90deg, transparent, #D4A017, transparent)' }} />

 {/* Badges anniversaires */}
 <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
 {["68e Anniversaire Dcheira", "68e Anniversaire M'Hamid", "50e Évacuation du Sahara"].map((t, i) => (
 <span key={i} style={{
 background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.4)',
 borderRadius: 50, padding: '5px 14px', fontSize: 11,
 color: '#D4A017', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em'
 }}>{t}</span>
 ))}
 </div>

 {/* Bouton entrer */}
 <button
 onClick={() => setEntered(true)}
 style={{
 background: 'linear-gradient(135deg, #D4A017, #F5C842)',
 color: '#3D1F00', fontFamily: 'Cinzel, serif', fontWeight: 900,
 fontSize: 15, letterSpacing: '0.15em', border: 'none',
 borderRadius: 50, padding: '16px 52px', cursor: 'pointer',
 boxShadow: '0 8px 32px rgba(212,160,23,0.5)',
 transition: 'transform 0.2s, box-shadow 0.2s',
 animation: 'float 4s ease-in-out infinite'
 }}
 onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,160,23,0.7)' }}
 onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,160,23,0.5)' }}
 >
 Entrer dans le Musée 
 </button>

 {/* Scroll hint */}
 <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'float 2s ease-in-out infinite' }}>
 <div style={{ fontSize: 10, color: 'rgba(212,160,23,0.4)', letterSpacing: '0.2em', fontFamily: 'Cinzel, serif' }}>DÉCOUVRIR</div>
 <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(212,160,23,0.6), transparent)' }} />
 </div>
 </div>
 </div>
 )
 }

 // VUE GALERIE PLEINE PAGE 
 if (viewingGallery && activeHall) {
 const hall = halls.find(h => h.id === activeHall)
 const hallIndex = halls.findIndex(h => h.id === activeHall)
 const prevHall = halls[(hallIndex - 1 + halls.length) % halls.length]
 const nextHall = halls[(hallIndex + 1) % halls.length]

 return (
 <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'Jost, sans-serif' }}>

 {/* Header */}
 <header className="museum-header">
 <div className="museum-logo">MÉMORIAL <span>DU SUD</span></div>
 <button onClick={backToHome} style={{
 display: 'flex', alignItems: 'center', gap: 8,
 background: 'transparent', border: '1px solid var(--border-mid)',
 color: 'var(--text)', padding: '8px 20px', cursor: 'pointer',
 fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500,
 letterSpacing: '0.15em', textTransform: 'uppercase',
 transition: 'all 0.2s'
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text)' }}
 >
 ← Retour aux Galeries
 </button>
 <div style={{ display: 'flex', gap: 8 }}>
 <button onClick={() => { setActiveHall(prevHall.id); if (!visitedHalls.includes(prevHall.id)) setVisitedHalls(p => [...p, prevHall.id]) }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-soft)', padding: '7px 16px', cursor: 'pointer', fontSize: 11, fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}>← {prevHall.emoji}</button>
 <button onClick={() => { setActiveHall(nextHall.id); if (!visitedHalls.includes(nextHall.id)) setVisitedHalls(p => [...p, nextHall.id]) }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-soft)', padding: '7px 16px', cursor: 'pointer', fontSize: 11, fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}>{nextHall.emoji} →</button>
 </div>
 </header>

 {/* Hero de la galerie */}
 <div style={{ position: 'relative', height: 340, overflow: 'hidden', background: 'var(--dark)' }}>
 {hall.images?.[0] && (
 <img src={hall.images[0]} alt={hall.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, filter: 'sepia(20%)' }} />
 )}
 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,20,16,0.2) 0%, rgba(26,20,16,0.75) 100%)' }} />
 <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px' }}>
 <div style={{ fontSize: 40, marginBottom: 12 }}>{hall.emoji}</div>
 <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'rgba(201,168,76,0.8)' }}>Collection</div>
 <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, color: 'white', marginBottom: 16, letterSpacing: '0.03em' }}>
 {hall.title}
 </h1>
 <div style={{ width: 40, height: 1, background: 'var(--gold)', marginBottom: 16, opacity: 0.6 }} />
 <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 600, lineHeight: 1.7, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
 {hall.desc}
 </p>
 </div>

 {/* Breadcrumb */}
 <div style={{ position: 'absolute', top: 20, left: 40, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>
 <span style={{ cursor: 'pointer', color: 'var(--gold)' }} onClick={backToHome}>Galeries</span>
 <span>/</span>
 <span>{hall.title}</span>
 </div>
 </div>

 {/* Contenu principal */}
 <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>

 {/* Barre d'actions */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
 <div>
 <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', marginBottom: 4 }}>
 {hall.images?.length || hall.content?.length || 0} {hall.images ? 'photographies' : 'documents'}
 </div>
 <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: 'var(--dark)' }}>
 {hall.title}
 </div>
 </div>
 <div style={{ display: 'flex', gap: 10 }}>
               {!isSpeaking ? (
                <button className="btn-outline" onClick={() => speak(hall.desc)}>Écouter</button>
              ) : (
                <button className="btn-red" style={{ padding: '8px 20px', fontSize: 11, borderRadius: 2 }}
                  onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false) }}>
                  Pause
                </button>
              )}
 {isTourActive && (
 <button className="btn-gold" onClick={() => nextStep(tourStep)}>
 Étape suivante →
 </button>
 )}
 </div>
 </div>

 {/* GRILLE PHOTOS */}
 {hall.images && (
 <GaleriePhotos images={hall.images} content={null} />
 )}

 {/* ARCHIVES */}
 {hall.content && (
 <div>
 <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 24, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
 {hall.desc}
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
 {hall.content.map((item, i) => {
 const isVideo = item.type === 'video' || item.type === 'video_locale'
 const isAudio = item.type === 'audio'
 const ytId = item.url?.includes('youtu') ? (item.url.match(/youtu\.be\/([^?&/]+)/)?.[1] || item.url.match(/[?&]v=([^&]+)/)?.[1]) : null
 const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null
 const typeColor = isVideo ? '#dc2626' : isAudio ? '#7c3aed' : '#2563eb'
 const typeLabel = isVideo ? 'Vidéo' : isAudio ? 'Audio' : 'Document'
 return (
 <div key={i} onClick={() => setSelectedDoc(item)} style={{
 display: 'flex', alignItems: 'center', gap: 16,
 background: 'white', border: '1px solid var(--border)',
 padding: 16, cursor: 'pointer', transition: 'all 0.2s',
 borderRadius: 2
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,20,16,0.08)' }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
 >
 <div style={{ width: 80, height: 56, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: 'var(--cream-dark)' }}>
 {ytThumb ? <img src={ytThumb} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: isAudio ? '#ede9fe' : '#dbeafe' }}>{isAudio ? '' : ''}</div>}
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: 9, color: typeColor, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4, fontFamily: 'Jost, sans-serif' }}>{typeLabel}</div>
 <div style={{ fontSize: 14, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>{item.title}</div>
 {item.credit && <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{item.credit}</div>}
 </div>
 <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>Ouvrir →</div>
 </div>
 )
 })}
 </div>
 </div>
 )}

 {/* Viewer document */}
 {selectedDoc && <DocumentViewer item={selectedDoc} onClose={() => setSelectedDoc(null)} />}
 </div>

 {/* Navigation bas */}
 <div style={{ borderTop: '1px solid var(--border)', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
 <button onClick={() => { setActiveHall(prevHall.id); if (!visitedHalls.includes(prevHall.id)) setVisitedHalls(p => [...p, prevHall.id]) }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
 <span style={{ fontSize: 20 }}>{prevHall.emoji}</span>
 <div style={{ textAlign: 'left' }}>
 <div style={{ fontSize: 9, color: 'var(--text-soft)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Précédent</div>
 <div style={{ fontSize: 14, fontFamily: 'Cormorant Garamond, serif', color: 'var(--dark)', fontWeight: 600 }}>{prevHall.title}</div>
 </div>
 </button>
 <button onClick={backToHome} className="btn-primary">Toutes les Galeries</button>
 <button onClick={() => { setActiveHall(nextHall.id); if (!visitedHalls.includes(nextHall.id)) setVisitedHalls(p => [...p, nextHall.id]) }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', textAlign: 'right' }}>
 <div>
 <div style={{ fontSize: 9, color: 'var(--text-soft)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Suivant</div>
 <div style={{ fontSize: 14, fontFamily: 'Cormorant Garamond, serif', color: 'var(--dark)', fontWeight: 600 }}>{nextHall.title}</div>
 </div>
 <span style={{ fontSize: 20 }}>{nextHall.emoji}</span>
 </button>
 </div>

 <ChatbotRawi />
 </div>
 )
 }

 // MUSÉE 
 return (
 <div className="museum-layout" style={{ minHeight: '100vh', padding: '0 0 40px' }}>

 {/* MODAL STATS */}
 {showStats && (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(8px)' }}>
 <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: 28, width: 320, textAlign: 'center', boxShadow: '0 20px 60px rgba(26,20,16,0.15)' }}>
 <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'Jost, sans-serif', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }}>Statistiques</div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
 <StatCard title="Galeries" value={visitedHalls.length} subtitle="visitées" icon="" />
 <StatCard title="Quiz" value={`${quizScore}/15`} subtitle="score" icon="" />
 <StatCard title="Points" value={visitedHalls.length * 35 + quizScore * 10} subtitle="accumulés" icon="" />
 <StatCard title="Badges" value="1" subtitle="débloqués" icon="" />
 </div>
 <button className="btn-red" style={{ width: '100%', padding: 10, fontSize: 12, borderRadius: 12 }} onClick={() => setShowStats(false)}>Fermer</button>
 </div>
 </div>
 )}

 {/* HEADER NAVIGATION */}
 <header style={{
 background: 'white',
 borderBottom: '1px solid var(--border)',
 position: 'sticky', top: 0, zIndex: 100,
 boxShadow: '0 2px 12px rgba(26,20,16,0.06)'
 }}>
 {/* Barre supérieure dorée */}
 <div style={{ height: 3, background: 'linear-gradient(90deg, #8B1A1A, #C9A84C, #1A3D2B, #C9A84C, #8B1A1A)', backgroundSize: '200% 100%', animation: 'barFlow 4s linear infinite' }} />

 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 64 }}>

 {/* Logo */}
 <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--dark)', letterSpacing: '0.06em', cursor: 'pointer', flexShrink: 0 }}
 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
 MÉMORIAL <span style={{ color: 'var(--gold)' }}>DU SUD</span>
 </div>

 {/* Navigation centrale */}
 <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
 {[
 { label: 'Accueil', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
 { label: 'Galeries', action: () => document.getElementById('galeries-section')?.scrollIntoView({ behavior: 'smooth' }) },
 { label: 'Carte', action: () => document.getElementById('carte-section')?.scrollIntoView({ behavior: 'smooth' }) },
 { label: 'Quiz', action: () => document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' }) },
 ].map((item, i) => (
 <button key={i} onClick={item.action} style={{
 background: 'transparent', border: 'none',
 padding: '6px 14px', cursor: 'pointer',
 fontFamily: 'Jost, sans-serif', fontSize: 11,
 fontWeight: 500, letterSpacing: '0.12em',
 textTransform: 'uppercase', color: 'var(--text-mid)',
 display: 'flex', alignItems: 'center', gap: 5,
 transition: 'color 0.2s', borderBottom: '2px solid transparent',
 height: 64
 }}
 onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderBottomColor = 'var(--gold)' }}
 onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderBottomColor = 'transparent' }}
 >
 <span style={{ fontSize: 13 }}>{item.icon}</span>
 {item.label}
 </button>
 ))}
 </nav>

 {/* Boutons droite */}
 <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>

 <button onClick={startTour} style={{
 background: 'transparent', border: '1px solid var(--border-mid)',
 color: 'var(--text-mid)', padding: '7px 16px', cursor: 'pointer',
 fontFamily: 'Jost, sans-serif', fontSize: 10, fontWeight: 500,
 letterSpacing: '0.15em', textTransform: 'uppercase',
 display: 'flex', alignItems: 'center', gap: 6,
 transition: 'all 0.2s'
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-mid)' }}
 >
 Visite guidée
 </button>

 <button onClick={() => setShowStats(true)} style={{
 background: 'var(--dark)', border: 'none',
 color: 'white', padding: '7px 16px', cursor: 'pointer',
 fontFamily: 'Jost, sans-serif', fontSize: 10, fontWeight: 500,
 letterSpacing: '0.12em', textTransform: 'uppercase',
 display: 'flex', alignItems: 'center', gap: 6,
 transition: 'background 0.2s'
 }}
 onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-dark)'}
 onMouseLeave={e => e.currentTarget.style.background = 'var(--dark)'}
 >
 {visitedHalls.length}/4
 </button>

 {/* Mode visiteur / enseignant */}
 <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
 <button onClick={() => setUserMode('visiteur')} style={{
   padding: '6px 14px', fontSize: 10, cursor: 'pointer',
   fontFamily: 'Jost, sans-serif', fontWeight: 500, letterSpacing: '0.1em',
   textTransform: 'uppercase',
   background: userMode === 'visiteur' ? 'var(--dark)' : 'transparent',
   color: userMode === 'visiteur' ? 'white' : 'var(--text-soft)',
   border: 'none', transition: 'all 0.2s'
 }}>Visiteur</button>
 <button onClick={() => setUserMode('enseignant')} style={{
   padding: '6px 14px', fontSize: 10, cursor: 'pointer',
   fontFamily: 'Jost, sans-serif', fontWeight: 500, letterSpacing: '0.1em',
   textTransform: 'uppercase',
   background: userMode === 'enseignant' ? 'var(--gold)' : 'transparent',
   color: userMode === 'enseignant' ? 'white' : 'var(--text-soft)',
   border: 'none', borderLeft: '1px solid var(--border)', transition: 'all 0.2s'
 }}>Enseignant</button>
 </div>
 </div>
 </div>

 {/* Sous-menu À propos si mode enseignant */}
 {userMode === 'enseignant' && (
 <div style={{ background: 'rgba(201,168,76,0.06)', borderTop: '1px solid var(--border)', padding: '8px 40px', display: 'flex', alignItems: 'center', gap: 20 }}>
 <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'Jost, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}> Mode Enseignant</span>
 <span style={{ width: 1, height: 14, background: 'var(--border-mid)' }} />
 <button onClick={generateTeacherPDF} style={{ background: 'none', border: 'none', fontSize: 10, color: 'var(--text-mid)', cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}
  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mid)'}
>Fiche de cours</button>
 <button onClick={() => setShowStats(true)} style={{ background: 'none', border: 'none', fontSize: 10, color: 'var(--text-mid)', cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}> Statistiques</button>
 </div>
 )}
 </header>

 {/* GRID */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, padding: '24px 32px 0' }}>

 {/* GAUCHE */}
 <div style={{ gridColumn: 'span 12' }} className="lg:col-span-3">
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
 <StatCard title="Galeries" value={visitedHalls.length} subtitle="visitées" icon="" />
 <StatCard title="Points" value={visitedHalls.length * 35 + quizScore * 10} subtitle="accumulés" icon="" />
 <StatCard title="Badges" value="1" subtitle="débloqués" icon="" />
 <StatCard title="Quiz" value={`${quizScore}/15`} subtitle="score" icon="" />
 </div>
 <div className="card-sahara" style={{ padding: 14 }}>
 <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>Mode d'accès</div>
 <div style={{ display: 'flex', gap: 8 }}>
 <button onClick={() => setUserMode('visiteur')} style={{
   flex: 1, padding: '9px 0', fontSize: 10, cursor: 'pointer',
   fontFamily: 'Jost, sans-serif', fontWeight: 600, letterSpacing: '0.12em',
   textTransform: 'uppercase', border: '1px solid var(--border)', borderRadius: 2,
   background: userMode === 'visiteur' ? 'var(--dark)' : 'white',
   color: userMode === 'visiteur' ? 'white' : 'var(--text-soft)',
   transition: 'all 0.2s'
 }}>Visiteur</button>
 <button onClick={() => setUserMode('enseignant')} style={{
   flex: 1, padding: '9px 0', fontSize: 10, cursor: 'pointer',
   fontFamily: 'Jost, sans-serif', fontWeight: 600, letterSpacing: '0.12em',
   textTransform: 'uppercase', border: '1px solid var(--border)', borderRadius: 2,
   background: userMode === 'enseignant' ? 'var(--gold)' : 'white',
   color: userMode === 'enseignant' ? 'white' : 'var(--text-soft)',
   transition: 'all 0.2s'
 }}>Enseignant</button>
 </div>
 </div>
 </div>

 {/* CENTRE — CARTE */}
 <div id="carte-section" style={{ gridColumn: 'span 12' }} className="lg:col-span-6">
 <div className="card-sahara" style={{ padding: 14, height: 520, display: 'flex', flexDirection: 'column' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
 <span></span>
 <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif' }}>Exploration Géographique</span>
 </div>
 <div style={{ display: 'flex', gap: 6 }}>
 <div onClick={() => handleHallSelect('batailles')} style={{ background: 'rgba(139,26,26,0.2)', border: '1px solid rgba(139,26,26,0.4)', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontSize: 10, color: '#fca5a5', fontFamily: 'Tajawal, sans-serif' }}> Dcheira</div>
 <div onClick={() => handleHallSelect('royale')} style={{ background: 'rgba(26,61,43,0.2)', border: '1px solid rgba(26,61,43,0.4)', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontSize: 10, color: '#86efac', fontFamily: 'Tajawal, sans-serif' }}> M'Hamid</div>
 </div>
 </div>
 <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(212,160,23,0.2)', position: 'relative' }}>
 <MapContainer center={[28.5, -9.5]} zoom={5} style={{ height: '100%', width: '100%' }}>
 <TileLayer
                   url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                   attribution='&copy; Esri'
                 />
                 {/* Overlay sombre pour effet nuit */}
                 <TileLayer
                   url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                   attribution=''
                   opacity={0.7}
                 />
 <Polyline positions={[[27.9,-12.8],[28.5,-10.0],[29.828,-5.723]]} pathOptions={{color:'rgba(245,200,66,0.15)',weight:14,opacity:1}} />
 <Polyline positions={[[27.9,-12.8],[28.5,-10.0],[29.828,-5.723]]} pathOptions={{color:'#F5C842',weight:3,opacity:1,dashArray:'10, 12'}} />
 <Marker position={[27.9, -12.8]} icon={markerRed} eventHandlers={{ click: () => handleHallSelect('batailles') }}>
 <Popup>
 <div style={{ fontFamily: 'Tajawal, sans-serif', minWidth: 170, background: '#0D1520', padding: 12, borderRadius: 10, border: '1px solid rgba(212,160,23,0.3)' }}>
 <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A017', fontFamily: 'Cinzel, serif', marginBottom: 4 }}> Dcheira</div>
 <div style={{ fontSize: 10, color: '#C4A96B', lineHeight: 1.5 }}>Bataille du <strong>13 janvier 1958</strong><br/>Armée de Libération du Sud</div>
 <div style={{ fontSize: 9, color: 'rgba(212,160,23,0.5)', borderTop: '1px solid rgba(212,160,23,0.15)', paddingTop: 6, marginTop: 6 }}> 27.1°N, 13.3°O</div>
 </div>
 </Popup>
 </Marker>
 <Marker position={[29.828, -5.723]} icon={markerGreen} eventHandlers={{ click: () => handleHallSelect('royale') }}>
 <Popup>
 <div style={{ fontFamily: 'Tajawal, sans-serif', minWidth: 180, background: '#0D1520', padding: 12, borderRadius: 10, border: '1px solid rgba(212,160,23,0.3)' }}>
 <div style={{ fontSize: 13, fontWeight: 700, color: '#D4A017', fontFamily: 'Cinzel, serif', marginBottom: 4 }}> M'Hamid El Ghizlane</div>
 <div style={{ fontSize: 10, color: '#C4A96B', lineHeight: 1.5 }}>Discours de <strong>Mohammed V</strong><br/><strong>25 février 1958</strong></div>
 <div style={{ fontSize: 9, color: 'rgba(212,160,23,0.5)', borderTop: '1px solid rgba(212,160,23,0.15)', paddingTop: 6, marginTop: 6 }}> 29.8°N, 5.7°O</div>
 </div>
 </Popup>
 </Marker>
 </MapContainer>
 {/* Légende */}
 <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'rgba(7,11,20,0.92)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: 10, padding: '8px 12px', backdropFilter: 'blur(8px)' }}>
 <div style={{ fontSize: 9, color: 'rgba(212,160,23,0.6)', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginBottom: 6 }}>SITES HISTORIQUES</div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#fca5a5' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B1A1A', border: '1px solid #D4A017' }}/>Dcheira 1958</div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#86efac' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1A3D2B', border: '1px solid #D4A017' }}/>M'Hamid 1958</div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* DROITE — Quiz + Enseignant */}
 <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 12 }} className="lg:col-span-3">

 {/* Espace Enseignant / Visiteur */}
 {userMode === 'enseignant' ? (
 <div className="card-sahara" style={{ padding: 16 }}>
 <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Jost, sans-serif' }}> Espace Enseignant</div>
 <p style={{ fontSize: 11, color: 'var(--text-soft)', marginBottom: 12, lineHeight: 1.6, fontStyle: 'italic' }}>Accédez aux archives pédagogiques et préparez vos séances avec des ressources historiques enrichies.</p>
 <a href="/files/fiche_cours.pdf" download style={{ display: 'block' }}>
 <button className="btn-gold" style={{ width: '100%', padding: 10, fontSize: 11 }}> Télécharger la Fiche de Cours</button>
 </a>
 <button className="btn-outline" style={{ width: '100%', padding: 8, fontSize: 11, marginTop: 8 }} onClick={() => setShowStats(true)}> Statistiques élèves</button>
 </div>
 ) : (
 <div className="card-sahara" style={{ padding: 16 }}>
 <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Jost, sans-serif' }}> Conseil de visite</div>
 <p style={{ fontSize: 11, color: 'var(--text-soft)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
 Cliquez sur une galerie pour l'explorer. Utilisez la visite guidée pour un parcours complet.
 </p>
 <button className="btn-gold" style={{ width: '100%', padding: 10, fontSize: 11 }} onClick={startTour}>Commencer la visite guidée</button>
 </div>
 )}

 {/* QUIZ */}
 <div id="quiz-section">
 <Quiz onScoreUpdate={setQuizScore} />
 </div>
 </div>
 </div>

 {/* GALERIES — Style cartes Mucha */}
 <div id="galeries-section" style={{ marginTop: 24 }}>
 <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 32px' }}>
 <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Collections</div>
 <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 300, color: 'var(--dark)', letterSpacing: '0.05em' }}>Nos <strong>Galeries</strong></h2>
 <div style={{ width: 40, height: 1, margin: '12px auto 0', background: 'var(--gold)' }} />
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, padding: '0 32px' }} className="md:grid-cols-4">
 {halls.map((hall, idx) => {
                const coverMap = {
                  batailles: '/covers/dcheira.jpeg',
                  royale: '/covers/mhamidghizlane.jpeg',
                  patrimoine: '/covers/patrimoine.jpeg',
                  archives: '/covers/archives.jpeg'
                }
                const coverImg = coverMap[hall.id] || hall.images?.[0] || null
 const isActive = activeHall === hall.id
 const isVisited = visitedHalls.includes(hall.id)
 const accentColors = ['#8B1A1A', '#1A3D2B', '#C4A96B', '#1a1c3a']
 return (
 <div key={hall.id} onClick={() => handleHallSelect(hall.id)} className={`gallery-card ${isActive ? 'active' : ''}`} style={{
 position: 'relative', aspectRatio: '3/4',
 }}
 onMouseEnter={e => { if (!isActive) { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5)' } }}
 onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(212,160,23,0.15)'; e.currentTarget.style.boxShadow = 'none' } }}
 >
 {/* Image de couverture */}
 {coverImg && (
 <img src={coverImg} alt={hall.title} className="gallery-card-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
 )}
 {/* Dégradé */}
 <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${accentColors[idx]}ee 0%, rgba(7,11,20,0.3) 60%, transparent 100%)` }} />

 {/* Badge visité */}
 {isVisited && (
 <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', borderRadius: 2, padding: '3px 10px', fontSize: 9, color: 'var(--gold-dark)', fontWeight: 600, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em', border: '1px solid var(--border)' }}> Visité</div>
 )}
 {isActive && (
 <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--gold)', borderRadius: 2, padding: '3px 10px', fontSize: 9, color: 'white', fontWeight: 600, fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}>EN COURS</div>
 )}

 {/* Contenu bas */}
 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 16px 16px', background: 'linear-gradient(to top, rgba(26,20,16,0.95) 0%, rgba(26,20,16,0.6) 60%, transparent 100%)' }}>
 <div style={{ fontSize: 20, marginBottom: 4 }}>{hall.emoji}</div>
 <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 600, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>{hall.title}</div>
 <div style={{ width: 24, height: 1, background: 'var(--gold)', marginBottom: 8, opacity: 0.7 }} />
 <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'Jost, sans-serif', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
 {hall.desc.substring(0, 75)}...
 </div>
 <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--gold)', fontFamily: 'Jost, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
 Explorer <span>→</span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>

       {/* IOT DASHBOARD */}
      <IotDashboard />

      {/* TIMELINE */}
      <Timeline />

      <ChatbotRawi />
 </div>
 )
}
