export const makeJoinSessionHandler = (io, rooms, socketMethods) =>
  function onJoinSession(sessionId) {
    const socket = this;

    if (!socketMethods.sessionExists(sessionId)) {
      socket.disconnect();
      return;
    }

    /* Add the client to this room */
    socket.join(sessionId);
    /* Add client to map of attendees */
    socketMethods.updateAttendee(sessionId, socket.id);

    /* Update number of attendees */
    rooms[
      sessionId
    ].presentation.data.attendees = socketMethods.getNumOfAttendees(sessionId);

    /* Send presentation description */
    socket.emit("welcomeMessage", {
      presentation: rooms[sessionId].presentation.information
    });

    /* Update Host */
    io.sockets
      .in(sessionId)
      .emit("updateHost", rooms[sessionId].presentation.data);
  };

export const makeOnAttendeePayload = (io, rooms, socketMethods) =>
  function onAttendeePayload({ session, payload }) {
    const socket = this;

    console.log("attendeePayload", payload);

    /* Update the attendees engagement value */
    socketMethods.updateAttendee(session, socket.id, payload);

    if (!rooms[session].presentation.data.settings.isAverage) {
      /* Get the total num of attendees */
      let attendees = 0;

      /* Calculate feedback values */
      let positive = 0;
      let negative = 0;
      rooms[session].attendees.forEach(attendee => {
        if (attendee.engagement === -1 || attendee.engagement === 1) {
          if (attendee.engagement === 1) positive++;
          if (attendee.engagement === -1) negative++;

          attendees++;
        }
      });

      const positivePercentage = positive / attendees * 100;
      const negativePercentage = 100 - positivePercentage;

      /* Update presentation engagement values */
      rooms[session].presentation.data.engagement.positive = Math.round(
        positivePercentage
      );
      rooms[session].presentation.data.engagement.negative = Math.round(
        negativePercentage
      );
    } else {
      const attendees = socketMethods.getNumOfAttendees(session);

      let sum = 0;
      rooms[session].attendees.forEach(
        attendee => (sum += attendee.engagement)
      );

      rooms[session].presentation.data.engagement.average = sum / attendees;
    }

    io.sockets.in(session).emit("updateHost", rooms[session].presentation.data);
  };

export const makeOnPresenterPayload = io =>
  function onPresenterPayload(payload) {
    console.log("presenterPayload", payload);
    io.sockets.in(payload.session).emit("updateClient", payload);
  };

export const makeOnDisconnectHandler = (io, rooms, socketMethods) =>
  function onDisconnect() {
    const socket = this;

    const id = socket.id;
    const userRooms = Object.values(Object.assign({}, socket.rooms));

    userRooms.forEach(room => {
      if (room !== id) {
        rooms[room].attendees.delete(id);

        rooms[
          room
        ].presentation.data.attendees = socketMethods.getNumOfAttendees(room);

        io.sockets.in(room).emit("updateHost", rooms[room].presentation.data);
      }
    });
  };
