import * as Sting from "~/lib/database/stingray";
import { NextApiRequest, NextApiResponse } from "next";

const movingStationsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "GET") {
    // Send the list of moving stations as a JSON response
    res.status(200).json({ result: "GET success" });
  } else if (req.method === "POST") {
    // Handle POST request with JSON payload
    const { data } = req.body;

    // Save the data to the database
    try {
      const createdStingrayId = await Sting.createOne(data);
      console.log("createdStingrayId:", createdStingrayId);
      console.log(`Data saved to database with ID ${createdStingrayId}`);
      res.status(200).json({ result: "success" });
    } catch (error) {
      console.error("Error saving data to database:", error);
      res.status(500).json({ error: "Error saving data to database" });
    }
  } else {
    // Handle other HTTP methods or return error
    res.status(400).json({ error: "Invalid request" });
  }
};

export default movingStationsHandler;
