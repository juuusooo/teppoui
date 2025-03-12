import React, { useState } from "react";
import Card from '@mui/material/Card';
import { format } from "date-fns";
import { Task } from "@/types/Task";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import CommentComponent from "./CommentComponent";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { t } from "i18next";
import { getUser } from "@/userStore";

const priorityColors = {
  low: "bg-green-200 text-green-800",
  medium: "bg-yellow-200 text-yellow-800",
  high: "bg-red-200 text-red-800",
};

interface TaskCardProps {
  task: Task;
  index: number;
  onAddComment: (task: Task, comment: string) => Promise<Task>;
  onAddLike: (task: Task) => Promise<Task>;
  onRemoveLike: (task: Task) => Promise<Task>;
  onAddDislike: (task: Task) => Promise<Task>;
  onRemoveDislike: (task: Task) => Promise<Task>;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => void;
  handleClick: (task: Task) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onStartEdit: (id: string, type: "task" | "column") => void;
  onStopEdit: (id: string, type: "task" | "column") => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onAddComment, onAddLike, onRemoveLike, onAddDislike, onRemoveDislike, handleDragStart, onDrop, handleClick, onDragEnter, onStartEdit, onStopEdit }) => {
  const user = getUser();
  
  const [currentTask, setCurrentTask] = useState<Task | null>(task);

  const [likes, setLikes] = useState(currentTask.likes.length || 0);
  const [dislikes, setDislikes] = useState(currentTask.dislikes.length || 0);
  const [userLiked, setUserLiked] = useState(currentTask.likes.includes(user._id));
  const [userDisliked, setUserDisliked] = useState(currentTask.dislikes.includes(user._id));

  const handleLike = async () => {
    try {
      if (userLiked) {
        await onRemoveLike(currentTask);
        setLikes((prev) => prev - 1);
        setUserLiked(false);
      } else {
        await onAddLike(currentTask);
        setLikes((prev) => prev + 1);
        setUserLiked(true);

        // Remove dislike if it exists
        if (userDisliked) {
          await onRemoveDislike(currentTask);
          setDislikes((prev) => prev - 1);
          setUserDisliked(false);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDislike = async () => {
    try {
      if (userDisliked) {
        await onRemoveDislike(currentTask);
        setDislikes((prev) => prev - 1);
        setUserDisliked(false);
      } else {
        await onAddDislike(currentTask);
        setDislikes((prev) => prev + 1);
        setUserDisliked(true);

        // Remove like if it exists
        if (userLiked) {
          await onRemoveLike(currentTask);
          setLikes((prev) => prev - 1);
          setUserLiked(false);
        }
      }
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  };

  return (
    <Box
      draggable
      onDragStart={(e) => handleDragStart(e, currentTask._id, currentTask.columnId)}
      onDrop={(e) => onDrop(e)}
      onClick={() => {
        onStartEdit(task._id, "task");
        handleClick(currentTask);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={onDragEnter}
      data-index={index}
      sx={{ cursor: "grab" }}
    >
      <Card
        sx={{
          maxWidth: 400,
          boxShadow: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          backgroundColor: currentTask.color,
          p: 2,
          position: "relative",
        }}
      >
        <Chip label={currentTask.priority}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            borderRadius: 100,
            fontWeight: "bold",
            color: "white",
            bgcolor: currentTask.priority === "low" ? "green"
              : currentTask.priority === "medium" ? "orange"
                : "red",
          }}
        >
        </Chip>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          {currentTask.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {currentTask.description}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {["g", "sd"].map((tag, index) => (
            <Chip label={tag} variant="outlined"
              key={index}
              sx={{
                borderRadius: 100,
              }}
            >
            </Chip>
          ))}
        </Box>
        <Box height={10}></Box>
        <Typography variant="body2" color="textSecondary" fontSize={12}>
          {`${t('updated')}: ${format(currentTask.createdAt, "PP")}`}
        </Typography>
        <Typography variant="body2" color="textSecondary" fontSize={12}>
          {`${t('created')}: ${format(currentTask.createdAt, "PP")}`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <IconButton onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike();
          }} color="primary">
            <ThumbUpIcon />
          </IconButton>
          <Typography variant="body2">{likes}</Typography>
          <IconButton onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDislike();
          }} color="secondary">
            <ThumbDownIcon />
          </IconButton>
          <Typography variant="body2">{dislikes}</Typography>
        </Box>
        <CommentComponent
          task={currentTask}
          onAddComment={async (comment: string) => {
            const updatedTask = await onAddComment(currentTask, comment);
            setCurrentTask(updatedTask);
          }}
        />
      </Card>
    </Box>
  );
};

export default TaskCard;