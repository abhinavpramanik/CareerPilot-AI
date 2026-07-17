"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserRound, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    targetRole: "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your career profile and preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UserRound className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Education & Career Goal</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            { label: "College / University", key: "college", placeholder: "e.g. IIT Delhi" },
            { label: "Degree", key: "degree", placeholder: "e.g. B.Tech" },
            { label: "Branch / Major", key: "branch", placeholder: "e.g. Computer Science" },
            { label: "Graduation Year", key: "graduationYear", placeholder: "e.g. 2025" },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-2 block text-sm font-medium text-foreground">{f.label}</label>
              <Input
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="rounded-xl"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-foreground">Target Role</label>
            <Input
              placeholder="e.g. Full Stack Developer"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-primary text-white gap-2"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4" />Save Profile</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
