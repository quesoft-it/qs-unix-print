import { Printer } from "../types";
import execAsync from "../utils/exec-async";
import parsePrinterAttribute from "../utils/parse-printer-attribute";

export default async function getPrinters(): Promise<Printer[]> {
  try {
    //Not working if system language is not english (try locale command?)
    const { stdout } = await execAsync("lpstat -lp");
    const { stdoutLang } = await execAsync("locale");

    const isThereAnyPrinter = stdout.match("printer");
    if (!isThereAnyPrinter) return [];

    if (stdoutLang.includes("hu_HU")) {
      return stdout
        .split(/^printer(.)/gm)
        .filter((line: string) => line.trim().length)
        .map((line: string) => ({
          printer: line.substr(0, line.indexOf(" ")),
          status: line.split(/.*is\s(\w+)\..*/gm)[1],
          description: parsePrinterAttribute(line, "Leírás"),
          alerts: parsePrinterAttribute(line, "Riasztások"),
          connection: parsePrinterAttribute(line, "Kapcsolat"),
        }));
    }
    else {
      return stdout
        .split(/^printer(.)/gm)
        .filter((line: string) => line.trim().length)
        .map((line: string) => ({
          printer: line.substr(0, line.indexOf(" ")),
          status: line.split(/.*is\s(\w+)\..*/gm)[1],
          description: parsePrinterAttribute(line, "Description"),
          alerts: parsePrinterAttribute(line, "Alerts"),
          connection: parsePrinterAttribute(line, "Connection"),
        }));
    }
    
  } catch (error) {
    throw error;
  }
}
