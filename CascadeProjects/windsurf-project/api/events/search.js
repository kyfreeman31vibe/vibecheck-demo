// Vercel serverless function: proxies Ticketmaster Discovery API
// Keeps API key server-side, returns normalized event data

module.exports = async function handler(req, res) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TICKETMASTER_API_KEY not configured' });
  }

  const { city, keyword, classificationName, latlong, radius, startDateTime, endDateTime, size, page, sort } = req.query;

  // Build Ticketmaster URL
  const params = new URLSearchParams();
  params.set('apikey', apiKey);
  params.set('classificationName', classificationName || 'music');
  params.set('size', size || '20');
  params.set('page', page || '0');
  params.set('sort', sort || 'date,asc');

  if (city) params.set('city', city);
  if (keyword) params.set('keyword', keyword);
  if (latlong) params.set('latlong', latlong);
  if (radius) params.set('radius', radius);
  if (startDateTime) params.set('startDateTime', startDateTime);
  if (endDateTime) params.set('endDateTime', endDateTime);

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Ticketmaster API error', details: text });
    }

    const data = await response.json();
    const events = (data._embedded && data._embedded.events) || [];

    // Normalize to a clean shape for the frontend
    const normalized = events.map(function (ev) {
      const venue = (ev._embedded && ev._embedded.venues && ev._embedded.venues[0]) || {};
      const attractions = (ev._embedded && ev._embedded.attractions) || [];
      const image = (ev.images || []).find(function (img) { return img.ratio === '16_9' && img.width >= 500; }) || ev.images?.[0];
      const classification = (ev.classifications || [])[0] || {};

      return {
        id: ev.id,
        name: ev.name,
        url: ev.url,
        imageUrl: image ? image.url : null,
        date: ev.dates && ev.dates.start ? ev.dates.start.localDate : null,
        time: ev.dates && ev.dates.start ? ev.dates.start.localTime : null,
        venue: {
          name: venue.name || '',
          city: venue.city ? venue.city.name : '',
          state: venue.state ? venue.state.stateCode : '',
          address: venue.address ? venue.address.line1 : '',
        },
        genre: classification.genre ? classification.genre.name : '',
        subGenre: classification.subGenre ? classification.subGenre.name : '',
        attractions: attractions.map(function (a) { return { id: a.id, name: a.name }; }),
        priceRange: ev.priceRanges ? ev.priceRanges[0] : null,
      };
    });

    const pageInfo = data.page || {};

    return res.status(200).json({
      events: normalized,
      page: {
        size: pageInfo.size || 20,
        totalElements: pageInfo.totalElements || 0,
        totalPages: pageInfo.totalPages || 0,
        number: pageInfo.number || 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
};
