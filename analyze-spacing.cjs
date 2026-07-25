const fs = require("fs");
const p = "/Users/suminder/Library/Application Support/Code - Insiders/User/workspaceStorage/e339b9c145cde25c3b9ffd425218122c/GitHub.copilot-chat/chat-session-resources/c4a14bef-afc7-4fc5-a6f8-c5ac08f91414/call_wheBka5gQ4GTjZipPS9Hg9MZ__vscode-1784058175961/content.json";
const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
const root = Array.isArray(parsed) ? parsed[0].document : (parsed.document || parsed);

function analyzeCard(n) {
  if (n.name === "Featured card" && n.type === "FRAME") {
    const card = n.absoluteBoundingBox;
    console.log(`\nCard bounds: y=${card.y} h=${card.height}`);
    
    let imageEnd = null;
    let copyStart = null;
    let tagEnd = null;
    let contentStart = null;
    let buttonsStart = null;
    
    function walk(node) {
      const b = node.absoluteBoundingBox;
      // Find instance/image
      if ((node.type === "INSTANCE" || node.type === "RECTANGLE") && node.name.includes("Illustration")) {
        imageEnd = b.y + b.height;
        console.log(`Image height: ${b.height}px`);
      }
      if (node.name === "copy" && node.type === "FRAME") {
        copyStart = b.y;
        console.log(`Copy frame starts at y=${b.y}`);
        // Find tag and content inside
        node.children?.forEach(child => {
          const cb = child.absoluteBoundingBox;
          if (child.name === "tag") {
            tagEnd = cb.y + cb.height;
            console.log(`  Tag: y=${cb.y} h=${cb.height} (ends ${tagEnd})`);
          }
          if (child.name === "content") {
            contentStart = cb.y;
            console.log(`  Content: y=${cb.y} h=${cb.height}`);
          }
          if (child.name === "Buttons") {
            buttonsStart = cb.y;
            console.log(`  Buttons: y=${cb.y} h=${cb.height}`);
          }
        });
      }
      if (node.children) node.children.forEach(walk);
    }
    walk(n);
    
    if (imageEnd && copyStart) console.log(`\nGap image→copy: ${copyStart - imageEnd}px`);
    if (tagEnd && contentStart) console.log(`Gap tag→content: ${contentStart - tagEnd}px`);
    if (contentStart && buttonsStart) console.log(`Gap content→buttons: ${buttonsStart - contentStart}px`);
  }
  if (n.children) n.children.forEach(analyzeCard);
}

analyzeCard(root);
