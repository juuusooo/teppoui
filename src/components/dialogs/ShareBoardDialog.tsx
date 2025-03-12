import React, { useState } from "react";
import { User } from "@/types/User";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { t } from "i18next";

interface ShareBoardDialogProps {
    isOpen: boolean;
    onDismiss: () => void;
    onShareBoard: (title: string) => void;
}

const ShareBoardDialog: React.FC<ShareBoardDialogProps> = ({ isOpen, onDismiss, onShareBoard }) => {
    const [email, setEmail] = useState("");

    const handleSubmit = () => {
        onShareBoard(email.trim());
    };

    return (
        <Dialog open={isOpen} onClose={onDismiss} fullWidth maxWidth="sm">
            <DialogTitle>{t('share_board')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {t('share_board_desciption')}
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="user-email"
                    label="Email"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </DialogContent><DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={onDismiss} color="secondary" variant="outlined">
                    {t('form_cancel')}
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    {t('form_share')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareBoardDialog;
