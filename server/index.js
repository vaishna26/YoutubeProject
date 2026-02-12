import express from "express";
import cors from "cors";
import http from "http";
import fetch from "node-fetch";
import { Server } from "socket.io";


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});


const videos = [
  {
    _id: "101",
    videotitle: "Space Exploration Documentary",
    thumbnail:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
    channel: "Space Hub",
    views: 180000,
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  },
  {
    _id: "102",
    videotitle: "Node.js Crash Course",
    thumbnail:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
    channel: "Backend Dev",
    views: 95000,
    videoUrl:
      "https://media.w3.org/2010/05/video/movie_300.mp4",
  },
  {
    _id: "103",
    videotitle: "Mountain Travel Vlog",
    thumbnail:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    channel: "Travel Diaries",
    views: 67000,
    videoUrl:
      "https://media.w3.org/2010/05/sintel/trailer.mp4",
  },
  {
    _id: "104",
    videotitle: "Street Food Bangkok",
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-bc6c2b6b54f4",
    channel: "Food Street",
    views: 112000,
    videoUrl:
      "https://media.w3.org/2010/05/bunny/movie.mp4",
  },
  {
    _id: "105",
    videotitle: "AI & Machine Learning Explained",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    channel: "AI Talks",
    views: 143000,
    videoUrl:
      "https://media.w3.org/2010/05/bunny/trailer.mp4",
  },
  {
    _id: "106",
    videotitle: "React Project Tutorial",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    channel: "React School",
    views: 88000,
    videoUrl:
      "https://media.w3.org/2010/05/video/movie_300.mp4",
  },
  {
    _id: "107",
    videotitle: "Rainforest Nature Sounds",
    thumbnail:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
    channel: "Nature Relax",
    views: 56000,
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  },
  {
    _id: "108",
    videotitle: "Top Programming Tips 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    channel: "Dev Shorts",
    views: 99000,
    videoUrl:
      "https://media.w3.org/2010/05/sintel/trailer.mp4",
  },
];



app.get("/video/getall", (req, res) => {
  res.json(videos);
});

app.get("/", (req, res) => {
  res.send("🚀 YouTube Backend API is running");
});


let comments = [];

const isValidComment = (text) => {
  const regex = /^[\p{L}\p{N}\s.,!?\n]+$/u;
  return regex.test(text.trim());
};

const getCityFromIP = async (ip) => {
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`);
    const d = await r.json();
    return d.city || "Unknown";
  } catch {
    return "Unknown";
  }
};

app.post("/comment/add", async (req, res) => {
  const { videoId, text } = req.body;

  if (!isValidComment(text)) {
    return res.status(400).json({ error: "Invalid characters" });
  }

  const city = await getCityFromIP(req.ip);

  const newComment = {
    id: Date.now(),
    videoId,
    text,
    likes: 0,
    dislikes: 0,
    city,
  };

  comments.push(newComment);
  res.json(newComment);
});

app.get("/comment/:videoId", (req, res) => {
  res.json(comments.filter((c) => c.videoId === req.params.videoId));
});

app.post("/comment/react", (req, res) => {
  const { commentId, type } = req.body;
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return res.sendStatus(404);

  if (type === "like") comment.likes++;
  if (type === "dislike") comment.dislikes++;

  if (comment.dislikes >= 2) {
    comments = comments.filter((c) => c.id !== commentId);
    return res.json({ removed: true });
  }

  res.json(comment);
});

app.post("/comment/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  const r = await fetch(url);
  const d = await r.json();

  res.json({ translated: d[0][0][0] });
});


io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("signal", (data) => {
    socket.broadcast.emit("signal", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
