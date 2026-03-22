import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "../../../models/user";
import mongoose from "mongoose";


const settingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
});


const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export async function GET() {
  await connectMongoDB();

  try {
    const settings = await Settings.findOne() || new Settings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await connectMongoDB();

  try {
    const { maintenanceMode } = await req.json();

    if (maintenanceMode !== undefined) {
      await Settings.updateOne({}, { maintenanceMode }, { upsert: true });
    }


    return NextResponse.json({ message: "Settings updated successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
