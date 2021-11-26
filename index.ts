import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import axios from "axios";
import {getDistance} from "geolib";
import e from "express";

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

// initialize events.
/* axios
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
        image: event.cardImageMobile.startsWith("/")
          ? "https://www.visitsaudi.com" +
            event.cardImageMobile.replace(/\s/g, "%20")
          : event.cardImageMobile.replace(/\s/g, "%20"),
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
        })
        .catch((err) => {
          console.log(err);
        });
    });
  })
  .catch((err) => {
    console.log(err);
  }); */

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

app.post("/check-in", async (req, res) => {
  const { body } = req;
  const { event_id, user_id } = body;
  prisma.checkIn
    .create({ data: { user_fk: user_id, event_fk: event_id } })
    .then(() => {
      return res.status(200);
    })
    .catch((err) => {
      return res.status(500);
    });
});

app.post("/nearest-events", async (req, res) => {
  // do this naively; get all events and calculate absoulte value
  // of (user lang - event lang) + (user lat - event lat)
  const { body } = req;
  const { lat: userLat, long: userLong } = body;
  const userCoord = { latitude: userLat, longitude: userLong };
  const distanceArray: { event_id: string; distance: number; }[] = []; // {event_id: "", distance: 123}
  const allEvents = await prisma.event.findMany({
    select: {
      image: true,
      name: true,
      shortDesc: true,
      id: true,
      lat: true,
      long: true,
    },
  });
  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];
    const dist = getDistance(userCoord, {
      latitude: event.lat,
      longitude: event.long,
    });
    distanceArray.push({ event_id: event.id, distance: dist });
  }
  distanceArray.sort((a, b) => {
    if (a.distance > b.distance) {
      return 1;
    } else if (a.distance === b.distance) {
      return 0;
    }
    return -1;
  });
  distanceArray.splice(10)
  console.log(distanceArray.length)
  console.log(distanceArray[0].distance)
  const filteredEvents = allEvents.filter(x=>distanceArray.map(y=>y.event_id).includes(x.id))
  console.log(filteredEvents)
  res.status(200).send(filteredEvents);
});

app.post("/update-events", (req, res) => {});
