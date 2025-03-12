import { useState } from "react";
import { Box, TextField, Button, Typography, Card, CardContent } from "@mui/material";
import { Task } from "@/types/Task";
import { format } from "date-fns";
import { t } from "i18next";

interface CommentComponentProps {
    task: Task;
    onAddComment: (comment: string) => Promise<void>
}

const CommentComponent: React.FC<CommentComponentProps> = ({ task, onAddComment }) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = () => {
    if (comment.trim() === "") return;
    onAddComment(comment);
    setComment("");
  };

  return (
    <Box maxWidth={400} mx="auto" mt={3}>
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          label={t('add_comment')}
          variant="outlined"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          onClick={(e) => e.stopPropagation()}
        />
        <Button variant="contained" onClick={(e) => {
            e.stopPropagation();
            handleAddComment();
        }}>
          Post
        </Button>
      </Box>

      {/* Toggle Comments */}
      <Box mt={2}>
        <Button variant="text" onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
        }}>
          {showComments ? t('hide_comments') : `${t('view_comments')} (${task.comments.length})`}
        </Button>
      </Box>

      {/* Comments List */}
      {showComments && (
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          {task.comments.length > 0 ? (
            task.comments.map((comment, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Typography variant="body1">{comment.text}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {`${t('updated')}: ${format(comment.createdAt, "PP")}`}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>{t('no_comments')}</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CommentComponent;
