const users = [];

// Join user to chat
const userJoin = (id, username, channel) => {
  const user = { id, username, channel };
  users.push(user);
  return user;
};

const getCurrentUser = id => {
  return users.find(user => user.id === id);
};

// User leaves chat
const userLeave = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get room users
const getRoomUsers = channel => {
  return users.filter(user => user.channel === channel);
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
