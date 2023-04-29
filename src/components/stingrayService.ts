import mysql, { RowDataPacket } from "mysql2/promise";

export type Stingray = {
  stingray_id: number;
  longitude: number;
  latitude: number;
  pitch: number;
  roll: number;
  time: Date;
  temperature: number;
};

export const getStingrays = async (): Promise<Stingray[]> => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin",
    database: "sensor-network",
  });

  const [rows] = await connection.execute<RowDataPacket[]>(
    "SELECT * FROM stingray"
  );

  const stingrays: Stingray[] = rows.map(
    (row) =>
      ({
        stingray_id: row.stingray_id,
        longitude: row.longitude,
        latitude: row.latitude,
        pitch: row.pitch,
        roll: row.roll,
        time: row.time,
        temperature: row.temperature,
      } as Stingray)
  );

  return stingrays;
};
