# Error Codes

You can find below a list of error codes the program may give you, what they mean and (for some) how you can fix them.

## Flight Setup

| Error Number | Description                                                                | Solution                                                                                                                                                                                                                                                          |
| :----------: | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      1       | One or both of the ICAO codes you have entered are invalid.                | Ensure the ICAO codes you have entered are 4 characters long.                                                                                                                                                                                                     |
|      2       | Your cruise level is invalid.                                              | Ensure your cruise flight level is a multiple of 5 (e.g. `35`, `350` or `375`) **and** is greater than `10`.                                                                                                                                                      |
|      3       |                                                                            |
|      4       | No flight simulator was detected so no data exchange could be established. | Ensure you have [FSUIPC](https://www.schiratti.com/dowson.html) (for FSX or P3D) or [XPUIPC >= 2.0.5.9](http://fsacars.com/downloads/xpuipc/) (for X-Plane) installed. If you run your simulator as Administrator, try running the Toolbox as Administrator, too. |

## Charts

| Error Number | Description                                                        | Solution                        |
| :----------: | ------------------------------------------------------------------ | ------------------------------- |
|      50      | Flight info not set up -- unable to use arrival/departure airport. | Set up your flight information. |
