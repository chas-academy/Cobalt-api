let rooms = {};

const SocketMethodsFactory = (io, rooms /* should be DB */) => {
  const getNewSession = sessionId => io.of(sessionId);

  const sessionExists = (rooms, sessionId) => rooms.hasOwnProperty(sessionId);

  const updateAttendee = (
    rooms,
    sessionId,
    socketId,
    value = { engagement: 0 }
  ) => rooms[sessionId].attendees.set(socketId, value);

  const getNumOfAttendees = (rooms, sessionId) =>
    rooms[sessionId].attendees.size;

  return {
    getNewSession: getNewSession.bind(null, io),
    sessionExists: sessionExists.bind(null, rooms),
    updateAttendee: updateAttendee.bind(null, rooms),
    getNumOfAttendees: getNumOfAttendees.bind(null, rooms)
  };
};

export { rooms, SocketMethodsFactory };

/* TODO: */
// const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);
// const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

// const canJoinSession = pipe(sessionExists);
