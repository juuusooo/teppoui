import React, { useState } from "react";
import { Priority, Task } from "@/types/Task";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { t } from "i18next";

interface EditTaskDialogProps {
    isOpen: boolean;
    task: Task;
    onEditTask: (task: Task) => void;
    onDismiss: () => void;
    onDeleteTask: (task: Task) => void;
}

const colors = ["#FFFFFF", "#F0EE96", "#9DF096", "#96B7F0", "#F0BA96"];

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ isOpen, task, onEditTask, onDismiss, onDeleteTask }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [priority, setPriority] = useState<Priority>(task.priority);
    const [tags, setTags] = useState(task.tags.join(", "));
    const [color, setColor] = useState(task.color);

    const handleSubmit = () => {
        task.title = title;
        task.description = description;
        task.priority = priority;
        if (task.tags.length != 0) {
            task.tags = tags.split(",").map(tag => tag.trim());
        } else {
            task.tags = [];
        }
        task.color = color;
        onEditTask(task);
    };

    const handleDelete = () => {
        task.title = title;
        task.description = description;
        task.priority = priority;
        task.tags = tags.split(",").map(tag => tag.trim());
        onDeleteTask(task);
    };

    return (
        <Dialog open={isOpen} onClose={onDismiss} fullWidth maxWidth="sm">
            <DialogTitle>{t('edit_task_title')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="edit-task-title"
                    label={t('form_title')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="edit-task-desc"
                    label={t('form_description')}
                    type="text"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel id="edit-task-priority-label">{t('task_priority')}</InputLabel>
                    <Select
                        labelId="edit-task-priority-label"
                        id="edit-task-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                    >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    id="edit-task-tags"
                    label={t('task_tags')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
            </DialogContent>
            <Box display="flex" gap={1} flexDirection="column" paddingX="30px">
                <Typography>
                    {t('task_color')}
                </Typography>
                <Box display="flex" gap={1} flexDirection="row">
                    {colors.map((c) => (
                        <Box
                            key={c}
                            onClick={() => setColor(c)}
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                backgroundColor: c,
                                cursor: "pointer",
                                border: c == color ? "3px solid black" : "1px solid grey",
                                transition: "border 0.2s",
                            }}
                        />
                    ))}
                </Box>
            </Box>
            <DialogActions>
                <Button onClick={handleDelete} color="error" variant="contained">
                    {t('form_delete')}
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    {t('form_submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditTaskDialog;
