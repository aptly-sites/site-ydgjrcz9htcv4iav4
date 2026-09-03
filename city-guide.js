const CITY_GUIDES = {
  waco: {
    name: 'Waco', lat: 31.5493, lon: -97.1467, population: '138,486', district: 'Waco ISD / Midway ISD', access: 'I-35 between Dallas and Austin',
    overview: 'Waco is the economic and cultural center of McLennan County, combining established neighborhoods, university energy, major employers, outdoor recreation, and direct I-35 access between Dallas–Fort Worth and Austin.',
    neighborhoods: [
      ['Downtown and Brazos River', 'Urban apartments, historic buildings, dining, events, and quick access to the riverfront, Baylor University, and major visitor destinations.'],
      ['Castle Heights and Dean Highland', 'Established central neighborhoods with distinctive architecture, mature trees, and convenient access to Lake Air Drive and downtown.'],
      ['Mountainview and Lake Waco', 'Residential areas near parks, medical services, shopping, and Lake Waco recreation with a mix of classic and updated homes.']
    ],
    attractions: [
      ['Cameron Park and Cameron Park Zoo', 'River overlooks, extensive trails, playgrounds, natural areas, and a regional zoo.', 'https://www.waco-texas.com/Departments/Parks-Recreation/Cameron-Park'],
      ['Magnolia Market at the Silos', 'A nationally known downtown shopping, dining, and events destination.', 'https://magnolia.com/visit/'],
      ['Waco Mammoth National Monument', 'An active paleontological site preserving a nursery herd of Columbian mammoths.', 'https://www.nps.gov/waco/']
    ],
    tips: ['Confirm the school district and assigned campus for the exact address; parts of the broader Waco area are served by different districts.', 'Compare drive times using I-35, Highway 6, Loop 340, and local streets during normal commute and Baylor event traffic.', 'For established homes, inspect foundation history, drainage, insulation, plumbing, electrical systems, and HVAC condition before move-in.']
  },
  woodway: {
    name: 'Woodway', lat: 31.4986, lon: -97.2316, population: '9,383', district: 'Midway ISD / Waco ISD', access: 'Southwest of Waco',
    overview: 'Woodway is a wooded, primarily residential community beside Lake Waco. It is known for established streets, larger homes, parks, and quick access to the Highway 84 retail and medical corridor.',
    neighborhoods: [
      ['Old Woodway and Poage Park', 'Established streets, mature trees, and convenient access to Poage Park and Woodway Drive.'],
      ['Lake Waco and Estates Drive', 'Homes near the lake, trails, arboretum, and recreation areas; confirm drainage, landscaping, and access needs.'],
      ['Highway 84 corridor', 'Convenient for shopping, dining, hospitals, and Waco commutes while retaining a suburban residential setting.']
    ],
    attractions: [
      ['Carleen Bright Arboretum', 'Gardens, walking paths, community events, and Woodway history.', 'https://discoverwoodway.com/'],
      ['Lakeside Hike & Bike Trails', 'More than six miles of nature trails beside Lake Waco.', 'https://discoverwoodway.com/parks/'],
      ['Poage Park', 'A neighborhood park with a walking track, playground, pavilion, and sand volleyball.', 'https://discoverwoodway.com/parks/']
    ],
    tips: ['Confirm the exact school district and attendance zone for the property address; Woodway includes both Midway ISD and Waco ISD areas.', 'Budget for mature-tree care, irrigation, and seasonal landscaping at established homes.', 'Test the commute at school drop-off and evening peak times around Highway 84 and nearby Waco corridors.']
  },
  hewitt: {
    name: 'Hewitt', lat: 31.4624, lon: -97.1958, population: '16,026', district: 'Midway ISD', access: 'Near I-35 and Waco',
    overview: 'Hewitt combines suburban neighborhoods with practical access to I-35, employers, shopping, and the greater Waco area. Housing ranges from established ranch-style homes to newer subdivisions.',
    neighborhoods: [
      ['Hewitt Drive corridor', 'Central access to city services, local businesses, and routes toward Waco and Woodway.'],
      ['Sun Valley area', 'Residential streets close to parks, schools, and the I-35 corridor.'],
      ['South and west Hewitt', 'Newer subdivisions and single-family homes with convenient access toward Lorena and Woodway.']
    ],
    attractions: [
      ['Hewitt Park', 'A city gathering place for recreation, events, and relaxed outdoor time.', 'https://www.cityofhewitt.com/557/General-Services'],
      ['Warren Park', 'A neighborhood park maintained by the City of Hewitt for recreation and community use.', 'https://www.cityofhewitt.com/557/General-Services'],
      ['Central Texas Marketplace', 'Regional shopping and dining near the I-35 corridor.', 'https://wacoheartoftexas.com/']
    ],
    tips: ['Verify the assigned Midway ISD campus by street address before enrolling; attendance boundaries can change.', 'Compare routes to I-35, Highway 84, and major Waco employers during commute hours.', 'Inspect HVAC performance and drainage carefully, especially in homes with older systems or low-lying yards.']
  },
  robinson: {
    name: 'Robinson', lat: 31.4677, lon: -97.1147, population: '12,443', district: 'Robinson ISD', access: 'Southeast of Waco',
    overview: 'Robinson offers a quieter residential setting southeast of Waco with access to Highway 77 and Highway 6. The market includes established homes, newer subdivisions, and properties with larger lots.',
    neighborhoods: [
      ['Central Robinson and Peplow Park', 'Established residential streets near the community park, schools, and city services.'],
      ['Moonlight and Greig corridors', 'Suburban single-family areas with practical access toward Waco and Highway 6.'],
      ['Rural-edge Robinson', 'Larger lots and a more open setting where utility, septic, fencing, and grounds-care needs deserve attention.']
    ],
    attractions: [
      ['Peplow Park', 'Playgrounds, courts, trails, exercise equipment, a pavilion, gazebo, and amphitheater.', 'https://www.robinsontexas.org/176/Park-and-Facilities'],
      ['Robinson community events', 'Seasonal gatherings and public activities centered around local facilities and parks.', 'https://www.robinsontexas.org/calendar.aspx'],
      ['Waco attractions', 'Baylor, downtown Waco, museums, and the Brazos River are a short drive away.', 'https://wacoheartoftexas.com/']
    ],
    tips: ['Confirm Robinson ISD attendance zones and transportation options for the exact address.', 'Ask whether the home uses city utilities, septic, or other property-specific systems.', 'For larger lots, clarify mowing, fencing, pest-control, and irrigation responsibilities before move-in.']
  },
  'china-spring': {
    name: 'China Spring', lat: 31.6493, lon: -97.3089, population: '1,436', district: 'China Spring ISD', access: 'About 12 miles NW of Waco',
    overview: 'China Spring is a northwest McLennan County community known for a rural-suburban feel, newer subdivisions, larger properties, and proximity to Lake Waco while remaining connected to Waco.',
    neighborhoods: [
      ['Historic China Spring / FM 1637', 'The community core with local services and routes connecting toward Waco.'],
      ['Wortham Bend and Rock Creek', 'Growing residential areas with a mix of subdivisions, open land, and larger lots.'],
      ['North River Crossing fringe', 'Newer Waco-area development near China Spring schools and routes toward Lake Waco.']
    ],
    attractions: [
      ['Lake Waco', 'Boating, fishing, parks, shoreline views, and outdoor recreation nearby.', 'https://www.swf-wc.usace.army.mil/waco/'],
      ['Waco Mammoth National Monument', 'A nationally significant fossil site and educational destination southeast of the community.', 'https://www.nps.gov/waco/'],
      ['Cameron Park', 'Trails, river overlooks, playgrounds, and natural areas in nearby Waco.', 'https://www.waco-texas.com/Departments/Parks-Recreation/Cameron-Park']
    ],
    tips: ['Use the Texas Education Agency district locator to verify China Spring ISD eligibility for the exact address.', 'Plan for longer drive times to major Waco employers and services, particularly during school traffic.', 'Clarify septic, well, propane, irrigation, fencing, and acreage-care responsibilities when considering rural-edge homes.']
  },
  bellmead: {
    name: 'Bellmead', lat: 31.5941, lon: -97.1089, population: '10,494', district: 'La Vega ISD', access: 'North of Waco on I-35',
    overview: 'Bellmead sits immediately north of Waco with direct I-35 and Loop 340 access. It offers established housing, local parks, everyday retail, and short trips to major Waco destinations.',
    neighborhoods: [
      ['Brame Park and Bellmead Drive', 'Established homes close to the splash pad, playgrounds, city services, and community events.'],
      ['Loop 340 and I-35 corridor', 'Convenient access to regional employers, shopping, and travel routes; compare traffic and road-noise exposure by address.'],
      ['North Bellmead', 'Residential areas toward Elm Mott with quick access to north Waco and regional highways.']
    ],
    attractions: [
      ['Brame Park', 'A splash pad, playgrounds, walking path, restrooms, and shaded pavilions.', 'https://bellmeadtx.gov/185/Recreation'],
      ['Lions Park', 'Baseball fields and community recreation in Bellmead.', 'https://bellmeadtx.gov/185/Recreation'],
      ['Waco Surf', 'Surf, cable wakeboarding, water slides, and a lazy river a short drive from City Hall.', 'https://bellmeadtx.gov/185/Recreation']
    ],
    tips: ['Verify the assigned La Vega ISD campus and any transportation arrangements for the property.', 'Compare access to I-35, Loop 340, and north Waco employers at the times you expect to travel.', 'For older homes, review electrical, plumbing, HVAC, insulation, and drainage condition before signing a lease.']
  },
  'lacy-lakeview': {
    name: 'Lacy Lakeview', lat: 31.6293, lon: -97.1022, population: '6,988', district: 'Connally ISD / La Vega ISD', access: 'North of Waco on I-35',
    overview: 'Lacy Lakeview is a compact community north of Waco with direct I-35 access, established neighborhoods, and convenient routes to regional employers, Texas State Technical College, and central Waco.',
    neighborhoods: [
      ['Connally and central Lacy Lakeview', 'Established residential streets near schools, city services, and local parks.'],
      ['I-35 corridor', 'Convenient regional access and nearby services; consider traffic patterns and road-noise exposure.'],
      ['North edge toward Elm Mott', 'A more open residential setting with quick access to north McLennan County.']
    ],
    attractions: [
      ['Lakeview Park', 'A local outdoor gathering space for neighborhood recreation.', 'https://www.lacylakeview.org/'],
      ['Texas State Technical College', 'A major nearby educational campus and community landmark.', 'https://www.tstc.edu/'],
      ['Brazos River and Cameron Park', 'Trails, overlooks, recreation, and river scenery a short drive south in Waco.', 'https://www.waco-texas.com/Departments/Parks-Recreation/Cameron-Park']
    ],
    tips: ['Verify whether the address is assigned to Connally ISD or La Vega ISD before enrolling.', 'Test I-35 and local frontage-road travel during normal work and school commute times.', 'Ask about drainage, foundation history, and the age of major systems in established homes.']
  }
};

const CITY_LISTINGS_API = 'https://app.getaptly.com/api/portal/listings/yDgjRcz9hTcv4iav4';
const APTLY_RENTAL_SEARCH = 'https://portal.getaptly.com/search/yDgjRcz9hTcv4iav4/';
const rentalsStyles = document.createElement('link'); rentalsStyles.rel = 'stylesheet'; rentalsStyles.href = 'city-rentals.css?v=20260820'; document.head.append(rentalsStyles);
const heroStyles = document.createElement('link'); heroStyles.rel = 'stylesheet'; heroStyles.href = 'city-heroes.css?v=20260820-1'; document.head.append(heroStyles);

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function guideMarkup(city) {
  return `<section class="city-guide" aria-labelledby="cityGuideHeading">
    <div class="wrap">
      <p class="city-eyebrow">LIVE, WORK &amp; EXPLORE</p>
      <h2 id="cityGuideHeading">Living in ${escapeHtml(city.name)}, Texas</h2>
      <p class="city-lede">${escapeHtml(city.overview)}</p>
      <div class="city-stats" aria-label="${escapeHtml(city.name)} community statistics">
        <div><strong>${escapeHtml(city.population)}</strong><span>2020 population</span></div>
        <div><strong>${escapeHtml(city.district)}</strong><span>Local school district area</span></div>
        <div><strong>${escapeHtml(city.access)}</strong><span>Regional location</span></div>
      </div>
      <section class="guide-block city-rentals" aria-labelledby="cityRentalsHeading">
        <div class="guide-heading city-rentals-heading"><div><p>AVAILABLE HOMES</p><h2 id="cityRentalsHeading">Homes for rent in ${escapeHtml(city.name)}</h2><p>Live rental availability from J R Grace Realty’s Aptly listing feed, filtered for ${escapeHtml(city.name)}.</p></div><a class="city-rentals-all" href="rental-search.html?city=${encodeURIComponent(city.name)}">Search all ${escapeHtml(city.name)} rentals →</a></div>
        <div class="city-rental-grid" id="cityRentalGrid"><div class="city-rental-loading"><span></span><p>Loading current ${escapeHtml(city.name)} rentals…</p></div></div>
      </section>
      <section class="guide-block"><div class="guide-heading"><p>FIND YOUR FIT</p><h2>${escapeHtml(city.name)} areas and neighborhood character</h2></div><div class="neighborhood-grid">${city.neighborhoods.map(([title,text])=>`<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join('')}</div><p class="guide-note">Area names are practical orientation labels, not official neighborhood boundaries. Verify utilities, zoning, school assignment, and commute details for a specific address.</p></section>
      <section class="guide-block"><div class="guide-heading"><p>THINGS TO DO</p><h2>Top sights and attractions near ${escapeHtml(city.name)}</h2></div><div class="attraction-grid">${city.attractions.map(([title,text,url],index)=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener"><span>0${index+1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p><b>Explore →</b></a>`).join('')}</div></section>
      <section class="guide-block relocation"><div class="guide-heading"><p>PLAN YOUR MOVE</p><h2>Relocation tips for moving to ${escapeHtml(city.name)}</h2></div><ol>${city.tips.map(tip=>`<li>${escapeHtml(tip)}</li>`).join('')}</ol></section>
      <section class="guide-block schools-block" aria-labelledby="citySchoolsHeading"><div class="guide-heading"><p>EDUCATION NEARBY</p><h2 id="citySchoolsHeading">Schools near ${escapeHtml(city.name)}</h2><p>Current public, charter, and private schools returned near the city center. Distances are approximate; confirm attendance boundaries directly with the district.</p></div><div class="city-school-list" id="citySchoolList"><div class="city-school-loading"><span></span><p>Finding nearby schools…</p></div></div><p class="guide-note">School information provided by <a href="https://www.greatschools.org/" target="_blank" rel="noopener">GreatSchools</a>. School boundaries and enrollment eligibility should be independently verified.</p></section>
    </div>
  </section>`;
}

const cityNameKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const listingStreet = listing => listing.address?.address || listing.address?.streetName || listing.marketingName || listing.name || 'Rental home';
const listingPhotos = listing => listing.marketingFiles?.length ? listing.marketingFiles : (listing.photo || []);
const listingMoney = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format((Number(cents)||0)/100);
const firstSecureUrl = (...values) => values.find(value => typeof value === 'string' && /^https:\/\//.test(value));
const listingApplyUrl = listing => firstSecureUrl(listing.aptlyScreening?.link,listing.links?.apply,listing.applyUrl) || APTLY_RENTAL_SEARCH;
const listingTourUrl = listing => firstSecureUrl(listing.aptlyShowings?.link,listing.aptlyShowings?.url,listing.links?.tour,listing.tourUrl) || (listing.aptlyShowings?.active && listing.companyId && listing._id ? `https://portal.getaptly.com/search/${encodeURIComponent(listing.companyId)}/${encodeURIComponent(listing._id)}` : APTLY_RENTAL_SEARCH);

function rentalCard(listing) {
  const photos = listingPhotos(listing), image = photos[0] || 'assets/areas.jpg', street = listingStreet(listing);
  return `<article class="city-rental-card"><a class="city-rental-image" href="rental-detail.html?id=${encodeURIComponent(listing._id)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(street)} rental home" loading="lazy"><span>AVAILABLE NOW</span>${photos.length>1?`<b>${photos.length} photos</b>`:''}</a><div class="city-rental-copy"><p class="city-rental-price">${listingMoney(listing.marketRent?.amount)}<small>/mo</small></p><p class="city-rental-facts">${escapeHtml(listing.beds ?? '—')} bd · ${escapeHtml(listing.baths ?? '—')} ba · ${listing.totalArea ? Number(listing.totalArea).toLocaleString() : '—'} sq ft</p><h3>${escapeHtml(street)}</h3><p class="city-rental-address">${escapeHtml(listing.address?.city)}, ${escapeHtml(listing.address?.stateCode)} ${escapeHtml(listing.address?.postalCode)}</p><div class="city-rental-actions"><a href="${escapeHtml(listingTourUrl(listing))}" target="_blank" rel="noopener">Self tour</a><a href="${escapeHtml(listingApplyUrl(listing))}" target="_blank" rel="noopener">Apply</a><a href="rental-detail.html?id=${encodeURIComponent(listing._id)}">View details →</a></div></div></article>`;
}

async function loadCityRentals(city) {
  const grid = document.querySelector('#cityRentalGrid');
  if (!grid) return;
  try {
    const response = await fetch(CITY_LISTINGS_API);
    if (!response.ok) throw new Error(`Listing feed returned ${response.status}`);
    const data = await response.json(), key = cityNameKey(city.name);
    const listings = (Array.isArray(data.data) ? data.data : []).filter(listing => listing.publishedForRent !== false && cityNameKey(listing.address?.city) === key);
    if (!listings.length) {
      grid.innerHTML = `<div class="city-rental-empty"><h3>No ${escapeHtml(city.name)} homes are available right now.</h3><p>Availability changes frequently. Browse every current J R Grace Realty rental or check back soon.</p><a href="rental-search.html?city=${encodeURIComponent(city.name)}">Open the rental search →</a></div>`;
      return;
    }
    grid.innerHTML = listings.slice(0,6).map(rentalCard).join('');
  } catch {
    grid.innerHTML = `<div class="city-rental-empty"><h3>Current rentals are temporarily unavailable.</h3><p>Please use the full rental search while the live city feed reconnects.</p><a href="rental-search.html?city=${encodeURIComponent(city.name)}">Open the rental search →</a></div>`;
  }
}

async function loadCitySchools(city) {
  const list = document.querySelector('#citySchoolList');
  if (!list) return;
  try {
    const response = await fetch(`/api/nearby-schools?lat=${encodeURIComponent(city.lat)}&lon=${encodeURIComponent(city.lon)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.schools) || !data.schools.length) throw new Error(data.message || 'School information is temporarily unavailable.');
    list.innerHTML = data.schools.slice(0, 8).map((school,index)=>`<a class="city-school-card" href="${escapeHtml(school.url || 'https://www.greatschools.org/') }" target="_blank" rel="noopener"><span>${index+1}</span><div><h3>${escapeHtml(school.name)}</h3><p>${escapeHtml(school.type)} · ${escapeHtml(school.grades || 'Grades vary')} · ${Number(school.distance || 0).toFixed(1)} mi</p><small>${escapeHtml(school.address)}</small></div></a>`).join('');
  } catch (error) {
    list.innerHTML = `<div class="city-school-error"><strong>Nearby school information is temporarily unavailable.</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

const cityKey = document.body.dataset.city;
const city = CITY_GUIDES[cityKey];
if (city) {
  const content = document.querySelector('.city-content');
  if (content) content.insertAdjacentHTML('afterend', guideMarkup(city));
  loadCityRentals(city);
  loadCitySchools(city);
}

(()=>{if(!document.querySelector('link[href*="global-property-nav"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='global-property-nav.css?v=20260824-7';document.head.append(link)}if(!document.querySelector('script[src*="global-property-nav"]')){const script=document.createElement('script');script.src='global-property-nav.js?v=20260824-7';document.body.append(script)}})();
