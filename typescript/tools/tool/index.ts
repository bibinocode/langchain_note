import calculator from "./calculator.ts";
import time from "./timer.ts";
import weather from "./weather.ts";

const tools = [calculator, time, weather];

export type ToolList = typeof tools;

export default tools;
