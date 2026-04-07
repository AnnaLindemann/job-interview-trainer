type LogLevel = "info" | "warn" | "error" | "success";

function formatMessage(level: LogLevel, message: string): string {
  const prefixMap: Record<LogLevel, string> = {
    info: "[INFO]",
    warn: "[WARN]",
    error: "[ERROR]",
    success: "[SUCCESS]",
  };

  return `${prefixMap[level]} ${message}`;
}

export function logInfo(message: string): void {
  console.log(formatMessage("info", message));
}

export function logWarn(message: string): void {
  console.warn(formatMessage("warn", message));
}

export function logError(message: string): void {
  console.error(formatMessage("error", message));
}

export function logSuccess(message: string): void {
  console.log(formatMessage("success", message));
}