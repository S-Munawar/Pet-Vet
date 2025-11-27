export const getMicrosoftOAuthURL = (state?: string) => {
  const rootUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    response_mode: "query",
    scope: ["openid", "profile", "email", "User.Read"].join(" "),
    prompt: "select_account"
  });

  if (state) params.append('state', state);

  return `${rootUrl}?${params.toString()}`;
};
