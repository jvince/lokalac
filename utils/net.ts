import { Context } from "fresh";

function assertIsNetAddr(addr: Deno.Addr): asserts addr is Deno.NetAddr {
  if (!["tcp", "udp"].includes(addr.transport)) {
    throw new Error("Not a network address.");
  }
}

function getRemoteAddFromInfo(info: Deno.ServeHandlerInfo): string {
  assertIsNetAddr(info.remoteAddr);
  return info.remoteAddr.hostname;
}

export function getRemoteAddr<State = unknown>(ctx: Context<State>): string {
  return getRemoteAddFromInfo(ctx.info);
}
