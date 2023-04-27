import { getConnectionPool } from "./connection";
import mysql, { RowDataPacket, OkPacket } from "mysql2/promise";

export type Stingray = {
  stingray_id: number;
  longitude: number;
  latitude: number;
  pitch: number;
  roll: number;
  time: Date;
  temperature: number;
};

export const createOne = async ({
  longitude,
  latitude,
  pitch,
  roll,
  time,
  temperature,
}: Stingray) => {
  console.log("createOne called with parameters:", {
    longitude,
    latitude,
    pitch,
    roll,
    time,
    temperature,
  });
  try {
    const connection = await getConnectionPool();
    const result = await connection.query(
      `
      INSERT INTO stingray (longitude, latitude, pitch, roll, time, temperature)
      VALUES (?, ?, ?, ?, ?, ?)
  `,
      [
        longitude,
        latitude,
        pitch,
        roll,
        time.toISOString().slice(0, 19).replace("T", " "),
        temperature,
      ]
    );
    console.log(connection);
    const okPacket = result[0] as OkPacket;
    return okPacket.insertId;
  } catch (err) {
    console.log(err);
  }
};

export const findById = async (id: number) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
        SELECT *
        FROM stingray
        WHERE stingray_id = ?
    `,
    [id]
  );
  const rows = result[0] as RowDataPacket[];
  return rows[0] as Stingray;
};

export const findMany = async () => {
  const connection = await getConnectionPool();
  const result = await connection.query(`
        SELECT *
        FROM stingray
    `);
  return result[0] as Stingray[];
};

export const updateOne = async ({
  id,
  longitude,
  latitude,
  pitch,
  roll,
  time,
  temperature,
}: Stingray & { id: number }) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      UPDATE stingray
      SET longitude   = ?,
          latitude    = ?,
          pitch       = ?,
          roll        = ?,
          time        = ?,
          temperature = ?
      WHERE stingray_id = ?
  `,
    [longitude, latitude, pitch, roll, time, temperature, id]
  );
  return result[0] as OkPacket;
};

export const deleteById = async (id: number) => {
  const connection = await getConnectionPool();
  const result = await connection.query(
    `
      DELETE FROM stingray
      WHERE stingray_id = ?
  `,
    [id]
  );
  return result[0] as OkPacket;
};
