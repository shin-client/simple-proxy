addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// Cấu hình whitelist để tránh bị người lạ xài chùa Proxy tấn công web khác
const ALLOWED_DOMAINS = [
  "api.mangadex.org",
  "uploads.mangadex.org",
  "mangadex.org",
  "mimihentai.com"
];

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Xử lý CORS Preflight (Cho method OPTIONS)
  // Trình duyệt luôn hỏi "Tao được phép gọi không?" trước khi gọi thật.
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const targetUrlStr = url.searchParams.get("url");

  if (!targetUrlStr) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch (e) {
    return new Response("Invalid URL", { status: 400 });
  }

  // Bảo mật: Chỉ cho phép proxy tới các domain đã định
  if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
    return new Response("Domain not allowed", { status: 403 });
  }

  // Copy các params khác từ request gốc sang target (nếu có)
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "url") {
      targetUrl.searchParams.append(key, value);
    }
  }

  // QUAN TRỌNG NHẤT: Tạo Header giả (Spoofing)
  // Không dùng `request.headers` gốc của client
  const newHeaders = new Headers();
  
  // Giả danh là trình duyệt truy cập trực tiếp
  newHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SuicaoDex/1.0");
  
  // 🔥 Chìa khóa để qua mặt MangaDex Hotlink Protection
  newHeaders.set("Referer", "https://mangadex.org/"); 
  newHeaders.set("Origin", "https://mangadex.org");

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders, // Dùng header mới đã fake
    body: request.body,
    redirect: "follow",
  });

  try {
    const response = await fetch(modifiedRequest);

    // Tạo response mới để trả về cho client
    const modifiedResponse = new Response(response.body, response);

    // Inject CORS headers cho response
    modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");
    modifiedResponse.headers.set("Access-Control-Expose-Headers", "*"); // Cho phép client đọc mọi header trả về
    
    // Cache control (Optional: Cache 1 ngày để đỡ tốn request)
    if (response.status === 200) {
        modifiedResponse.headers.set("Cache-Control", "public, max-age=86400");
    }

    return modifiedResponse;
  } catch (err) {
    return new Response("Proxy Error: " + err.message, { status: 500 });
  }
}
