import React, { useState } from "react";
import { Priority } from "@/types/Task";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { t } from "i18next";

interface AddTaskDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  columnId: string;
  onAddTask: (
    columnId: string,
    title: string,
    description: string,
    priority: "low" | "medium" | "high",
    tags: string[]
  ) => void;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ isOpen, onDismiss, columnId, onAddTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState("");

  const handleSubmit = () => {
    onAddTask(
      columnId,
      title,
      description,
      priority,
      tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    );
    setTitle("");
    setDescription("");
    setPriority("medium");
    setTags("");
  };

  return (
    <>
      <Dialog open={isOpen} fullWidth maxWidth="sm">
        <DialogTitle>{t('add_task_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="task-title"
            label={t('form_title')}
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            id="task-desc"
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
            <InputLabel id="task-priority-label">{t('task_priority')}</InputLabel>
            <Select
              labelId="task-priority-label"
              id="task-priority"
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
            id="task-tags"
            label={t('task_tags')}
            type="text"
            fullWidth
            variant="outlined"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => {onDismiss()}}>
            {t('form_cancel')}
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {t('form_submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTaskDialog;
