print(
  'Start #################################################################',
);
rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] });
db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [],
});

print('END #################################################################');
