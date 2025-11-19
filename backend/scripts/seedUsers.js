import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import User from "../src/models/User.js";
import Stage from "../src/models/Stage.js";

dotenv.config();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@trustdrive.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@1234";

const STAGE_MANAGER_EMAIL =
  process.env.SEED_STAGE_EMAIL || "manager@trustdrive.local";
const STAGE_MANAGER_PASSWORD =
  process.env.SEED_STAGE_PASSWORD || "Stage@1234";

const STAGE_NAME = process.env.SEED_STAGE_NAME || "CBD Terminus";
const STAGE_LOCATION = process.env.SEED_STAGE_LOCATION || "Nairobi CBD";

async function upsertAdmin() {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    console.log("Admin already exists:", ADMIN_EMAIL);
    return admin;
  }
  admin = await User.create({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "ADMIN",
    fullName: "TrustDrive Administrator",
    phone: "+254700000001",
  });
  console.log("Created admin:", ADMIN_EMAIL, "password:", ADMIN_PASSWORD);
  return admin;
}

async function upsertStage() {
  let stage = await Stage.findOne({ name: STAGE_NAME });
  if (!stage) {
    stage = await Stage.create({
      name: STAGE_NAME,
      location: STAGE_LOCATION,
    });
    console.log("Created stage:", STAGE_NAME);
  } else {
    console.log("Stage already exists:", STAGE_NAME);
  }
  return stage;
}

async function upsertStageManager(stage) {
  let manager = await User.findOne({ email: STAGE_MANAGER_EMAIL });
  if (manager) {
    console.log("Stage manager already exists:", STAGE_MANAGER_EMAIL);
  } else {
    manager = await User.create({
      email: STAGE_MANAGER_EMAIL,
      password: STAGE_MANAGER_PASSWORD,
      role: "STAGE_MANAGER",
      fullName: "CBD Stage Manager",
      phone: "+254700000002",
      stage: stage._id,
    });
    console.log(
      "Created stage manager:",
      STAGE_MANAGER_EMAIL,
      "password:",
      STAGE_MANAGER_PASSWORD
    );
  }
  stage.manager = manager._id;
  await stage.save();
  console.log("Linked manager to stage:", stage.name);
}

async function main() {
  try {
    await connectDb();
    const admin = await upsertAdmin();
    const stage = await upsertStage();
    await upsertStageManager(stage);
    console.log("Seeding complete.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

main();


