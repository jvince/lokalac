export class RequestBodyTooLargeError extends Error {}

export async function readLimitedFormData(
  request: Request,
  maxBytes: number,
): Promise<FormData> {
  const declaredLength = Number(request.headers.get("Content-Length"));

  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyTooLargeError();
  }

  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (reader) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new RequestBodyTooLargeError();
    }

    chunks.push(value);
  }

  const contentType = request.headers.get("Content-Type");
  const headers = contentType ? { "Content-Type": contentType } : undefined;
  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return await new Response(body, { headers }).formData();
}
