import React, { useEffect, useState } from "react";
import { logoutUser, getUserProfile, updateUserProfile } from "@/services/userApiService";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/User";
import ProfileDialog from "../dialogs/ProfileDialog";
import { Avatar, Box, Typography } from "@mui/material";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState<boolean | null>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    console.log("isOpen: ", profileOpen);
    const fetchUser = async () => {
      try {
        const user = await getUserProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUser();
  }, [profileOpen]);

  const handleSaveProfile = async (username: string, email: string) => {
    const user = await updateUserProfile(username, email);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const displayName = currentUser?.username || "User";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        cursor: "pointer",
        borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
      onClick={() => setProfileOpen(true)}
    >
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" fontWeight="medium">
          {displayName}
        </Typography>
        {currentUser?.email && (
          <Typography variant="caption" color="textSecondary">
            {currentUser.email}
          </Typography>
        )}
      </Box>

      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText" }}>
        {displayName.slice(0, 1)}
      </Avatar>

      {profileOpen && (
        <ProfileDialog
          isOpen={profileOpen}
          user={currentUser}
          onDismiss={() => {
            console.log(profileOpen);
            console.log("closed");
            setProfileOpen(null);
            console.log(profileOpen);
          }}
          onSaveProfile={(username, email) => {
            handleSaveProfile(username, email);
            setProfileOpen(null);
          }}
          onLogout={handleLogout}
        />
      )}
    </Box>
  );
};

export default UserProfile;
