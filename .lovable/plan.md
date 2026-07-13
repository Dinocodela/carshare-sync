# Update Co-Host Agreement: Eon/Turo terms & management fee

Update the agreement text inside `src/components/agreements/CoHostAgreementModal.tsx`. Bump the `agreement_version` so new signatures are recorded against the revised terms.

## 1. Rewrite the CLAIMS section (replace entirely)

Remove the old Turo "$2,500 deductible / 90 plan" language and replace with the current platform terms:

```text
CLAIMS

Teslys lists vehicles on Eon and Turo. Coverage and deductibles depend on the
platform the trip was booked through:

• Eon: In the event of an accident, the deductible is $0.
• Turo: In the event of an accident, the deductible is $250, which is covered by Teslys.

- Owner authorizes Teslys to handle the entire claim resolution process.
- Teslys covers the deductible only if the vehicle is repaired at Teslys' partner facilities.
- All documents and invoices related to claims can be provided upon written
  request to claims@Teslys.com.
- If the vehicle is declared a total loss, Teslys will inform the Owner within 72 hours.

Owner bears full responsibility for claims if the vehicle was inoperable, lacked
registration, or lacked insurance at the time of the incident. Teslys is not
responsible for pre-existing damage or damage while in owner's possession.
```

## 2. Update EARNINGS AND PAYMENT (disclose the fees)

Clarify the two separate 30% deductions — the platform (Eon/Turo) keeps 30% of gross, and Teslys retains a separate 30% management fee:

```text
EARNINGS AND PAYMENT

Owner shall be entitled to receive their share of the gross rental revenue
generated from the rental. Vehicles are listed on Eon and Turo using a 70/30
split, meaning the platform (Eon or Turo) retains 30% of the gross rental
revenue. In addition, Teslys retains a Management Fee equal to 30% of the gross
rental revenue for its management services. The gross rental revenue includes
rental revenue, unlimited mileage extras, late return fees, and additional
usage fees.

Gross rental revenue doesn't include cleaning fees, smoking fees, deep cleaning
fees, delivery fees, or other extras provided to guests. Owner's share shall be
paid monthly and calculated within 10 days following the end of the calendar month.
```

## 3. Adjust related references

- The **TICKETS AND FEES** paragraph currently says "during the reservations period" — leave wording as-is unless you want it updated (out of scope).
- Fees table row "Claim Processing — resolved through Turo or EON" already references both platforms; no change needed.

## 4. Version bump

Change `agreement_version: "2025-v1"` to `"2025-v2"` in the `handleSign` insert so re-signed agreements reflect the updated terms.

## Technical notes
- All changes are confined to `src/components/agreements/CoHostAgreementModal.tsx` (JSX text content only, plus the version string). No schema, backend, or logic changes.
- The confirmation about the 30% management fee is now explicitly disclosed in the EARNINGS AND PAYMENT section.