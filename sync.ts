import { S3Client } from "bun"
import { readdir } from "fs/promises"

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT!,
    bucket: "backgrounds",
    region: "auto",
    secretAccessKey: process.env.S3_SECRET!,
    accessKeyId: process.env.S3_KEY!,
})


let allNames: string[] = [];

async function laodData(key?: string) {
    let data = await s3.list(key ? {
        continuationToken: key
    } : undefined);
    allNames.push(...data.contents?.map(x => x.key) ?? []);
    for (const x of data.contents ?? []) {
        if (x.key.endsWith(".png.png")) {
            await s3.delete(x.key)
        }
    }
    if (data.isTruncated) {
        await laodData(data.nextContinuationToken)
    }
}

await laodData()


await Bun.write("public/allNames.txt", allNames.join("\n"))


let promises = []
for (const file of await readdir(`${process.env.HOME}/Backgrounds`)) {
    if (!file.endsWith(".png") || allNames.includes(file)) continue;
    promises.push(s3.write(file, new Blob([await Bun.file(`${process.env.HOME}/Backgrounds/${file}`).arrayBuffer()], { type: "image/png" })))
}

await Promise.all(promises)