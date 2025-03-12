import React, { useState } from "react";
import { User } from "@/types/User";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { t } from "i18next";

interface CreateBoardDialogProps {
    isOpen: boolean;
    onDismiss: () => void;
    onCreateBoard: (title: string) => void;
}

const CreateBoardDialog: React.FC<CreateBoardDialogProps> = ({ isOpen, onDismiss, onCreateBoard }) => {
    const [title, setTitle] = useState("");

    const handleSubmit = () => {
        onCreateBoard(title.trim());
    };

    return (
        <Dialog open={isOpen} onClose={onDismiss} fullWidth maxWidth="sm">
            <DialogTitle>{t('create_board')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="board-title"
                    label="Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </DialogContent><DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={onDismiss} color="secondary" variant="outlined">
                    {t('form_cancel')}
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    {t('form_create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateBoardDialog;
