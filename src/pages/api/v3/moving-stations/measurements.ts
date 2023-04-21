// pages/api/pitchRollYaw.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createOne, Stingray } from "~/lib/database/stingray";

// Global variables to store pitch, roll, and yaw data
let pitch = 0;
let roll = 0;
let yaw = 0;

// Interface for incoming request body
interface PitchRollYawData {
  pitch: number;
  roll: number;
  yaw: number;
  time: Date;
  long: number;
  lat: number;
  temperature: number;
}


// Export default function to handle API requests
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check the HTTP method of the request
    if (req.method === "GET") {
      // Handle GET request

      // Return the current pitch, roll, and yaw data as a JSON response
      res.status(200).json({ pitch, roll, yaw });
    } else if (req.method === "POST") {
      // Handle POST request

      // Parse the incoming JSON request body

      const requestBody: PitchRollYawData = JSON.parse(req.body) as PitchRollYawData;
      const { pitch, roll, long, lat, time, temperature } = req.body;
      // Create a Stingray object using the properties from the request body
      const stingray: Stingray = {
        stingray_id: 0,
        pitch: requestBody.pitch,
        roll: requestBody.roll,
        long: 0, // replace with the correct value from requestBody
        lat: 0, // replace with the correct value from requestBody
        time: new Date(time), // replace with the correct value from requestBody
        temperature: 0, // replace with the correct value from requestBody
      };

      console.log('req.body:', req.body); // TEST
      // const requestBody: Stingray = {
      //   stingray_id: 0,
      //   pitch,
      //   roll,
      //   long,
      //   lat,
      //   time,
      //   temperature,
      // };

      // Update pitch, roll, and yaw data with the values from the request body
      //pitch = requestBody.pitch;
      //roll = requestBody.roll;
      //yaw = requestBody.yaw;

      // Store the data in the database
      console.log('requestBody:', requestBody);
      console.log('requestBody.pitch:', requestBody.pitch);
      console.log('requestBody.roll:', requestBody.roll);
      console.log('requestBody.yaw:', requestBody.yaw);
      console.log('requestBody.long:', requestBody.long);
      console.log('requestBody.lat:', requestBody.lat);
      console.log('requestBody.time:', requestBody.time);
      console.log('requestBody.temperature:', requestBody.temperature);
      const id = await createOne(stingray);

      // Print the received data to console (for demonstration purposes)
      console.log("Received data from Raspberry Pi:", requestBody);

      // Return a JSON response indicating success
      res.status(200).json({
        success: true,
        message: "Stingray data received successfully",
        id,
      });
    } else {
      // Handle unsupported HTTP methods with an error response
      res.status(400).json({ success: false, message: "Invalid HTTP method" });
    }
  } catch (error) {
    // Handle any errors with an error response
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
