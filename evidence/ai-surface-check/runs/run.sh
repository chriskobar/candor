#!/bin/zsh
# usage: run.sh <image> <deep:true|false> <outfile> [intent]
IMG="$1"; DEEP="$2"; OUT="$3"; INTENT="${4:-}"
python3 -I -c '
import base64,json,sys
img,deep,intent=sys.argv[1],sys.argv[2]=="true",sys.argv[3]
print(json.dumps({"imageBase64":base64.b64encode(open(img,"rb").read()).decode(),"mediaType":"image/png","deepCritique":deep,"primaryIntent":intent}))
' "$IMG" "$DEEP" "$INTENT" > "$OUT.req"
curl -s -m 280 -w "\nHTTP %{http_code} %{time_total}s\n" -X POST localhost:3000/api/audit -H 'content-type: application/json' --data @"$OUT.req" > "$OUT"
rm "$OUT.req"
