// DNS guard for the reviews fetch. The lookup hook resolves every address for
// the host, refuses the lot if any one is in an IANA special-purpose range, and
// hands the socket the exact address it checked, so no second lookup happens.
import { lookup as dnsLookup } from "node:dns";
import { BlockList, isIP } from "node:net";

export type Resolved = { address: string; family: number };
export type Resolver = (host: string) => Promise<Resolved[]>;

const v4 = new BlockList();
for (const [net, bits] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) v4.addSubnet(net, bits, "ipv4");

const v6 = new BlockList();
for (const [net, bits] of [
  ["::", 128], ["::1", 128], ["100::", 64], ["2001::", 23], ["2001:db8::", 32], ["3fff::", 20],
  ["5f00::", 16], ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8],
] as const) v6.addSubnet(net, bits, "ipv6");

// The sixteen bytes of an IPv6 address, or null when it does not parse.
function v6Bytes(addr: string): number[] | null {
  let s = addr.split("%")[0];
  const tail: number[] = [];
  const dotted = s.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) {
    if (isIP(dotted[1]) !== 4) return null;
    tail.push(...dotted[1].split(".").map(Number));
    s = s.slice(0, -dotted[1].length) + "0:0";
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const words = (h: string) => (h ? h.split(":").map((w) => parseInt(w, 16)) : []);
  const head = words(halves[0]);
  const rest = halves.length === 2 ? words(halves[1]) : [];
  const fill = 8 - head.length - rest.length;
  if (fill < 0 || (halves.length === 1 && fill !== 0)) return null;
  const all = [...head, ...Array(fill).fill(0), ...rest];
  if (all.some((w) => !(w >= 0 && w <= 0xffff))) return null;
  const bytes = all.flatMap((w) => [w >> 8, w & 0xff]);
  if (tail.length) bytes.splice(12, 4, ...tail);
  return bytes;
}

// True when the address must never be connected to. Unparseable counts as blocked.
export function isBlockedAddress(addr: string): boolean {
  const kind = isIP(addr.split("%")[0]);
  if (kind === 4) return v4.check(addr, "ipv4");
  if (kind !== 6) return true;
  const b = v6Bytes(addr);
  if (!b) return true;
  const zero = (from: number, to: number) => b.slice(from, to).every((x) => x === 0);
  const asV4 = (at: number) => b.slice(at, at + 4).join(".");
  // v4-mapped ::ffff:0:0/96, v4-translated ::ffff:0:0:0/96, v4-compatible ::/96.
  if (zero(0, 10) && ((b[10] === 0xff && b[11] === 0xff) || (b[10] === 0 && b[11] === 0))) {
    if (zero(0, 12) && zero(12, 16)) return true;
    return isBlockedAddress(asV4(12));
  }
  if (zero(0, 8) && b[8] === 0xff && b[9] === 0xff && zero(10, 12)) return isBlockedAddress(asV4(12));
  // NAT64 64:ff9b::/96 and 64:ff9b:1::/48 carry a v4 in the last 32 bits.
  if (b[0] === 0 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b) {
    if (zero(4, 12)) return isBlockedAddress(asV4(12));
    if (b[4] === 0 && b[5] === 1) return true;
  }
  // 6to4 2002::/16 carries a v4 in bytes 2 to 5.
  if (b[0] === 0x20 && b[1] === 0x02) return isBlockedAddress(asV4(2));
  // Teredo 2001::/32 sits inside the blocked 2001::/23.
  return v6.check(addr.split("%")[0], "ipv6");
}

const systemResolver: Resolver = (host) =>
  new Promise((resolve, reject) =>
    dnsLookup(host, { all: true, verbatim: true }, (err, list) => (err ? reject(err) : resolve(list))),
  );

type LookupCallback = (err: Error | null, address?: string | Resolved[], family?: number) => void;

// A `lookup` for node:https that refuses any name with a blocked address and
// pins the connection to the first checked one.
export function createSafeLookup(resolve: Resolver = systemResolver) {
  return (host: string, options: { all?: boolean } | number | LookupCallback, cb?: LookupCallback): void => {
    const callback = (typeof options === "function" ? options : cb) as LookupCallback;
    const all = typeof options === "object" && options !== null && options.all === true;
    resolve(host).then(
      (list) => {
        if (!list.length || list.some((r) => isBlockedAddress(r.address))) {
          callback(new Error("blocked address"));
          return;
        }
        const pick = { address: list[0].address, family: list[0].family };
        if (all) callback(null, [pick]);
        else callback(null, pick.address, pick.family);
      },
      () => callback(new Error("lookup failed")),
    );
  };
}
