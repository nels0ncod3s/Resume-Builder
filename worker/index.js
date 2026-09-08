export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);

    if (response.status !== 404 || request.method !== "GET" || url.pathname.includes(".")) {
      return response;
    }

    url.pathname = "/";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
