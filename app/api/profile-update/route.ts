import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import User from "../../../models/user";


interface RequestBody {
  dob?: string;
  country?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipPostalCode?: string;
  phone?: string;
  profilePicture?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Extract user from custom header
    const userData = req.headers.get("user");
    let user: { id?: string } | null = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch {
        return NextResponse.json(
          { message: "Unauthorized: Invalid user header" },
          { status: 401 }
        );
      }
    }


    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }
    const userId = user.id;

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const {
      dob,
      country,
      streetAddress,
      city,
      state,
      zipPostalCode,
      phone,
      profilePicture,
    } = body;


    await connectMongoDB();

    const fieldsToUpdate: Partial<RequestBody> = {};
    if (dob?.trim()) fieldsToUpdate.dob = dob.trim();
    if (country?.trim()) fieldsToUpdate.country = country.trim();
    if (streetAddress?.trim()) fieldsToUpdate.streetAddress = streetAddress.trim();
    if (city?.trim()) fieldsToUpdate.city = city.trim();
    if (state?.trim()) fieldsToUpdate.state = state.trim();
    if (zipPostalCode?.trim()) fieldsToUpdate.zipPostalCode = zipPostalCode.trim();
    if (profilePicture?.trim()) fieldsToUpdate.profilePicture = profilePicture.trim();

    if (phone?.trim()) {
      const normalizedPhone = phone.replace(/[\s-]/g, "").trim();
      if (!/^(?:\+977)?9\d{9}$/.test(normalizedPhone)) {
        return NextResponse.json(
          {
            message:
              "Phone number must be a valid Nepal number (9XXXXXXXXX or +9779XXXXXXXXX).",
          },
          { status: 400 }
        );
      }
      fieldsToUpdate.phone = normalizedPhone;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No valid fields were provided to update" },
        { status: 400 }
      );
    }


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

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "ValidationError"
    ) {
      const validationError = error as {
        errors?: Record<string, { message?: string }>;
      };
      const message = Object.values(validationError.errors || {})
        .map((entry) => entry?.message)
        .filter(Boolean)
        .join(", ");
      return NextResponse.json(
        { message: message || "Invalid profile data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}