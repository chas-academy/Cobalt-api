/* Join Session */
export const makeJoinSessionHandler = (io, rooms, socketMethods) =>
  function onJoinSession(sessionId) {
    const socket = this;

    console.log("onJoinSession", sessionId);
    console.log(rooms[sessionId]);

    if (!socketMethods.sessionExists(sessionId)) {
      socket.disconnect();
      return;
    }

    /* Add the client to this room */
    socket.join(sessionId);
    /* Add client to map of attendees */
    socketMethods.updateAttendee(sessionId, socket.id);

    /* Update number of attendees */
    rooms[sessionId].data.attendees = socketMethods.getNumOfAttendees(
      sessionId
    );

    /* Send presentation description */
    socket.emit("welcomeMessage", {
      presentation: rooms[sessionId].data.description
    });

    /* Update Host */
    io.sockets.in(sessionId).emit("updateHost", rooms[sessionId].data);
  };

/* Attendee Payload */
export const makeOnAttendeePayload = (io, rooms, socketMethods) =>
  function onAttendeePayload({ session, payload }) {
    const socket = this;

    console.log("attendeePayload", session, payload);

    /* Update the attendees engagement value */
    socketMethods.updateAttendee(session, socket.id, payload);

    const newData = Object.assign(
      {},
      socketMethods.calculateAverageValue(session),
      socketMethods.calculatePercentageValue(session)
    );

    console.log(newData);

    rooms[session].data.engagement = newData;

    console.log("onattendeepayload", rooms[session].data);

    io.sockets.in(session).emit("updateHost", rooms[session].data);
  };

/* Presenter Payload */
export const makeOnPresenterPayload = (io, rooms) =>
  function onPresenterPayload(payload) {
    console.log("presenterPayload", payload);
    rooms[payload.session].data = payload.payload;
    io.sockets
      .in(payload.session)
      .emit("updateClient", rooms[payload.session].data);
  };

export const makeOnPresenterSavePolling = (io, rooms, dbActions) =>
  function onPresenterSavePolling(payload) {
    console.log("presenterRequestsSave", payload);

    /* TODO: Update session data for presentation in DB */
    dbActions.savePresentationValues({
      payload,
      presentationId: rooms[payload.sessionId].presentationId
    });
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

        const newData = Object.assign(
          {},
          socketMethods.calculateAverageValue(room),
          socketMethods.calculatePercentageValue(room)
        );

        console.log(newData);

        rooms[room].data.engagement = newData;

        io.sockets.in(room).emit("updateHost", rooms[room].data);
      }
    });
  };
