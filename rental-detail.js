const API='https://app.getaptly.com/api/portal/listings/yDgjRcz9hTcv4iav4';
const CONTEXT_API='https://app.getaptly.com/api/portal/context/';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((c||0)/100);
const slug=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120);
const routeId=()=>{const match=location.pathname.match(/^\/rentals\/[^/]+\/[^/]+\/([^/]+)\/?$/i);if(!match)return'';try{return decodeURIComponent(match[1])}catch{return''}};
const id=new URLSearchParams(location.search).get('id')||routeId();
const zones={'US/Eastern':'America/New_York','US/Central':'America/Chicago','US/Mountain':'America/Denver','US/Pacific':'America/Los_Angeles','US/Arizona':'America/Phoenix','US/Alaska':'America/Anchorage','US/Hawaii':'Pacific/Honolulu'};
const zoneLabels={'US/Eastern':'Eastern Time','US/Central':'Central Time','US/Mountain':'Mountain Time','US/Pacific':'Pacific Time','US/Arizona':'Arizona Time','US/Alaska':'Alaska Time','US/Hawaii':'Hawaii Time'};
let galleryPhotos=[],viewerIndex=0;

function street(p){return p.address?.address||p.address?.streetName||p.marketingName||p.name}
function listingUrl(p){return `/rentals/${slug(p.address?.city||'central-texas')}-${slug(p.address?.stateCode||p.address?.state||'tx')}/${slug(street(p))||'rental-home'}/${encodeURIComponent(p._id)}`}
function feedUrl(){return[...arguments].find(v=>typeof v==='string'&&/^https:\/\//.test(v))}
function tour(p){return feedUrl(p.aptlyShowings?.link,p.aptlyShowings?.url,p.links?.tour,p.tourUrl)||(p.aptlyShowings?.active&&p.companyId&&p._id?`https://portal.getaptly.com/${encodeURIComponent(p.companyId)}/showing/app/showing/create/?cId=${encodeURIComponent(p._id)}`:'https://portal.getaptly.com/search/yDgjRcz9hTcv4iav4/')}
function apply(p){return feedUrl(p.aptlyScreening?.link,p.links?.apply,p.applyUrl)||'https://portal.getaptly.com/search/yDgjRcz9hTcv4iav4/'}

function setMeta(selector,value,attribute='content'){let node=$(selector);if(!node&&selector==='#canonicalUrl'){node=document.createElement('link');node.id='canonicalUrl';node.rel='canonical';document.head.append(node)}if(node&&value)node.setAttribute(attribute,value)}
function injectSeo(p,pics,type){
  const address=p.address||{},formatted=address.formattedAddress||address.standardAddress||street(p),rent=money(p.marketRent?.amount),title=`${street(p)}, ${address.city}, ${address.stateCode} for Rent | J R Grace Realty`,description=`${formatted}: ${p.beds} bedroom, ${p.baths} bathroom ${String(type).toLowerCase()} for rent at ${rent} per month${p.totalArea?` with ${Number(p.totalArea).toLocaleString()} square feet`:''}. View photos, features, tour times, nearby schools, and application details.`.slice(0,300),canonical=new URL(listingUrl(p),location.origin).href,image=pics[0];
  document.title=title;setMeta('#seoDescription',description);setMeta('#ogTitle',title);setMeta('#ogDescription',description);setMeta('#ogUrl',canonical);setMeta('#twitterTitle',title);setMeta('#twitterDescription',description);setMeta('#canonicalUrl',canonical,'href');if(image)setMeta('#ogImage',image);
  const pets=p.petsAllowed?'Pets are allowed; restrictions and pet charges may apply.':'Contact J R Grace Realty to confirm the current pet policy.',tourAnswer=p.aptlyShowings?.active?'Yes. Available self-tour windows are loaded from Aptly on this page and confirmed during reservation.':'Contact J R Grace Realty for the current showing options.',faqs=[
    [`How much is the monthly rent for ${street(p)}?`,`${rent} per month is the current advertised base rent. Final lease terms and conditional fees control.`],
    [`How many bedrooms and bathrooms does this rental have?`,`${street(p)} has ${p.beds} bedroom${Number(p.beds)===1?'':'s'} and ${p.baths} bathroom${Number(p.baths)===1?'':'s'}${p.totalArea?`, with approximately ${Number(p.totalArea).toLocaleString()} square feet`:''}.`],
    [`Can I schedule a tour of ${street(p)}?`,tourAnswer],
    [`Are pets allowed at ${street(p)}?`,pets]
  ];
  $('#listingFaq').innerHTML=faqs.map(([question,answer],i)=>`<details${i===0?' open':''}><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('');
  const coords=listingCoordinates(p),schema={'@context':'https://schema.org','@graph':[{'@type':'RealEstateListing','@id':`${canonical}#listing`,identifier:p._id,name:title,url:canonical,description,datePosted:p.createdAt||undefined,dateModified:p.updatedAt||undefined,image:pics.slice(0,20),provider:{'@type':'RealEstateAgent',name:'J R Grace Realty',telephone:'+1-254-400-2863',email:'hello@jrgrace.com',url:`${location.origin}/`},offers:{'@type':'Offer',price:Number(p.marketRent?.amount||0)/100,priceCurrency:'USD',availability:'https://schema.org/InStock',url:apply(p)},mainEntity:{'@type':/apartment/i.test(type)?'Apartment':'SingleFamilyResidence',name:formatted,address:{'@type':'PostalAddress',streetAddress:address.address,addressLocality:address.city,addressRegion:address.stateCode,postalCode:address.postalCode,addressCountry:'US'},geo:coords?{'@type':'GeoCoordinates',latitude:coords.lat,longitude:coords.lon}:undefined,numberOfBedrooms:p.beds,numberOfBathroomsTotal:p.baths,floorSize:p.totalArea?{'@type':'QuantitativeValue',value:Number(p.totalArea),unitCode:'FTK'}:undefined,petsAllowed:p.petsAllowed}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'J R Grace Realty',item:`${location.origin}/`},{'@type':'ListItem',position:2,name:'Homes for Rent',item:`${location.origin}/rental-search.html`},{'@type':'ListItem',position:3,name:street(p),item:canonical}]},{'@type':'FAQPage',mainEntity:faqs.map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))}]};
  $('#listingStructuredData')?.remove();const script=document.createElement('script');script.type='application/ld+json';script.id='listingStructuredData';script.textContent=JSON.stringify(schema);document.head.appendChild(script);
}

function renderGallery(p,pics){
  galleryPhotos=pics;const visible=pics.slice(0,5),remaining=Math.max(0,pics.length-5);
  $('#gallery').innerHTML=visible.map((src,i)=>`<button class="gallery-photo gallery-photo-${i+1}" data-photo="${i}" aria-label="Open photo ${i+1} of ${pics.length}"><img src="${esc(src)}" alt="${esc(p.address?.formattedAddress||street(p))} rental property photo ${i+1}">${i===4&&remaining?`<span class="more-photos">+${remaining} photos</span>`:''}</button>`).join('');
  $('#viewerThumbs').innerHTML=pics.map((src,i)=>`<button data-viewer-photo="${i}" aria-label="View photo ${i+1}"><img loading="lazy" src="${esc(src)}" alt=""></button>`).join('');
  $('#viewerTitle').textContent=street(p);
}
function showViewer(index){viewerIndex=(index+galleryPhotos.length)%galleryPhotos.length;const viewer=$('#photoViewer'),image=viewer.querySelector('figure img');image.src=galleryPhotos[viewerIndex];image.alt=`Property photo ${viewerIndex+1} of ${galleryPhotos.length}`;$('#viewerCount').textContent=`${viewerIndex+1} / ${galleryPhotos.length}`;viewer.querySelectorAll('[data-viewer-photo]').forEach((button,i)=>button.classList.toggle('active',i===viewerIndex));viewer.querySelector(`[data-viewer-photo="${viewerIndex}"]`)?.scrollIntoView({inline:'center',block:'nearest'});if(!viewer.open)viewer.showModal()}
$('#gallery').addEventListener('click',e=>{const button=e.target.closest('[data-photo]');if(button)showViewer(Number(button.dataset.photo))});
$('#photoViewer').addEventListener('click',e=>{if(e.target.closest('.viewer-close'))return $('#photoViewer').close();if(e.target.closest('.viewer-prev'))return showViewer(viewerIndex-1);if(e.target.closest('.viewer-next'))return showViewer(viewerIndex+1);const thumb=e.target.closest('[data-viewer-photo]');if(thumb)return showViewer(Number(thumb.dataset.viewerPhoto));if(e.target===$('#photoViewer'))$('#photoViewer').close()});
document.addEventListener('keydown',e=>{if(!$('#photoViewer').open)return;if(e.key==='ArrowLeft')showViewer(viewerIndex-1);if(e.key==='ArrowRight')showViewer(viewerIndex+1)});

function localParts(date,timeZone){const parts=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date),n=type=>Number(parts.find(x=>x.type===type)?.value||0);return{year:n('year'),month:n('month'),day:n('day'),hour:n('hour'),minute:n('minute')}}
function formatTime(value){const hour=Math.floor(value/100),minute=value%100;return new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(new Date(Date.UTC(2020,0,1,hour,minute)))}
function tourIso(dateKey,value,timeZone){const hour=String(Math.floor(value/100)).padStart(2,'0'),minute=String(value%100).padStart(2,'0'),offset=(new Intl.DateTimeFormat('en-US',{timeZone,timeZoneName:'longOffset'}).formatToParts(new Date(`${dateKey}T12:00:00Z`)).find(x=>x.type==='timeZoneName')?.value||'GMT+00:00').replace('GMT','')||'+00:00';return new Date(`${dateKey}T${hour}:${minute}:00${offset}`).toISOString()}
function tourDay(calendar,dateKey,schedule){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)||dateKey<schedule.today||dateKey>schedule.maxDate)return null;
  const date=new Date(`${dateKey}T12:00:00Z`);if(Number.isNaN(date.getTime()))return null;
  const range=calendar?.multiTimeRanges?.[String(date.getUTCDay())];if(!range?.active)return null;
  const times=[];
  for(const slot of range.slots||[]){let cursor=Math.floor(slot.startTime/100)*60+slot.startTime%100,end=Math.floor(slot.endTime/100)*60+slot.endTime%100;while(cursor<end){const value=Math.floor(cursor/60)*100+cursor%60;if(dateKey!==schedule.today||value>schedule.now.hour*100+schedule.now.minute)times.push(value);cursor+=schedule.duration}}
  if(!times.length)return null;
  const offset=Math.round((date-schedule.anchor)/86400000);return{date,dateKey,offset,times};
}
function tourDays(calendar){
  const zoneKey=calendar?.businessHours?.timezone,duration=Number(calendar?.tourDurationMin);
  if(!zoneKey||!Number.isFinite(duration)||duration<=0||!calendar?.multiTimeRanges)return null;
  const timeZone=zones[zoneKey]||zoneKey,now=localParts(new Date(),timeZone),today=`${now.year}-${String(now.month).padStart(2,'0')}-${String(now.day).padStart(2,'0')}`,anchor=new Date(Date.UTC(now.year,now.month-1,now.day,12)),maximum=new Date(anchor),days=[];
  maximum.setUTCFullYear(maximum.getUTCFullYear()+1);
  const schedule={days,zoneKey,timeZone,now,today,anchor,duration,maxDate:maximum.toISOString().slice(0,10)};
  for(let offset=0;offset<31&&days.length<5;offset++){const date=new Date(anchor);date.setUTCDate(date.getUTCDate()+offset);const day=tourDay(calendar,date.toISOString().slice(0,10),schedule);if(day)days.push(day)}
  return schedule;
}
function tourDateLabel(date){return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date)}
function tourMonthLabel(date){return new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(date)}
function tourCalendarDays(calendar,schedule,cursor,selectedKey){
  const year=cursor.getUTCFullYear(),month=cursor.getUTCMonth(),firstDay=new Date(Date.UTC(year,month,1)).getUTCDay(),count=new Date(Date.UTC(year,month+1,0)).getUTCDate(),cells=[];
  for(let i=0;i<firstDay;i++)cells.push('<span class="tour-calendar-empty" aria-hidden="true"></span>');
  for(let dayNumber=1;dayNumber<=count;dayNumber++){const key=`${year}-${String(month+1).padStart(2,'0')}-${String(dayNumber).padStart(2,'0')}`,date=new Date(`${key}T12:00:00Z`),available=tourDay(calendar,key,schedule),selected=key===selectedKey,label=tourDateLabel(date);cells.push(`<button type="button" class="tour-calendar-day${selected?' is-selected':''}" data-tour-date="${key}" aria-label="${label}${available?'':', unavailable'}" ${available?'':'disabled'} ${selected?'aria-current="date"':''}>${dayNumber}</button>`)}
  return cells.join('');
}
function tourBookingUrl(booking,dateIso){const url=new URL(booking,location.href);url.searchParams.set('tourDate',dateIso);return url.href}
function renderTours(p,context){
  const listingCalendar=context?.aptlyListings?.overrideCalendarEnabled?context.aptlyListings.overrideCalendar:context?.aptlyListings?.defaultCalendar;
  const companyListings=context?.companyInfo?.aptlyListings||{},calendar=listingCalendar||companyListings.defaultCalendar,enabled=p.aptlyShowings?.active&&calendar?.multiTimeRanges;
  const scheduler=$('#tourScheduler'),booking=tour(p);
  if(!enabled){scheduler.innerHTML=`<p class="tour-unavailable">Aptly is not currently publishing self-tour times for this home.</p><a class="gold-button" href="${esc(booking)}" target="_blank" rel="noopener">CHECK TOUR AVAILABILITY</a>`;return}
  const schedule=tourDays(calendar),days=schedule?.days||[];if(!schedule||!days.length){scheduler.innerHTML=`<p class="tour-unavailable">Aptly does not currently show an upcoming self-tour window for this home. Please check again later.</p><a class="gold-button" href="${esc(booking)}" target="_blank" rel="noopener">CHECK APTLY</a>`;return}
  let selected=days[0],chosenTime=null,calendarCursor=new Date(Date.UTC(selected.date.getUTCFullYear(),selected.date.getUTCMonth(),1));
  const refreshCalendar=dialog=>{const monthKey=`${calendarCursor.getUTCFullYear()}-${String(calendarCursor.getUTCMonth()+1).padStart(2,'0')}`,minimumMonth=schedule.today.slice(0,7),maximumMonth=schedule.maxDate.slice(0,7);dialog.querySelector('[data-tour-month-label]').textContent=tourMonthLabel(calendarCursor);dialog.querySelector('.tour-calendar-grid').innerHTML=tourCalendarDays(calendar,schedule,calendarCursor,selected.dateKey);dialog.querySelector('[data-tour-month="-1"]').disabled=monthKey<=minimumMonth;dialog.querySelector('[data-tour-month="1"]').disabled=monthKey>=maximumMonth};
  const draw=()=>{const quickIndex=days.findIndex(day=>day.dateKey===selected.dateKey),otherSelected=quickIndex<0,continueUrl=chosenTime==null?'':tourBookingUrl(booking,tourIso(selected.dateKey,chosenTime,schedule.timeZone));scheduler.innerHTML=`<div class="tour-days" role="tablist" aria-label="Tour dates published by Aptly">${days.map((day,i)=>`<button type="button" role="tab" aria-selected="${i===quickIndex}" class="${i===quickIndex?'is-selected':''}" data-tour-day="${i}"><span>${day.offset===0?'Today':day.offset===1?'Tomorrow':new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:'UTC'}).format(day.date)}</span><strong>${new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(day.date)}</strong></button>`).join('')}<button type="button" role="tab" aria-selected="${otherSelected}" class="tour-other${otherSelected?' is-selected':''}" data-tour-other><span>Other</span><strong><i class="tour-calendar-icon" aria-hidden="true"></i><span class="sr-only">Choose another date</span></strong></button></div>${otherSelected?`<p class="tour-selected-date">Available times for <strong>${tourDateLabel(selected.date)}</strong></p>`:''}<p class="tour-time-note">Scheduling windows are loaded directly from Aptly. Final availability is confirmed when you reserve. Times shown in ${zoneLabels[schedule.zoneKey]||schedule.zoneKey}.</p><div class="tour-times">${selected.times.map(time=>`<button type="button" class="${time===chosenTime?'is-selected':''}" data-tour-time="${time}">${formatTime(time)}</button>`).join('')}</div><a class="gold-button tour-continue ${chosenTime==null?'is-disabled':''}" ${chosenTime==null?'aria-disabled="true"':`href="${esc(continueUrl)}" target="_blank" rel="noopener"`}>${chosenTime==null?'SELECT A TOUR TIME':`CONTINUE WITH ${formatTime(chosenTime)}`}</a><dialog class="tour-date-dialog" aria-labelledby="tour-date-title"><div class="tour-date-panel"><button type="button" class="tour-date-close" aria-label="Close date picker">×</button><p class="kicker">SELF-TOUR THIS HOME</p><h3 id="tour-date-title">Choose another tour date</h3><p class="tour-date-help">Select an available date from the current Aptly tour calendar.</p><div class="tour-calendar-head"><button type="button" data-tour-month="-1" aria-label="Previous month">‹</button><strong data-tour-month-label>${tourMonthLabel(calendarCursor)}</strong><button type="button" data-tour-month="1" aria-label="Next month">›</button></div><div class="tour-calendar-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="tour-calendar-grid">${tourCalendarDays(calendar,schedule,calendarCursor,selected.dateKey)}</div><p class="tour-date-footnote">Available dates follow the current recurring schedule published by Aptly for the next 12 months.</p></div></dialog>`};
  scheduler.addEventListener('click',e=>{const quickDay=e.target.closest('[data-tour-day]');if(quickDay){selected=days[Number(quickDay.dataset.tourDay)];chosenTime=null;draw();return}if(e.target.closest('[data-tour-other]')){calendarCursor=new Date(Date.UTC(selected.date.getUTCFullYear(),selected.date.getUTCMonth(),1));draw();const dialog=scheduler.querySelector('.tour-date-dialog');dialog.showModal();dialog.querySelector('[data-tour-date]:not(:disabled)')?.focus();return}const dialog=e.target.closest('.tour-date-dialog');if(e.target.closest('.tour-date-close')){dialog.close();return}const monthButton=e.target.closest('[data-tour-month]');if(monthButton){calendarCursor=new Date(Date.UTC(calendarCursor.getUTCFullYear(),calendarCursor.getUTCMonth()+Number(monthButton.dataset.tourMonth),1));refreshCalendar(dialog);return}const dateButton=e.target.closest('[data-tour-date]');if(dateButton){const next=tourDay(calendar,dateButton.dataset.tourDate,schedule);if(next){selected=next;chosenTime=null;dialog.close();draw()}return}if(e.target===dialog){dialog.close();return}const time=e.target.closest('[data-tour-time]');if(time){chosenTime=Number(time.dataset.tourTime);draw();return}const disabled=e.target.closest('.tour-continue.is-disabled');if(disabled)e.preventDefault()});draw();
}

function listingCoordinates(p){
  const point=p.address?.geopoint;
  if(Array.isArray(point)&&point.length>=2){const lon=Number(point[0]),lat=Number(point[1]);if(Number.isFinite(lat)&&Number.isFinite(lon))return{lat,lon}}
  const lat=Number(point?.lat??point?.latitude??p.address?.lat??p.address?.latitude),lon=Number(point?.lon??point?.lng??point?.longitude??p.address?.lon??p.address?.lng??p.address?.longitude);
  return Number.isFinite(lat)&&Number.isFinite(lon)?{lat,lon}:null;
}
async function renderSchools(p){
  const coords=listingCoordinates(p),list=$('#schoolList');
  if(!coords||typeof L==='undefined'){list.innerHTML='<div class="school-empty"><p>School mapping is not available for this listing.</p></div>';return}
  try{
    const response=await fetch(`/api/nearby-schools?lat=${encodeURIComponent(coords.lat)}&lon=${encodeURIComponent(coords.lon)}`),data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.message||'Schools unavailable');
    const schools=Array.isArray(data.schools)?data.schools:[];
    if(!schools.length){list.innerHTML='<div class="school-empty"><p>No nearby schools were returned for this location.</p></div>';return}
    const map=L.map('schoolMap',{scrollWheelZoom:false}).setView([coords.lat,coords.lon],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const homeIcon=L.divIcon({className:'home-map-marker',html:'<span class="home-pin" aria-hidden="true">★</span>',iconSize:[42,42],iconAnchor:[21,21]});
    L.marker([coords.lat,coords.lon],{icon:homeIcon,zIndexOffset:1000}).addTo(map).bindPopup(`<b>${esc(street(p))}</b><span>Rental home location</span>`);const bounds=L.latLngBounds([[coords.lat,coords.lon]]);
    const legend=L.control({position:'bottomleft'});
    legend.onAdd=()=>{const node=L.DomUtil.create('div','school-map-legend');node.innerHTML='<span><i class="legend-home" aria-hidden="true">★</i> Rental home</span><span><i class="legend-school" aria-hidden="true">1</i> Nearby school</span>';return node};
    legend.addTo(map);
    list.innerHTML=schools.map((school,i)=>`<a class="school-card" href="${esc(school.url||'#')}" ${school.url?'target="_blank" rel="noopener"':''} data-school="${i}"><span class="school-number">${i+1}</span><span><h3>${esc(school.name)}</h3><p class="school-meta">${esc(school.type)} · ${esc(school.grades)} · ${Number(school.distance).toFixed(1)} mi</p><p class="school-address">${esc(school.address)}</p>${school.ratingBand?`<span class="school-band">${esc(school.ratingBand)}</span>`:''}</span></a>`).join('');
    const markers=schools.map((school,i)=>{const marker=L.marker([school.lat,school.lon],{icon:L.divIcon({className:'school-map-marker',html:`<span class="school-pin">${i+1}</span>`,iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map).bindPopup(`<b>${esc(school.name)}</b><span>${esc(school.grades)} · ${Number(school.distance).toFixed(1)} mi</span>${school.url?`<br><a href="${esc(school.url)}" target="_blank" rel="noopener">School details</a>`:''}`);bounds.extend([school.lat,school.lon]);return marker});
    list.addEventListener('mouseover',event=>{const card=event.target.closest('[data-school]');if(card)markers[Number(card.dataset.school)]?.openPopup()});
    map.fitBounds(bounds.pad(.12),{maxZoom:14,padding:[32,32]});setTimeout(()=>map.invalidateSize(),50);
  }catch(error){$('#nearbySchools').classList.add('schools-unavailable');list.innerHTML=`<div class="school-empty"><b>Nearby school information is not available yet.</b><p>${esc(error.message||'We are finishing the secure school-data connection for this feature.')}</p></div>`}
}

function render(p,all,context){
  const pics=p.marketingFiles?.length?p.marketingFiles:p.photo||[];document.title=`${street(p)}, ${p.address?.city}, TX for Rent | J R Grace Realty`;$('#crumbCity').textContent=`${p.address?.city}, ${p.address?.stateCode}`;$('#crumbStreet').textContent=street(p);renderGallery(p,pics);renderTours(p,context);$('#kicker').textContent=`AVAILABLE RENTAL IN ${(p.address?.city||'WACO').toUpperCase()}, ${p.address?.stateCode||'TX'}`;const type=p.buildingType||p.rentalCategory||'Home';$('#title').textContent=String(p.marketingName||'').trim()||`${p.beds}-Bedroom ${type} for Rent in ${p.address?.city}, ${p.address?.stateCode}`;$('#address').textContent=p.address?.formattedAddress||p.address?.standardAddress;$('#summary').textContent=`${street(p)} is an available ${p.beds}-bedroom, ${p.baths}-bathroom ${type.toLowerCase()} for rent in ${p.address?.city}, ${p.address?.stateCode} ${p.address?.postalCode}. The advertised rent is ${money(p.marketRent?.amount)} per month${p.totalArea?` for approximately ${Number(p.totalArea).toLocaleString()} square feet`:''}.`;$('#rent').textContent=money(p.marketRent?.amount);$('#beds').textContent=p.beds??'—';$('#baths').textContent=p.baths??'—';$('#area').textContent=p.totalArea?Number(p.totalArea).toLocaleString():'—';$('#features').innerHTML=[['PROPERTY TYPE',type],['ADDRESS',p.address?.formattedAddress],['PETS',p.petsAllowed?'Pets allowed':'Contact leasing'],['PARKING',p.parkingType||'Contact leasing'],['LAUNDRY',p.laundryType||'Contact leasing'],['DEPOSIT',money(p.deposit?.amount)]].map(x=>`<div><span>${esc(x[0])}</span><b>${esc(x[1])}</b></div>`).join('');$('#aboutHeading').textContent=`About this ${p.address?.city} rental`;$('#description').textContent=p.marketingDescription||'Contact JR Grace Realty for details about this available home.';$('#costRent').textContent=money(p.marketRent?.amount);$('#deposit').textContent=money(p.deposit?.amount);['tourSide','tourBottom'].forEach(x=>$('#'+x).href='#tour-times');['applySide','applyBottom'].forEach(x=>$('#'+x).href=apply(p));const similar=all.filter(x=>x._id!==p._id&&(x.address?.city===p.address?.city||x.beds===p.beds)).slice(0,3);$('#similar').innerHTML=similar.map(x=>`<article class="similar-card"><a href="${esc(listingUrl(x))}"><img src="${esc(x.marketingFiles?.[0]||x.photo?.[0]||'/assets/areas.jpg')}" alt="${esc(street(x))}"><div><b>${money(x.marketRent?.amount)}/mo</b><p>${x.beds} bd · ${x.baths} ba · ${x.totalArea?Number(x.totalArea).toLocaleString():'—'} sq ft</p><h3>${esc(street(x))}</h3><span>${esc(x.address?.city)}, ${esc(x.address?.stateCode)} ${esc(x.address?.postalCode)}</span></div></a></article>`).join('');$('#loading').hidden=true;$('#page').hidden=false;
}

async function loadListing(){
  const response=await fetch(API);if(!response.ok)throw new Error(`Feed returned ${response.status}`);
  const payload=await response.json(),all=(payload.data||[]).filter(item=>item.publishedForRent!==false),p=all.find(item=>String(item._id)===id);
  if(!p)throw new Error('not found');
  const canonicalPath=listingUrl(p);
  if(location.pathname.replace(/\/$/,'')!==canonicalPath||location.search)history.replaceState({rental:true},'',canonicalPath);
  const context=await fetch(`${CONTEXT_API}${encodeURIComponent(p._id)}?audience=showing`).then(r=>r.ok?r.json():null).catch(()=>null);
  renderSchools(p);
  render(p,all,context);$('#loading')?.remove();const pics=p.marketingFiles?.length?p.marketingFiles:p.photo||[],type=p.buildingType||p.rentalCategory||'Home';injectSeo(p,pics,type);
}
loadListing().catch(()=>{$('#loading')?.remove();$('#unavailable').hidden=false});
