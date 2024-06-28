---
layout: "../../layouts/BlogPost.astro"
title: "Gemini API ktor backend / kotlin backend"
description: "Information about how i use the gemini api in my kotlin backend"
pubDate: "Jun 28 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

After doing some searching i couldn't find any information. Do with this code what you want i dont care lol
If you have any improvements to make leave it in the comments i only added the fields i needed personally, and no error handling :0

```kt
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.content.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class GeminiResponse(
    val candidates: List<Candidate>,
    val usageMetadata: UsageMetadata,
)

@Serializable
data class Candidate(
    val content: Content,
    val finishReason: String,
    val index: Long,
    val safetyRatings: List<SafetyRating>,
)

@Serializable
data class Content(
    val parts: List<Part>,
    val role: String,
)

@Serializable
data class Part(
    val text: String,
)

@Serializable
data class SafetyRating(
    val category: String,
    val probability: String,
)

@Serializable
data class UsageMetadata(
    val promptTokenCount: Long,
    val candidatesTokenCount: Long,
    val totalTokenCount: Long,
)

suspend fun sendMessage(input: String): String {
    val client = HttpClient {
        install(ContentNegotiation) {
            json()
        }
    }
    val baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent"


    val systemInstruction = "You are funny json ai bot and you return json or something :)"

    @Serializable
    data class Part(
        val text: String
    )

    @Serializable
    data class Contents(
        val role: String,
        val parts: List<Part>
    )
    @Serializable
    data class SystemInstruct(
        val parts: Part
    )

    @Serializable
    data class GenerationConfig(
        val temperature: Float,
        val topK: Int,
        val topP: Float,
        val maxOutputTokens: Int,
        val responseMimeType: String
    )
    @Serializable
    data class Content(
        val system_instruction: SystemInstruct,
        val contents: List<Contents>,
        val generation_config: GenerationConfig
    )

    val generationConfig = GenerationConfig(
        temperature = 1f,
        topK = 64,
        topP = 0.95f,
        maxOutputTokens = 8192,
        responseMimeType = "application/json"
    )


    val response = client.post(baseUrl) {
        headers {
            append("Content-Type", "application/json")
            append("x-goog-api-key", "")
        }
        val body = Content(
            generation_config = generationConfig,
            system_instruction = SystemInstruct(parts = Part(text = systemInstruction)),
            contents = listOf(
                Contents(
                    role = "user",
                    parts = listOf(Part(text = input))
                )
            )
        )
        println(Json.encodeToString(body))
        setBody(body)

    }

    val res = response.body<GeminiResponse>()
    return res.candidates[0].content.parts[0].text
}
```
