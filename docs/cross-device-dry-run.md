# Cross-Device Dry Run

Use a desktop browser for `/admin` and the installed Agent app for `/agent`. Disconnect USB before testing.

1. Use **Reset Dry Run Data** from the authenticated Admin profile menu. Confirm `FI-DRYRUN-001` is unassigned and absent from Agent A.
2. Assign it to Agent A. Confirm the phone receives the task and unread in-app notification without reload.
3. Accept and start on the phone. Confirm Admin updates without reload.
4. Complete the checklist and upload at least three evidence items, including a photo and signature. Confirm Admin can open the same remote evidence.
5. Submit, request rework with `Please verify asset condition again.`, update a field, resubmit, and complete. Confirm both sides update after each action.
6. Reset, assign `FI-DRYRUN-002` to Agent A, then reassign to Agent B. Confirm Agent A loses access, Agent B receives it, and both assignment rows remain in history.
7. Turn phone internet off, assign a reset task, then restore internet. Confirm resume/reconnect refetch discovers the task and notification.
8. Kill the app, assign a task, then reopen. Confirm database state and notifications are fetched.
9. Sign in as Agent B and try Agent A's task UUID. Confirm no data is returned and direct mutation is rejected by RLS.
10. Sign in with an Agent account at `/admin`, and with an Admin account in the Agent app. Confirm both role violations are blocked.
11. Attempt mobile navigation to `https://fi-iflow.vercel.app/admin` and `https://fi-iflow.vercel.app/`. Confirm neither renders in the WebView.
12. Reset the database again after successful testing.

Realtime is an invalidation signal. Reconnect, focus, visibility resume, and native network-restoration events all refetch authoritative Supabase data.

System notification-bar delivery while the app is killed is not configured. That requires FCM/APNs; reopening still reconciles correctly from Supabase.
