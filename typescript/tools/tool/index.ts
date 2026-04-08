import calculator from "./calculator.ts";
import time from "./timer.ts";
import weather from "./weather.ts";
import search from "./search.ts";

const tools = [calculator, time, weather,search];

export type ToolList = typeof tools;

export default tools;
