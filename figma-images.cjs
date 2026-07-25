const fs = require("fs");
const p = "/Users/suminder/Library/Application Support/Code - Insiders/User/workspaceStorage/e339b9c145cde25c3b9ffd425218122c/GitHub.copilot-chat/chat-session-resources/c4a14bef-afc7-4fc5-a6f8-c5ac08f91414/call_wheBka5gQ4GTjZipPS9Hg9MZ__vscode-1784058175961/content.json";
const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
const root = Array.isArray(parsed) ? parsed[0].document : (parsed.document || parsed);
function getImages(n, acc, path = "") {
  if (n.type === "RECTANGLE" && n.fills && n.fills.some(f => f.type === "IMAGE") && n.absoluteBoundingBox) {
    const b = n.absoluteBoundingBox;
    acc.push({
      name: n.name,
      path: path + "/" + n.name,
      x: Math.round(b.x),
      y: Math.round(b.y),
      w: Math.round(b.width),
      h: Math.round(b.height),
      cornerRadius: n.cornerRadius,
      fills: n.fills.map(f => ({ type: f.type, imageRef: f.imageRef ? "yes" : "no" }))
    });
  }
  if (n.children) n.children.forEach((c) => getImages(c, acc, path + "/" + (n.name || "")));
  return acc;
}
const images = getImages(root, []);
images.sort((a, b) => a.y - b.y || a.x - b.x);
const out = images.map((img, i) => 
  `Image ${i}: ${img.name} | x=${img.x} y=${img.y} w=${img.w} h=${img.h} radius=${img.cornerRadius} | ${img.path}`
).join("\n");
fs.writeFileSync("/Users/suminder/CopilotAnalyticsLabs/figma-images.txt", out);
console.log(out);
