# RYMEC ReClaim-iT: Database Entity Relationship (ER) Diagram

This diagram documents the complete relational schema implemented for the RYMEC Campus Lost & Found Portal, including primary keys, foreign key relationships, cascade constraints, and sensitive data protection fields.

```mermaid
erDiagram
    PROFILES ||--o{ ITEMS : "reports"
    PROFILES ||--o{ CLAIMS : "submits"
    PROFILES ||--o{ SAVED_SEARCHES : "creates"
    PROFILES ||--o{ NOTIFICATIONS : "receives"
    PROFILES ||--o{ POINTS_LEDGER : "earns"
    PROFILES ||--o{ BADGES : "unlocks"
    PROFILES ||--o{ MESSAGES : "sends"
    PROFILES ||--o{ ABUSE_REPORTS : "flags"

    LOCATIONS ||--o{ ITEMS : "located_at"
    LOCATIONS ||--o{ SAVED_SEARCHES : "watches"

    ITEMS ||--o{ MATCHES : "lost_side"
    ITEMS ||--o{ MATCHES : "found_side"
    ITEMS ||--o{ CLAIMS : "claimed_in"
    ITEMS ||--o{ CUSTODY_EVENTS : "tracked_by"
    ITEMS ||--o{ ABUSE_REPORTS : "reported_for"

    CLAIMS ||--o{ CUSTODY_EVENTS : "triggers"
    CLAIMS ||--o{ MESSAGES : "contains"

    PROFILES {
        uuid id PK
        string name
        string roll_no UK
        string phone
        enum role "STUDENT | ADMIN"
        int points
        int fraud_claims
        bool flagged
        timestamptz created_at
    }

    LOCATIONS {
        uuid id PK
        string slug UK
        string name
        string parent_zone
        numeric x
        numeric y
        timestamptz created_at
    }

    ITEMS {
        uuid id PK
        uuid user_id FK
        enum type "LOST | FOUND"
        string title
        string category
        text description
        string colour
        string brand
        uuid location_id FK
        string location_other
        timestamptz occurred_at
        string image_path
        string held_at
        string verify_question
        string verify_answer_hash "Private"
        bool is_anonymous
        bool is_private "U2 ID Card Guard"
        string id_roll_no "Private"
        enum status "OPEN | MATCHED | CLAIMED | RETURNED | ARCHIVED | DONATED | REMOVED"
        timestamptz created_at
        timestamptz updated_at
    }

    MATCHES {
        uuid id PK
        uuid lost_item_id FK
        uuid found_item_id FK
        int score "0-100"
        jsonb reasons "U1 Explainable Array"
        timestamptz created_at
    }

    CLAIMS {
        uuid id PK
        uuid item_id FK
        uuid claimant_id FK
        text message
        string answer
        enum status "PENDING | APPROVED | REJECTED"
        bool fraudulent
        string handover_code_hash "SHA-256"
        timestamptz handover_expires_at
        uuid decided_by FK
        timestamptz decided_at
        timestamptz created_at
    }

    CUSTODY_EVENTS {
        uuid id PK
        uuid item_id FK
        uuid claim_id FK
        uuid actor_id FK
        string action "FOUND | DEPOSITED | CLAIM_REQUESTED | CLAIM_APPROVED | HANDOVER_VERIFIED | RETURNED"
        text note
        timestamptz created_at
    }

    MESSAGES {
        uuid id PK
        uuid claim_id FK
        uuid sender_id FK
        text body
        timestamptz created_at
    }

    SAVED_SEARCHES {
        uuid id PK
        uuid user_id FK
        string keywords
        string category
        uuid location_id FK
        timestamptz created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        text message
        string link
        bool is_read
        timestamptz created_at
    }

    POINTS_LEDGER {
        uuid id PK
        uuid user_id FK
        string reason
        int points
        timestamptz created_at
    }

    BADGES {
        uuid user_id PK, FK
        string badge PK "FIRST_RETURN | HELPER | CAMPUS_HERO"
        timestamptz awarded_at
    }

    ABUSE_REPORTS {
        uuid id PK
        uuid item_id FK
        uuid reporter_id FK
        text reason
        bool resolved
        timestamptz created_at
    }
```

### Public View Layer: `public_items`
For data safety and student privacy, all client-facing browse queries read through the SQL view `public_items`:
1. Filters out records where `is_private = TRUE` (such as discovered ID cards awaiting private claim).
2. Filters out records where `status = 'REMOVED'`.
3. Strips `verify_answer_hash` and `id_roll_no` so hashes are never exposed over the network.
4. Replaces `user_id` and `reporter_name` with `'Anonymous Student'` when `is_anonymous = TRUE`.
