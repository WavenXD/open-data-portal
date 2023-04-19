import { createPool, OkPacket, RowDataPacket, Pool } from "mysql2/promise";

//import { connection } from "./db"


const connection: Pool = createPool({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "sensor_network",
  timezone: "+00:00",
  connectionLimit: 1000,
});

const c = {
    /* define ranges for measurements */
    MIN_TEMP: 0,
    MAX_TEMP: 20,

    /* define how much each datapoint is allowed to change between each point,
     * the rate is a randomized value between -<change_rate> < 0 < <change_rate> */
    TEMP_CHANGE_RATE: 0.1,

  };

function theLocation(): [number, number] {
    let LAT: number = 56.181017; // Starting position
    let LONG: number = 15.588019; //Starting position
    const latChange: number = Math.random() / 20000;
    const longChange: number = Math.random() / 20000;
    const posNegLat: number = Math.random(); // Positive or negative direction
    const posNegLong: number = Math.random();
  
    if (posNegLat > 0.5) {
      LAT -= latChange;
    } else {
      LAT += latChange;
    }
  
    if (posNegLong > 0.5) {
      LONG -= longChange;
    } else {
      LONG += longChange;
    }
  
    return [LONG, LAT];
  }
  
  const generateTheTemperature = (value: number) => {
    let rate =
      Math.random() < 0.5
        ? Math.random() * c.TEMP_CHANGE_RATE
        : -Math.random() * c.TEMP_CHANGE_RATE;
    let newVal = value + rate;
    return newVal < c.MIN_TEMP || newVal > c.MAX_TEMP
      ? value - rate
      : value + rate;
  };
  
  function getTheCurrentTime(): string {
    const now: Date = new Date();
    return now.toLocaleTimeString();
  }
  
  // This loop function is just to simulate that the stingray send the data in intervals.
  function theLoopFunction(): void {
    const temperature: number = generateTheTemperature(10);
    console.log(`The temperature is ${temperature} degrees.`);
    const currentTime: string = getTheCurrentTime();
    console.log(`The current time is ${currentTime}.`);
    const loc: [number, number] = theLocation();
    console.log(`Longitude = ${loc[0]}, latitude ${loc[1]}`);
  }
  
  setInterval(theLoopFunction, 1000); // Runs myLoopFunction every 1000 milliseconds (1 second)