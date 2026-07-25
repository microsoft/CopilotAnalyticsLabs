const fs = require("fs");
const p = "/Users/suminder/Library/Application Support/Code - Insiders/User/workspaceStorage/e339b9c145cde25c3b9ffd425218122c/GitHub.copilot-chat/chat-session-resources/c4a14bef-afc7-4fc5-a6f8-c5ac08f91414/call_wheBka5gQ4GTjZipPS9Hg9MZ__vscode-1784058175961/content.json";
const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
const root = Array.isArray(parsed) ? parsed[0].document : (parsed.document || parsed);
function walk(n, depth = 0) {
  const pad = "  ".repeat(depth);
  let info = `${pad}${n.type} "${n.name || ""}"`;
  if (n.absoluteBoundingBox) {
    const b = n.absoluteBoundingBox;
    info += ` [x=${Math.round(b.x)} y=${Math.round(b.y)} w=${Math.round(b.width)} h=${Math.round(b.height)}]`;
  }
  if (n.layoutMode) info += ` [layout=${n.layoutMode}]`;
  console.log(info);
  if (n.children && depth < 6) n.children.forEach(c => walk(c, depth + 1));
}
// Find the "Featured card" frames
function findCards(n) {
  if (n.name === "Featured card" && n.type === "FRAME") {
    console.log("\n=== FEATURED CARD ===");
    walk(n, 0);
  }
  if (n.children) n.children.forEach(findCards);
}
findCards(root);
