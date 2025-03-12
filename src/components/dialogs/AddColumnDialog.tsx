import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { t } from "i18next";

interface AddColumnDialogProps {
    isOpen: boolean;
    onDismiss: () => void;
    onAddColumn: (title: string) => void;
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({ isOpen, onDismiss, onAddColumn }) => {
    const [title, setTitle] = useState("");

    const handleSubmit = () => {
        onAddColumn(title.trim());
    };

    return (
        <Dialog open={isOpen} onClose={onDismiss} fullWidth maxWidth="sm">
            <DialogTitle>{t('add_column_title')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="edit-column-title"
                    label="Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onDismiss} color="secondary">
                    {t('form_cancel')}
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    {t('form_create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddColumnDialog;
