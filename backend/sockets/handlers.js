export function initSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    socket.on('join_request', (requestId) => {
      socket.join(`request_${requestId}`);
      console.log(`Joined request room ${requestId}`);
    });

    socket.on('join_ambulance', (ambulanceId) => {
      socket.join(`ambulance_${ambulanceId}`);
      console.log(`Ambulance ${ambulanceId} joined room`);
    });

    socket.on('join_civilian', (vehicleId) => {
      socket.join(`civilian_${vehicleId}`);
      console.log(`Civilian vehicle ${vehicleId} joined room`);
    });

    socket.on('ambulance_location', (data) => {
      const { requestId, ambulanceId, lat, lng } = data;
      io.to(`request_${requestId}`).emit('location_update', {
        ambulanceId,
        location: { lat, lng },
        timestamp: new Date().toISOString()
      });
    });

    socket.on('track_civilian', (data) => {
      const { vehicleId, lat, lng, route } = data;
      if (!vehicleId || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return;
      io.to(`civilian_${vehicleId}`).emit('civilian_location', {
        vehicleId,
        location: { lat: Number(lat), lng: Number(lng) },
        route,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('emergency_trigger', (data) => {
      io.emit('emergency_broadcast', {
        ...data,
        timestamp: new Date().toISOString(),
        broadcastId: `BROADCAST-${Date.now()}`
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
