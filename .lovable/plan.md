

# Convert Client Name to Dropdown

## Summary
Replace the free-text Client Name input with a Select dropdown populated from a hardcoded list of client names, preserving the existing order.

## Technical Details

### 1. Create `src/lib/clients.ts`
- Export a constant array of client names (deduplicated, preserving order — note "histrips" appears twice in the source data)
- Simple string array: `["numoya", "bhealth", "artiesmusic", ...]`

### 2. Update `src/components/ReportForm.tsx`
- Import the client list from `src/lib/clients.ts`
- Import `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` from `@/components/ui/select`
- Replace the `<Input>` for Client Name with a `<Select>` dropdown
- The `onValueChange` handler sets `clientName` state
- Keep the same label, icon, and spacing
- Style the trigger to match the existing input height (`h-12`) and rounded corners (`rounded-xl`)

No changes to `Index.tsx`, `api.ts`, or any other file — the form already passes `clientName` as a string.

