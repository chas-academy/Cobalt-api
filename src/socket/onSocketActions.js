/* Join Session */
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

/* Attendee Payload */
export const makeOnAttendeePayload = (io, rooms, socketMethods) =>
  function onAttendeePayload({ session, payload }) {
    const socket = this;

    console.log("attendeePayload", payload);

    /* Update the attendees engagement value */
    socketMethods.updateAttendee(session, socket.id, payload);

    const newData = socketMethods.presentationUsesAverage(session)
      ? socketMethods.calculateAverageValue(session)
      : socketMethods.calculatePercentageValue(session);

    io.sockets.in(session).emit("updateHost", rooms[session].data);
  };

/* Presenter Payload */
export const makeOnPresenterPayload = io =>
  function onPresenterPayload(payload) {
    console.log("presenterPayload", payload);
    io.sockets.in(payload.session).emit("updateClient", payload);
  };

export const makeOnPresenterSavePolling = (io, dbActions) =>
  function onPresenterSavePolling(payload) {
    console.log("presenterRequestsSave", payload);

    /* TODO: Update session data for presentation in DB */
    dbActions.savePresentationValues(payload);
  };

/* On Disconnect */
export const makeOnDisconnectHandler = (io, rooms, socketMethods) =>
  function onDisconnect() {
    const socket = this;

    const id = socket.id;
    const userRooms = Object.values(Object.assign({}, socket.rooms));

    userRooms.forEach(room => {
      if (room !== id) {
        rooms[room].attendees.delete(id);

        rooms[room].data.attendees = socketMethods.getNumOfAttendees(room);

        io.sockets.in(room).emit("updateHost", rooms[room].data);
      }
    });
  };
