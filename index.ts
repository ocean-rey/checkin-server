import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import axios from "axios";

type event = {
  cardImageMobile: string;
  calendarEndDate: string;
  calendarStartDate: string;
  latitude: string;
  longitude: string;
  season: string;
  title: string;
  id: string;
  city: string;
  shortDescription: string;
};
const PORT = 8080;
const app = express();
const prisma = new PrismaClient();

prisma.event
  .findMany({
    select: {
      id: true,
      name: true,
      city: true,
      image: true,
      startDate: true,
      endDate: true,
    },
  })
  .then((res) => {
    console.log(res[0]);
  });

// initialize events.
axios
  .get("https://www.visitsaudi.com/bin/api/v1/events?locale=en&limit=100")
  .then((res) => {
    //console.log(res.data);
    const events: [event] = res.data.data;
    //console.log(events.length);
    events.forEach((event) => {
      const eventData = {
        shortDesc: event.shortDescription,
        name: event.title,
        city: event.city,
        image: event.cardImageMobile,
        lat: parseFloat(event.latitude),
        long: parseFloat(event.longitude),
        startDate: new Date(event.calendarStartDate),
        endDate: new Date(event.calendarEndDate),
        season: event.season,
      };
      console.log(eventData);
      prisma.event
        .create({
          data: eventData,
        })/* 
        .catch((err) => {
          console.log(err);
        }); */
    });
  })
  .catch((err) => {
    console.log(err);
  });

process.on("warning", (w) => {
  console.log(w);
  console.log(w.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled rejection at ", promise, `reason: ${reason}`);
});

process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  console.log(err);
  console.log(err.stack);
});

const corsOptions: cors.CorsOptions = {
  origin: "*", // allow all origins
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to Mobile Computing");
});

app.post("/register", (req, res) => {
  // called from auth server
  prisma.user
    .create({ data: { id: req.body._id, email: req.body.email } })
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.error("Error creating new user!");
      console.error(err);
      res.status(400).send(err);
    });
});

app.get("/nearest-events", async (req, res) => {
  // do this naively; get all events and calculate absoulte value
  // of (user lang - event lang) + (user lat - event lat)
  const { body } = req;
  const { lat: userLat, long: userLong } = body;
  const allEvents = await prisma.event.findMany({
    select: { image: true, name: true, shortDesc: true},
  });
  res.status(200).send(allEvents);
});

app.post("/update-events", (req, res) => {});
