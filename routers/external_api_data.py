"""
fed_service.py Unified SAM.gov + FPDS wrapper
"""

from __future__ import annotations
import os, time, logging, requests
from typing import Dict, List, Optional
from functools import lru_cache
from dotenv import load_dotenv
load_dotenv()

SAM_BASE = "https://api.sam.gov/entity-information/v2/entities"
FPDS_BASE = "https://api.fpds.gov/ws/public/webservice"    # ezSearch JSON façade
TIMEOUT  = (3, 15)   # connect, read
RETRIES  = 2

log = logging.getLogger("FedService")
logging.basicConfig(level=logging.INFO)

# ──────────────────────────────────────────────
class FedService:
    def __init__(self,
                 sam_api_key: Optional[str] = None,
                 mock: bool = False):
        # Priority: passed-in > environment variable
        self.sam_key = sam_api_key or os.getenv("SAM_API_KEY")
        self.mock    = mock

        if not self.sam_key and not self.mock:
            raise ValueError("SAM_API_KEY is required for live mode. Either pass it or set it in the .env file.")

    # ── Public ------------------------------------------------------------
    def vendor(self, identifier: str, *, id_type: str = "UEI") -> Optional[Dict]:
        """
        Lookup an entity in SAM.gov.
        id_type = UEI | DUNS | CAGE | TIN
        """
        if self.mock:
            return _MOCK_VENDOR
        params = {"api_key": self.sam_key, "q": identifier,
                  "identifierType": id_type}
        data = self._get_json(SAM_BASE, params)
        return data.get("entities", [{}])[0] if data else None

    def awards(self, duns: str) -> List[Dict]:
        """
        Fetch award history from FPDS (last 5 yrs by default).
        """
        if self.mock:
            return _MOCK_AWARDS
        params = {"recipientDunsNumber": duns, "format": "json"}
        data = self._get_json(FPDS_BASE, params)
        return data.get("results", []) if data else []

    # ── Internal ----------------------------------------------------------
    def _get_json(self, url: str, params: dict) -> dict:
        for attempt in range(1, RETRIES + 2):
            try:
                r = requests.get(url, params=params, timeout=TIMEOUT)
                r.raise_for_status()
                return r.json()
            except requests.RequestException as exc:
                log.warning("Request failed (%s/%s): %s",
                            attempt, RETRIES + 1, exc)
                if attempt == RETRIES + 1:
                    return {}
                time.sleep(2 * attempt)   # simple back-off

# ──────────────────────────────────────────────
class RiskScore:
    """
    Simple heuristic:
      • inactive SAM → +50 risk
      • open exclusions → +40 risk
      • >80 % awards with one agency → +20 risk
      • high total award volume (> $25 M) → +10 risk
    """

    @staticmethod
    def compute(vendor: Dict, awards: List[Dict]) -> Dict:
        score = 0
        # 1. Registration status
        if vendor.get("registrationStatus") != "ACTIVE":
            score += 50
        # 2. Exclusions
        if vendor.get("exclusionSummary", {}).get("totalActiveExclusions", 0) > 0:
            score += 40
        # 3. Award concentration
        agency_counts = {}
        total_value = 0
        for a in awards:
            agy = a.get("agency", "UNK")
            agency_counts[agy] = agency_counts.get(agy, 0) + 1
            total_value += float(a.get("amount", 0))
        if awards:
            max_share = max(agency_counts.values()) / len(awards)
            if max_share > 0.8:
                score += 20
        # 4. Volume
        if total_value > 25_000_000:
            score += 10

        level = ("Low" if score <= 20 else
                 "Moderate" if score <= 50 else
                 "High")
        return {"score": score, "level": level}

# ──────────────────────────────────────────────
# Mock payloads for offline / unit-test mode
_MOCK_VENDOR = {
    "uei": "EZ123ABCDLM1",
    "duns": "012345678",
    "name": "ExampleGov LLC",
    "registrationStatus": "ACTIVE",
    "exclusionSummary": {"totalActiveExclusions": 0},
}
_MOCK_AWARDS = [
    {"contract_id": "N00024-25-C-9000", "agency": "Navy",
     "amount": 1200000, "date": "2024-11-15"},
    {"contract_id": "W56HZV-24-C-7000", "agency": "Army",
     "amount": 800000, "date": "2023-06-03"}
]

# ──────────────────────────────────────────────
if __name__ == "__main__":              # quick sanity check
    from fed_service import FedService, RiskScore
    from dotenv import load_dotenv
    load_dotenv()

    svc = FedService(mock=False)  # ← enable real API access
    v = svc.vendor("K6Q8G9KQZ3S3", id_type="UEI")  # ← real UEI

    if not v:
        print("[ERROR] Vendor lookup failed.")
        exit(1)

    print("Vendor:", v.get("name"))
    print("UEI   :", v.get("uei"))
    print("DUNS  :", v.get("duns"))

    duns = v.get("duns")
    if not duns:
        print("[ERROR] Vendor has no DUNS number.")
        exit(1)

    a = svc.awards(duns)
    print("Awards:", len(a))

    r = RiskScore.compute(v, a)
    print("Risk :", r)