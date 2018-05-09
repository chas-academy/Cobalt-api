import * as dbActions from "./actions";

const User = {
  getUserFromId: id => {
    if (!id) return Promise.reject(Error("Error"));

    Promise.resolve({
      _id: id
    });
  }
};

const makeMockGetUserFromId = User => dbActions.getUserFromId;

const getUserFromId = makeMockGetUserFromId(User);

console.log(getUserFromId);

it("passes a dummy test", () => {
  expect(2).toBe(2);
});

it("finds a userByid", () => {
  // const user = getUserFromId("someString");
  // expect(user).toBe({
  //   _id: "someString"
  // });
});
