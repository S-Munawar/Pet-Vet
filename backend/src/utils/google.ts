// utils/google.ts
export const getGoogleOAuthURL = (state?: string) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options: Record<string, string> = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["openid", "profile", "email"].join(" "),
  };

  const qs = new URLSearchParams(options);
  if (state) qs.append('state', state);
  return `${rootUrl}?${qs.toString()}`;
};
