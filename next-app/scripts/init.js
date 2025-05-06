db = db.getSiblingDB("MotorDeBusca"); // muda para o banco MotorDeBusca

db.createCollection("users");

const senha = "senha123";
const salt = await bcrypt.genSalt(10);
const senhaCriptografada = await bcrypt.hash(senha,salt);

db.users.insertOne({
  nome: "admin",
  email: "admin@gmail.com",
  senha: senhaCriptografada // Idealmente já criptografada em produção
});