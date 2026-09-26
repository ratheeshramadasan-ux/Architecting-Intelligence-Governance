# SOP-INCENTIVE-001-v2
Effective 2026-07-01 onward. Status: ACTIVE. Synthetic demonstration content.

## 4.2 Base commission rates
Mortgage transactions earn 0.42%, personal lending 0.27%, and investments 0.20% of eligible principal. The rate is applied to principal before any factor. A $25 floor and $25,000 cap apply last.

## 5.4 Customer segment factors
Premium customers receive a 1.06 multiplicative factor. Standard customers use 1.00. Customer name is irrelevant to eligibility and must be tokenized. New-to-bank status adds 0.05 to the running multiplier.

## 7.1 Volume accelerators
When eligible year-to-date volume including the current transaction reaches $1,000,000, add 0.08. The entire threshold-crossing transaction qualifies. Cancelled principal and prior clawbacks do not count.

## 8.3 Campaign rules
CMP-FALL-26 multiplies the post-segment, post-bonus amount by 1.10. Only campaigns listed in CAMPAIGN_ELIGIBILITY may apply.

## 8.7 Stacking order
Apply the segment factor first. Add new-to-bank and volume accelerators. Apply one campaign multiplier last. Caps and floors follow all factors. Where wording conflicts, section 11.3 prevails.

## 9.2 Joint dealer allocation
Divide final commission equally among eligible participants when no approved allocation exists. Allocate rounding residue to the final listed dealer. An ineligible participant receives zero and forces human review.

## 10.1 Compliance eligibility
All participants must be eligible at transaction effective time. A compliance hold blocks payment but preserves the calculation and evidence.

## 10.5 Cancellations and clawbacks
Cancellation within 90 days creates a 100% clawback. Days 91–180 create a 50% clawback. Later cancellations create no automatic clawback. A human approves every clawback above $5,000.

## 11.3 Precedence and date determination
Compliance overrides every incentive. Approved exception matrix rules override campaigns. Campaign rules override general segment rules. Use original transaction date for corrections and cancellation date only to determine the window.

## 12 Worked examples
Example A: $640,000 mortgage, premium customer, no bonus or campaign: $640,000 × 0.42% × 1.06 = $2,849.28. Example B distributes the final rounded amount equally across two dealers and assigns residue to the last dealer.

## 13 Exception matrix
| Condition | Calculation | Payment | HITL owner |
|---|---|---|---|
| Exact duplicate | Preserve | Block | Process owner |
| Potential duplicate | Preserve | Hold | Process owner |
| Model/engine variance | Engine result | Block | Commission approver |
| Compliance ineligible | Preserve | Block | Compliance owner |
| Prior-period correction | Original SOP | Hold | Policy owner |
