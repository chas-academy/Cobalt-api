let rooms = {};

const SocketMethodsFactory = (io, rooms /* should be DB */) => {
  const getNewSession = sessionId => io.of(sessionId);
  const sessionExists = (rooms, sessionId) => rooms.hasOwnProperty(sessionId);
  const getNumOfAttendees = sessionId =>
    io.sockets.adapter.rooms[sessionId].length;

  return {
    getNewSession: getNewSession.bind(null, io),
    sessionExists: sessionExists.bind(null, rooms),
    getNumOfAttendees: getNumOfAttendees.bind(null, io)
  };
};

export { rooms, SocketMethodsFactory };
