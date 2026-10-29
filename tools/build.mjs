import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const tpl = read("src/memory-vault.template.html");
const three = read("vendor/three.r91.js");

/* demo 版：内置 31 条演示记忆，无快照 */
let demo = tpl.replace("/*__THREE_JS__*/", () => three);
if (/assets\//.test(demo)) throw new Error("external ref leaked");
fs.writeFileSync(path.join(root, "memory-vault.html"), demo);

/* sample 版：注入示例快照（179 条） */
const snap = JSON.parse(read("snapshot/sample-snapshot.json"));
const wrapper = "window.MEMORY_SNAPSHOT=" + JSON.stringify(snap).replace(/<\//g, "<\\/") + ";";
let sample = tpl.replace("/*__THREE_JS__*/", () => three).replace("/*__SNAPSHOT__*/", () => wrapper);
if (/assets\//.test(sample)) throw new Error("external ref leaked");
fs.writeFileSync(path.join(root, "memory-vault-sample.html"), sample);

console.log("memory-vault.html", fs.statSync(path.join(root, "memory-vault.html")).size, "bytes");
console.log("memory-vault-sample.html", fs.statSync(path.join(root, "memory-vault-sample.html")).size, "bytes");
