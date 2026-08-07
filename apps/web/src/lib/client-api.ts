import type { ApiEnvelope } from "@htmlpub/core";

export async function readApi<T>(response: Response): Promise<T> {
  const envelope = await response.json() as ApiEnvelope<T>;
  if (!envelope.ok) throw new Error(envelope.error.message);
  return envelope.data;
}
