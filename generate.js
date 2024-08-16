import { serialize } from "next-mdx-remote/serialize";
import  { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";

const files = readdirSync("./blogs/raw/");

console.log(files);

const index = []

for(const file of files){
    const raw_content = readFileSync(path.resolve("./blogs/raw/", file),{ encoding: "utf8"});
    const {frontmatter} = await serialize(raw_content,{
        parseFrontmatter: true
    });
    // console.log(mdxData.frontmatter);
    index.push({
        title: frontmatter.title,
        slug: file.slice(0,-4),
        author: frontmatter.author,
        author_short: frontmatter.author_short,
        tags: String(frontmatter.tags).split(",").map(el=>el.trim()),
        synopsis: frontmatter.synopsis,
        blog_img: frontmatter.blog_img,
        added_on: frontmatter.added_on
    })
}

writeFileSync(path.resolve("./blogs/index.json"), JSON.stringify(index,null,2),{encoding: "utf-8"});
console.log(`Generated ${index.length} indexes`);