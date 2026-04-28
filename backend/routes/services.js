import express from 'express';
import { googlePhotoUrl, nearbySearch, normalizePlace, placeDetails } from '../lib/googleMaps.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      lat,
      lng,
      type = 'hospital',
      radius = 5000,
      keyword,
      specialty,
      minRating,
      openNow,
      sortBy = 'distance'
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    let placeType = type;
    const validTypes = ['hospital', 'police', 'doctor', 'pharmacy', 'health'];
    if (!validTypes.includes(placeType)) placeType = 'hospital';

    const places = await nearbySearch({
      lat,
      lng,
      type: placeType,
      radius,
      keyword: specialty || keyword || (placeType === 'doctor' ? 'doctor clinic' : undefined)
    });

    let results = places.map(place => {
      const normalized = normalizePlace(place, { lat, lng });
      return {
        ...normalized,
        photo: googlePhotoUrl(normalized.photoReference)
      };
    });

    if (minRating) {
      const threshold = Number(minRating);
      results = results.filter(place => (place.rating || 0) >= threshold);
    }

    if (openNow === 'true') {
      results = results.filter(place => place.openNow === true);
    }

    results.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'availability') return Number(b.openNow === true) - Number(a.openNow === true);
      return (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER);
    });

    res.json({
      count: results.length,
      type: placeType,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      filters: {
        radius: Number(radius),
        minRating: minRating ? Number(minRating) : null,
        openNow: openNow === 'true',
        specialty: specialty || null,
        sortBy
      },
      results
    });
  } catch (error) {
    console.error('Services error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch nearby services', details: error.details });
  }
});

router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await placeDetails(
      placeId,
      'name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,reviews,geometry,photos,business_status,url'
    );
    res.json(details);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch place details', details: error.details });
  }
});

export default router;
