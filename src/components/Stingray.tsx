/* eslint-disable prettier/prettier */
import { useEffect, useState, useContext, useReducer, useMemo } from "react";
import { useLocations } from "~/lib/hooks";

import type { PointTuple } from "leaflet";

import type { Location } from "~/lib/database/location";

import { PreferenceContext } from "~/lib/utils/preferences";
import { useInterval } from "~/lib/hooks";
import LocationRow from "./LocationRow";
import Card from "./Card";
import styles from "src/styles/Dashboard.module.css";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./CustomProgressBar";
import { Stack, Slider } from "@mui/material";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import SpeedIcon from "@mui/icons-material/Speed";
import { urlWithParams, fetcher } from "~/lib/utils/fetch";

const MAP_CENTER: PointTuple = [56.178516, 15.60261];
const INITIAL_DELAY = 5000;

/* load map without ssr due to lack of support with Leaflet */
import dynamic from "next/dynamic";
import { Console } from "console";
const MapWithNoSSR = dynamic(() => import("./StingrayMap"), {
  ssr: false,
});






/** reducer for a state with unique array elements, only two actions
 * allowed - push and pop. push only adds an element if it is not already
 * in the array, pop only removes an element if it is in the array
 **/

const ENDPOINT = "/api/v3/locations?";



export const uniqueArrayReducer = (
  state: number[],
  action: { type: "push" | "pop"; index: number }
) => {
  switch (action.type) {
    case "push":
      if (state.includes(action.index)) return state;
      return [...state, action.index];
    case "pop":
      return state.filter((i) => i !== action.index);
  }
};

// export const getLocations = () => {
//   const [location, setLocation] = useState<any>(undefined);

//   useEffect(()=>{

//   });

//   return location;
// }

var Stingray = () => {
  //console.log("Yipeeee");
  const url: string = useMemo(
    () => urlWithParams(ENDPOINT, { "Access-Control-Allow-Methods": "*" }),
    []
  );





  //fetcher(url).then((data) => console.log(data[0].id)); //useLocations(url);
  let bananas;
  fetcher(url)
  .then((bananas) => {
    console.log(bananas[0].name);
    console.log(bananas);
    return bananas;
  })
  .then((bananas) => {
    // do something else with the bananas
    console.log(bananas[1].name);

  });


  //console.log("HAHAHA BANANA: ");
  const { locations } = useContext(PreferenceContext);

  const [intervalDelay, setIntervalDelay] = useState(INITIAL_DELAY);
  const [selectedLocationIndex, setSelectedIndex] = useState(0);
  const [unselectableIndices, updateUnselectable] = useReducer(
    uniqueArrayReducer,
    []
  );

  const selectNextLocation = () => {
    if (!locations) return;
    if (unselectableIndices.length >= locations.length) return;
    const getNextId: (arg0: number) => number = (currentId: number) => {
      // get next idx with wrap around, dont select unselectable locations
      const nextId = currentId === locations.length - 1 ? 0 : currentId + 1;
      // recursively call until we get a valid idx
      if (!unselectableIndices.includes(nextId)) {
        return nextId;
      }
      return getNextId(nextId);
    };

    setSelectedIndex((prev) => getNextId(prev));
  };

  useInterval(selectNextLocation, intervalDelay);

  return (
    <Card title="Angle" styles={{ margin: "40px 0 0 0" }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 2 }}>
        <ThemeProvider theme={theme}>
          <SlowMotionVideoIcon color="primary" fontSize="large" />
          <Slider
            aria-label="Interval Speed"
            valueLabelDisplay="auto"
            valueLabelFormat={(v: number) => `${Math.round(v / 1000)}s`}
            value={intervalDelay}
            onChange={(e, v) => setIntervalDelay(v as number)}
            min={1 * 1000} // 1s
            max={60 * 1000} // 1min
            color="primary"
          />
          <SpeedIcon color="primary" fontSize="large" />
        </ThemeProvider>
      </Stack>

      <div className={styles.container}>
        {locations ? (
          <>
            <div className={styles.left}>
              <p>London is the capital city of England.</p>
            </div>
            <div className={styles.right}>
              
              <MapWithNoSSR
                locations={locations}
                selectedLocation={selectedLocationIndex}
                mapCenter={MAP_CENTER}
                unselectableIndices={unselectableIndices}
              />
              <div>
                {locations?.map((location, index) => (
                  <div key={location.id} style={{ margin: "5px 0" }}>
                    <LocationRow
                      key={location.id}
                      locationName={location.name}
                      selected={index === selectedLocationIndex}
                      dontSelectThisOne={() =>
                        updateUnselectable({ type: "push", index })
                      }
                      canSelectThisOne={() =>
                        updateUnselectable({ type: "pop", index })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.left}>
              <p>London is the capital city of England.</p>
            </div>
            <div className={styles.right}>
              {/* <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Temperature (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {bananas.map((banana) => (
                    <tr key={banana.name}>
                      <td>{banana.name}</td>
                      <td>{banana.id}</td>
                      <td>{banana.radiusMeters}</td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            </div>
          </>
        ) : (
          <div>Loading</div>
        )}
      </div>
    </Card>
  );
};

export default Stingray;
