# Proposal D-041: Refactor DailyReading hexagramLines for type safety

## Status: Pending Approval

## Problem
The `DailyReading` model currently stores hexagram line data in a `hexagramLines` field typed as `Json?`. The associated comment mentions it represents a "binary structure (6 lines)". Storing this fixed structure as JSON introduces several drawbacks:
*   **Lack of Type Safety:** The database and application code cannot guarantee the structure or types within the JSON, leading to potential runtime errors.
*   **Querying Limitations:** Querying specific lines (e.g., finding all readings where line 3 was Yang) is cumbersome and inefficient with JSON fields.
*   **Maintainability:** Changes to the expected JSON structure would require complex parsing logic and could break existing data without clear errors.

## Proposed Solution
Refactor the `hexagramLines` field to use explicit, typed columns for each of the 6 hexagram lines.

1.  **Remove Schema Field:** Delete the `hexagramLines Json?` field from the `DailyReading` model in `schema.prisma`.
2.  **Add New Fields:** Introduce six new integer fields to the `DailyReading` model:
    *   `hexagramLine1 Int`
    *   `hexagramLine2 Int`
    *   `hexagramLine3 Int`
    *   `hexagramLine4 Int`
    *   `hexagramLine5 Int`
    *   `hexagramLine6 Int`
    These fields will store the state (e.g., Yin/Yang representation) for each line of the hexagram.
3.  **Migration:** Create a new Prisma migration that:
    *   Drops the `hexagramLines` JSON column from the `daily_readings` table.
    *   Adds the six new integer columns (`hexagramLine1` through `hexagramLine6`).
    *   (Optional but Recommended) Includes a data migration step to parse existing `hexagramLines` JSON data and populate the new columns. This step would require careful implementation to handle potentially varying JSON formats from past data.

## Justification
This change significantly improves the data integrity and query capabilities for hexagram readings:
*   **Type Safety:** Ensures that each line's state is stored correctly, preventing data corruption.
*   **Query Performance & Clarity:** Allows for direct, indexed queries on specific lines, improving performance and simplifying queries.
*   **Maintainability:** Makes the schema more explicit and easier to understand, reducing the risk of errors in application logic.
*   **Low Risk:** Refactors an optional (`?`) field, minimizing impact on existing functionality. The primary risk lies in the data migration step, which can be managed with a robust migration script.

## Impact Assessment
*   **Production Data:** Existing `Json?` data for `hexagramLines` will need to be migrated. This is the highest-risk area but can be managed with a robust migration script.
*   **Backend Code:** Code that reads `dailyReading.hexagramLines` will need to be updated to access `dailyReading.hexagramLine1` through `dailyReading.hexagramLine6`.
*   **Frontend Code:** Similar updates may be required if the frontend directly consumes `hexagramLines`.
*   **Performance:** Querying will likely improve due to structured data.

## Next Steps
1.  Create a markdown file with this proposal.
2.  Commit the proposal file with the message: `feat(schema): D-041 — proposal (awaiting approval)`.
3.  Stop execution and await human approval for schema changes.
