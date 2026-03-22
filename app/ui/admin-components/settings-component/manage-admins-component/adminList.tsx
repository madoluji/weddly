"use client";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { Button } from "@/app/ui/button";
import Card from "@/app/ui/card";
import { TrashIcon } from "@heroicons/react/24/outline";
import React, { useState, useCallback, useEffect } from "react";

interface Admin {
  _id: string;
  name: string;
  userName: string;
  role: string;
}

const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchAdmins = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("searchQuery", searchQuery);
      if (roleFilter) queryParams.append("roleFilter", roleFilter);

      const res = await fetchWithAuth(
        `/api/admin/fetch-admin?${queryParams.toString()}`
      );
      if (!res.ok) {
        throw new Error("Error fetching admins");
      }
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins", error);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handlePromoteToSuperAdmin = async (adminId: string) => {
    try {
      await fetchWithAuth(`/api/admin/super-admin/promote-admin`, {
        method: "PATCH",
        body: JSON.stringify({ adminId }),
      });
      fetchAdmins();
    } catch (error) {
      console.error("Error promoting admin", error);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await fetchWithAuth(
        `/api/admin/super-admin/delete-admin?adminId=${adminId}`,
        {
          method: "DELETE",
        }
      );
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  return (
    <Card>
      <>
        <h3 className="text-xl font-semibold mb-3">Admin List</h3>
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={handleSearchChange}
            className="border rounded-md p-2"
          />
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="border rounded-md p-2"
          >
            <option value="">All Roles</option>
            <option value="us">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <Button onClick={fetchAdmins}>Refresh</Button>
        </div>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 w-1/12 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {admins.length > 0 ? (
              <>
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm rounded-lg font-semibold ${
                          admin.role === "superadmin"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-400 text-black"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex  justify-end text-gray-500 ">
                      {admin.role !== "superadmin" && (
                        <Button
                          onClick={() => handlePromoteToSuperAdmin(admin._id)}
                          className="mr-8 right-0 "
                        >
                          Promote
                        </Button>
                      )}
                      <button onClick={() => handleDeleteAdmin(admin._id)}>
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No admins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    </Card>
  );
};

export default AdminList;
