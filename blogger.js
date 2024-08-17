import { serialize } from "next-mdx-remote/serialize";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import arg from "arg";
import { exec } from "child_process";

function execute(cmd) {
    exec(cmd);
}

async function generateIndex(){
    const index = [];

    for (const file of files) {
      const raw_content = readFileSync(path.resolve("./blogs/raw/", file), {
        encoding: "utf8",
      });
      const { frontmatter } = await serialize(raw_content, {
        parseFrontmatter: true,
      });
      // console.log(mdxData.frontmatter);
      index.push({
        title: frontmatter.title,
        slug: file.slice(0, -4),
        author: frontmatter.author,
        author_short: frontmatter.author_short,
        tags: String(frontmatter.tags)
          .split(",")
          .map((el) => el.trim()),
        synopsis: frontmatter.synopsis,
        blog_img: frontmatter.blog_img,
        added_on: frontmatter.added_on,
      });
    }
  
    writeFileSync(
      path.resolve("./blogs/index.json"),
      JSON.stringify(index, null, 2),
      { encoding: "utf-8" }
    );
    console.log(`Generated ${index.length} indexes`);
}

function commit(){
    if(!args["--commit-msg"]){
        args["--commit-msg"] = `Auto Generated Commit on ${new Date().toLocaleString("en-US")}`;
    }
    execute(`git add .`)
    execute(`git commit -m "${args['--commit-msg']}"`);
}

function push(){
    execute(`git push`);
}
let args;
try {
  args = arg({
    "--generate": Boolean,
    "--skip-generate": Boolean,
    "--push": Boolean,
    "--commit-msg": String,
    "--commit": Boolean,
    "--verbose": Boolean,
  });
} catch (err) {
  if (err.code === "ARG_UNKNOWN_OPTION") {
    console.log(err.message);
    process.exit(-1);
  } else {
    throw err;
  }
}

if (args["--verbose"]) {
  console.log(args);
}

const files = readdirSync("./blogs/raw/");

if (args["--verbose"]) {
  console.log(files);
}
let generated = false;
if (!args["--skip-generate"]) {
  await generateIndex();
  generated = true;
}
if(args["--generate"] && !generated){
    await generateIndex();
    generated = true;
}
let commited = false;
if(args["--commit"]){
    commit();
    commited = true;
}

if(args["--push"]){
    push();
}