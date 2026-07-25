const fs = require("fs");
const p = "/Users/suminder/Library/Application Support/Code - Insiders/User/workspaceStorage/e339b9c145cde25c3b9ffd425218122c/GitHub.copilot-chat/chat-session-resources/c4a14bef-afc7-4fc5-a6f8-c5ac08f91414/call_wheBka5gQ4GTjZipPS9Hg9MZ__vscode-1784058175961/content.json";
const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
const root = Array.isArray(parsed) ? parsed[0].document : (parsed.document || parsed);

// First featured card (Insights Analysis - Essentials)
function analyzeCard(n, cardName) {
  if (n.name === cardName && n.type === "FRAME") {
    const card = n.absoluteBoundingBox;
    console.log(`\n=== ${cardName} ===`);
    console.log(`Card: x=${card.x} y=${card.y} w=${card.width} h=${card.height}`);
    
    // Find the image/instance
    let image = null;
    let copyFrame = null;
    
    function walk(node, depth = 0) {
      if (node.type === "INSTANCE" || (node.type === "RECTANGLE" && node.name === "Illustration")) {
        if (node.absoluteBoundingBox) {
          const b = node.absoluteBoundingBox;
          image = { x: b.x, y: b.y, w: b.width, h: b.height, name: node.name };
        }
      }
      if (node.name === "copy" && node.type === "FRAME") {
        const b = node.absoluteBoundingBox;
        copyFrame = { x: b.x, y: b.y, w: b.width, h: b.height };
        
        // Analyze content inside copy frame
        let tagY = null, contentY = null, buttonsY = null;
        node.children?.forEach(child => {
          const cb = child.absoluteBoundingBox;
          if (child.name === "tag") tagY = cb.y;
          if (child.name === "content") contentY = cb.y;
          if (child.name === "Buttons") buttonsY = cb.y;
        });
        
        console.log(`Copy frame: x=${b.x} y=${b.y} w=${b.width} h=${b.height}`);
        if (tagY) console.log(`  Tag Y: ${tagY}`);
        if (contentY) console.log(`  Content Y: ${contentY}`);
        if (buttonsY) console.log(`  Buttons Y: ${buttonsY}`);
        if (tagY && contentY) console.log(`  Gap tag→content: ${contentY - tagY - 24}px`);
        if (contentY && buttonsY) console.log(`  Gap content→buttons: ${buttonsY - contentY - 154}px`);
      }
      if (node.children) node.children.forEach(c => walk(c, depth + 1));
    }
    walk(n);
    
    if (image) {
      console.log(`Image: x=${Math.round(image.x)} y=${Math.round(image.y)} w=${image.w} h=${image.h}`);
      console.log(`Padding left (image to card edge): ${Math.round(image.x - card.x)}px`);
      console.log(`Padding top (image to card edge): ${Math.round(image.y - card.y)}px`);
      if (copyFrame) {
        console.log(`Gap image→copy content: ${Math.round(copyFrame.x - (image.x + image.w))}px`);
        console.log(`Padding card edge to content: ${Math.round(copyFrame.x - card.x)}px`);
      }
    }
  }
  if (n.children) n.children.forEach(c => analyzeCard(c, cardName));
}

analyzeCard(root, "Featured card");
