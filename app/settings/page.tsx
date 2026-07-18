"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, ShieldAlert, Palette, UserCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { update } = useSession();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [account, setAccount] = useState({
    name: "",
    email: "",
    hasPassword: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch("/api/settings/account");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setAccount({
              name: json.data.name || "",
              email: json.data.email || "",
              hasPassword: json.data.hasPassword || false,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  const handleSaveAccount = async () => {
    if (!account.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSavingAccount(true);
    try {
      const res = await fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: account.name }),
      });

      if (!res.ok) throw new Error("Failed to save");

      await update({ name: account.name });
      toast.success("Account settings updated!");
    } catch (err) {
      toast.error("Failed to update account settings.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to update password");
        return;
      }

      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error("An error occurred while changing password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      {/* Account Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
          <UserCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Account Information</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Full Name</label>
            <Input
              value={account.name}
              onChange={(e) => setAccount({ ...account, name: e.target.value })}
              className="max-w-md rounded-xl"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email Address</label>
            <Input
              value={account.email}
              disabled
              className="max-w-md rounded-xl bg-muted text-muted-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">Email addresses cannot be changed.</p>
          </div>
          <Button
            onClick={handleSaveAccount}
            disabled={savingAccount}
            className="rounded-full gap-2 mt-2"
          >
            {savingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </motion.section>

      {/* Security Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Security</h2>
        </div>
        <div className="p-6">
          {!account.hasPassword ? (
            <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Connected with Google</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  You signed in using a provider (e.g. Google), so you don't have a local password to change.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-md">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Current Password</label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleSavePassword}
                disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="rounded-full gap-2 mt-2"
              >
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update Password
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Appearance Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="p-6">
          <label className="mb-4 block text-sm font-medium text-foreground">Theme Preference</label>
          <div className="flex flex-wrap gap-4">
            {["light", "dark", "system"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-xl border-2 px-6 py-3 text-sm font-medium capitalize transition-all ${
                  theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-foreground hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
