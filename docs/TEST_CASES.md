# RYMEC ReClaim-iT: Test Cases & Acceptance Matrix

| Test ID | Module | Input & Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC01** | Auth | Registration with an existing University Roll Number (e.g. `3BR21CS001`) | Rejects registration with 400 error; duplicate account prevented. | **PASS** |
| **TC02** | Reports | Submitting report form with missing mandatory category or title | Form validation triggers; submission blocked until corrected. | **PASS** |
| **TC03** | Engine | Lost black wallet reported near Library; Found black wallet reported at Library (1 day gap) | Explainable Match Engine returns score >= 85 with human-readable reasons list; notifies both students. | **PASS** |
| **TC04** | Claims | Claimant submits answer to hidden challenge question | Finder reviews claimant's answer side-by-side with close match indicator; secret answer never sent to client. | **PASS** |
| **TC05** | Custody | Finder approves claim | System generates 6-digit code and SHA-256 hash (valid 48h); claimant receives QR code. | **PASS** |
| **TC06** | Handover | Finder/Admin enters valid 6-digit code at `/handover` | Item status becomes `RETURNED`; custody timeline updated; finder awarded +20 pts & `FIRST_RETURN` badge. | **PASS** |
| **TC07** | Handover | Entering invalid or expired code at `/handover` | System displays error; item status remains unchanged. | **PASS** |
| **TC08** | Privacy | Found ID Card reported with roll number `3BR21CS001` | Marked `is_private = true`; hidden from public browse/search; owner notified privately. | **PASS** |
| **TC09** | Security | Student attempts to open `/admin` or access another student's contact details | HTTP 403 Forbidden returned; redirect to portal; contact details stay masked until both tap share. | **PASS** |
| **TC10** | Admin | Admin opens Dashboard | Displays correct totals, category/peak hour charts, hotspot heatmap, and 5 plain-language prevention insights. | **PASS** |
| **TC11** | Print | Admin prints poster for `/near/library` | Printable A4 poster renders with large QR pointing to `https://reclaim.rymec.edu.in/near/library`. | **PASS** |
| **TC12** | Fraud | Submitting a 6th report within 1 hour or a near-identical duplicate | Rate-limiter halts 6th submission; duplicate check warns if similarity >= 0.8. | **PASS** |
