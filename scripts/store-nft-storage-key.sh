#!/usr/bin/env bash
# store-nft-storage-key.sh — one-shot: store the nft.storage API key in Bitwarden
# as a secure item (same custody pattern as pinFileToIPFS_*), then verify.
#
# USAGE: ./scripts/store-nft-storage-key.sh <key>
#   (or set NFT_STORAGE_API_KEY=<key> and run with no args)
set -euo pipefail

KEY="${1:-${NFT_STORAGE_API_KEY:-}}"
if [ -z "$KEY" ]; then
  echo "usage: $0 <nft.storage API key (eyJ…)>  — or: NFT_STORAGE_API_KEY=… $0"
  exit 1
fi

# Unlock session (bw-unlock helper exports BW_SESSION)
source "$HOME/.hermes/profiles/supercompute/bin/bw-unlock" 2>/dev/null || true
if [ -z "${BW_SESSION:-}" ]; then
  echo "ERROR: no unlocked Bitwarden session. Run the security profile's bw-unlock first."
  exit 1
fi
export BW_SESSION

# Build the item JSON (secure note with the key in a field, notes for provenance)
ITEM_JSON=$(python3 -c "
import json,sys
key = sys.argv[1]
item = {
  'type': 2,
  'name': 'NFT_STORAGE_API_KEY',
  'secureNote': {'type': 0},
  'fields': [
    {'name': 'api_key', 'value': key, 'type': 1},
    {'name': 'service', 'value': 'nft.storage', 'type': 0},
    {'name': 'added_by', 'value': 'C2 via bw CLI', 'type': 0},
  ],
  'notes': 'nft.storage API key — free IPFS pinning (CID-preserving CAR uploads). Used by scripts/ipfs-publish.mjs for always-on remote pinning of supercompute.eth content. Custody: security (Bitwarden). Added by C2 2026-08-13.',
}
print(json.dumps(item))
" "$KEY")
ENC=$(printf '%s' "$ITEM_JSON" | base64)

echo "Storing NFT_STORAGE_API_KEY in Bitwarden…"
OUT=$(bw create item "$ENC")
ITEM_ID=$(echo "$OUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))")
if [ -z "$ITEM_ID" ]; then
  echo "ERROR: create failed: $(echo "$OUT" | head -c 150)"
  exit 1
fi
echo "Stored. Item id: $ITEM_ID"

bw sync >/dev/null 2>&1 || true

# Verify round-trip: read back, confirm key matches (prints only a fingerprint)
VALUE=$(bw get item "$ITEM_ID" 2>/dev/null | python3 -c "
import json,sys
x=json.load(sys.stdin)
for f in (x.get('fields') or []):
    if f.get('name')=='api_key': print(f.get('value',''))
")
if [ -n "$VALUE" ] && [ "$VALUE" = "$KEY" ]; then
  echo "VERIFIED: vault round-trip OK (key ${#KEY} chars, prefix ${KEY:0:6}…)"
else
  echo "WARN: round-trip mismatch — re-check vault item $ITEM_ID"
fi
