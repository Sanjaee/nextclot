// pages/scan/[uuid].tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Globe,
  ExternalLink,
  Music,
  User,
} from "lucide-react";
import { useRouter } from "next/router";

interface PublicProfile {
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
}
export default function ScanPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/qr/${uuid}`
      );
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error || "Profile not found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const formatSocialUrl = (platform: string, value: string) => {
    if (!value) return null;

    // If already a full URL, return as is
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    // Remove @ symbol if present
    const cleanValue = value.replace("@", "");

    switch (platform) {
      case "instagram":
        return `https://instagram.com/${cleanValue}`;
      case "twitter":
        return `https://twitter.com/${cleanValue}`;
      case "tiktok":
        return `https://tiktok.com/@${cleanValue}`;
      case "youtube":
        return `https://youtube.com/@${cleanValue}`;
      case "linkedin":
        return value.includes("linkedin.com")
          ? value
          : `https://linkedin.com/in/${cleanValue}`;
      case "facebook":
        return value.includes("facebook.com")
          ? value
          : `https://facebook.com/${cleanValue}`;
      default:
        return value;
    }
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      value: profile?.instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      platform: "instagram",
    },
    {
      name: "Twitter",
      icon: Twitter,
      value: profile?.twitter,
      color: "bg-black",
      platform: "twitter",
    },
    {
      name: "TikTok",
      icon: Music,
      value: profile?.tiktok,
      color: "bg-black",
      platform: "tiktok",
    },
    {
      name: "YouTube",
      icon: Youtube,
      value: profile?.youtube,
      color: "bg-red-600",
      platform: "youtube",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      value: profile?.linkedin,
      color: "bg-blue-600",
      platform: "linkedin",
    },
    {
      name: "Facebook",
      icon: Facebook,
      value: profile?.facebook,
      color: "bg-blue-700",
      platform: "facebook",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="text-red-500 mb-4">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Profile Not Available
            </h2>
            <p className="text-gray-600 mb-4">
              {error === "Profile is not published"
                ? "This profile is not published yet."
                : error === "Profile is inactive"
                ? "This profile is currently inactive."
                : "This profile could not be found or is no longer available."}
            </p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24"></div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col items-center -mt-12">
              {/* Avatar */}
              <div className="relative mb-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || "Profile"}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "";
                      target.style.display = "none";
                      // Show fallback
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                {profile.avatar && (
                  <div
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center absolute top-0 left-0"
                    style={{ display: "none" }}
                  >
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                {profile.name || "Anonymous User"}
              </h1>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-600 text-center leading-relaxed mb-4 px-2">
                  {profile.bio}
                </p>
              )}

              {/* Website Button */}
              {profile.website && (
                <Button
                  className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                  onClick={() => {
                    const url = profile.website!.startsWith("http")
                      ? profile.website!
                      : `https://${profile.website!}`;
                    window.open(url, "_blank");
                  }}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Website
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <div className="space-y-3">
          {socialLinks.map((social) => {
            const url = formatSocialUrl(social.platform, social.value || "");
            if (!url) return null;

            const IconComponent = social.icon;

            return (
              <Card
                key={social.name}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => window.open(url, "_blank")}
              >
                <CardContent className="p-0">
                  <div
                    className={`${social.color} text-white p-4 flex items-center justify-between group`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{social.name}</h3>
                        <p className="text-white text-opacity-90 text-sm">
                          {social.value?.replace("@", "") || "Visit Profile"}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {!socialLinks.some((link) => link.value) && !profile.website && (
          <Card className="mt-6 border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Globe className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Links Added Yet
              </h3>
              <p className="text-gray-500 text-sm">
                This profile doesn't have any social links or website added yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">Powered by QR Profile System</p>
        </div>
      </div>
    </div>
  );
}
