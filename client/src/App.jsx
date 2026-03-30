import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";




function App() {
  const [industry, setIndustry] = useState("");
  const [topic, setTopic] = useState("");
  const [posts, setPosts] = useState([]);
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");



  const handleGenerate = async () => {
    console.log("Button clicked");

    if (!industry || !topic || !audience || !tone) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setError("");
      setPosts([]);
      setCopied(false);
      setLoading(true);


      const response = await fetch("http://localhost:5001/generate-post", {  //send requests to backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ industry, topic, tone, audience }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate post");
      }
      setPosts(data.posts || []);  //handles result
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (postText) => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl">LinkedIn Post Generator</CardTitle>
            <CardDescription>
              Generate sharper LinkedIn posts with AI, tailored by industry, tone, and audience.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select industry</option>
              <option value="B2B SaaS">B2B SaaS</option>
              <option value="Investment Banking">Investment Banking</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Marketing">Marketing</option>
            </select>

            <Input
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <Input
              placeholder="Target audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />

            <Input
              placeholder="Tone (example: thoughtful, bold, practical)"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />

            <Button onClick={handleGenerate} className="w-full" disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Generating your post...</p>
            </CardContent>
          </Card>
        )}

        {posts.length > 0 &&
          posts.map((post, index) => (
            <Card className="shadow-sm" key={index}>
              <CardHeader>
                <CardTitle>Generated Post {index + 1}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="whitespace-pre-wrap leading-7 text-sm text-slate-700">
                  {post}
                </div>

                <Button variant="outline" onClick={() => handleCopy(post)}>
                  {copied ? "Copied!" : "Copy Post"}
                </Button>
              </CardContent>
            </Card>
          ))}

      </div>
    </main>
  );
}

export default App;