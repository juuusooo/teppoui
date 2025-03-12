import React, { useState } from "react";
import { User } from "@/types/User";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { t } from "i18next";
import LanguageSelectorComponent from "../profile/LanguageSelectorComponent";
import i18n from "@/locales/i18n";
import { toast } from "sonner";

interface AddColumnDialogProps {
    isOpen: boolean;
    user: User;
    onDismiss: () => void;
    onSaveProfile: (username: string, email: string) => void;
    onLogout: () => void;
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({ isOpen, user, onDismiss, onSaveProfile, onLogout }) => {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);

    const handleSubmit = () => {
        onSaveProfile(username.trim(), email.trim());
    };

    const handleLogout = () => {
        onLogout();
    };

    return (
        <Dialog open={isOpen} onClose={onDismiss} fullWidth maxWidth="sm">
            <DialogTitle>{t('profile_title')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="edit-username"
                    label={t('form_username')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="edit-email"
                    label={t('form_email')}
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <LanguageSelectorComponent
                    onChangeLanguage={async (language: string) => {
                        i18n.changeLanguage(language);
                        localStorage.setItem("language", language);
                        toast("Language changed. Reload for full effect.");
                    }} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={handleLogout} color="secondary" variant="outlined">
                    {t('form_logout')}
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    {t('form_save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddColumnDialog;
