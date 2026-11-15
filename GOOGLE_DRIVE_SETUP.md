# Personal Gmail: connect your test Google Drive

This is the path for an account that has **My Drive**, without Google Workspace Shared Drives. Do not use a service-account key for this path. VSpark requests `drive.file` access and creates its own private **VSpark Submissions** folder. You do not need to make the folder public.

## One-time setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) with the Gmail account you want to use. Create a project named **VSpark Test** (or select your existing project).
2. Go to **APIs & Services → Library**. Search for **Google Drive API** and click **Enable**.
3. Open **Google Auth Platform → Branding / Get started**. Set the app name to **VSpark**, and use your event Gmail as the support and developer contact email.
4. In **Audience**, choose **External**, keep the app in **Testing**, and add your event Gmail under **Test users**.
5. In **Data Access**, add only this Google Drive scope: `https://www.googleapis.com/auth/drive.file`. It limits access to files created or selected with the application; it does not grant access to every file in My Drive.
6. In **Clients → Create client**, choose **Web application** and name it **VSpark Website**. Under **Authorized redirect URIs**, paste this exact URL:

   `https://vspark-competition.vercel.app/auth/drive/callback`

   JavaScript origins are not needed for this server callback flow. Do not use the Supabase callback URL for this connection.
7. Create the client. Keep its **Client ID** and **Client secret** private. In your Vercel **vspark-competition** project, open **Settings → Environment Variables** and add these values for **Production**:

   | Name | Value |
   | --- | --- |
   | `GOOGLE_DRIVE_OAUTH_CLIENT_ID` | The Client ID from Google |
   | `GOOGLE_DRIVE_OAUTH_CLIENT_SECRET` | The Client secret from Google |

   These are server-only values: do not add `NEXT_PUBLIC_` to either name. The server's `GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY` has already been generated and saved. Preserve that existing key; changing it would make saved connections unreadable. Do not paste client secrets or token files into chat or GitHub.
8. Tell me the two Vercel values are saved, and I will redeploy. Alternatively, use **Deployments → latest production deployment → Redeploy** yourself.

## Connect the test account

9. Log into the live website as an admin. Open **Competition settings → Google Drive destination**, click **Connect Google Drive**, select your test Gmail, and review Google's file-access request. You perform the approval directly in Google.
10. After returning, the page should show your connected email, a saved folder link, and **Access verified**. VSpark creates/reuses **VSpark Submissions** in that account's My Drive. Connecting keeps the competition **Closed** so you can check the destination before opening it.
11. Click **Open folder**, then **Check access**. Use this app-created folder for testing. Pasting an unrelated folder from My Drive is not enough to grant the app access to it. A Shared Drive destination can still be used through the separate service-account setup.
12. Tell me it is connected. We will test the student registration, approval, folder upload, evaluation, and result-publication flow. Gmail SMTP is a separate remaining connection for registration/notification emails.

You can change the test account later using **Reconnect Google Drive**. Existing uploaded projects remain in the old Drive account; reconnecting does not move or delete them. If a participant's saved upload points to a different destination, they will be prompted to restart their own upload. Keep submissions closed while changing accounts. To revoke an old grant, use that Google account's [third-party connections](https://myaccount.google.com/connections).

## Testing limitation

Google's External/Testing mode issues Drive refresh tokens that expire after seven days. Reconnect when required during testing. Before the real event, review the consent app's production publishing configuration; the seven-day test setup is not the final launch setup.

Official references: [OAuth consent setup](https://developers.google.com/workspace/guides/configure-oauth-consent), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [Google OAuth and test-token expiry](https://developers.google.com/identity/protocols/oauth2/).
