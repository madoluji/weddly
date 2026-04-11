"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  EyeIcon,
  KeyIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { upload } from "@/app/lib/firebase";
import SafeImage from "@/app/ui/shared/SafeImage";

type SettingsMode = "freelancer" | "client";

type UserForm = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  zipPostalCode: string;
  dob: string;
  profilePicture: string;
  profileVisible: boolean;
};

type FreelancerForm = {
  bio: string;
  location: string;
  rate: string;
  skillsInput: string;
  languagesInput: string;
};

type ClientForm = {
  isWeddingPlanner: boolean;
  weddingStyle: string;
  targetWeddingDate: string;
  location: string;
  averageBudget: string;
};

const EMPTY_USER_FORM: UserForm = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  streetAddress: "",
  zipPostalCode: "",
  dob: "",
  profilePicture: "",
  profileVisible: true,
};

const EMPTY_FREELANCER_FORM: FreelancerForm = {
  bio: "",
  location: "",
  rate: "",
  skillsInput: "",
  languagesInput: "",
};

const EMPTY_CLIENT_FORM: ClientForm = {
  isWeddingPlanner: false,
  weddingStyle: "Modern",
  targetWeddingDate: "",
  location: "",
  averageBudget: "",
};

const weddingStyles = [
  "Traditional",
  "Modern",
  "Rustic",
  "Minimalist",
  "Bohemian",
  "Glamorous",
  "Vintage",
  "Destination",
];

export default function SettingsPage({ mode = "freelancer" }: { mode?: SettingsMode }) {
  const { session, status, update } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  const [userForm, setUserForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [freelancerForm, setFreelancerForm] = useState<FreelancerForm>(EMPTY_FREELANCER_FORM);
  const [clientForm, setClientForm] = useState<ClientForm>(EMPTY_CLIENT_FORM);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteForm, setDeleteForm] = useState({
    currentPassword: "",
    confirmationText: "",
  });

  const profileHref = mode === "client" ? "/client/profile" : "/user/profile";

  const roleSummary = useMemo(() => {
    if (mode === "client") {
      return {
        title: "Client Preferences",
        subtitle: "Wedding goals, style, location, and planning budget",
      };
    }

    return {
      title: "Freelancer Professional Details",
      subtitle: "Portfolio-facing bio, skills, languages, and rate",
    };
  }, [mode]);

  useEffect(() => {
    const loadData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const userRes = await fetchWithAuth(
          "/api/user?fields=name,lastName,email,phone,country,state,city,streetAddress,zipPostalCode,dob,profilePicture,profileVisible"
        );

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserForm({
            name: userData.name || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            country: userData.country || "",
            state: userData.state || "",
            city: userData.city || "",
            streetAddress: userData.streetAddress || "",
            zipPostalCode: userData.zipPostalCode || "",
            dob: userData.dob || "",
            profilePicture: userData.profilePicture || "",
            profileVisible:
              typeof userData.profileVisible === "boolean"
                ? userData.profileVisible
                : true,
          });
        }

        if (mode === "freelancer") {
          const freelancerRes = await fetchWithAuth(
            `/api/freelancerInfo?userId=${encodeURIComponent(session.user.id)}`
          );

          if (freelancerRes.ok) {
            const data = await freelancerRes.json();
            const freelancer = data?.freelancer;
            setFreelancerForm({
              bio: freelancer?.bio || "",
              location: freelancer?.location || "",
              rate: freelancer?.rate ? String(freelancer.rate) : "",
              skillsInput: Array.isArray(freelancer?.skills)
                ? freelancer.skills.join(", ")
                : "",
              languagesInput: Array.isArray(freelancer?.languages)
                ? freelancer.languages.join(", ")
                : "",
            });
          }
        }

        if (mode === "client") {
          const clientRes = await fetchWithAuth(
            `/api/clientInfo?userId=${encodeURIComponent(session.user.id)}`
          );

          if (clientRes.ok) {
            const data = await clientRes.json();
            const client = data?.client;
            setClientForm({
              isWeddingPlanner: Boolean(client?.isWeddingPlanner),
              weddingStyle: client?.weddingStyle || "Modern",
              targetWeddingDate: client?.targetWeddingDate || "",
              location: client?.location || "",
              averageBudget:
                client?.averageBudget !== undefined
                  ? String(client.averageBudget)
                  : "",
            });
          }
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load settings data." });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mode, session?.user?.id]);

  const onUserFieldChange = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setUserForm((prev) => ({ ...prev, [key]: value }));
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingProfilePic(true);

    try {
      const imageUrl = await upload(file);
      setUserForm((prev) => ({ ...prev, profilePicture: imageUrl }));
      setMessage({ type: "success", text: "Profile picture uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "Failed to upload profile picture" });
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    setMessage(null);

    try {
      const response = await fetchWithAuth("/api/user", {
        method: "PATCH",
        body: JSON.stringify(userForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update account details.");
      }

      await update({
        name: userForm.name,
        email: userForm.email,
        lastName: userForm.lastName,
        profilePicture: userForm.profilePicture,
      });

      setMessage({ type: "success", text: "Account details updated successfully." });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to update account details.";
      setMessage({ type: "error", text });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveRoleSettings = async () => {
    setSavingRole(true);
    setMessage(null);

    try {
      if (mode === "freelancer") {
        const payload = {
          location: freelancerForm.location,
          skills: parseList(freelancerForm.skillsInput),
          bio: freelancerForm.bio,
          languages: parseList(freelancerForm.languagesInput),
          rate: freelancerForm.rate,
          workExperience: [],
          projectPortfolio: [],
          education: [],
        };

        const res = await fetchWithAuth("/api/freelancerInfo", {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Failed to save freelancer settings.");
        }
      } else {
        const payload = {
          fullName: `${userForm.name} ${userForm.lastName}`.trim(),
          isWeddingPlanner: clientForm.isWeddingPlanner,
          weddingStyle: clientForm.weddingStyle,
          targetWeddingDate: clientForm.targetWeddingDate,
          location: clientForm.location,
          averageBudget: Number(clientForm.averageBudget || 0),
        };

        const res = await fetchWithAuth("/api/clientInfo", {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Failed to save client settings.");
        }
      }

      setMessage({ type: "success", text: `${roleSummary.title} saved successfully.` });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to save role settings.";
      setMessage({ type: "error", text });
    } finally {
      setSavingRole(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const res = await fetchWithAuth("/api/user/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password.");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully." });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to change password.";
      setMessage({ type: "error", text });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setMessage(null);

    try {
      const res = await fetchWithAuth("/api/user/delete-account", {
        method: "DELETE",
        body: JSON.stringify(deleteForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete account.");
      }

      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to delete account.";
      setMessage({ type: "error", text });
    } finally {
      setDeletingAccount(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-6 text-sm text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 bg-white text-slate-900">
      <section className="rounded-[1.5rem] bg-gradient-to-br from-slate-50 via-white to-primary-50/40 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Curated Heirloom Settings
            </p>
            <h1 className="font-headline mt-3 text-3xl font-medium leading-tight text-slate-900">
              {mode === "client" ? "Client Settings" : "Freelancer Settings"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Update your account and profile details with real persistence. No dummy controls,
              every section on this page is connected to your backend.
            </p>
          </div>

          <Link
            href={profileHref}
            className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            <EyeIcon className="mr-2 h-4 w-4" />
            Preview Profile
          </Link>
        </div>
      </section>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-primary-50 text-primary-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-[1.25rem] bg-slate-50 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5 text-primary-700" />
              <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">First name</span>
                <input
                  value={userForm.name}
                  onChange={(e) => onUserFieldChange("name", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Last name</span>
                <input
                  value={userForm.lastName}
                  onChange={(e) => onUserFieldChange("lastName", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-500">Email</span>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => onUserFieldChange("email", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Phone</span>
                <input
                  value={userForm.phone}
                  onChange={(e) => onUserFieldChange("phone", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Date of birth</span>
                <input
                  type="date"
                  value={userForm.dob}
                  onChange={(e) => onUserFieldChange("dob", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Country</span>
                <input
                  value={userForm.country}
                  onChange={(e) => onUserFieldChange("country", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">State</span>
                <input
                  value={userForm.state}
                  onChange={(e) => onUserFieldChange("state", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">City</span>
                <input
                  value={userForm.city}
                  onChange={(e) => onUserFieldChange("city", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Postal code</span>
                <input
                  value={userForm.zipPostalCode}
                  onChange={(e) => onUserFieldChange("zipPostalCode", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-500">Street address</span>
                <input
                  value={userForm.streetAddress}
                  onChange={(e) => onUserFieldChange("streetAddress", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                />
              </label>

              <label className="text-sm sm:col-span-2">
                <span className="mb-3 block text-slate-500">Profile Picture</span>
                <div className="flex items-end gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
                    <SafeImage
                      src={userForm.profilePicture || "/images/image.png"}
                      alt="Profile picture preview"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100">
                    <PlusIcon className="h-4 w-4" />
                    {uploadingProfilePic ? "Uploading..." : "Change Picture"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploadingProfilePic}
                      className="hidden"
                    />
                  </label>
                </div>
              </label>
            </div>

            <button
              onClick={handleSaveAccount}
              disabled={savingAccount}
              className="mt-5 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60"
            >
              {savingAccount ? "Saving..." : "Save Account Details"}
            </button>
          </div>

          <div className="rounded-[1.25rem] bg-slate-50 p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{roleSummary.title}</h2>
              <p className="text-sm text-slate-500">{roleSummary.subtitle}</p>
            </div>

            {mode === "freelancer" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  <span className="mb-1 block text-slate-500">Professional bio</span>
                  <textarea
                    value={freelancerForm.bio}
                    onChange={(e) =>
                      setFreelancerForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={5}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-slate-500">Primary location</span>
                  <input
                    value={freelancerForm.location}
                    onChange={(e) =>
                      setFreelancerForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-slate-500">Rate (Rs)</span>
                  <input
                    value={freelancerForm.rate}
                    onChange={(e) =>
                      setFreelancerForm((prev) => ({ ...prev, rate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="text-sm sm:col-span-2">
                  <span className="mb-1 block text-slate-500">Skills (comma separated)</span>
                  <input
                    value={freelancerForm.skillsInput}
                    onChange={(e) =>
                      setFreelancerForm((prev) => ({ ...prev, skillsInput: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="text-sm sm:col-span-2">
                  <span className="mb-1 block text-slate-500">Languages (comma separated)</span>
                  <input
                    value={freelancerForm.languagesInput}
                    onChange={(e) =>
                      setFreelancerForm((prev) => ({ ...prev, languagesInput: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  <span className="mb-1 block text-slate-500">Wedding style</span>
                  <select
                    value={clientForm.weddingStyle}
                    onChange={(e) =>
                      setClientForm((prev) => ({ ...prev, weddingStyle: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  >
                    {weddingStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-slate-500">Target wedding date</span>
                  <input
                    type="date"
                    value={clientForm.targetWeddingDate}
                    onChange={(e) =>
                      setClientForm((prev) => ({ ...prev, targetWeddingDate: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="text-sm">
                  <span className="mb-1 block text-slate-500">Average budget (Rs)</span>
                  <input
                    value={clientForm.averageBudget}
                    onChange={(e) =>
                      setClientForm((prev) => ({ ...prev, averageBudget: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="text-sm sm:col-span-2">
                  <span className="mb-1 block text-slate-500">Location</span>
                  <input
                    value={clientForm.location}
                    onChange={(e) =>
                      setClientForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-300"
                  />
                </label>

                <label className="inline-flex items-center gap-3 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={clientForm.isWeddingPlanner}
                    onChange={(e) =>
                      setClientForm((prev) => ({
                        ...prev,
                        isWeddingPlanner: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-200"
                  />
                  <span className="text-slate-700">I am planning weddings professionally</span>
                </label>
              </div>
            )}

            <button
              onClick={handleSaveRoleSettings}
              disabled={savingRole}
              className="mt-5 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60"
            >
              {savingRole ? "Saving..." : "Save Role Settings"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.25rem] bg-slate-50 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-primary-700" />
              <h3 className="text-base font-semibold text-slate-900">Profile Visibility</h3>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              Control if your profile appears in search and recommendation lists.
            </p>

            <label className="inline-flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={userForm.profileVisible}
                onChange={(e) => onUserFieldChange("profileVisible", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-200"
              />
              <span>{userForm.profileVisible ? "Visible to others" : "Hidden from others"}</span>
            </label>
          </div>

          <div className="rounded-[1.25rem] bg-slate-50 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-primary-700" />
              <h3 className="text-base font-semibold text-slate-900">Security</h3>
            </div>
            <p className="mb-3 text-sm text-slate-600">Update your password securely.</p>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-300"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-300"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-300"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="mt-4 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-60"
            >
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </div>

          <div className="rounded-[1.25rem] bg-slate-100 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-slate-700" />
              <h3 className="text-base font-semibold text-slate-900">Danger Zone</h3>
            </div>
            <p className="mb-3 text-sm text-slate-600">
              Deleting your account is permanent. Type DELETE to confirm.
            </p>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={deleteForm.currentPassword}
                onChange={(e) =>
                  setDeleteForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <input
                type="text"
                placeholder='Type "DELETE"'
                value={deleteForm.confirmationText}
                onChange={(e) =>
                  setDeleteForm((prev) => ({ ...prev, confirmationText: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="mt-4 inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-60"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
