addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

async function getUrls() {
  let resp = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
  if(resp.status !== 200){
    return false;
  }
  let data = await resp.json();
  let variants = data["variants"];
  return variants[(variants.length * Math.random()) << 0]
}

async function getResp(url) {
  let resp = await fetch(url);
  if(resp.status !== 200){
    return false;
  }
  let body = await resp.text();
  return body
}
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if(request.headers.get("cookie")){
    url = request.headers.get("cookie").split("=")[1];
  }
  else {
    var url = await getUrls();
    if(!url){
      return new Response('Failed to fetch variant urls', {status: 500});
    }
  }

  let body = await getResp(url);
  if(!body){
    return new Response('Failed to fetch variant page body', {status: 500});
  }
  let resp = new Response(body, {
    headers: {
      'content-type': 'text/html',
      'set-cookie': `prev=${url}`
    }
  })
  let newResp = new HTMLRewriter()
    .on('*', {
      element(element) {
        switch(element.tagName){
          case "title":
            element.setInnerContent(`Variant ${Number(url.match(/\d+/)[0]) == 1 ? "Uno" : "Dos"}`);
            break;
          case "h1":
            if(element.getAttribute("id") == "title"){
              element.setInnerContent(`Variant ${Number(url.match(/\d+/)[0]) == 1 ? "Uno" : "Dos"}`);
            }
            break;
          case "p":
            if(element.getAttribute("id") == "description"){
              element.setInnerContent(`I am variant <span style="font-weight: bold;">${Number(url.match(/\d+/)[0]) == 1 ? "uno" : "dos"}</span> of the take home project!`, { html: true });
              element.after('<a class="text-sm leading-5 text-gray-900" href="https://ericzhong.com" target="_blank">ericzhong.com</a>', {html: true});
            }
            break;
          case "a":
            if(element.getAttribute("id") == "url"){
              element.setInnerContent('Take me home!');
              element.setAttribute("href", "https://www.youtube.com/watch?v=oHg5SJYRHA0");
            }
            break;
        }
      },
    })
  .transform(resp)

  return newResp;
}
