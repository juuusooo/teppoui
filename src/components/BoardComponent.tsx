import React, { useState } from "react";
import { Board as BoardType } from "../types/Board";
import AddTaskDialog from "./dialogs/AddTaskDialog";
import TaskCard from "./board/TaskCardComponent";
import { Task } from "@/types/Task";
import EditTaskDialog from "./dialogs/EditTaskDialog";
import AddColumnDialog from "./dialogs/AddColumnDialog";
import Button from '@mui/material/Button';
import { Box, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Column } from "@/types/Column";
import { Toaster, toast } from 'sonner';
import { t } from "i18next";
import { addLike, removeLike, addDislike, removeDislike } from "@/services/boardApiService";

interface BoardComponentProps {
  board: BoardType;
  boards: BoardType[];
  onSwitchBoard: (board: BoardType) => void;
  onAddColumn: (title: string) => void;
  onMoveColumn: (columnId: string, newIndex: number) => void;
  onRemoveColumn: (columnId: string) => void;
  onAddTask: (
    columnId: string,
    title: string,
    description: string,
    priority: "low" | "medium" | "high",
    tags: string[]
  ) => void;
  onAddComment: (task: Task, comment: string) => Promise<Task>;
  onMoveTask: (sourceColumnId: string, destinationColumnId: string, taskId: string) => void;
  onReorderTask: (columnId: string, newOrder: Task[]) => void;
  onEditTask: (task: Task) => Promise<void>;
  onDeleteTask: (task: Task) => Promise<void>;
  onStartEdit: (id: string, type: "task" | "column") => void;
  onStopEdit: (id: string, type: "task" | "column") => void;
}

const BoardComponent: React.FC<BoardComponentProps> = ({ board, boards, onAddColumn, onRemoveColumn, onAddTask, onAddComment, onMoveTask, onReorderTask, onEditTask, onDeleteTask, onMoveColumn, onStartEdit, onStopEdit }) => {
  const [addingColumn, setAddingColumn] = useState<boolean | null>(null);
  const [addingTask, setAddingTask] = useState<boolean | null>(null);
  const [taskAddingToColumn, setTaskAddingToColumn] = useState<Column | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [searchingTasksColumn, setSearchingTaskColumn] = useState<Column | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>("");
  const [queriedTasks, setQueriedTasks] = useState<Task[] | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: Column) => {
    if (event.target.value == "") {
      // clear queries
      setQueriedTasks([]);
      setSearchQuery("");
      setSearchingTaskColumn(null);
    } else {
      setSearchingTaskColumn(column);
      setSearchQuery(event.target.value);
      if (searchingTasksColumn != null) {
        setQueriedTasks(searchingTasksColumn.tasks.filter((task) => task.title.toLowerCase().includes(searchQuery.toLowerCase())));
      }
    }
  };

  // this dragging logic is quite complex so here is a breakdown:
  // handleColumnDragStart -> sets columnId that is dragged and type to column
  // handleColumnDrop -> handles when column is dropped
  // handleTaskDragStart -> sets taskId and sourceColumnId of task that is dragged and type to task
  // handleTaskDrop -> handles when task is dropped

  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.dataTransfer.setData("type", "column");
    e.dataTransfer.setData("columnId", columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, destinationColumnId: string) => {
    console.log("handleColumnDrop");
    e.preventDefault();

    const draggedColumnId = e.dataTransfer.getData("columnId");
    if (!draggedColumnId || draggedColumnId === destinationColumnId) return;

    const columnOrder = [...board.columns];
    const draggedColumnIndex = columnOrder.findIndex(col => col._id === draggedColumnId);
    const destinationColumnIndex = columnOrder.findIndex(col => col._id === destinationColumnId);

    if (draggedColumnIndex !== -1 && destinationColumnIndex !== -1) {
      const [movedColumn] = columnOrder.splice(draggedColumnIndex, 1);
      columnOrder.splice(destinationColumnIndex, 0, movedColumn);

      onMoveColumn(draggedColumnId, destinationColumnIndex);
    }
  };

  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, columnId: string) => {
    console.log("start");
    // stops parent drag being triggered
    e.stopPropagation();

    e.dataTransfer.setData("type", "task");
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceColumnId", columnId);
  };

  const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, destinationColumnId: string) => {
    console.log("handleTaskDrop");

    e.preventDefault();
    // stops parent drag being triggered
    e.stopPropagation();

    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    const taskId = e.dataTransfer.getData("taskId");

    if (sourceColumnId !== destinationColumnId) {
      // task moved to another column
      console.log("Another column");
      onMoveTask(sourceColumnId, destinationColumnId, taskId);
    } else {
      // task dragged in the same column
      console.log("Same column");
      const newOrder = [...board.columns.find(col => col._id === destinationColumnId)!.tasks];
      const draggedTaskIndex = newOrder.findIndex(task => task._id === taskId);

      console.log("draggedtask: ", draggedTaskIndex);
      console.log("hoveredtask: ", hoveredIndex);

      if (draggedTaskIndex !== hoveredIndex) {
        const [movedTask] = newOrder.splice(draggedTaskIndex, 1);
        newOrder.splice(hoveredIndex, 0, movedTask);
        onReorderTask(destinationColumnId, newOrder);
      }
    }


    if (!taskId || !sourceColumnId) return;
  };

  const handleClick = async (task: Task) => {
    setEditingTask(task);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        p: 2,
        overflowX: "auto",
        overflowY: "hidden",
        alignItems: "center",
        height: "100%",
        flexGrow: 1,
      }}
    >
      {board.columns.map((column) => (
        <Paper
          key={column._id}
          draggable
          onDragStart={(e) => handleColumnDragStart(e, column._id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const type = e.dataTransfer.getData("type");
            if (type === "task") {
              handleTaskDrop(e, column._id);
            } else if (type === "column") {
              handleColumnDrop(e, column._id);
            }
          }}
          sx={{
            backgroundColor: "#f4f4f4",
            border: "1px solid #ccc",
            p: 2,
            height: "90%",
            width: 300,
            flex: "0 0 300px",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {column.title}
            </Typography>
            <IconButton onClick={() => onRemoveColumn(column._id)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            <Box height={5}></Box>
            <TextField
              label={t('search_tasks')}
              value={searchingTasksColumn == column ? searchQuery : ""}
              onChange={(e) => { handleSearchChange(e, column) }}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {((searchQuery != "") && (searchingTasksColumn._id == column._id)) ? (queriedTasks || []).length == 0 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                {t('no_tasks')}
              </Typography>
            ) : (
              queriedTasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onAddComment={(task: Task, comment: string) => onAddComment(task, comment)}
                  onAddLike={(task: Task) => addLike(board._id, task.columnId, task._id)}
                  onRemoveLike={(task: Task) => removeLike(board._id, task.columnId, task._id)}
                  onAddDislike={(task: Task) => addDislike(board._id, task.columnId, task._id)}
                  onRemoveDislike={(task: Task) => removeDislike(board._id, task.columnId, task._id)}
                  handleDragStart={(e) => handleTaskDragStart(e, task._id, column._id)}
                  handleClick={() => handleClick(task)}
                  onDragEnter={(e) => (setHoveredIndex(index))}
                  onDrop={(e) => handleTaskDrop(e, column._id)}
                  onStartEdit={onStartEdit}
                  onStopEdit={onStopEdit}
                />
              ))
            ) : column.tasks.length === 0 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                {t('no_tasks')}
              </Typography>
            ) : (
              column.tasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onAddComment={(task: Task, comment: string) => onAddComment(task, comment)}
                  onAddLike={(task: Task) => addLike(board._id, task.columnId, task._id)}
                  onRemoveLike={(task: Task) => removeLike(board._id, task.columnId, task._id)}
                  onAddDislike={(task: Task) => addDislike(board._id, task.columnId, task._id)}
                  onRemoveDislike={(task: Task) => removeDislike(board._id, task.columnId, task._id)}
                  handleDragStart={(e) => handleTaskDragStart(e, task._id, column._id)}
                  handleClick={() => handleClick(task)}
                  onDragEnter={(e) => (setHoveredIndex(index))}
                  onDrop={(e) => handleTaskDrop(e, column._id)}
                  onStartEdit={onStartEdit}
                  onStopEdit={onStopEdit}
                />
              ))
            )}
          </Box>
          <Button onClick={() => {
            setTaskAddingToColumn(column);
            setAddingTask(true);
          }}>
            {t('add_task')}
          </Button>
        </Paper>
      ))}
      <Button
        variant="outlined"
        size="small"
        sx={{ minWidth: "auto", px: 1 }}
        onClick={() => setAddingColumn(true)}
      >
        {t('new_column')}
      </Button>

      {addingColumn && (
        <AddColumnDialog
          isOpen={true}
          onAddColumn={(title) => {
            onAddColumn(title);
            setAddingColumn(null);
          }}
          onDismiss={() => setAddingColumn(null)}
        />
      )}

      {addingTask && (
        <AddTaskDialog
          isOpen={true}
          columnId={taskAddingToColumn._id}
          onAddTask={(columnId: string,
            title: string,
            description: string,
            priority: "low" | "medium" | "high",
            tags: string[]
          ) => {
            onAddTask(columnId, title, description, priority, tags);
            setAddingTask(null);
          }}
          onDismiss={() => setAddingTask(null)}
        />
      )}

      {editingTask && (
        <EditTaskDialog
          isOpen={true}
          task={editingTask}
          onEditTask={async (task) => {
            try {
              await onEditTask(task);
              setEditingTask(null);
            } catch (error) {
              console.log("asd");
              toast("Another user is editing the task!");
            }
          }}
          onDeleteTask={(task: Task) => {
            onDeleteTask(task);
            setEditingTask(null);
          }}
          onDismiss={() => {
            onStopEdit(editingTask._id, "task");
            setEditingTask(null);
          }}
        />
      )}
    </Box>
  );
};

export default BoardComponent;
