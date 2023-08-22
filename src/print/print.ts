import { promises as fs } from "fs";
import fsBase from "fs";
import execAsync from "../utils/exec-async";

export default async function print(
  file: string | Buffer,
  printer?: string,
  options?: string[]
): Promise<void> {
  let tmpFilePath: string;
  const args = [];

  if (typeof file === "undefined") {
    throw "No file specified";
  } else if (typeof file === "string") {
    if (!fsBase.existsSync(file)) throw "No such file";

    args.push(`'${file}'`);
  } else if (!isPdf(file)) {
    throw "File has to be a PDF";
  } else {
    tmpFilePath = `/tmp/${(Math.random() + 1).toString(36).substring(7)}.pdf`;

    await fs.writeFile(tmpFilePath, file);
    args.push(`'${tmpFilePath}'`);
  }

  if (printer) {
    args.push("-d", printer);
  }

  if (options) {
    if (!Array.isArray(options)) throw "options should be an array";

    options.forEach((arg) => args.push(arg));
  }

  return execAsync(`lp ${args.join(" ")}`).finally(() => {
    if (tmpFilePath) fs.rm(tmpFilePath);
  });
}

const isPdf = (buffer: Buffer) =>
  Buffer.isBuffer(buffer) &&
  buffer.lastIndexOf("%PDF-") === 0 &&
  buffer.lastIndexOf("%%EOF") > -1;
