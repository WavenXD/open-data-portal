import { getConnectionPool } from 'lib/database/connection';
import { RowDataPacket, OkPacket } from 'mysql2/promise';
import mysql from 'mysql2/promise';

export type CombinedFormat = {
  type: string,
  time: Date
  min: number,
  avg: number,
  max: number,
}

export const createOne = async (
  {
    date,
    sensorType,
    locationId,
  }: { date: string | Date, sensorType: string, locationId: number },
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: OkPacket, _: any] = await connection.query(`
      INSERT INTO history
          (date, location_id, type, daily_min, daily_avg, daily_max)
      VALUES (?, ?, ?,
              (SELECT MIN(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
              (SELECT AVG(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?),
              (SELECT MAX(value) FROM measurement WHERE date(time) = ? AND location_id = ? AND type = ?))
  `, [
    date, locationId, sensorType,
    date, locationId, sensorType,
    date, locationId, sensorType,
    date, locationId, sensorType,
  ]);
  return result.insertId;
};

/* query for getting data formatted the same way for history and measurement table */
export const findInCombinedFormat = async (
  {
    startDate,
    endDate,
    locationId,
    sortOrder = "ASC",
  }: { startDate: Date | string, endDate: Date | string, locationId: number, sortOrder?: string },
) => {
  /* if locationId = -1 we select all, else select with id */
  const query = locationId > 0
    ? mysql.format(`
              SELECT type, daily_avg as avg, date as time, daily_min as min, daily_max as max
              FROM history
              WHERE location_id = ?
                AND date BETWEEN ? AND ?
              ORDER BY date ${sortOrder}
    `, [
      locationId, startDate, endDate
    ])
    : mysql.format(`
              SELECT type, daily_avg as avg, date as time, daily_min as min, daily_max as max
              FROM history
              WHERE date BETWEEN ? AND ?
              ORDER BY date ${sortOrder}
    `, [
      startDate, endDate
    ]);
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(query);
  return result as CombinedFormat[];
};

export const findMany = async (
  {
    startDate,
    endDate,
    locationId,
    sortOrder = "ASC",
  }: { startDate: string | Date, endDate: string | Date, locationId: number, sortOrder?: string },
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(`
      SELECT *
      FROM history
      WHERE date BETWEEN ? AND ?
        AND location_id = ?
      ORDER BY date ${sortOrder}
  `, [startDate, endDate, locationId]);
  return result;
};

export const findByFilter = async (
  {
    date,
    sensorType,
    locationId,
    sortOrder = "ASC"
  }: { date: string | Date, sensorType: string, locationId: number, sortOrder?: string },
) => {
  const connection = await getConnectionPool();
  const [result, _]: [result: RowDataPacket[], _: any] = await connection.query(`
      SELECT *
      FROM history
      WHERE date = ?
        AND location_id = ?
        AND type = ?
      ORDER BY date ${sortOrder}
  `, [date, locationId, sensorType]);
  return result;
};