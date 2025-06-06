// pages/edit/[uuid].tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Eye,
  Save,
  User,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

interface QRProfile {
  uuid: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  linkedin: string | null;
  facebook: string | null;
  website: string | null;
  isPublished: boolean;
  user: {
    username: string;
    isActive: boolean;
  };
}

export default function EditPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const [profile, setProfile] = useState<QRProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (uuid && typeof uuid === "string") {
      fetchProfile();
    }
  }, [uuid]);

  const fetchProfile = async () => {
    if (!uuid || typeof uuid !== "string") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/qr/${uuid}`
      );
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
        if (!result.data.user.isActive) {
          toast({
            title: "Account Inactive",
            description: "This account has been disabled by admin",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Profile not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter username and password",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      const result = await response.json();
      if (result.success) {
        setIsLoggedIn(true);
        toast({
          title: "Success",
          description: "Login successful",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!profile || !isLoggedIn || !uuid) return;

    setSaving(true);
    try {
      // Only send the profile fields that the API expects
      const updateData = {
        username: credentials.username,
        password: credentials.password,
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        instagram: profile.instagram,
        twitter: profile.twitter,
        tiktok: profile.tiktok,
        youtube: profile.youtube,
        linkedin: profile.linkedin,
        facebook: profile.facebook,
        website: profile.website,
        isPublished: profile.isPublished,
      };

      console.log("Sending update data:", updateData); // Debug log

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/qr/${uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();
      console.log("Update response:", result); // Debug log

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        // Update only the profile data, keep the user object intact
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...result.data,
                user: prev.user, // Preserve the user object
              }
            : null
        );
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof QRProfile,
    value: string | boolean
  ) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const getPreviewUrl = () => {
    if (profile?.isPublished && uuid) {
      return `${window.location.origin}/scan/${uuid}`;
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Profile Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              The QR profile you're looking for doesn't exist or has been
              removed.
            </p>
            <Button className="w-full mt-4" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login required
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Login Required</CardTitle>
            <p className="text-center text-gray-600">
              Please login to edit your QR profile
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main edit interface
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit QR Profile</h1>
        <div className="flex gap-2">
          {getPreviewUrl() && (
            <Button
              variant="outline"
              onClick={() => window.open(getPreviewUrl()!, "_blank")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your display name"
                value={profile.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell people about yourself..."
                rows={3}
                value={profile.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                placeholder="https://example.com/avatar.jpg"
                value={profile.avatar || ""}
                onChange={(e) => handleInputChange("avatar", e.target.value)}
              />
              {profile.avatar && (
                <div className="mt-2">
                  <img
                    src={profile.avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={profile.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                placeholder="@yourusername or full URL"
                value={profile.instagram || ""}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter/X
              </Label>
              <Input
                id="twitter"
                placeholder="@yourusername or full URL"
                value={profile.twitter || ""}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                placeholder="@yourusername or full URL"
                value={profile.tiktok || ""}
                onChange={(e) => handleInputChange("tiktok", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </Label>
              <Input
                id="youtube"
                placeholder="Channel name or full URL"
                value={profile.youtube || ""}
                onChange={(e) => handleInputChange("youtube", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="Profile URL"
                value={profile.linkedin || ""}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </Label>
              <Input
                id="facebook"
                placeholder="Profile URL"
                value={profile.facebook || ""}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publish Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Publishing Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="publish" className="text-base font-medium">
                Publish Profile
              </Label>
              <p className="text-sm text-gray-600">
                Make your profile visible when someone scans your QR code
              </p>
            </div>
            <Switch
              id="publish"
              checked={profile.isPublished}
              onCheckedChange={(checked) =>
                handleInputChange("isPublished", checked)
              }
            />
          </div>

          {profile.isPublished && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Your profile is published and accessible at:
                <br />
                <code className="bg-green-100 px-2 py-1 rounded text-xs mt-1 inline-block">
                  {getPreviewUrl()}
                </code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
