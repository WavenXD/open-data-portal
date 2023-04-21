// pages/api/measurements.ts

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
}

// Export default function to handle API requests
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check the HTTP method of the request
    if (req.method === 'GET') {
      // Handle GET request

      // Return the current pitch, roll, and yaw data as a JSON response
      res.status(200).json({ pitch, roll, yaw });
    } else if (req.method === 'POST') {
      // Handle POST request

      // Parse the incoming JSON request body
      const requestBody: PitchRollYawData = JSON.parse(req.body);

      // Store the request data into the database
      await createOne({
        stingray_id: 0,
        long: 0, // Update with your own values
        lat: 0, // Update with your own values
        pitch: requestBody.pitch,
        roll: requestBody.roll,
        time: new Date(),
        temperature: 0, // Update with your own values
      });

      // Update pitch, roll, and yaw data with the values from the request body
      pitch = requestBody.pitch;
      roll = requestBody.roll;
      yaw = requestBody.yaw;

      // Print the received data to console (for demonstration purposes)
      console.log('Received data from Raspberry Pi:', requestBody);

      // Return a JSON response indicating success
      res.status(200).json({ success: true, message: 'Pitch, roll, and yaw data received successfully' });
    } else {
      // Handle unsupported HTTP methods with an error response
      res.status(400).json({ success: false, message: 'Invalid HTTP method' });
    }
  } catch (error) {
    // Handle any errors with an error response
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
