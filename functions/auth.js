export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope') || 'repo';
  const state = url.searchParams.get('state') || '';

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/auth/callback`,
    scope,
    state,
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
