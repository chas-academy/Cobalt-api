import * as dbActions from "./actions";

beforeAll(async () => {
  await dbActions.deleteUser({
    email: "jane@doe.com"
  });
});

describe("Database Actions Test", () => {
  it("creates a new user", async () => {
    const userIn = {
      email: "jane@doe.com",
      name: "Jane Doe",
      password: "secret"
    };

    const userOut = await dbActions.createUser(userIn);

    expect(userOut).toEqual(
      expect.objectContaining({
        __v: expect.anything(),
        _id: expect.anything(),
        email: expect.stringContaining(userIn.email),
        name: expect.stringContaining(userIn.name),
        workspaces: expect.any(Array),
        password: expect.any(String)
      })
    );
  });

  it("finds user by email", async () => {
    const userFound = await dbActions.getUserFromEmail(
      "jane@doe.com",
      /* withPassword */ true
    );

    expect(userFound).toEqual(
      expect.objectContaining({
        __v: expect.anything(),
        _id: expect.anything(),
        email: expect.anything(),
        name: expect.anything(),
        workspaces: expect.any(Array),
        password: expect.any(String)
      })
    );
  });
});
