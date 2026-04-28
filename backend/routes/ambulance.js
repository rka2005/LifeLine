import express from 'express';
import { saveDocument } from '../lib/firebaseAdmin.js';

const router = express.Router();

const fleetByZone = new Map();
const requests = new Map();
const trackingTimers = new Map();

const DRIVER_RESPONSE_TIMEOUT_MS = process.env.NODE_ENV === 'production'
  ? 5 * 60 * 1000
  : Number(process.env.DRIVER_RESPONSE_TIMEOUT_MS || 5000);

function getFleet(lat, lng) {
  const key = zoneKey(lat, lng);
  if (!fleetByZone.has(key)) {
    fleetByZone.set(key, createFleet(Number(lat), Number(lng), key));
  }
  return fleetByZone.get(key);
}

function createFleet(lat, lng, seedKey) {
  const types = ['Basic', 'Advanced', 'ICU', 'Neonatal'];
  return Array.from({ length: 10 }, (_, index) => {
    const latRand = seededRandom(`${seedKey}:lat:${index}`) - 0.5;
    const lngRand = seededRandom(`${seedKey}:lng:${index}`) - 0.5;
    const eta = 3 + Math.floor(seededRandom(`${seedKey}:eta:${index}`) * 12);

    return {
      id: `AMB-${Math.abs(hashCode(`${seedKey}:${index}`)).toString().slice(0, 5)}`,
      type: types[index % types.length],
      driver: {
        name: ['Amit Kumar', 'Ravi Singh', 'Arjun Das', 'Sanjay Roy', 'Nikhil Verma'][index % 5],
        phone: `+91 ${9000000000 + Math.abs(hashCode(`${seedKey}:phone:${index}`)) % 999999999}`,
        rating: (4 + seededRandom(`${seedKey}:rating:${index}`)).toFixed(1)
      },
      vehicleNumber: `IN-${10 + index} EMS-${1000 + Math.abs(hashCode(`${seedKey}:vehicle:${index}`)) % 8999}`,
      location: {
        lat: lat + latRand * 0.04,
        lng: lng + lngRand * 0.04
      },
      available: seededRandom(`${seedKey}:available:${index}`) > 0.2,
      eta,
      distance: (eta * 0.45).toFixed(1),
      updatedAt: new Date().toISOString()
    };
  });
}

router.get('/nearby', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  const available = getFleet(lat, lng)
    .filter(vehicle => vehicle.available)
    .sort((a, b) => a.eta - b.eta);

  res.json({
    count: available.length,
    ambulances: available,
    timestamp: new Date().toISOString()
  });
});

router.post('/request', (req, res) => {
  const {
    userId,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng,
    preferredAmbulanceId,
    emergencyType,
    patientName,
    contact,
    notes
  } = req.body;

  if (!userId || !pickupLat || !pickupLng) {
    return res.status(400).json({ error: 'userId, pickupLat, and pickupLng are required' });
  }

  const requestId = `REQ-${Date.now()}`;
  const pickup = { lat: Number(pickupLat), lng: Number(pickupLng) };
  const destination = destinationLat && destinationLng
    ? { lat: Number(destinationLat), lng: Number(destinationLng) }
    : null;

  const nearbyAmbulances = getFleet(pickupLat, pickupLng)
    .filter(vehicle => vehicle.available)
    .sort((a, b) => a.eta - b.eta)
    .slice(0, 5);

  const request = {
    id: requestId,
    userId,
    pickup,
    destination,
    emergencyType: emergencyType || 'medical',
    patientName,
    contact,
    notes,
    status: 'searching',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    ambulancesNotified: nearbyAmbulances.map(vehicle => vehicle.id),
    assignedAmbulance: null
  };

  requests.set(requestId, request);
  void saveDocument('ambulanceRequests', requestId, request);

  const io = req.io;
  if (io) {
    nearbyAmbulances.forEach(vehicle => {
      io.to(`ambulance_${vehicle.id}`).emit('new_ambulance_request', request);
    });
  }

  setTimeout(() => {
    const reqData = requests.get(requestId);
    if (!reqData || reqData.status !== 'searching') return;

    const preferred = nearbyAmbulances.find(vehicle => vehicle.id === preferredAmbulanceId);
    const accepted = preferred || nearbyAmbulances[0];

    if (accepted) {
      accepted.available = false;
      accepted.updatedAt = new Date().toISOString();
      reqData.status = 'accepted';
      reqData.assignedAmbulance = accepted;
      reqData.acceptedAt = new Date().toISOString();
      requests.set(requestId, reqData);
      void saveDocument('ambulanceRequests', requestId, reqData);

      if (io) {
        io.to(`user_${userId}`).emit('ambulance_assigned', {
          requestId,
          ambulance: accepted,
          eta: accepted.eta,
          message: 'Ambulance assigned. Live tracking is active.'
        });
        io.to(`request_${requestId}`).emit('ambulance_assigned', { requestId, ambulance: accepted, eta: accepted.eta });
        startTrackingSimulation(io, userId, requestId, accepted, pickup, destination);
      }
    } else {
      reqData.status = 'no_ambulance';
      requests.set(requestId, reqData);
      void saveDocument('ambulanceRequests', requestId, reqData);

      if (io) {
        io.to(`user_${userId}`).emit('ambulance_not_found', {
          requestId,
          message: 'No ambulance available nearby. Try Civilian Mode or expand search.',
          alternatives: nearbyAmbulances.slice(1, 4)
        });
      }
    }
  }, DRIVER_RESPONSE_TIMEOUT_MS);

  res.json({
    requestId,
    status: 'searching',
    message: 'Finding nearest available ambulance...',
    acceptanceWindowSeconds: 300,
    simulatedDecisionMs: DRIVER_RESPONSE_TIMEOUT_MS,
    nearbyCount: nearbyAmbulances.length,
    ambulances: nearbyAmbulances.map(vehicle => ({
      id: vehicle.id,
      type: vehicle.type,
      eta: vehicle.eta,
      distance: vehicle.distance,
      vehicleNumber: vehicle.vehicleNumber
    }))
  });
});

router.get('/request/:requestId', (req, res) => {
  const request = requests.get(req.params.requestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

router.post('/location-update', (req, res) => {
  const { ambulanceId, lat, lng, requestId } = req.body;
  const io = req.io;
  const location = { lat: Number(lat), lng: Number(lng) };

  if (!ambulanceId || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
    return res.status(400).json({ error: 'ambulanceId, lat, and lng are required' });
  }

  updateFleetLocation(ambulanceId, location);

  if (io && requestId) {
    io.to(`request_${requestId}`).emit('location_update', {
      ambulanceId,
      location,
      timestamp: new Date().toISOString()
    });
  }

  res.json({ status: 'updated', ambulanceId, location });
});

function startTrackingSimulation(io, userId, requestId, ambulance, pickup, destination) {
  if (trackingTimers.has(requestId)) clearInterval(trackingTimers.get(requestId));

  const start = { ...ambulance.location };
  const checkpoint = pickup;
  const finalTarget = destination || pickup;
  let tick = 0;

  const timer = setInterval(() => {
    tick += 1;
    const goingToPickup = tick <= 12;
    const phaseTick = goingToPickup ? tick : tick - 12;
    const phaseStart = goingToPickup ? start : checkpoint;
    const phaseEnd = goingToPickup ? checkpoint : finalTarget;
    const progress = Math.min(phaseTick / 12, 1);
    const location = interpolate(phaseStart, phaseEnd, progress);

    ambulance.location = location;
    ambulance.updatedAt = new Date().toISOString();
    updateFleetLocation(ambulance.id, location);

    const payload = {
      requestId,
      ambulanceId: ambulance.id,
      location,
      status: goingToPickup ? 'en_route_to_pickup' : 'en_route_to_destination',
      timestamp: new Date().toISOString()
    };

    io.to(`request_${requestId}`).emit('location_update', payload);
    io.to(`user_${userId}`).emit('location_update', payload);

    if (!goingToPickup && progress >= 1) {
      clearInterval(timer);
      trackingTimers.delete(requestId);
      io.to(`request_${requestId}`).emit('ambulance_arrived', { requestId, ambulanceId: ambulance.id });
      io.to(`user_${userId}`).emit('ambulance_arrived', { requestId, ambulanceId: ambulance.id });
    }
  }, 3000);

  trackingTimers.set(requestId, timer);
}

function updateFleetLocation(ambulanceId, location) {
  fleetByZone.forEach(fleet => {
    const ambulance = fleet.find(vehicle => vehicle.id === ambulanceId);
    if (ambulance) {
      ambulance.location = location;
      ambulance.updatedAt = new Date().toISOString();
    }
  });
}

function interpolate(start, end, progress) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress
  };
}

function zoneKey(lat, lng) {
  return `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
}

function seededRandom(seed) {
  const value = Math.sin(hashCode(seed)) * 10000;
  return value - Math.floor(value);
}

function hashCode(value) {
  return String(value).split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

export default router;
