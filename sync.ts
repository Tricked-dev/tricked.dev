import { S3Client } from "bun"

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT!,
    bucket: "backgrounds",
    region: "auto",
    secretAccessKey: process.env.S3_SECRET!,
    accessKeyId: process.env.S3_KEY!,
})

let allNames: string[] = [];

async function loadData(key?: string) {
    let data = await s3.list(key ? {
        continuationToken: key
    } : undefined);
    allNames.push(...data.contents?.map(x => x.key) ?? []);
    for (const x of data.contents ?? []) {
        if (x.key.endsWith(".png.png") || x.key.startsWith("to_process/")) {
            await s3.delete(x.key)
        }
    }
    if (data.isTruncated) {
        await loadData(data.nextContinuationToken)
    }
}

await loadData()


await Bun.write("public/allNames.json", JSON.stringify(allNames))