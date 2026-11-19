
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";

import User from "../models/user.model.ts";

const seedAdmin = async (): Promise<void> => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME?.trim() || "Admin";
    const mongoUri = process.env.MONGODB_URI;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
    }

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        throw new Error(
          "This email already belongs to a non-admin account"
        );
      }

      existingAdmin.password = hashedPassword;
      existingAdmin.name = name;

      await existingAdmin.save();

      console.log("Existing admin password updated successfully");
    } else {
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin created successfully");

      console.log({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    }

    console.log("Admin email:", email);
    console.log("Admin password:", password);
  } catch (error) {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

void seedAdmin();

