import { db } from "@workspace/db";
import { workoutsTable, productsTable, schedulesTable } from "@workspace/db/schema";

async function seed() {
  console.log("Seeding database with original CoreKaya data...");

  await db.delete(schedulesTable);
  await db.delete(workoutsTable);
  await db.delete(productsTable);

  const workouts = await db.insert(workoutsTable).values([
    {
      title: "Morning Flow & Glow",
      instructor: "Elara Vance",
      durationMin: 25,
      category: "Mat Lab",
      difficulty: "Beginner",
      equipment: ["Yoga Mat"],
      thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
      description: "A gentle awakening flow to open the hips and spine.",
      tags: ["Morning", "Flexibility"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Power Reformer Sculpt",
      instructor: "Davina S.",
      durationMin: 45,
      category: "Reformer Lab",
      difficulty: "Advanced",
      equipment: ["Reformer", "Box"],
      thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
      description: "High intensity sculpting session targeting deep core muscles.",
      tags: ["Strength", "Cardio"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Magic Circle Madness",
      instructor: "Leo K.",
      durationMin: 30,
      category: "Mat Lab",
      difficulty: "Intermediate",
      equipment: ["Magic Circle"],
      thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800",
      description: "Burn out your inner thighs and arms with the circle.",
      tags: ["Toning", "Prop-based"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Spine Corrector Arc",
      instructor: "Elara Vance",
      durationMin: 20,
      category: "Spine Corrector",
      difficulty: "Intermediate",
      equipment: ["Spine Corrector"],
      thumbnailUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=800",
      description: "Extension and rotation for a healthy spine.",
      tags: ["Mobility"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Jumpboard Cardio",
      instructor: "Davina S.",
      durationMin: 35,
      category: "Reformer Lab",
      difficulty: "Advanced",
      equipment: ["Reformer", "Jumpboard"],
      thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
      description: "Get your heart rate up with this low-impact cardio session.",
      tags: ["Cardio", "Plyometrics"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Wunda Chair Balance",
      instructor: "Leo K.",
      durationMin: 40,
      category: "Wunda Chair",
      difficulty: "Advanced",
      equipment: ["Wunda Chair"],
      thumbnailUrl: "https://images.unsplash.com/photo-1517963879466-dbbcd8ebb482?auto=format&fit=crop&q=80&w=800",
      description: "Challenging balance and stability on the chair.",
      tags: ["Stability", "Legs"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Cadillac Trapeze Flow",
      instructor: "Davina S.",
      durationMin: 55,
      category: "Cadillac Lab",
      difficulty: "Advanced",
      equipment: ["Cadillac"],
      thumbnailUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=800",
      description: "Full body suspension and articulation using the Trapeze Table.",
      tags: ["Suspension", "Advanced"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Ladder Barrel Extension",
      instructor: "Elara Vance",
      durationMin: 30,
      category: "Ladder Barrel",
      difficulty: "Intermediate",
      equipment: ["Ladder Barrel"],
      thumbnailUrl: "https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&q=80&w=800",
      description: "Deep stretching and back extension work.",
      tags: ["Flexibility", "Spine"],
      videoUrl: null,
      isPublished: true,
    },
    {
      title: "Tower Power",
      instructor: "Leo K.",
      durationMin: 45,
      category: "Reformer Trapeze",
      difficulty: "Intermediate",
      equipment: ["Reformer Tower"],
      thumbnailUrl: "https://images.unsplash.com/photo-1593810450967-a9a2a7e84452?auto=format&fit=crop&q=80&w=800",
      description: "Using the tower springs for resistance and assistance.",
      tags: ["Springs", "Full Body"],
      videoUrl: null,
      isPublished: true,
    },
  ]).returning();

  console.log(`Inserted ${workouts.length} workouts`);

  const products = await db.insert(productsTable).values([
    {
      name: "C-FLEX Foldable Reformer",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1616259063717-38448ebf5624?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 1,30,000",
      description: "Studio performance. Zero compromise on space. Vertical fold, ultra-smooth carriage, adjustable spring resistance.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "CUX Reformer in Maple Wood",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 1,40,000",
      description: "Classic craftsmanship for studios that mean business. Premium maple wood frame, studio-grade aluminium rails.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "BHX Reformer in Metal",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1593810450967-a9a2a7e84452?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 1,40,000",
      description: "Professional grade. Studio ready. Priced to scale. Robust powder-coated metal frame.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "CX3-Pro Reformer with Movable Foot Bar",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1517963879466-dbbcd8ebb482?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 2,50,000",
      description: "The pro's reformer. Built for every body, every session. Movable foot bar, commercial-grade powder-coated metal frame.",
      isFeatured: true,
      isPublished: true,
    },
    {
      name: "CUX Reformer with Tower in Maple Wood",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1598454443453-6119859f5156?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 1,80,000",
      description: "All-in-one maple reformer and tower — double the training. Integrated half Cadillac tower system.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "BHX Reformer with Tower in Metal",
      category: "Large Equipment",
      imageUrl: "https://images.unsplash.com/photo-1586211124239-25d2595f923d?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 1,80,000",
      description: "Robust metal reformer upgraded with functional tower. Integrated half Cadillac tower.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Professional Pilates Mat",
      category: "Small Props",
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 3,500",
      description: "Extra-thick non-slip mat for home practice. Premium quality with alignment guides.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Magic Circle (Pilates Ring)",
      category: "Small Props",
      imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 2,200",
      description: "The classic Pilates prop for inner thigh, arm, and core toning. Studio-grade metal with padded handles.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Resistance Band Set (3 levels)",
      category: "Accessories",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 1,800",
      description: "Set of light, medium, and heavy fabric loop bands for at-home and reformer-based exercises.",
      isFeatured: false,
      isPublished: true,
    },
    {
      name: "Home Studio Starter Bundle",
      category: "Bundles",
      imageUrl: "https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&q=80&w=600",
      affiliateUrl: "https://corekaya.com/",
      priceDisplay: "Rs. 9,500",
      description: "Everything to start your home Pilates journey: premium mat, magic circle, 3-piece resistance band set, and foam roller.",
      isFeatured: true,
      isPublished: true,
    },
  ]).returning();

  console.log(`Inserted ${products.length} products`);

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  const startDate = monday.toISOString().split("T")[0];

  await db.insert(schedulesTable).values({
    startDate,
    mon: workouts[0].id,
    tue: workouts[1].id,
    wed: workouts[2].id,
    thu: workouts[4].id,
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
