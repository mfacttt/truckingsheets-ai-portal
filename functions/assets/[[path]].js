/**
 * Answers 404 for a built file that is not there.
 *
 * Pages sends any unmatched path to index.html so that /login and the rest
 * reach the app. That also catches requests for built files, which come back
 * as a page of HTML under status 200 — and _headers marks everything here as
 * unchanging for a year. So a browser asking for a script during the seconds
 * a deploy takes to spread is handed a document, files it away under the
 * script's name, and never asks again. The page stays broken for that person
 * until they clear their cache by hand, and clearing site data will not do it:
 * the HTTP cache is a separate store.
 *
 * A 404 that says not to store it leaves nothing behind, and the next request
 * finds the file.
 *
 * Handing the request onward first means a file that does exist is served
 * exactly as before — only the fallback is turned away.
 */
export async function onRequest(context) {
  const response = await context.next()

  const servedAPage = (response.headers.get('content-type') || '').includes('text/html')
  if (!servedAPage) {
    return response
  }

  return new Response('Not found', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
