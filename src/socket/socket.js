let presentations = {};

const SocketMethodsFactory = (io, presentations /* should be DB */) => {
  const initialiseSocketSession = (
    presentations,
    io,
    { sessionId, _id: presentationId, settings, description, name },
    {
      threshold = 35,
      maxAttendees = 50,
      engagementDescription = {
        up: "Positive",
        down: "Negative"
      }
    }
  ) =>
    (presentations[sessionId] = {
      session: io.of(sessionId),
      presentationId: presentationId,
      owner: undefined,
      attendees: new Map(),
      data: {
        sessionId: sessionId,
        presentation: {
          name: name,
          description: description
        },
        settings: {
          threshold,
          maxAttendees,
          engagementDescription
        },
        status: {
          hasStarted: false,
          hasEnded: false,
          isPaused: false,
          time: 0
        },
        engagement: {
          average: 0,
          positive: 50,
          negative: 50
        },
        attendees: 0
      }
    });

  const sessionExists = (presentations, sessionId) => {
    return presentations.hasOwnProperty(sessionId);
  };

  const sessionHasEnded = (presentations, sessionId) => {
    return presentations[sessionId].data.status.hasEnded;
  };

  const updateAttendee = (
    presentations,
    sessionId,
    socketId,
    value = { engagement: 0 }
  ) => presentations[sessionId].attendees.set(socketId, value);

  const getNumOfAttendees = (presentations, sessionId) =>
    presentations[sessionId].attendees.size;

  const calculatePercentageValue = (presentations, sessionId) => {
    /* Get the total num of attendees */
    let attendees = 0;

    /* Calculate feedback values */
    let positive = 0;
    let negative = 0;
    presentations[sessionId].attendees.forEach(attendee => {
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

  const calculateAverageValue = (presentations, sessionId) => {
    const attendees = presentations[sessionId].attendees.size;

    let sum = 0;
    presentations[sessionId].attendees.forEach(
      attendee => (sum += attendee.engagement)
    );

    return {
      average: sum / attendees
    };
  };

  const passClientData = (presentations, sessionId) =>
    Object.assign(
      {},
      { presentation: presentations[sessionId].data.presentation },
      { status: presentations[sessionId].data.status },
      {
        engagementDescription:
          presentations[sessionId].data.settings.engagementDescription
      }
    );

<<<<<<< Updated upstream
=======
  const setPresentationOwner = (presentations, sessionId, socketId) => {
    console.log("setting presetntation owner", presentations[sessionId]);

    presentations[sessionId].owner = socketId;
    console.log("should be set", presentations[sessionId]);
  };

>>>>>>> Stashed changes
  return {
    sessionExists: sessionExists.bind(null, presentations),
    sessionHasEnded: sessionHasEnded.bind(null, presentations),
    updateAttendee: updateAttendee.bind(null, presentations),
    getNumOfAttendees: getNumOfAttendees.bind(null, presentations),
    calculatePercentageValue: calculatePercentageValue.bind(
      null,
      presentations
    ),
    calculateAverageValue: calculateAverageValue.bind(null, presentations),
    initialiseSocketSession: initialiseSocketSession.bind(
      null,
      presentations,
      io
    ),
    passClientData: passClientData.bind(null, presentations)
  };
};

export { presentations, SocketMethodsFactory };

/* TODO: */
// const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);
// const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

// const canJoinSession = pipe(sessionExists);
