const jwt = require('jsonwebtoken');

const JWT_SECRET = "JVOdvgWoPfvZiDVeYEe7Vg7BcDpJb0KZiVIKPtdS+ZaGAhHB5dR5NdpvrUl8Asf4mj7bUKVK7K770brqZ+7UmA==";

const payload = {
  sub: "test-user-id",
  email: "test@example.com",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
};

const token = jwt.sign(payload, JWT_SECRET);
console.log('Generated JWT Token:');
console.log(token);