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

  const presentationUsesAverage = (rooms, sessionId) =>
    rooms[session].data.status.isAverage;

  const calculatePercentageValue = (rooms, sessionId) => {
    /* Get the total num of attendees */
    let attendees = 0;

    /* Calculate feedback values */
    let positive = 0;
    let negative = 0;
    rooms[sessionId].attendees.forEach(attendee => {
      if (attendee.engagement !== 0) {
        if (attendee.engagement > 0) positive++;
        if (attendee.engagement < 0) negative++;

        attendees++;
      }
    });

    const positivePercentage = positive / attendees * 100;
    const negativePercentage = 100 - positivePercentage;

    /* Update presentation engagement values */
    return {
      positive: Math.round(positivePercentage),
      negative: Math.round(negativePercentage)
    };
  };

  const calculateAverageValue = (rooms, sessionId) => {
    const attendees = rooms[sessionId].attendees.size;

    let sum = 0;
    rooms[sessionId].attendees.forEach(
      attendee => (sum += attendee.engagement)
    );

    return {
      average: sum / attendees
    };
  };

  return {
    getNewSession: getNewSession.bind(null, io),
    sessionExists: sessionExists.bind(null, rooms),
    updateAttendee: updateAttendee.bind(null, rooms),
    getNumOfAttendees: getNumOfAttendees.bind(null, rooms),
    presentationUsesAverage: presentationUsesAverage.bind(null, rooms),
    calculatePercentageValue: calculatePercentageValue.bind(null, rooms),
    calculateAverageValue: calculateAverageValue.bind(null, rooms)
  };
};

export { rooms, SocketMethodsFactory };

/* TODO: */
// const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);
// const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

// const canJoinSession = pipe(sessionExists);
