// pages/api/measurements.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createOne, getLatestPitchRoll } from "~/lib/database/stingray";

// Global variables to store pitch, roll, and yaw data
let pitch = 0;
let roll = 0;

// Interface for incoming request body
interface PitchRollData {
  data: {
    pitch: number;
    roll: number;
  };
}

// Export default function to handle API requests
export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    // Check the HTTP method of the request
    if (req.method === "GET") {
      // Handle GET request

      // Return the current pitch, roll, and yaw data as a JSON response
      res.status(200).json({ pitch, roll });
    } else if (req.method === "POST") {
      // Handle POST request

      // Parse the incoming JSON request body
      try {
        // Parse the incoming JSON request body
        const requestBody: PitchRollData = JSON.parse(req.body);

        // Store the request data into the database
        await createOne({
          stingray_id: 0,
          longitude: 0, // Update with your own values
          latitude: 0, // Update with your own values
          pitch: requestBody.data.pitch,
          roll: requestBody.data.roll,
          time: new Date(),
          temperature: 0, // Update with your own values
        });

        // Update pitch, roll, and yaw data with the values from the request body
        pitch = requestBody.data.pitch;
        roll = requestBody.data.roll;

        // Print the received data to console (for demonstration purposes)
        //console.log("Received data from Raspberry Pi:", requestBody, "requestBody.pitch", requestBody.data.pitch, "requestBody.roll", requestBody.data.roll);

        // Return a JSON response indicating success
        res.status(200).json({
          success: true,
          message: "Pitch, roll, and yaw data received successfully",
        });
      } catch (error) {
        // Handle any errors with an error response
        res
          .status(400)
          .json({ success: false, message: "Invalid JSON request body" });
      }
    }
  } catch (error) {
    // Handle any errors with an error response
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch the latest pitch and roll values from the "stingray" table
async function fetchLatestPitchRoll() {
  const latestPitchRoll = await getLatestPitchRoll();
  if (latestPitchRoll) {
    pitch = latestPitchRoll.pitch;
    roll = latestPitchRoll.roll;
  }
}

// Call the function to fetch the latest pitch and roll values on server startup
fetchLatestPitchRoll();
