export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return sendMessage('authorization:github:error:No authorization code received', false);
  }

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await res.json();
    if (!data.access_token) {
      throw new Error(data.error_description || data.error || 'Token exchange failed');
    }
    const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
    return sendMessage(`authorization:github:success:${payload}`, true);
  } catch (err) {
    return sendMessage(`authorization:github:error:${err.message}`, false);
  }
}

function sendMessage(message, handshake) {
  const safe = JSON.stringify(message);
  const body = handshake
    ? `(function(){var m=${safe};function r(e){window.opener.postMessage(m,e.origin);}window.addEventListener('message',r,false);window.opener.postMessage('authorizing:github','*');})();`
    : `window.opener&&window.opener.postMessage(${safe},'*');window.close();`;
  return new Response(
    `<!doctype html><html><body><script>${body}<\/script></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
