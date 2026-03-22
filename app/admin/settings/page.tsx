"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  ServerIcon,
  KeyIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

const defaultSettings: AdminSettings = {
  maintenanceMode: false,
  darkMode: false,
  sessionTimeout: 30,
  loggingLevel: "info",
  emailNotifications: true,
  systemNotifications: true,
  alertEmails: "admin@example.com",
  twoFactorAuth: false,
  passwordExpiry: 90,
  maxLoginAttempts: 5,
  cacheEnabled: true,
  autoBackup: true,
  backupFrequency: 7,
  apiEnabled: true,
  apiKey: "************",
  apiRateLimit: 100,
}

interface AdminSettings {
  // System Settings
  maintenanceMode: boolean
  darkMode: boolean
  sessionTimeout: number // in minutes
  loggingLevel: "debug" | "info" | "warn" | "error"

  // Notification Settings
  emailNotifications: boolean
  systemNotifications: boolean
  alertEmails: string

  // Security Settings
  twoFactorAuth: boolean
  passwordExpiry: number // in days
  maxLoginAttempts: number

  // Performance Settings
  cacheEnabled: boolean
  autoBackup: boolean
  backupFrequency: number // in days

  // API Settings
  apiEnabled: boolean
  apiKey: string
  apiRateLimit: number // requests per minute
}

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings)

  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<AdminSettings | null>(null)

  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        // Uncomment when API is ready
        // const response = await fetchWithAuth("/api/adminSettings");
        // const data = await response.json();
        // setSettings(data);
        // setOriginalSettings(data);

        // For demo purposes, we'll just use the default settings
        setOriginalSettings({ ...defaultSettings })
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching settings:", error)
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  useEffect(() => {
    // Check for unsaved changes
    if (originalSettings) {
      const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
      setUnsavedChanges(hasChanges)
    }
  }, [settings, originalSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    })
  }

  const regenerateApiKey = () => {
    if (window.confirm("Are you sure you want to regenerate the API key? This will invalidate the current key.")) {
      const newApiKey = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
      setSettings({ ...settings, apiKey: newApiKey })
      setUnsavedChanges(true)
    }
  }

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values? This cannot be undone.")) {
      if (originalSettings) {
        setSettings(originalSettings)
        setUnsavedChanges(false)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setIsLoading(true)

      // Uncomment when API is ready
      // await fetchWithAuth("/api/adminSettings", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(settings),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setNotification({ type: "success", message: "Settings updated successfully!" })
      setOriginalSettings({ ...settings })
      setUnsavedChanges(false)
      setIsLoading(false)

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (error) {
      console.error("Error updating settings:", error)
      setNotification({ type: "error", message: "Failed to update settings. Please try again." })
      setIsLoading(false)
    }
  }

  const dismissNotification = () => {
    setNotification(null)
  }

  return (
    <div className="flex flex-col p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
        {unsavedChanges && (
          <div className="flex items-center text-amber-600">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            <span>Unsaved changes</span>
          </div>
        )}
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={dismissNotification} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* System Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Cog6ToothIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">System Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Maintenance Mode</label>
                    <p className="text-sm text-gray-500">Take the system offline for maintenance</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="maintenanceMode"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.maintenanceMode ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.maintenanceMode ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Dark Mode</label>
                    <p className="text-sm text-gray-500">Enable dark theme for admin panel</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="darkMode"
                      name="darkMode"
                      checked={settings.darkMode}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="darkMode"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.darkMode ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.darkMode ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    min="5"
                    max="240"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-700 mb-2">Logging Level</label>
                  <select
                    name="loggingLevel"
                    value={settings.loggingLevel}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <BellIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Notification Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Send system alerts via email</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.emailNotifications ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">System Notifications</label>
                    <p className="text-sm text-gray-500">Show in-app notifications</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="systemNotifications"
                      name="systemNotifications"
                      checked={settings.systemNotifications}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="systemNotifications"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.systemNotifications ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.systemNotifications ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <label className="block font-medium text-gray-700 mb-2">Alert Email Addresses</label>
                  <input
                    type="text"
                    name="alertEmails"
                    value={settings.alertEmails}
                    onChange={handleChange}
                    placeholder="Comma-separated email addresses"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-sm text-gray-500">Require 2FA for admin users</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      checked={settings.twoFactorAuth}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="twoFactorAuth"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.twoFactorAuth ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.twoFactorAuth ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                  <input
                    type="number"
                    name="passwordExpiry"
                    value={settings.passwordExpiry}
                    onChange={handleChange}
                    min="0"
                    max="365"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">0 = never expires</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ServerIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Performance Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Enable Caching</label>
                    <p className="text-sm text-gray-500">Improve performance with caching</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="cacheEnabled"
                      name="cacheEnabled"
                      checked={settings.cacheEnabled}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="cacheEnabled"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.cacheEnabled ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.cacheEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Auto Backup</label>
                    <p className="text-sm text-gray-500">Schedule automatic backups</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      name="autoBackup"
                      checked={settings.autoBackup}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="autoBackup"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.autoBackup ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.autoBackup ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-700 mb-2">Backup Frequency (days)</label>
                  <input
                    type="number"
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    disabled={!settings.autoBackup}
                    className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !settings.autoBackup ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <KeyIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">API Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Enable API</label>
                    <p className="text-sm text-gray-500">Allow API access to the system</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="apiEnabled"
                      name="apiEnabled"
                      checked={settings.apiEnabled}
                      onChange={handleChange}
                      className="absolute w-0 h-0 opacity-0"
                    />
                    <label
                      htmlFor="apiEnabled"
                      className={`absolute inset-0 cursor-pointer rounded-full transition-colors duration-200 ${
                        settings.apiEnabled ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 transform ${
                          settings.apiEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block font-medium text-gray-700 mb-2">API Rate Limit (requests/min)</label>
                  <input
                    type="number"
                    name="apiRateLimit"
                    value={settings.apiRateLimit}
                    onChange={handleChange}
                    min="10"
                    max="1000"
                    disabled={!settings.apiEnabled}
                    className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !settings.apiEnabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-gray-700">API Key</label>
                    <button
                      type="button"
                      onClick={regenerateApiKey}
                      disabled={!settings.apiEnabled}
                      className={`text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none ${
                        !settings.apiEnabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={settings.apiKey}
                      readOnly
                      disabled={!settings.apiEnabled}
                      className={`w-full p-2 border border-gray-300 rounded-l focus:outline-none ${
                        !settings.apiEnabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.apiKey)
                        setNotification({ type: "success", message: "API key copied to clipboard!" })
                        setTimeout(() => setNotification(null), 3000)
                      }}
                      disabled={!settings.apiEnabled}
                      className={`px-4 bg-gray-200 border border-gray-300 border-l-0 rounded-r hover:bg-gray-300 ${
                        !settings.apiEnabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Keep this key secure. It grants full access to the API.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 flex flex-wrap justify-between gap-4">
            <button
              type="button"
              onClick={resetToDefaults}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <ArrowPathIcon className="w-5 h-5 inline-block mr-1" />
              Reset to Defaults
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  if (originalSettings) {
                    setSettings(originalSettings)
                    setUnsavedChanges(false)
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={!unsavedChanges}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isLoading || !unsavedChanges}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminSettingsPage

