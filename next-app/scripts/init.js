db = db.getSiblingDB("MotorDeBusca"); // muda para o banco MotorDeBusca

db.createCollection("users");

db.users.insertOne({
  nome: "admin",
  email: "admin@gmail.com",
  senha: "senha123",
});