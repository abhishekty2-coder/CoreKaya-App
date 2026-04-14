import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { badgesTable } from "@workspace/db/schema";
import { count } from "drizzle-orm";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const SEED_BADGES = [
  { slug: "first-rep", name: "First Rep", description: "Completed your very first workout", iconEmoji: "🔥", xpReward: 50, unlockConditionType: "first_workout", unlockConditionValue: 1 },
  { slug: "three-day-flame", name: "Three Day Flame", description: "Maintained a 3-day streak", iconEmoji: "⚡", xpReward: 75, unlockConditionType: "streak", unlockConditionValue: 3 },
  { slug: "week-warrior", name: "Week Warrior", description: "Completed a full 7-day streak", iconEmoji: "🏆", xpReward: 150, unlockConditionType: "streak", unlockConditionValue: 7 },
  { slug: "reformer-initiate", name: "Reformer Initiate", description: "Completed 3 Reformer Lab workouts", iconEmoji: "🛠️", xpReward: 100, unlockConditionType: "category_count", unlockConditionValue: 3 },
  { slug: "mat-master", name: "Mat Master", description: "Completed 10 Mat Lab workouts", iconEmoji: "🧘", xpReward: 200, unlockConditionType: "category_count", unlockConditionValue: 10 },
  { slug: "century", name: "Century", description: "Completed 100 total workouts", iconEmoji: "💎", xpReward: 500, unlockConditionType: "workouts_completed", unlockConditionValue: 100 },
  { slug: "consistent-ten", name: "Consistent Ten", description: "Completed 10 total workouts", iconEmoji: "⭐", xpReward: 100, unlockConditionType: "workouts_completed", unlockConditionValue: 10 },
];

async function seedBadges() {
  try {
    const [{ count: existing }] = await db.select({ count: count() }).from(badgesTable);
    if (Number(existing) === 0) {
      await db.insert(badgesTable).values(SEED_BADGES);
      logger.info("Badges seeded");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed badges");
  }
}

seedBadges();

export default app;
