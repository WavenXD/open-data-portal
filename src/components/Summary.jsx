import { useContext, useState, useMemo } from "react";
import { PreferenceContext } from "src/pages/_app";
import { formatISO, startOfToday, sub } from "date-fns";

import { Grid } from "@mui/material";
import { CustomProgressBar } from "./CustomProgressBar";
import Card from "src/components/Card";
import DateRangeSelector from "src/components/DateRangeSelector";

import { useSummarizedData } from "src/lib/hooks/swr-extensions";
import { round, capitalize, urlWithParams } from "src/lib/utilityFunctions";
import styles from "src/styles/Summary.module.css";

const ENDPOINT = "/api/v3/measurements/history?";

const Summary = () => {
  const { preferences } = useContext(PreferenceContext);
  const [startDate, setStartDate] = useState(startOfToday());
  const [endDate, setEndDate] = useState(new Date());

  const urls = useMemo(() => {
    const base = {
      temperatureUnit: preferences.temperatureUnit.symbol,
      conductivityUnit: preferences.conductivityUnit.symbol,
      includeMeasurements: false,
    };
    return {
      current: urlWithParams(ENDPOINT, {
        ...base,
        startTime: formatISO(startDate),
        endTime: formatISO(endDate),
        locationName: preferences.location.symbol,
      }),
      allTime: urlWithParams(ENDPOINT, {
        ...base,
        locationName: preferences.location.symbol,
      }),
      lastYears: urlWithParams(ENDPOINT, {
        ...base,
        startTime: formatISO(sub(startDate, { years: 1 })),
        endTime: formatISO(sub(endDate, { years: 1 })),
        locationName: preferences.location.symbol,
      }),
      archipelago: urlWithParams(ENDPOINT, {
        ...base,
        startTime: formatISO(startDate),
        endTime: formatISO(endDate),
      }),
    };
  }, [preferences, startDate, endDate]);

  /* the data for the selected period */
  const { summarizedData, isLoading, isLagging, error } = useSummarizedData(urls.current);

  /* the data for comparing all time */
  const {
    summarizedData: allTimeData,
    isLoading: allTimeLoading,
    isLagging: allTimeLagging,
    error: allTimeError,
  } = useSummarizedData(urls.allTime);

  /* the data for comparing the same period last year */
  const {
    summarizedData: lastYearsData,
    isLoading: lastYearsLoading,
    isLagging: lastYearsLagging,
    error: lastYearsError,
  } = useSummarizedData(urls.lastYears);

  /* the data for comparing the entire archipelago for this period*/
  const {
    summarizedData: archipelagoData,
    isLoading: archipelagoLoading,
    isLagging: archipelagoLagging,
    error: archipelagoError,
  } = useSummarizedData(urls.archipelago);

  const isAnyLoading = isLoading || allTimeLoading || lastYearsLoading || archipelagoLoading;
  const isAnyLagging = isLagging || allTimeLagging || lastYearsLagging || archipelagoLagging;

  const columns = isAnyLoading || error ? [] : Object.keys(summarizedData.sensors);
  const columnCount = 3 + 3 * columns.length;

  return (
    <Card title="Summarize data over a period">
      {(isAnyLagging || isAnyLoading) && !error && <CustomProgressBar/>}
      {!isLoading && error && <div>No data for selected timerange and location</div>}
      <Grid container columns={columnCount} spacing={0} className={styles.gridContainer}>
        <Grid item xs={Math.floor(columnCount / 2)} sm={4} md={3} sx={{ fontWeight: 600 }}>

          {/* empty div but force height with 0-width unicode symbol */}
          <div className={styles.header}>{"\u200b"}</div>

          {/* period's delta */}
          <div className={styles.section}>
            <div className={styles.row}>Period start</div>
            <div className={styles.row}>Period end</div>
            <div className={styles.row}>Change</div>
          </div>

          {/* current period */}
          <div className={styles.section}>
            <div className={styles.row}>Minimum</div>
            <div className={styles.row}>Average</div>
            <div className={styles.row}>Maximum</div>
          </div>

          {/* compared to section */}
          <div className={styles.section}>
            <div className={`${styles.row}  ${styles.comparedToHeader}`}>
              Compared to:
            </div>

            {/* compared to all-time */}
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>
              {"all time's average"}
            </div>

            {/* compared to last year */}
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>
              same period last year
            </div>

            {/* compared to the archipelago */}
            <div className={`${styles.row}  ${styles.comparedTo}`}>
              <span className={styles.icon}>{"\u27A4"}</span>
              the entire archipelago
            </div>
          </div>

        </Grid>

        <Grid item xs={Math.floor(columnCount / 2)} sm={8} md={9} className={styles.gridValues}>
          {(!isAnyLoading && !error) && Object.entries(summarizedData.sensors).map(([sensor, sensorData], index) => {
            const unit = preferences[`${sensor.toLowerCase()}Unit`]?.symbol;
            const capitalizedUnit = capitalize(unit);

            const periodDelta = round(sensorData?.end - sensorData?.start);
            const deltaOptions = {
              inPercent: round(periodDelta / sensorData?.start * 100),
              sign: periodDelta < 0 ? "" : "+",
              color: periodDelta < 0 ? "red" : "green",
            };

            const comparedToAllTime = allTimeError && !allTimeLagging ? "No data found" : round(allTimeData?.sensors[sensor]?.avg - sensorData?.avg);
            const allTimeOptions = {
              inPercent: round(comparedToAllTime / sensorData?.avg * 100),
              sign: comparedToAllTime < 0 ? "" : "+",
              color: comparedToAllTime < 0 ? "red" : "green",
            };

            const comparedToLastYear = lastYearsError && !lastYearsLagging ? "No data found" : round(lastYearsData?.sensors[sensor]?.avg - sensorData?.avg);
            const lastYearsOptions = {
              inPercent: round(comparedToLastYear / sensorData?.avg * 100),
              sign: comparedToLastYear < 0 ? "" : "+",
              color: comparedToLastYear < 0 ? "red" : "green",
            };

            const archipelagoAverage = archipelagoError && !archipelagoLagging ? "No data found" : round(archipelagoData?.sensors[sensor]?.avg - sensorData?.avg);
            const archipelagoOptions = {
              inPercent: round(archipelagoAverage / sensorData?.avg * 100),
              sign: archipelagoAverage < 0 ? "" : "+",
              color: archipelagoAverage < 0 ? "red" : "green",
            };

            return (
              <Grid item key={index} xs={6} md={4} lg={3} className={styles.gridValue}>

                <div className={styles.header}>
                  {sensor === "ph" ? "ph" : capitalize(sensor)} {capitalizedUnit && `(${capitalizedUnit})`}
                </div>

                {/* period's delta */}
                <div className={styles.section}>
                  <div className={styles.row}>{sensorData.start}</div>
                  <div className={styles.row}>{sensorData.end}</div>
                  <div className={styles.row}>
                    <span style={{ color: deltaOptions.color, width: "max-content" }}>
                      {deltaOptions.sign}{periodDelta} {capitalizedUnit} ({deltaOptions.sign}{deltaOptions.inPercent} %)
                    </span>
                  </div>
                </div>

                {/* current period */}
                <div className={styles.section}>
                  <div className={styles.row}>{sensorData.min}</div>
                  <div className={styles.row}>{sensorData.avg}</div>
                  <div className={styles.row}>{sensorData.max}</div>
                </div>

                {/* compared to section */}
                <div className={styles.section}>

                  {/* empty div but force height with 0-width unicode symbol */}
                  <div className={`${styles.row} ${styles.comparedToHeader}`}>{"\u200b"}</div>

                  {/* compared to all-time */}
                  <div className={styles.row}>
                    <span style={{ color: allTimeOptions.color, minWidth: "max-content" }}>
                      {allTimeOptions.sign}{comparedToAllTime} {capitalizedUnit} ({allTimeOptions.sign}{allTimeOptions.inPercent} %)
                    </span>
                  </div>

                  {/* compared to last year */}
                  <div className={styles.row}>
                    <span style={{ minWidth: "max-content" }}>
                      {typeof comparedToLastYear === "string" ? comparedToLastYear :
                        <span style={{ color: lastYearsOptions.color }}>
                          {lastYearsOptions.sign}{comparedToLastYear} {capitalizedUnit} ({lastYearsOptions.sign}{lastYearsOptions.inPercent} %)
                        </span>
                      }
                    </span>
                  </div>

                  {/* compared to the archipelago */}
                  <div className={styles.row}>
                    <span style={{ color: archipelagoOptions.color, minWidth: "max-content" }}>
                      {archipelagoOptions.sign}{archipelagoAverage} {capitalizedUnit} ({archipelagoOptions.sign}{archipelagoOptions.inPercent} %)
                    </span>
                  </div>

                </div>

              </Grid>
            );
          })}
        </Grid>
      </Grid>

      <div>
        <DateRangeSelector
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
        />
      </div>

    </Card>
  );
};
export default Summary;
