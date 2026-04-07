import { db } from "@workspace/db";
import { workoutsTable, productsTable, schedulesTable } from "@workspace/db/schema";

async function seed() {
  console.log("Seeding database...");

  await db.delete(workoutsTable);
  await db.delete(productsTable);
  await db.delete(schedulesTable);

  const workouts = await db.insert(workoutsTable).values([
    {
      title: "Foundations Flow",
      instructor: "Gabrielle M.",
      durationMin: 30,
      category: "Mat Lab",
      difficulty: "Beginner",
      equipment: ["Mat"],
      thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format",
      description: "Build a strong Pilates foundation with fundamental movements designed to align and activate your deep core muscles.",
      tags: ["core", "alignment", "breathwork"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Reformer Intensive",
      instructor: "Marco T.",
      durationMin: 45,
      category: "Reformer Lab",
      difficulty: "Intermediate",
      equipment: ["Reformer", "Box"],
      thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format",
      description: "Elevate your reformer practice with a full-body sequence targeting length, strength, and control through the CoreKaya system.",
      tags: ["reformer", "full-body", "strength"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Spine Restore",
      instructor: "Gabrielle M.",
      durationMin: 25,
      category: "Mat Lab",
      difficulty: "Beginner",
      equipment: ["Mat", "Foam Roller"],
      thumbnailUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format",
      description: "A therapeutic session focused on spinal mobility, posture correction, and releasing tension held in the back body.",
      tags: ["spine", "posture", "restoration"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Power Tower Circuit",
      instructor: "Sasha K.",
      durationMin: 50,
      category: "Tower Lab",
      difficulty: "Advanced",
      equipment: ["Cadillac", "Tower"],
      thumbnailUrl: "https://images.unsplash.com/photo-1616279967983-ec413476e824?w=800&auto=format",
      description: "A challenging tower circuit that builds serious strength and flexibility using springs and bars for full range development.",
      tags: ["tower", "strength", "advanced"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Morning Activation",
      instructor: "Marco T.",
      durationMin: 20,
      category: "Mat Lab",
      difficulty: "Beginner",
      equipment: ["Mat"],
      thumbnailUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&auto=format",
      description: "Start your day with intention. This gentle wake-up flow activates key muscles and improves circulation before your day begins.",
      tags: ["morning", "energy", "activation"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Chair Lab Focus",
      instructor: "Sasha K.",
      durationMin: 35,
      category: "Chair Lab",
      difficulty: "Intermediate",
      equipment: ["Wunda Chair"],
      thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format",
      description: "The Wunda Chair brings challenge and precision — this sequence develops single-leg stability, shoulder strength, and total body control.",
      tags: ["chair", "stability", "precision"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Deep Stretch & Release",
      instructor: "Gabrielle M.",
      durationMin: 40,
      category: "Mat Lab",
      difficulty: "Beginner",
      equipment: ["Mat", "Resistance Band"],
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format",
      description: "A restorative session combining Pilates principles with deep stretching to improve flexibility and recovery.",
      tags: ["stretch", "recovery", "flexibility"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Reformer Cardio Fusion",
      instructor: "Marco T.",
      durationMin: 45,
      category: "Reformer Lab",
      difficulty: "Advanced",
      equipment: ["Reformer", "Jump Board"],
      thumbnailUrl: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&auto=format",
      description: "High-energy reformer session incorporating the jump board for cardiovascular conditioning alongside classic Pilates principles.",
      tags: ["cardio", "reformer", "high-intensity"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Hip & Glute Sculpt",
      instructor: "Sasha K.",
      durationMin: 30,
      category: "Mat Lab",
      difficulty: "Intermediate",
      equipment: ["Mat", "Loop Band"],
      thumbnailUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&auto=format",
      description: "Target the posterior chain with precise mat work designed to sculpt the hips and glutes while supporting lower back health.",
      tags: ["glutes", "hips", "sculpt"],
      videoUrl: null,
      isPublished: true,
    },
  ]).returning();

  console.log(`Inserted ${workouts.length} workouts`);

  const products = await db.insert(productsTable).values([
    {
      name: "CoreKaya Classic Reformer",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$2,400",
      description: "Our signature reformer — engineered for home and studio use with 5 spring settings, padded carriage, and studio-grade rails.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "ProForm Cadillac Tower",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$3,800",
      description: "Full Cadillac system with adjustable towers, trapeze bar, leg springs, and arm springs for comprehensive Pilates training.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "Wunda Chair Elite",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$1,200",
      description: "Compact and powerful, the Wunda Chair is designed for focused strength training, balance work, and rehabilitation.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Spine Corrector Barrel",
      category: "Small Props",
      imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$380",
      description: "The perfect arc for back extension, opening the chest, and correcting spinal alignment. Works beautifully with any reformer program.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "CoreKaya Jump Board",
      category: "Accessories",
      imageUrl: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$295",
      description: "Compatible with all CoreKaya reformers. Adds low-impact cardio to your reformer practice for a dynamic full-body session.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Precision Mat Pro",
      category: "Small Props",
      imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$120",
      description: "8mm premium non-slip mat with alignment markers. Extra-wide design supports all Pilates mat exercises comfortably.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Pilates Ring Set",
      category: "Accessories",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$65",
      description: "Set of 2 magic circles in light and medium resistance. Ideal for inner thigh work, arm toning, and adding challenge to mat work.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Studio Starter Bundle",
      category: "Bundles",
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$485",
      description: "Everything for your home mat studio: Precision Mat Pro, Pilates Ring Set, Loop Band Set (3 resistances), and a foam roller.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "Reformer Accessory Kit",
      category: "Bundles",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$350",
      description: "Everything your CoreKaya Reformer needs: long box, short box, jump board, foot strap set, and padded shoulder rests.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "CoreKaya Loop Band Set",
      category: "Accessories",
      imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&auto=format",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "$45",
      description: "Set of 3 fabric loop bands (light, medium, heavy). Non-slip design for seated, standing, and floor-based Pilates exercises.",
      isFeatured: false,
      isPublished: true,
    },
  ]).returning();

  console.log(`Inserted ${products.length} products`);

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  const startDate = monday.toISOString().split("T")[0];

  const [schedule] = await db.insert(schedulesTable).values({
    startDate,
    mon: workouts[0].id,
    tue: workouts[1].id,
    wed: workouts[4].id,
    thu: workouts[2].id,
    fri: workouts[5].id,
    sat: workouts[7].id,
    sun: null,
  }).returning();

  console.log(`Inserted schedule starting ${startDate}`);
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
