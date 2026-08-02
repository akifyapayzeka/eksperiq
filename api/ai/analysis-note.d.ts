import type { IncomingMessage, ServerResponse } from "node:http";

declare function handler(request: IncomingMessage, response: ServerResponse): Promise<void>;
declare namespace handler {
  const DEFAULT_OPENROUTER_MODEL: string;
}

export default handler;
