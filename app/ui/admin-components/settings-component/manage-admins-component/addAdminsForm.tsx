"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { Button } from "@/app/ui/button";
import Card from "@/app/ui/card";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const AddAdminsForm = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("useradmin");
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await fetchWithAuth(
          "/api/admin/fetch-admin?currentUser=true"
        );
        const data = await res.json();
        if (data.role !== "superadmin") {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        router.push("/admin");
      }
    };

    checkUserRole();
  }, [router]);

  const handleAddAdmin = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/super-admin/add-admin", {
        method: "POST",
        body: JSON.stringify({ name, lastName, userName, role, email }),
      });
      if (res.ok) {
        alert("Admin added successfully");
      } else alert("Error adding admin");
    } catch (error) {
      console.error("Error adding admin", error);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>

      {/* Add Admin Form */}
      <Card className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Add Admin</h3>
        <div className="grid grid-cols-3 gap-4">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2 "
          />
          <input
            placeholder="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border rounded p-2 "
          />
          <input
            placeholder="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="border rounded p-2"
          />
          <input
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2"
          />
          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="useradmin">User Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
        <Button className="mt-4" onClick={handleAddAdmin}>
          Add Admin
        </Button>
      </Card>
    </>
  );
};

export default AddAdminsForm;
