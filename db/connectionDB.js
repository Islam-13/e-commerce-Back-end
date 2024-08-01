import { connect } from "mongoose";

const connectionDB = async () => {
  return await connect(process.env.DB_URL_Online)
    .then(() => console.log("db connected successfully"))
    .catch((err) => console.log("Error connecting to db", err));
};

export default connectionDB;
