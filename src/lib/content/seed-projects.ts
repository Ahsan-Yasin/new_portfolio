import type { Project } from './schema';

/**
 * The projects a new deployment starts with. Descriptions come from reading and running
 * each repo, plus Ahsan's CV. Everything here can be changed from the admin.
 */
export const seedProjects: Project[] = [
  {
    "id": "lensbay",
    "slug": "lensbay",
    "title": "LensBay",
    "summary": "A live marketplace for used camera gear in Pakistan, with auctions, live messaging, repair listings and a 3D camera that comes apart as you scroll.",
    "published": true,
    "cover": {
      "src": "/projects/lensbay-cover.webp",
      "alt": "LensBay landing page with an exploded 3D camera between the words Camera Gear, Verified, on desktop and phone",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "/projects/lensbay-landing.mp4",
      "alt": "LensBay’s landing page: a 3D camera comes apart and rotates as the page scrolls",
      "kind": "video",
      "width": 1440,
      "height": 780,
      "poster": "/projects/lensbay-landing-poster.webp"
    },
    "coverFit": "contain",
    "color": "#008F66",
    "year": "2026",
    "client": "Final year project, FAST-NUCES",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "React",
      "TypeScript",
      "Three.js",
      "GSAP",
      "Node.js",
      "MongoDB",
      "Socket.IO",
      "FastAPI",
      "Docker",
      "AWS"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "Live",
        "label": "On AWS, with a CI/CD pipeline"
      },
      {
        "id": "m2",
        "value": "18",
        "label": "Feature modules in the marketplace API"
      }
    ],
    "links": [
      {
        "id": "live",
        "label": "Visit the live site",
        "url": "https://lensbay.dpdns.org"
      }
    ],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "LensBay is my final year project at FAST-NUCES: a marketplace for used camera gear in Pakistan, priced in PKR. People can buy at a fixed price, bid in auctions, message each other live, browse parts and find repair technicians. Payments are simulated for now.\n\nThe idea is that each listing carries evidence about the item: a condition grade, a lens health check, a fair-price range and a seller Trust Score. The AI services behind those are designed but aren’t running live yet, so the site says “Not available right now” instead of showing a made-up result."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/lensbay-recording.mp4",
          "alt": "A walkthrough of the live LensBay site: the 3D landing page, browsing, search, a listing, repair technicians and parts",
          "kind": "video",
          "width": 1440,
          "height": 780,
          "poster": "/projects/lensbay-landing-poster.webp"
        },
        "caption": "A walkthrough of the live site, recorded on an admin account, which is why the listing says it can’t buy. Payments run in test mode, and the checks marked “Not available right now” need AI services that aren’t live yet.",
        "size": "wide",
        "color": "#DDF1EA"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "The landing camera is built in code with React Three Fiber and driven by one pinned GSAP ScrollTrigger timeline. Where the browser supports it, the scene renders on an OffscreenCanvas in a Web Worker.",
          "The marketplace API is a modular monolith on Express, Mongoose and Socket.IO, with 18 feature modules. A bid in an auction’s last 2 minutes adds 2 more.",
          "AI sits behind a boundary: four FastAPI services for vision, pricing, the shopping assistant and 3D reconstruction, which only the API calls. The API polls their health, and the site shows each feature only when its service is available.",
          "It’s deployed on AWS on a t3.small, using Docker and Nginx.",
          "CI/CD runs on GitHub Actions: each push is checked, and a push to main deploys automatically."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/lensbay-1.webp",
          "alt": "A LensBay listing for a Fujifilm X-T3 with photos, an asking price in PKR and buy buttons",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "A listing page with photos, price and checkout. The AI chips say Not available right now until those services are connected.",
        "size": "wide",
        "color": "#DDF1EA"
      },
      {
        "id": "b7",
        "type": "media",
        "media": {
          "src": "/projects/lensbay-3.webp",
          "alt": "A live auction page for a Nikon D7500 with its price, time left and bid controls",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Auctions update live, and a bid in the last 2 minutes adds 2 more.",
        "size": "inset",
        "color": "#DDF1EA"
      },
      {
        "id": "b8",
        "type": "media",
        "media": {
          "src": "/projects/lensbay-2.webp",
          "alt": "Landing page section explaining the find, check, verify and buy steps beside the 3D camera",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The landing page, where scrolling moves, rotates and opens the 3D camera section by section. The 94/100 trust score is sample copy, and the checks it lists need AI services that aren’t live yet.",
        "size": "inset",
        "color": "#DDF1EA"
      }
    ]
  },
  {
    "id": "highlight-cutter",
    "slug": "highlight-cutter",
    "title": "Highlight Cutter",
    "summary": "Turns a raw meeting recording into a finished video, vertical shorts, a video of everything it cut and a report of why. It’s deployed and in use at FloLabs.",
    "published": true,
    "cover": {
      "src": "/projects/highlight-cutter-cover.webp",
      "alt": "The Highlight Cutter results page for a synthetic demo meeting: the final video, downloads, shorts and the YouTube panel, with a short on a phone in front",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#C4341F",
    "year": "2026",
    "client": "FloLabs",
    "role": "Intern & Co-Team Lead",
    "duration": "",
    "team": "",
    "tags": [
      "Python",
      "FastAPI",
      "ffmpeg",
      "LLM",
      "Zoom API",
      "YouTube API"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "In use",
        "label": "Deployed at FloLabs"
      }
    ],
    "links": [],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "Highlight Cutter takes a Zoom recording, a YouTube link or an uploaded file and produces one zip per meeting: the final video with the highlights reel first and the cleaned meeting after it, vertical shorts with burned-in captions, a video of every cut labelled with its time and reason, a PDF report, transcripts and YouTube chapters.\n\nIt reuses the platform’s own transcript when there is one, an AI pass judges every sentence, and ffmpeg does the cutting. It’s deployed and in use at FloLabs, where I work as an Intern and Co-Team Lead. The screenshots here show a synthetic demo meeting with fictional people, not a real recording."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/highlight-cutter-1.webp",
          "alt": "A finished job for a synthetic demo meeting, with every stage ticked and a table of what the AI picked",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "A finished job on a synthetic demo meeting: every stage ticked, the uploaded transcript reused, and what the AI picked for the reel and shorts.",
        "size": "wide",
        "color": "#FBE6E2"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "A FastAPI service with a single-worker job queue. Each job moves through ingest, transcription, the AI decisions, the edit list, then rendering and packaging.",
          "The AI judges each sentence keep or remove and scores highlights, then re-ranks the best moments and writes the chapters. Claude Haiku is the default, with OpenAI and Gemini as options.",
          "Every cut lands on a whole source frame, and every piece is checked for frame count and encoder settings before it’s joined, so a mismatch fails the job instead of shipping a broken file.",
          "Silence detection measures the audio itself and adapts to each recording, so a quiet speaker isn’t cut.",
          "It can publish to YouTube: the shorts first, then the full video with chapters and links to them, and a published video is never uploaded twice."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/highlight-cutter-2.webp",
          "alt": "A clip labelled Removed 00:00 to 01:34, housekeeping, above two vertical shorts with captions",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Every cut of a second or more is in its own video, labelled with its time and reason, and the shorts come ready to post.",
        "size": "inset",
        "color": "#FBE6E2"
      },
      {
        "id": "b7",
        "type": "media",
        "media": {
          "src": "/projects/highlight-cutter-3.webp",
          "alt": "The PDF report, listing highlights, shorts, YouTube chapters and removed parts with reasons",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The PDF report: highlights, shorts, chapters and every removal with its reason.",
        "size": "inset",
        "color": "#FBE6E2"
      }
    ]
  },
  {
    "id": "eld-trip-planner",
    "slug": "eld-trip-planner",
    "title": "ELD Trip Planner",
    "summary": "LogisticsPro plans multi-day truck trips under FMCSA Hours of Service rules and draws the driver log sheet for each day.",
    "published": true,
    "cover": {
      "src": "/projects/eld-trip-planner-cover.webp",
      "alt": "LogisticsPro route map for a Chicago to Houston trip with its day-by-day schedule, in front of the generated ELD log sheets",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#2747D6",
    "year": "2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Django",
      "React",
      "TypeScript",
      "MongoDB",
      "RAG",
      "ChromaDB",
      "Google Maps",
      "Leaflet"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "96 cells",
        "label": "Per day in each generated ELD log"
      }
    ],
    "links": [
      {
        "id": "live",
        "label": "Visit the live site",
        "url": "https://eld-trip-planner-virid.vercel.app"
      },
      {
        "id": "repo",
        "label": "View on GitHub",
        "url": "https://github.com/Ahsan-Yasin/ELD-Trip-Planner"
      }
    ],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "LogisticsPro is a fleet compliance app for fleet managers and truck drivers. You enter a current location, a pickup, a dropoff and the hours already used in the 70-hour cycle. It plans the road route, splits the drive into days with breaks, fuel stops and overnight rest, and flags any Hours of Service violations.\n\nEach day gets a 24-hour electronic logging device (ELD) log sheet you can download, and a history page keeps every trip for each user. An assistant answers compliance questions from FMCSA documentation using RAG."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/eld-trip-planner-1.webp",
          "alt": "Compliance page showing drive and cycle hours, a 24-hour ELD log grid and an event log",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The compliance page for a one-day trip: hours used, the day's ELD log grid and its event log.",
        "size": "wide",
        "color": "#E5E9FB"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "The HOS engine in Python walks a trip day by day, applying the 11-hour driving limit, the 14-hour window, a 30-minute break after 8 hours of driving, the 70-hour cycle and a fuel stop every 1,000 miles.",
          "The ELD generator uses Pillow to draw each 24-hour log at one pixel per minute with 15-minute ticks, which makes 96 cells per day.",
          "Routing uses Google Maps directions, falling back to OSRM and then to straight-line distance when no key is set; React-Leaflet draws the route on OpenStreetMap.",
          "The compliance assistant retrieves FMCSA chunks from ChromaDB with sentence-transformer embeddings and answers through an OpenRouter LLM.",
          "A Django REST Framework API with custom JWT auth and per-user data in MongoDB through MongoEngine, with React, TypeScript, Zustand and Tailwind CSS on the front."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/eld-trip-planner-2.webp",
          "alt": "Fleet dashboard with trip stats and the AI compliance assistant drawer open",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The dashboard with the AI compliance assistant open, showing its suggested questions. The trips, mileage and compliance rate come from test trips, and “12 Units” is placeholder text in the sidebar.",
        "size": "inset",
        "color": "#E5E9FB"
      },
      {
        "id": "b7",
        "type": "media",
        "media": {
          "src": "/projects/eld-trip-planner-3.webp",
          "alt": "Trip history listing each planned route with distance, drive time, days and ELD logs",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Trip history keeps every plan with its distance, drive time, days and log sheets.",
        "size": "inset",
        "color": "#E5E9FB"
      }
    ]
  },
  {
    "id": "gaussian-splatting-studio",
    "slug": "gaussian-splatting-studio",
    "title": "Gaussian Splatting Studio",
    "summary": "Turns a webcam recording, video or image folder into a 3D Gaussian Splat scene you can orbit in the browser, using a local GPU.",
    "published": true,
    "cover": {
      "src": "/projects/gaussian-splatting-studio-cover.webp",
      "alt": "Gaussian Splatting Studio with its WebGL viewer showing a synthetic test scene, a colourful knot made of Gaussians, not a real capture",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#141416",
    "year": "2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "3D Gaussian Splatting",
      "COLMAP",
      "WebGL",
      "Computer vision",
      "Flask",
      "OpenCV"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "Live 3D",
        "label": "Rendered in the browser with WebGL"
      }
    ],
    "links": [
      {
        "id": "repo",
        "label": "View on GitHub",
        "url": "https://github.com/Ahsan-Yasin/3DGS"
      }
    ],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "Gaussian Splatting Studio takes a webcam recording, a video file or a folder of images and produces an interactive 3D scene you can orbit in the browser. A web app runs the whole pipeline: it samples frames, estimates camera poses with COLMAP, trains a 3D Gaussian Splatting model on a local GPU, and loads the result into a WebGL viewer.\n\nYou can watch each stage and its live log while a job runs, and finished jobs stay available in a history panel. The scene shown here is a synthetic test file used to exercise the viewer, not a real capture."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/gaussian-splatting-studio-1.webp",
          "alt": "A job running, with frame extraction in progress, the pipeline stepper and log lines streaming",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "A job running: the stepper shows the current stage while log lines stream in live.",
        "size": "wide",
        "color": "#E9E5DC"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "A Flask backend with routes to upload a video or path, check job status, stream logs and serve the trained PLY.",
          "A thread-safe job manager runs the three stages in the background, streams log lines over Server-Sent Events and recovers finished jobs from disk after a restart.",
          "OpenCV samples frames at a chosen rate, capped at 500, and COLMAP then runs feature extraction, matching, mapping and undistortion through its command-line tools for camera poses.",
          "Training launches the official gaussian-splatting train.py as a subprocess on the GPU, with iterations adjustable from the UI.",
          "The viewer is a small wrapper around the gsplat.js WebGL renderer, with orbit controls."
        ]
      }
    ]
  },
  {
    "id": "occupational-stress",
    "slug": "occupational-stress-research",
    "title": "Beating a published ML paper",
    "summary": "I reproduced a paper on occupational stress prediction in Python, then raised its accuracy from 74.19% to 83.87%.",
    "published": true,
    "cover": {
      "src": "/projects/stress-paper-cover.webp",
      "alt": "A results card: accuracy rose from 74.19% to 83.87% and features fell from 39 to 10, using RFECV, a stacking ensemble, Optuna and SMOTE",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#B45309",
    "year": "2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Machine learning",
      "Python",
      "XGBoost",
      "Optuna"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "+9.68",
        "label": "Accuracy points, from 74.19% to 83.87%"
      },
      {
        "id": "m2",
        "value": "39 → 10",
        "label": "Features, cut with RFECV"
      }
    ],
    "links": [],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "The result"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "I reproduced a published machine learning paper on occupational stress in Python, then worked on improving it. Accuracy went from 74.19% to 83.87%, and the feature count dropped from 39 to 10.\n\nThe changes were RFECV feature selection, a stacking ensemble in place of hard voting, Bayesian tuning with Optuna's TPE sampler, and SMOTE class balancing. I also ran a full ablation study."
      },
      {
        "id": "b3",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b4",
        "type": "list",
        "title": "",
        "items": [
          "RFECV feature selection cut the feature set from 39 to 10.",
          "A stacking ensemble with Random Forest and XGBoost base models and a Logistic Regression meta-learner replaced hard voting over Logistic Regression and SVC.",
          "Hyperparameters were tuned with Bayesian search using Optuna's TPE sampler.",
          "SMOTE was used for class balancing.",
          "A full ablation study was run on the pipeline."
        ]
      }
    ]
  },
  {
    "id": "wellness-chatbot",
    "slug": "ai-mental-wellness-chatbot",
    "title": "MindSpace",
    "summary": "An AI mental-wellness assistant: a check-in conversation, a short summary, then a chat that recalls earlier messages through RAG. Not a replacement for professional care.",
    "published": true,
    "cover": {
      "src": "/projects/ai-mental-wellness-chatbot-cover.webp",
      "alt": "The MindSpace home page on desktop and phone",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#0E7490",
    "year": "2025",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Python",
      "Flask",
      "LangChain",
      "Groq",
      "ChromaDB",
      "RAG",
      "React",
      "Express"
    ],
    "metrics": [],
    "links": [],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "MindSpace is a wellness assistant I worked on, for reflecting on how you feel. It is not a replacement for professional care. You go through a check-in conversation that asks one question at a time, read a short summary, and then keep talking to an assistant called Sera.\n\nSera can draw on what you said earlier, because each user’s check-in result and messages are embedded in ChromaDB, and the closest matches are fed back in before every reply. The check-in shown here uses sample text written for the screenshot."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/ai-mental-wellness-chatbot-1.webp",
          "alt": "The check-in conversation, asking one question at a time, with mood shortcuts",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The check-in asks one question at a time. The text here is sample data.",
        "size": "wide",
        "color": "#DDF0F5"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "A Flask service runs the AI with LangChain and a Groq-hosted LLM, with separate chains for the check-in and the chat.",
          "RAG memory: earlier messages are embedded in ChromaDB, and the closest matches are retrieved before each reply.",
          "Chat replies use structured output with a Pydantic schema, and the chain recovers from schema failures by reading the failed generation and extracting its JSON.",
          "A React, Vite and Tailwind front end with an Express accounts server."
        ]
      }
    ]
  },
  {
    "id": "social-media-studio",
    "slug": "social-media-studio",
    "title": "Social Media Studio",
    "summary": "Takes one blog post and turns it into reviewed, scheduled versions for Telegram, X and LinkedIn, publishing through Telegram’s Bot API and mock adapters, with idempotency keys to stop repeat posts.",
    "published": true,
    "cover": {
      "src": "/projects/social-media-studio-cover.webp",
      "alt": "Social Media Studio dashboard with posts, campaign variants and a schedule queue, in front of its mock outbox",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#C4341F",
    "year": "2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Node.js",
      "Express",
      "SQLite",
      "Idempotency",
      "Telegram Bot API"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "17 tests",
        "label": "All passing, covering idempotency, crash recovery and adapter swaps"
      }
    ],
    "links": [],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "Social Media Studio is my FlyRank Backend AI Engineering capstone. You give it a blog post as a URL or pasted Markdown, and it generates one version per platform. A person approves, edits or rejects each version, any edit is checked against that platform’s rules for length, hashtags and tone, and only approved versions can be scheduled.\n\nA background worker then publishes each one at its time slot. The core of the project is stopping a retry, a restart or a duplicate request from creating a second post. X and LinkedIn go to mock adapters that dedupe on an idempotency key and record what they would have posted. Telegram goes through the real Bot API, where a crash between Telegram accepting a post and the database commit can still send it twice, and the README documents that limit."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/social-media-studio-1.webp",
          "alt": "Platform variants with character and hashtag limits beside a table of scheduled posts",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Variants on the left with their length and hashtag limits, and the schedule queue on the right. The posts are samples.",
        "size": "wide",
        "color": "#FBE6E2"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "Node.js and Express, with SQLite through the built-in node:sqlite module, so it needs no Docker and no native builds.",
          "Every schedule has a unique idempotency key made from the variant and its time slot. Mock adapters store it with INSERT OR IGNORE, and a duplicate request on a published schedule returns skipped_duplicate.",
          "The durable worker claims a schedule by moving it from pending to publishing. On restart it re-queues anything stuck in publishing. On the mock adapters the key stops the retry from posting twice, and failures retry up to 5 times before a schedule is marked failed.",
          "getAdapter picks the Telegram or mock publisher for each platform from the ADAPTERS config, so swapping Telegram to mock is a configuration change with no code changes.",
          "Variants come from a rule-based generator, and constraint profiles in code reject a rule-breaking edit with a 400, such as going over 280 characters or 3 hashtags on X."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/social-media-studio-2.webp",
          "alt": "Publish history table beside a mock outbox showing posts and their idempotency keys",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Every publish attempt is recorded, and the mock outbox shows what each adapter would have posted, with its idempotency key.",
        "size": "inset",
        "color": "#FBE6E2"
      }
    ]
  },
  {
    "id": "nyc-congestion-audit",
    "slug": "nyc-congestion-audit",
    "title": "NYC Congestion Pricing Audit",
    "summary": "A DuckDB pipeline and Streamlit dashboard comparing NYC taxi trips before and after the 2025 congestion toll.",
    "published": true,
    "cover": {
      "src": "/projects/nyc-congestion-audit-cover.webp",
      "alt": "Two dashboard windows: speed heatmaps for Q1 2024 and Q1 2025, and a chart and table of taxi zones with rising drop-offs",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#5B4BF5",
    "year": "2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Python",
      "DuckDB",
      "Parquet",
      "Streamlit",
      "Plotly",
      "Data engineering"
    ],
    "metrics": [],
    "links": [],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "I built this to check what NYC's congestion toll, which started on January 5, 2025, did to taxi trips. It works directly from the city's public trip records and compares the first quarter of 2024 with the first quarter of 2025.\n\nThe pipeline flags suspicious trips, such as impossible speeds or fares with no distance. It also compares drop-off volumes, speeds by hour and day, monthly surcharges against a rough tip estimate, and daily trips against rainfall. A Streamlit dashboard then shows the results."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/nyc-congestion-audit-1.webp",
          "alt": "Two heatmaps of average taxi speed by hour and day of week, for Q1 2024 and Q1 2025",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Average speed by hour and day in the pipeline's zone list, Q1 2024 against Q1 2025. The overall change on this run was 0.03 MPH.",
        "size": "wide",
        "color": "#ECEBFE"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "DuckDB queries the monthly Parquet files directly with read_parquet and union_by_name, and only small result tables reach the dashboard.",
          "The audit flags three patterns in SQL: speeds over 65 MPH, trips under a minute with fares over $20, and zero-distance trips with a fare.",
          "Daily trip counts are joined with Open-Meteo rainfall for Central Park, and SciPy fits the relationship.",
          "If December 2025 is missing, the pipeline builds it from a 30% sample of December 2023 and a 70% sample of December 2024, shifted forward.",
          "DuckDB runs on an in-memory connection with a 4 GB limit and four threads, and exports its results with COPY for the dashboard."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/nyc-congestion-audit-2.webp",
          "alt": "A bar chart and table of the 15 taxi zones with the largest rise in drop-offs",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Zones with the biggest rise in drop-offs between the two quarters. The note on screen is fixed dashboard text: on this run the top ten are all in Brooklyn and Queens, not along 60th Street.",
        "size": "inset",
        "color": "#ECEBFE"
      }
    ]
  },
  {
    "id": "arabic-urdu-dictionary",
    "slug": "arabic-urdu-dictionary",
    "title": "Arabic to Urdu Dictionary",
    "summary": "A Java desktop dictionary that stores Arabic words with Urdu meanings and uses Arabic NLP to find roots, lemmas and segments.",
    "published": true,
    "cover": {
      "src": "/projects/arabic-urdu-dictionary-cover.webp",
      "alt": "Two windows of the dictionary app: the Add Word form with suggested Arabic roots, and the text lemmatization screen",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#B45309",
    "year": "2025-2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Java",
      "Swing",
      "MySQL",
      "Arabic NLP",
      "AlKhalil"
    ],
    "metrics": [],
    "links": [
      {
        "id": "repo",
        "label": "View on GitHub",
        "url": "https://github.com/Ahsan-Yasin/Arabic-Dictionary-"
      }
    ],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "This is a desktop dictionary I worked on as part of a team, for building an Arabic to Urdu word list. Each entry holds the Arabic form, base form, Urdu meaning, part of speech, root, pattern, examples and grammar metadata, and you can add, edit, search and browse them.\n\nThe language tools are the interesting part. Paste Arabic text and it checks each word against the dictionary, marks the missing ones, and lets you click through to add them. It also suggests roots for a new word, generates a word from a root and a pattern, and builds a glossary CSV from a text file."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/arabic-urdu-dictionary-1.webp",
          "alt": "The text lemmatization tab with an Arabic sentence and a table marking each word true or false",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Paste Arabic text and each word is analysed and checked against the dictionary. The entries in these shots are sample data.",
        "size": "wide",
        "color": "#F6E7D6"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "The code is layered into a Swing UI, business objects and DAOs, with a facade over each of the logic and data layers and DTOs passed between them.",
          "The AlKhalil analyser and stemmer from the Oujda NLP team provide the lemmas, roots and segments, which are saved per word.",
          "Root suggestions rank stored roots by longest common subsequence with the new word and show the match as a percentage.",
          "Data lives in MySQL through JDBC, with tables for roots, words, noun and verb metadata, examples, lemmas, segments and patterns.",
          "Regex search compiles a Unicode-aware pattern and runs it over stored Arabic forms, so a pattern can step over the vowel marks."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/arabic-urdu-dictionary-2.webp",
          "alt": "The regex search tab listing four Arabic words with their Urdu meanings",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "Regex search across the stored Arabic forms, here finding sample words built on the root ك ت ب.",
        "size": "inset",
        "color": "#F6E7D6"
      },
      {
        "id": "b7",
        "type": "media",
        "media": {
          "src": "/projects/arabic-urdu-dictionary-3.webp",
          "alt": "The word generator tab showing a generated Arabic word in red",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The word generator builds a word from a root and a pattern. Red means no exact match, but the check compares this vowelled form with unvowelled base forms, so here it misses a word the dictionary does hold.",
        "size": "inset",
        "color": "#F6E7D6"
      }
    ]
  },
  {
    "id": "omnix",
    "slug": "omnix",
    "title": "OMNIX",
    "summary": "The website for OMNIX, the software studio I co-founded. It presents our services and saves enquiries to MongoDB, emailing both sides.",
    "published": true,
    "cover": {
      "src": "/projects/omnix-cover.webp",
      "alt": "The OMNIX services page in a browser window, with the home page on a phone in front",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#2747D6",
    "year": "2026",
    "client": "",
    "role": "Co-founder",
    "duration": "",
    "team": "",
    "tags": [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Express",
      "MongoDB",
      "Vercel"
    ],
    "metrics": [],
    "links": [],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "OMNIX is the software studio I co-founded, and this is its website. It presents our web, mobile and AI services and takes enquiries through two forms: a detailed quote request with a service type and a budget slider in PKR, and a simple contact form.\n\nEach enquiry is saved to MongoDB and triggers two emails through Nodemailer: a notification to us and an auto-reply to the person who wrote in."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/omnix-1.webp",
          "alt": "OMNIX home page with its logo and animated tagline",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The home page, with a typed tagline that cycles through Innovate, Build and Deploy.",
        "size": "wide",
        "color": "#E5E9FB"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "React 19 and Vite with React Router. Vercel rewrites send every non-API path to index.html, so deep links survive a refresh.",
          "An Express and Mongoose API that runs as a serverless function on Vercel.",
          "A cached lazy database connection for serverless, plus a guard so warm starts don’t recompile Mongoose models.",
          "Enquiries are saved first, then Nodemailer sends the emails. Each step has its own error handling, so one failing doesn’t stop the other."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/omnix-2.webp",
          "alt": "Quote request form with service type and a budget slider in PKR",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The quote form asks for a service type, a budget in PKR and a short project description.",
        "size": "inset",
        "color": "#E5E9FB"
      }
    ]
  },
  {
    "id": "youtube-analyzer",
    "slug": "youtube-comment-analyzer",
    "title": "YouTube Comment Analyzer",
    "summary": "A Flask app that pulls a video’s YouTube comments, counts positive and negative ones with an LLM, and answers questions about them. The figures shown are samples.",
    "published": true,
    "cover": {
      "src": "/projects/youtube-comment-analyzer-cover.webp",
      "alt": "The YouTube Comments Analyzer page on desktop and phone, with sample percentages of 78% and 22% and a sample answer, not from a real run",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#C4341F",
    "year": "2025",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Python",
      "Flask",
      "RAG",
      "ChromaDB",
      "Groq",
      "Sentiment analysis"
    ],
    "metrics": [],
    "links": [
      {
        "id": "repo",
        "label": "View on GitHub",
        "url": "https://github.com/Ahsan-Yasin/Youtube-Analyzer"
      }
    ],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "I built this to read a video's comments without scrolling through them. You paste a YouTube link, the app fetches the comments through the YouTube Data API, stores them in ChromaDB, and shows what percentage are positive and negative.\n\nYou can then type a question into the same box. The app widens your question into related searches, pulls the five closest comments, and has an LLM answer in a few short lines using only those comments. If the comments don't cover it, the prompt tells the model to say it doesn't know.\n\nThe Groq model it was written for has since been retired, so a fresh clone needs a new model ID in model.py first."
      },
      {
        "id": "b3",
        "type": "media",
        "media": {
          "src": "/projects/youtube-comment-analyzer-1.webp",
          "alt": "The results page with two percentage circles, a link input and an answer box",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The results page. The percentages and answer here are sample values, because this shot was taken without the API keys a live analysis needs.",
        "size": "wide",
        "color": "#FBE6E2"
      },
      {
        "id": "b4",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b5",
        "type": "list",
        "title": "",
        "items": [
          "Flask serves a single page. Input starting with https:// runs the analysis, and anything else goes to the question flow.",
          "Comments come from the YouTube Data API's commentThreads endpoint, paging until none are left.",
          "Comments are embedded with the all-MiniLM-L6-v2 sentence transformer and stored in a persistent ChromaDB collection, which is cleared when a new link comes in.",
          "Sentiment runs in batches of 100 comments through a Groq-hosted LLM, and a regex pulls the counts out of each reply before they are totalled.",
          "Questions use two LLM calls: one to expand the query, and one to answer from the five retrieved comments."
        ]
      },
      {
        "id": "b6",
        "type": "media",
        "media": {
          "src": "/projects/youtube-comment-analyzer-2.webp",
          "alt": "The same results page on a phone",
          "kind": "image",
          "width": 1600,
          "height": 1000
        },
        "caption": "The same page on a phone, also with sample values.",
        "size": "inset",
        "color": "#FBE6E2"
      }
    ]
  },
  {
    "id": "daily-duas",
    "slug": "daily-duas",
    "title": "Daily Duas",
    "summary": "An Android app for reciting daily duas, with alarm-style reminders, a guided counter, recitation audio and offline Quran text checks.",
    "published": true,
    "cover": {
      "src": "/projects/daily-duas-cover.webp",
      "alt": "A fact card for Daily Duas: 6,236 Quran verses bundled for offline checking, alarm-style reminders, a guided counter, and recitation audio",
      "kind": "image",
      "width": 2000,
      "height": 1200
    },
    "coverVideo": {
      "src": "",
      "alt": "",
      "kind": "video"
    },
    "coverFit": "contain",
    "color": "#008F66",
    "year": "2026",
    "client": "",
    "role": "",
    "duration": "",
    "team": "",
    "tags": [
      "Flutter",
      "Dart",
      "Kotlin",
      "Android",
      "SQLite",
      "Riverpod"
    ],
    "metrics": [
      {
        "id": "m1",
        "value": "6,236",
        "label": "Quran verses bundled for offline checking"
      }
    ],
    "links": [
      {
        "id": "repo",
        "label": "View on GitHub",
        "url": "https://github.com/Ahsan-Yasin/Duas-App"
      }
    ],
    "blocks": [
      {
        "id": "b1",
        "type": "heading",
        "text": "What it does"
      },
      {
        "id": "b2",
        "type": "text",
        "text": "Daily Duas keeps your list of duas, groups them into routines, and rings like a real alarm at the times you pick. When it rings, it walks you through each dua one at a time with a counter, large Arabic text and optional recitation audio. Everything is stored on the phone and works offline, apart from the AI features, online source checks and the first download of Quran audio.\n\nI put a lot of the work into trust. Each Quran dua is compared with the bundled Quran text, each cited hadith is checked against an online dataset, and every dua shows a Verified or Unverified badge. The AI chat can suggest duas, but its suggestions go through the same checks and nothing is saved until you review it."
      },
      {
        "id": "b3",
        "type": "heading",
        "text": "How it’s built"
      },
      {
        "id": "b4",
        "type": "list",
        "title": "",
        "items": [
          "The Flutter app uses Riverpod and sqflite, and the logic in lib/domain has no Flutter imports, so it can be unit tested on its own.",
          "Alarms run on a custom Kotlin engine with a ring service, scheduler and boot receiver, connected to Dart through a MethodChannel and an EventChannel.",
          "Verification strips Arabic vowel marks, compares the text with the bundled Tanzil verses, and accepts partial-verse matches above a minimum length.",
          "The chat and translation client supports both Gemini and Anthropic, and the public build ships with no key, so users paste their own.",
          "There are about 180 test cases, and a FakeNativeBridge stands in for the Android side."
        ]
      }
    ]
  }
];
