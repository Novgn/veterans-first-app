#!/usr/bin/env bash
# Verify the host-canonicalization routing matrix
# (docs/superpowers/specs/2026-07-03-admin-subdomain-design.md).
#
# Local (Host-header injection against next start):
#   ./verify-host-routing.sh http://localhost:3100
# Live (real DNS, run after the admin domain is attached):
#   ./verify-host-routing.sh live
set -u

MODE="${1:-http://localhost:3100}"
FAIL=0

# check <label> <expected-status> <expected-location-substring|-> <curl args...>
# curl's %{redirect_url} resolves relative Location headers against the
# request URL, so same-host rows contains-match the path fragment while
# cross-host rows still assert the full https://... redirect URL.
check() {
  local label="$1" want_status="$2" want_loc="$3"; shift 3
  local out status loc
  out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$@")
  status="${out%% *}"; loc="${out#* }"
  if [[ "$status" != "$want_status" ]] || { [[ "$want_loc" != "-" ]] && [[ "$loc" != *"$want_loc"* ]]; }; then
    echo "FAIL  $label -> got: $out  want: $want_status ${want_loc}"
    FAIL=1
  else
    echo "ok    $label"
  fi
}

# Host headers are always passed explicitly: locally they inject the
# production host against next start; in live mode they match the URL's
# own host (a no-op), which keeps the arrays non-empty — macOS bash 3.2
# errors on empty-array expansion under `set -u`.
if [[ "$MODE" == "live" ]]; then
  WWW=(https://www.vf1st.com)
  ADM=(https://admin.vf1st.com)
else
  WWW=("$MODE")
  ADM=("$MODE")
fi
WWW_H=(-H 'Host: www.vf1st.com')
ADM_H=(-H 'Host: admin.vf1st.com')

# www: console paths canonicalize to the admin host (query preserved)
check "www /dispatch/fleet -> admin" 308 "https://admin.vf1st.com/dispatch/fleet" "${WWW_H[@]}" "${WWW[0]}/dispatch/fleet"
check "www /admin?x=1 keeps query"   308 "https://admin.vf1st.com/admin?x=1"      "${WWW_H[@]}" "${WWW[0]}/admin?x=1"
check "www /business -> admin"       308 "https://admin.vf1st.com/business"       "${WWW_H[@]}" "${WWW[0]}/business"
# www: marketing untouched
check "www / serves marketing"       200 - "${WWW_H[@]}" "${WWW[0]}/"
# admin: root -> role dispatcher; anonymous dispatcher -> sign-in
check "admin / -> /console"          307 "/console"  "${ADM_H[@]}" "${ADM[0]}/"
check "admin /console anon -> sign-in" 307 "/sign-in" "${ADM_H[@]}" "${ADM[0]}/console"
# admin: allowlisted paths serve
check "admin /sign-in serves"        200 - "${ADM_H[@]}" "${ADM[0]}/sign-in"
check "admin /dispatch anon gated"   404 - "${ADM_H[@]}" "${ADM[0]}/dispatch"
# admin: marketing paths bounce to www
check "admin marketing path -> www"  308 "https://www.vf1st.com/not-a-console" "${ADM_H[@]}" "${ADM[0]}/not-a-console"
# /api is served on BOTH hosts, never host-redirected (webhooks/callers
# must not eat a 308). Empty-body POST to the waitlist zod-rejects: 400
# proves the route executed rather than redirected.
check "www /api served (400 zod)"    400 - -X POST -H 'Content-Type: application/json' -d '{}' "${WWW_H[@]}" "${WWW[0]}/api/waitlist"
check "admin /api served (400 zod)"  400 - -X POST -H 'Content-Type: application/json' -d '{}' "${ADM_H[@]}" "${ADM[0]}/api/waitlist"

if [[ "$MODE" != "live" ]]; then
  # unknown host: everything behaves as today (no-op row)
  check "unknown host / serves"        200 - "$MODE/"
  check "unknown host /dispatch gated" 404 - "$MODE/dispatch"
  check "unknown host /console -> sign-in" 307 "/sign-in" "$MODE/console"
fi

exit $FAIL
