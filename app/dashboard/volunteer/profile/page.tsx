"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CalendarIcon, User } from "lucide-react";
import { CheckboxReactHookFormMultiple } from "@/components/renderedItems";
import { LocationSelects } from "@/components/location-selects";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, getSkillsets, getUserLocation } from "@/lib/utils";
import { toast } from "sonner";
import LocationSelector from "@/components/location-selector";

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  skills: string[] | null;
  availability: string | null;
  experience: string | null;
  residence_country: string | null;
  residence_state: string | null;
  origin_country: string | null;
  origin_state: string | null;
  origin_lga: string | null;
  volunteer_countries: string[] | null;
  volunteer_states: string[] | null;
  volunteer_lgas: string[] | null;
  profile_picture: string | null;
}

export interface Item {
  id: string;
  label: string;
  children?: Item[];
  subChildren?: Item[];
}

interface SelectedData {
  selectedCountries: string[];
  selectedStates: string[];
  selectedLgas: string[];
}

export default function VolunteerProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [availabilityType, setAvailabilityType] = useState<
    "full-time" | "specific-period"
  >("full-time");
  const [availabilityStartDate, setAvailabilityStartDate] = useState<
    Date | undefined
  >(undefined);
  const [availabilityEndDate, setAvailabilityEndDate] = useState<
    Date | undefined
  >(undefined);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expertiseData, setExpertiseData] = useState<Item[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<SelectedData>({
    selectedCountries: [],
    selectedStates: [],
    selectedLgas: [],
  });

  const supabase = createClient();
  const router = useRouter();

  // Fetch skillsets
  useEffect(() => {
    const fetchSkillsets = async () => {
      const skillsets = await getSkillsets();
      setExpertiseData(skillsets);
    };
    fetchSkillsets();
  }, []);

  // Fetch profile and location
  useEffect(() => {
    const fetchProfileAndLocation = async () => {
      setLoading(true);

      // Fetch user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error fetching user:", userError);
        setMessage({
          text: "Please log in to view your profile.",
          isError: true,
        });
        setLoading(false);
        return;
      }

      setUserEmail(user.email);
      setUserPhone(user.phone || null);

      // Fetch profile
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, email, phone, date_of_birth, address, skills, availability, experience, residence_country, residence_state, origin_country, origin_state, origin_lga, volunteer_countries, volunteer_states, volunteer_lgas, profile_picture"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setMessage({ text: "Failed to load profile data.", isError: true });
        setLoading(false);
        return;
      }

      // Set profile data
      const profileData = {
        ...data,
        skills: data.skills || [],
        volunteer_countries: data.volunteer_countries || [],
        volunteer_states: data.volunteer_states || [],
        volunteer_lgas: data.volunteer_lgas || [],
        profile_picture: data.profile_picture || null,
      };
      setProfile(profileData);
      setSelectedSkill(data.skills || []);
      setSelectedLocations({
        selectedCountries: data.volunteer_countries || [],
        selectedStates: data.volunteer_states || [],
        selectedLgas: data.volunteer_lgas || [],
      });
      setImagePreview(data.profile_picture || null);

      if (data.availability === "full-time") {
        setAvailabilityType("full-time");
        setAvailabilityStartDate(undefined);
        setAvailabilityEndDate(undefined);
      } else if (data.availability) {
        try {
          const parsedAvailability = JSON.parse(data.availability);
          setAvailabilityType("specific-period");
          setAvailabilityStartDate(
            parsedAvailability.startDate
              ? new Date(parsedAvailability.startDate)
              : undefined
          );
          setAvailabilityEndDate(
            parsedAvailability.endDate
              ? new Date(parsedAvailability.endDate)
              : undefined
          );
        } catch (e) {
          console.error("Error parsing availability dates:", e);
          setAvailabilityType("full-time");
          setAvailabilityStartDate(undefined);
          setAvailabilityEndDate(undefined);
        }
      }

      // Fetch and apply location
      try {
        const location = await getUserLocation();
        if (location) {
          setProfile((prev) => {
            if (!prev) return profileData;
            return {
              ...prev,
              residence_country:
                location.country || prev.residence_country || "Unknown",
              residence_state:
                location.region || prev.residence_state || "Unknown",
            };
          });
        } else {
          console.warn("No location data returned from getUserLocation");
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }

      setLoading(false);
    };

    fetchProfileAndLocation();
  }, [supabase]);

  // Handle image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (userId: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleInputChange = (
    field: keyof ProfileData,
    value: string | string[]
  ) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkill(skills);
    handleInputChange("skills", skills);
  };

  // Handle location selection changes
  const handleLocationChange = (data: SelectedData) => {
    setSelectedLocations(data);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!profile) {
      toast.error("No profile data to save.");
      setSubmitting(false);
      return;
    }

    // Validate availability
    if (
      availabilityType === "specific-period" &&
      (!availabilityStartDate || !availabilityEndDate)
    ) {
      toast.error("Please select both a start and end date for your availability period.");
      setSubmitting(false);
      return;
    }
    if (
      availabilityType === "specific-period" &&
      availabilityStartDate &&
      availabilityEndDate &&
      availabilityStartDate > availabilityEndDate
    ) {
      toast.error("Start date cannot be after end date.");
      setSubmitting(false);
      return;
    }

    // Validate volunteer locations
    if (selectedLocations.selectedCountries.length === 0) {
      toast.error("Please select at least one volunteer location preference.");
      setSubmitting(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error("Authentication error. Please log in again.");
      setSubmitting(false);
      return;
    }

    let profilePictureUrl = profile.profile_picture;
    if (imageFile) {
      const uploadedUrl = await uploadImage(user.id, imageFile);
      if (uploadedUrl) {
        profilePictureUrl = uploadedUrl;
        setProfile((prev) =>
          prev ? { ...prev, profile_picture: uploadedUrl } : null
        );
      } else {
        toast.error("Failed to upload profile picture.");
        setSubmitting(false);
        return;
      }
    }

    const availabilityToStore =
      availabilityType === "full-time"
        ? "full-time"
        : JSON.stringify({
            startDate: availabilityStartDate
              ? format(availabilityStartDate, "yyyy-MM-dd")
              : null,
            endDate: availabilityEndDate
              ? format(availabilityEndDate, "yyyy-MM-dd")
              : null,
          });

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        address: profile.address,
        skills: selectedSkill,
        availability: availabilityToStore,
        experience: profile.experience,
        residence_country: profile.residence_country,
        residence_state: profile.residence_state,
        origin_country: profile.origin_country,
        origin_state: profile.origin_state,
        origin_lga: profile.origin_lga,
        volunteer_countries:
          selectedLocations.selectedCountries.length > 0
            ? selectedLocations.selectedCountries
            : null,
        volunteer_states:
          selectedLocations.selectedStates.length > 0
            ? selectedLocations.selectedStates
            : null,
        volunteer_lgas:
          selectedLocations.selectedLgas.length > 0
            ? selectedLocations.selectedLgas
            : null,
        email: user.email,
        profile_picture: profilePictureUrl,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } else {
      toast.success("Profile updated successfully!");
      router.refresh();
      setMessage({ text: "Profile updated successfully!", isError: false });
    }
    setSubmitting(false);
  };

  // Display selected locations
  const selectedLocationsDisplay = useMemo(() => {
    const { selectedCountries, selectedStates, selectedLgas } = selectedLocations;
    return (
      <div className="text-sm text-gray-600 mt-2">
        {selectedCountries.length > 0 ? (
          <>
            <p>
              <strong>Countries:</strong> {selectedCountries.join(", ")}
            </p>
            {selectedStates.length > 0 && (
              <p>
                <strong>States:</strong> {selectedStates.join(", ")}
              </p>
            )}
            {selectedLgas.length > 0 && (
              <p>
                <strong>LGAs:</strong> {selectedLgas.join(", ")}
              </p>
            )}
          </>
        ) : (
          <p>No locations selected.</p>
        )}
      </div>
    );
  }, [selectedLocations]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Loading Profile...</h3>
          <p className="text-sm text-gray-500">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Profile Not Found</h3>
          <p className="text-sm text-gray-500">Could not load your profile data. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Combine residence_country and residence_state for display
  const locationDisplay =
    [profile.residence_country, profile.residence_state]
      .filter(Boolean)
      .join(", ") || "Unknown";

  return (
    <Card className="w-full max-w-4xl mx-auto border-gray-200 rounded-xl shadow-sm">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'); * { font-family: 'Roboto', sans-serif; }`}
      </style>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Volunteer Profile</CardTitle>
        <CardDescription className="text-gray-600">
          Manage your personal information, skills, and volunteer preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6" aria-live="polite">
          {/* Profile Picture Section */}
          <div className="grid gap-2">
            <Label htmlFor="profile-picture" className="text-base font-medium text-gray-800">
              Profile Picture
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile picture"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-gray-600"
                  aria-label="Upload profile picture"
                />
                <p className="text-sm text-gray-500">Upload a profile picture (JPEG, PNG, max 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name" className="text-base font-medium text-gray-800">
                Full Name
              </Label>
              <Input
                id="full-name"
                type="text"
                placeholder="John Doe"
                value={profile.full_name || ""}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                required
                aria-required="true"
                className="border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-base font-medium text-gray-800">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={userEmail || ""}
                value={profile.email || ""}
                disabled
                className="bg-gray-100"
                aria-label="User email (disabled)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-base font-medium text-gray-800">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={userPhone || ""}
                value={profile.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="border-gray-300 focus:ring-blue-500"
                aria-label="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-of-birth" className="text-base font-medium text-gray-800">
                Date of Birth
              </Label>
              <Input
                id="date-of-birth"
                type="date"
                value={profile.date_of_birth || ""}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                className="border-gray-300 focus:ring-blue-500"
                aria-label="Date of birth"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address" className="text-base font-medium text-gray-800">
              Address
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main St, City, State, ZIP"
              value={profile.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="border-gray-300 focus:ring-blue-500"
              aria-label="Address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location" className="text-base font-medium text-gray-800">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              value={locationDisplay}
              disabled
              className="bg-gray-100"
              aria-label="Current location (disabled)"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-base font-medium text-gray-800">Skills & Interests</Label>
            <CheckboxReactHookFormMultiple
              items={expertiseData}
              onChange={handleSkillsChange}
              initialValues={profile.skills || []}
              aria-label="Select skills and interests"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-base font-medium text-gray-800">Availability</Label>
            <RadioGroup
              value={availabilityType}
              onValueChange={(value: "full-time" | "specific-period") => {
                setAvailabilityType(value);
                if (value === "full-time") {
                  setAvailabilityStartDate(undefined);
                  setAvailabilityEndDate(undefined);
                }
              }}
              className="flex items-center space-x-4"
              aria-label="Select availability type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="full-time"
                  id="availability-full-time-profile"
                  className="text-blue-600"
                />
                <Label htmlFor="availability-full-time-profile" className="text-gray-700">
                  Full-time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="specific-period"
                  id="availability-specific-period-profile"
                  className="text-blue-600"
                />
                <Label htmlFor="availability-specific-period-profile" className="text-gray-700">
                  Specific Period
                </Label>
              </div>
            </RadioGroup>
            {availabilityType === "specific-period" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="grid gap-2">
                  <Label htmlFor="start-date-profile" className="text-base font-medium text-gray-800">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300",
                          !availabilityStartDate && "text-gray-500"
                        )}
                        aria-label="Select availability start date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {availabilityStartDate ? (
                          format(availabilityStartDate, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={availabilityStartDate}
                        onSelect={setAvailabilityStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date-profile" className="text-base font-medium text-gray-800">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300",
                          !availabilityEndDate && "text-gray-500"
                        )}
                        aria-label="Select availability end date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {availabilityEndDate ? (
                          format(availabilityEndDate, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={availabilityEndDate}
                        onSelect={setAvailabilityEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="experience" className="text-base font-medium text-gray-800">
              Previous Volunteer Experience
            </Label>
            <Textarea
              id="experience"
              placeholder="Tell us about your previous volunteer experience..."
              value={profile.experience || ""}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              rows={4}
              className="border-gray-300 focus:ring-blue-500"
              aria-label="Previous volunteer experience"
            />
          </div>

          <LocationSelects
            label="Country of Origin"
            country={profile.origin_country || ""}
            state={profile.origin_state || ""}
            lga={profile.origin_lga || ""}
            onChangeCountry={(value) => {
              handleInputChange("origin_country", value);
              handleInputChange("origin_state", "");
              handleInputChange("origin_lga", "");
            }}
            onChangeState={(value) => {
              handleInputChange("origin_state", value);
              handleInputChange("origin_lga", "");
            }}
            onChangeLga={(value) => handleInputChange("origin_lga", value)}
            required
            aria-label="Select country of origin"
          />

          <div className="grid gap-2">
            <Label className="text-base font-medium text-gray-800">
              Volunteer Location Preferences
            </Label>
            <LocationSelector onSelectionChange={handleLocationChange} />
            {selectedLocationsDisplay}
            <p className="text-sm text-gray-500">
              Select your preferred countries, states, and LGAs for volunteering.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 transition-all"
            disabled={submitting}
            aria-label="Save profile changes"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          {message && (
            <p
              className={`text-center text-sm ${
                message.isError ? "text-red-500" : "text-green-500"
              }`}
              aria-live="assertive"
            >
              {message.text}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}