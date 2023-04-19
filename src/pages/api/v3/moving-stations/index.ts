import { NextApiRequest, NextApiResponse } from "next";

const movingStationsHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // Handle POST request with JSON payload
    const { data } = req.body;

    // Process the JSON payload
    console.log("Received JSON data:", data); // Print out the JSON data in the console

    // Send response
    res.status(200).json({ result: "success" });
  } else {
    // Handle other HTTP methods or return error
    res.status(400).json({ error: "Invalid request" });
  }
};

export default movingStationsHandler;
