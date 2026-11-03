# Program editor simplification

The editor now separates Basic information, Student details, Advanced settings, and Application cycles. Advanced settings start collapsed. Publication controls sit beside the status near the title; the save bar contains only save feedback, Save, and Cancel. Reordering is an explicit mode, and long fields use one column.

Save submission preserves input on errors. Navigation, Cancel, browser Back, and Sign out check for unsaved changes. Saving locks conflicting controls. The existing publication and cycle-verification actions remain in use.

Two data-preservation issues were corrected: multiline structured items remain individual items when saved, and updating visible program fields no longer clears stored official-source URLs, image URLs, or document URLs.

## Verification

24 checks passed in headless Microsoft Edge against a temporary local fixture using the real editor components:

- New-program status, required name validation, generated identifier, and opening/focusing invalid fields inside Advanced settings.
- Cancel, links, browser Back, and Sign out protect unsaved changes.
- Input and conflicting actions are blocked during a save.
- A failed unauthenticated save preserves both controlled inputs and uncontrolled description text.
- Existing program values, multiline items, featured placement, and priority remain populated.
- Reorder mode, item order, add/remove focus, and Tab/Enter keyboard operation.
- The saved-program cycles link includes its program ID.
- No horizontal page overflow at 1366, 390, and 320 pixels. Mobile save controls remain in normal flow and do not cover form content.

Final fixture run recorded no browser console errors. Desktop and mobile screenshots were inspected; the final stylesheet uses a 28px editor title and normal-weight text inputs. Screenshots and the browser check transcript are local artifacts under `reports/`. The temporary fixture route was removed after verification.

Four Node regression tests cover multiline list preservation, ordering, empty-row removal, clearing all rows, and legacy newline input.

The final production build, including TypeScript and route generation, passed after the fixture was removed. Targeted ESLint and whitespace checks also passed.

## Limits

Browser checks used synthetic program data and a fresh browser profile. Successful authenticated saves, database publication changes, and the destination cycle listing were not exercised against real records. No production records were changed. Mobile checks used emulated viewport sizes and keyboard input, not a physical touch device or screen reader. Same-document history protection uses the Navigation API where available; full-document departures use the browser's beforeunload protection.
