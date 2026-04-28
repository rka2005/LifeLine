import express from 'express';
import { nearbySearch, normalizePlace } from '../lib/googleMaps.js';
import { saveDocument } from '../lib/firebaseAdmin.js';

const router = express.Router();

const alerts = new Map();

async function findPoliceStations(lat, lng, route = []) {
  const points = routePoints(route, { lat, lng }).slice(0, 5);
  const seen = new Map();

  for (const point of points) {
    const places = await nearbySearch({ lat: point.lat, lng: point.lng, type: 'police', radius: 3500 });
    places.forEach(place => {
      if (!seen.has(place.place_id)) {
        seen.set(place.place_id, {
          ...normalizePlace(place, { lat, lng }),
          phone: '100'
        });
      }
    });
  }

  return Array.from(seen.values())
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
    .slice(0, 8);
}

router.post('/alert', async (req, res) => {
  try {
    const { vehicleId, vehicleType, route, eta, location, requestType, contact } = req.body;
    if (!vehicleId || !location?.lat || !location?.lng) {
      return res.status(400).json({ error: 'vehicleId and location are required' });
    }

    const stations = await findPoliceStations(location.lat, location.lng, route || []);

  const alertId = `ALT-${Date.now()}`;
  const alert = {
    id: alertId,
    vehicleId,
    vehicleType: vehicleType || 'ambulance',
    route: route || [],
    eta,
    location,
    requestType,
    contact,
    status: 'sent',
    policeStationsNotified: stations.map(p => p.id),
    sentAt: new Date().toISOString()
  };
  alerts.set(alertId, alert);
  await saveDocument('policeAlerts', alertId, alert);

  const io = req.io;
  if (io) {
    io.emit('police_alert', { ...alert, stations });
  }

  res.json({
    alertId,
    status: 'sent',
    message: 'Police alert sent to nearby stations',
    stationsNotified: alert.policeStationsNotified.length,
    stations,
    timestamp: alert.sentAt
  });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to alert police', details: error.details });
  }
});

router.get('/stations', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    const stations = await findPoliceStations(lat, lng);
    res.json({ count: stations.length, stations });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch police stations', details: error.details });
  }
});

function routePoints(route, fallback) {
  const points = [{ lat: Number(fallback.lat), lng: Number(fallback.lng) }];

  if (Array.isArray(route)) {
    route.forEach(step => {
      if (step?.start?.lat && step?.start?.lng) points.push({ lat: Number(step.start.lat), lng: Number(step.start.lng) });
      if (step?.end?.lat && step?.end?.lng) points.push({ lat: Number(step.end.lat), lng: Number(step.end.lng) });
    });
  }

  return points.filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng));
}

export default router;
