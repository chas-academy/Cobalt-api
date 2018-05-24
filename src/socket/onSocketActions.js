/* Join Session */
export const makeJoinSessionHandler = (io, presentations, socketMethods) =>
  function onJoinSession(sessionId) {
    const socket = this;

    console.log("onJoinSession", sessionId);
    console.log("presentationObj", presentations[sessionId]);

    if (
      !socketMethods.sessionExists(sessionId) ||
      socketMethods.sessionHasEnded(sessionId)
    ) {
      socket.disconnect();
      return;
    }

    /* Add the client to this room */
    socket.join(sessionId);
    /* Add client to map of attendees */
    socketMethods.updateAttendee(sessionId, socket.id);

    /* Update number of attendees */
    presentations[sessionId].data.attendees = socketMethods.getNumOfAttendees(
      sessionId
    );

    /* Send presentation description */
    socket.emit("updateClient", socketMethods.passClientData(sessionId));

    /* Update Host */
    io.sockets.in(sessionId).emit("updateHost", presentations[sessionId].data);
  };

/* Like Event */
export const makeOnLikeEvent = (io, presentations, socketMethods) =>
  function onLikeEvent({ session, payload }) {
    const socket = this;

    if (
      !socketMethods.sessionExists(session) ||
      socketMethods.sessionHasEnded(session)
    ) {
      socket.disconnect();
      return;
    }

    if (
      presentations[session].data.status.isPaused ||
      !presentations[session].data.status.hasStarted
    )
      return;

    console.log("attendeeLike", session, payload);
    presentations[session].data.likes++;

    io.sockets.in(session).emit("sendLike", presentations[session].data);
    io.sockets.in(session).emit("updateHost", presentations[session].data);
  };

/* Attendee Payload */
export const makeOnAttendeePayload = (io, presentations, socketMethods) =>
  function onAttendeePayload({ session, payload }) {
    const socket = this;

    console.log("attendeePayload", session, payload);

    if (
      !socketMethods.sessionExists(session) ||
      socketMethods.sessionHasEnded(session)
    ) {
      socket.disconnect();
      return;
    }

    if (
      presentations[session].data.status.isPaused ||
      !presentations[session].data.status.hasStarted
    )
      return;

    /* Update the attendees engagement value */
    socketMethods.updateAttendee(session, socket.id, payload);

    /* Update number of impressions*/
    presentations[session].data.impressions++;

    const newData = Object.assign(
      {},
      socketMethods.calculateAverageValue(session),
      socketMethods.calculatePercentageValue(session)
    );

    presentations[session].data.engagement = newData;

    console.log("onattendeepayload", presentations[session].data);

    io.sockets.in(session).emit("updateHost", presentations[session].data);
  };

/* Presenter Payload */
export const makeOnPresenterPayload = (
  io,
  presentations,
  socketMethods,
  dbActions
) =>
  function onPresenterPayload(payload) {
    const socket = this;

    if (socket.id !== presentations[payload.session].owner) return;

    if (
      !socketMethods.sessionExists(payload.session) ||
      socketMethods.sessionHasEnded(payload.session)
    ) {
      socket.disconnect();
      return;
    }

    presentations[payload.session].data = payload.payload;

    const numOfAttendees = payload.payload.attendees;

    io.sockets
      .in(payload.session)
      .emit("updateClient", socketMethods.passClientData(payload.session));

    // Shut down the Socket Connection and update the DB status to hasEnded
    if (payload.payload.status.hasEnded) {
      const presentationNSP = io.of(payload.session); // Get Namespace
      const connectedNameSpaceSockets = Object.keys(presentationNSP.connected); // Get Object with Connected SocketIds as properties
      connectedNameSpaceSockets.forEach(socketId => {
        presentationNSP.connected[socketId].disconnect(); // Disconnect Each socket
      });
      presentationNSP.removeAllListeners(); // Remove all Listeners for the event emitter
      delete io.nsps[payload.session]; // Remove from the server namespaces

      dbActions
        .endPresentation(
          presentations[payload.session].presentationId,
          numOfAttendees,
          payload.payload.status.time
        )
        .then(console.log)
        .catch(console.error);
    }
  };

export const makeOnPresenterSavePolling = (
  io,
  presentations,
  socketMethods,
  dbActions
) =>
  function onPresenterSavePolling(payload) {
    console.log("presenterRequestsSave", payload);

    const socket = this;

    if (
      !socketMethods.sessionExists(payload.sessionId) ||
      socketMethods.sessionHasEnded(payload.sessionId)
    ) {
      socket.disconnect();
      return;
    }

    /* TODO: Update session data for presentation in DB */
    dbActions.savePresentationValues({
      payload,
      presentationId: presentations[payload.sessionId].presentationId
    });
  };

/* On Disconnect */
export const makeOnDisconnectHandler = (io, presentations, socketMethods) =>
  function onDisconnect() {
    const socket = this;

    // The attendees socketID
    const attendeeId = socket.id;

    // The attendees connected presentations
    const attendeePresentations = Object.values(
      Object.assign({}, socket.rooms)
    );

    // Loop over all of the presentations the attendee is connected to
    attendeePresentations.forEach(sessionId => {
      // If the sessionId is different to the attendees own session remove it from that presentation
      if (sessionId !== attendeeId) {
        /* If the owner of the session disconnects. Pause the session and update the clients */
        if (presentations[sessionId].owner === attendeeId) {
          presentations[sessionId].data.status.isPaused = true;
          presentations[sessionId].data.status.wasDisconnected = true;
          io.sockets
            .in(sessionId)
            .emit("updateClient", presentations[sessionId].data);
        }

        // Remove the attendee from the attendees list
        presentations[sessionId].attendees.delete(attendeeId);

        // Update the presentations number of attendees
        presentations[
          sessionId
        ].data.attendees = socketMethods.getNumOfAttendees(sessionId);

        // Re-calculate the data since we're now an attendee short
        const newData = Object.assign(
          {},
          socketMethods.calculateAverageValue(sessionId),
          socketMethods.calculatePercentageValue(sessionId)
        );

        // Update the data with the changes in mind
        presentations[sessionId].data.engagement = newData;

        // Emit the new data to the host
        io.sockets
          .in(sessionId)
          .emit("updateHost", presentations[sessionId].data);
      }
    });
  };
