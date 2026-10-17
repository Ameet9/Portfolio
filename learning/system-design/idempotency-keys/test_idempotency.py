import asyncio
import os
import sys
import uuid
from typing import Optional
import httpx

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
CHARGE_URL = f"{API_BASE_URL}/charge"
HEALTH_URL = f"{API_BASE_URL}/health"

# ANSI Terminal Colors for clear readability
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


async def check_server_health(client: httpx.AsyncClient) -> bool:
    """Verifies that the API server is up and reachable before executing test suite."""
    try:
        resp = await client.get(HEALTH_URL, timeout=3.0)
        return resp.status_code == 200
    except Exception:
        return False


async def send_charge_request(
    client: httpx.AsyncClient,
    request_index: int,
    idempotency_key: Optional[str],
    amount: float = 49.99,
    card_id: str = "card_tok_visa_4242"
) -> dict:
    """Sends a single charge request with optional Idempotency-Key header."""
    headers = {}
    if idempotency_key is not None:
        headers["Idempotency-Key"] = idempotency_key

    payload = {
        "amount": amount,
        "card_id": card_id
    }

    try:
        response = await client.post(CHARGE_URL, json=payload, headers=headers, timeout=10.0)
        return {
            "index": request_index,
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "data": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
        }
    except Exception as exc:
        return {
            "index": request_index,
            "status_code": -1,
            "error": str(exc),
            "data": None
        }


async def main():
    print(f"\n{BOLD}{CYAN}=============================================================={RESET}")
    print(f"{BOLD}{CYAN}       Payment API Idempotency Verification Test Suite        {RESET}")
    print(f"{BOLD}{CYAN}=============================================================={RESET}\n")
    print(f"Target API: {API_BASE_URL}")

    async with httpx.AsyncClient() as client:
        # Pre-check: Wait for server availability
        is_healthy = await check_server_health(client)
        if not is_healthy:
            print(f"{YELLOW}[!] Notice: API at {API_BASE_URL} is not responding.{RESET}")
            print("    Please ensure services are running via:")
            print(f"    {BOLD}docker-compose up --build -d{RESET}\n")

        all_tests_passed = True

        # -------------------------------------------------------------
        # TEST 1: Missing Idempotency-Key Header (Must return HTTP 400)
        # -------------------------------------------------------------
        print(f"\n{BOLD}Test 1: Request without 'Idempotency-Key' Header{RESET}")
        res_no_key = await send_charge_request(client, 1, idempotency_key=None)
        if res_no_key["status_code"] == 400:
            print(f"  {GREEN}[PASS]{RESET} Server rejected missing idempotency key with HTTP 400.")
        else:
            print(f"  {RED}[FAIL]{RESET} Expected HTTP 400, got {res_no_key['status_code']}: {res_no_key['data']}")
            all_tests_passed = False

        # -------------------------------------------------------------
        # TEST 2: 5 Concurrent Requests with the SAME Idempotency-Key
        # -------------------------------------------------------------
        shared_key = f"order-idem-{uuid.uuid4()}"
        num_concurrent = 5
        print(f"\n{BOLD}Test 2: Firing {num_concurrent} Concurrent Requests with SAME Idempotency-Key{RESET}")
        print(f"  Idempotency-Key: {CYAN}{shared_key}{RESET}")

        tasks = [
            send_charge_request(client, i + 1, idempotency_key=shared_key, amount=129.50)
            for i in range(num_concurrent)
        ]

        # Dispatch all 5 requests concurrently using asyncio.gather
        responses = await asyncio.gather(*tasks)

        # Inspect responses
        transaction_ids = set()
        status_codes = []
        cache_headers = []

        for r in responses:
            idx = r["index"]
            sc = r["status_code"]
            status_codes.append(sc)
            if sc == 200 and isinstance(r["data"], dict):
                tx_id = r["data"].get("transaction_id")
                transaction_ids.add(tx_id)
                cache_status = r["headers"].get("x-cache", "UNKNOWN")
                cache_headers.append(cache_status)
                print(f"  -> Request #{idx}: HTTP {sc} | Transaction ID: {tx_id} | Cache: {cache_status}")
            else:
                print(f"  -> Request #{idx}: HTTP {sc} | Data: {r.get('data') or r.get('error')}")

        # Assertions for Test 2:
        # All requests must return HTTP 200
        # All requests must return the EXACT same transaction_id (len(transaction_ids) == 1)
        all_200 = all(sc == 200 for sc in status_codes)
        single_tx = len(transaction_ids) == 1

        if all_200 and single_tx:
            single_id = list(transaction_ids)[0]
            print(f"  {GREEN}[PASS]{RESET} All {num_concurrent} requests returned HTTP 200 and identical Transaction ID: {GREEN}{single_id}{RESET}")
            print(f"         Exactly ONE payment charge was executed. Duplicate requests received idempotent cached replay.")
        else:
            print(f"  {RED}[FAIL]{RESET} Idempotency violated or request failure!")
            print(f"         Status codes: {status_codes}")
            print(f"         Unique Transaction IDs seen: {transaction_ids}")
            all_tests_passed = False

        # -------------------------------------------------------------
        # TEST 3: Sequential Replay with Same Idempotency-Key (Cache Hit)
        # -------------------------------------------------------------
        print(f"\n{BOLD}Test 3: Sequential Replay with the same Idempotency-Key{RESET}")
        res_replay = await send_charge_request(client, 6, idempotency_key=shared_key, amount=129.50)
        if res_replay["status_code"] == 200 and res_replay["data"].get("transaction_id") in transaction_ids:
            cache_tag = res_replay["headers"].get("x-cache", "")
            print(f"  {GREEN}[PASS]{RESET} Sequential replay returned original transaction ID instantly.")
            print(f"         X-Cache Header: {CYAN}{cache_tag}{RESET}")
        else:
            print(f"  {RED}[FAIL]{RESET} Replay did not match original transaction ID: {res_replay}")
            all_tests_passed = False

        # -------------------------------------------------------------
        # TEST 4: Request with a DIFFERENT Idempotency-Key
        # -------------------------------------------------------------
        different_key = f"order-idem-{uuid.uuid4()}"
        print(f"\n{BOLD}Test 4: Request with a DIFFERENT Idempotency-Key{RESET}")
        print(f"  Idempotency-Key: {CYAN}{different_key}{RESET}")

        res_diff = await send_charge_request(client, 7, idempotency_key=different_key, amount=500.00)
        if res_diff["status_code"] == 200 and isinstance(res_diff["data"], dict):
            new_tx_id = res_diff["data"].get("transaction_id")
            print(f"  -> New Request: HTTP 200 | Transaction ID: {new_tx_id}")
            if new_tx_id not in transaction_ids:
                print(f"  {GREEN}[PASS]{RESET} Different key generated distinct Transaction ID as expected: {GREEN}{new_tx_id}{RESET}")
            else:
                print(f"  {RED}[FAIL]{RESET} Different key unexpectedly reused existing transaction ID!")
                all_tests_passed = False
        else:
            print(f"  {RED}[FAIL]{RESET} Request with different key failed: {res_diff}")
            all_tests_passed = False

        # -------------------------------------------------------------
        # SUMMARY
        # -------------------------------------------------------------
        print(f"\n{BOLD}{CYAN}--------------------------------------------------------------{RESET}")
        if all_tests_passed:
            print(f"{BOLD}{GREEN}>>> ALL IDEMPOTENCY TESTS PASSED! System guarantees exactly-once semantics. <<<{RESET}")
        else:
            print(f"{BOLD}{RED}>>> SOME TESTS FAILED! Check logs above for details. <<<{RESET}")
        print(f"{BOLD}{CYAN}--------------------------------------------------------------{RESET}\n")

        if not all_tests_passed:
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
