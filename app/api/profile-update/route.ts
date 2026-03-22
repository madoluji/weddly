import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import User from "../../../models/user";


interface RequestBody {
  userId: string;
  dob: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipPostalCode: string;
  phone: string;
  profilePicture: string;
}

export async function POST(req: NextRequest) {
  try {
    // Extract user from custom header
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;


    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }
    const userId = user.id;

    const {
      dob,
      country,
      streetAddress,
      city,
      state,
      zipPostalCode,
      phone,
      profilePicture,
    }: RequestBody = await req.json();


    await connectMongoDB();

    const fieldsToUpdate: Partial<RequestBody> = {};
    if (dob) fieldsToUpdate.dob = dob;
    if (country) fieldsToUpdate.country = country;
    if (streetAddress) fieldsToUpdate.streetAddress = streetAddress;
    if (city) fieldsToUpdate.city = city;
    if (state) fieldsToUpdate.state = state;
    if (zipPostalCode) fieldsToUpdate.zipPostalCode = zipPostalCode;
    if (phone) fieldsToUpdate.phone = phone;
    if (profilePicture) fieldsToUpdate.profilePicture = profilePicture;


    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: fieldsToUpdate,
        $unset: { isFirstLogin: "" },
      },

      { new: true, runValidators: true, strict: false }
    );


    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Attributes added successfully",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}