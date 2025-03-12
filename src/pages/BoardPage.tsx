import React, { useEffect, useState } from "react";
import { getBoards, createBoard, shareBoard, addColumn, deleteColumn, addTask, moveTask, updateTask, deleteTask, reorderTasks, moveColumn, deleteBoard, addCommentToTask } from "../services/boardApiService";
import { Board, Board as BoardType } from "../types/Board";
import { Task } from "@/types/Task";
import BoardComponent from "../components/BoardComponent";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, stepClasses, TextField } from "@mui/material";
import UserProfile from "@/components/profile/UserProfileComponent";
import CreateBoardDialog from "@/components/dialogs/CreateBoardDialog";
import ShareBoardDialog from "@/components/dialogs/ShareBoardDialog";
import { io } from "socket.io-client";
import { toast, Toaster } from "sonner";
import { t } from "i18next";
import { fetchUser } from "@/userStore";

const socket = io("http://localhost:8080", {
  withCredentials: true,
  transports: ["websocket"],
});

const BoardPage: React.FC = () => {
  const [boards, setBoards] = useState<BoardType[] | null>(null);
  const [currentBoard, setCurrentBoard] = useState<BoardType | null>(null);

  const [creatingBoard, setCreatingBoard] = useState<boolean | null>(null);
  const [sharingBoard, setSharingBoard] = useState<boolean | null>(null);

  // Active edits
  const [lockedItems, setLockedItems] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUser();
    fetchBoard();

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.log("Connection Error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    // Listen for lock events
    socket.on("item_locked", ({ id, type, userId }) => {
      setLockedItems((prev) => ({ ...prev, [`${type}-${id}`]: userId }));
    });

    // Listen for unlock events
    socket.on("item_unlocked", ({ id, type }) => {
      setLockedItems((prev) => {
        const newLocks = { ...prev };
        delete newLocks[`${type}-${id}`];
        return newLocks;
      });
    });

    return () => {
      socket.off("item_locked");
      socket.off("item_unlocked");
    };
  }, []);

  const fetchBoard = async () => {
    try {
      const boards = await getBoards();
      setBoards(boards);
      setCurrentBoard(boards[0]);
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  };

  const handleStartEdit = (id: string, type: "task" | "column") => {
    if (!lockedItems[`${type}-${id}`]) {
      const userId = localStorage.getItem("userId");
      socket.emit("start_edit", { id, type, userId });
    } else {
      alert(`${type} is being edited by another user.`);
    }
  };

  const handleStopEdit = (id: string, type: "task" | "column") => {
    const userId = localStorage.getItem("userId");
    socket.emit("stop_edit", { id, type, userId });
  };

  const handleCreateBoard = async (title: string) => {
    try {
      const newBoard = await createBoard(title);
      boards.push(newBoard);
      setBoards(boards);
      setCurrentBoard(newBoard);
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleShareBoard = async (email: string) => {
    try {
      await shareBoard(currentBoard._id, email);
      toast("Board shared successfully!");
    } catch (error) {
      console.error("Error sharing board:", error);
      toast("Failed to share board.");
    }
  };

  const handleDeleteBoard = async (board: BoardType) => {
    try {
      await deleteBoard(board._id);
      boards.filter((board) => board._id !== board._id);
      setBoards(boards);

      // since the current board was the deleted one, change currentBoard
      setCurrentBoard(boards[0]);

    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const handleAddColumn = async (title: string) => {
    try {
      const updatedBoard = await addColumn(currentBoard._id, title);
      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleMoveColumn = async (columnId: string, newIndex: number) => {
    try {
      const updatedBoard = await moveColumn(currentBoard._id, columnId, newIndex);
      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error moving column:", error);
    }
  };

  const handleRemoveColumn = async (columnId: string) => {
    try {
      const updatedBoard = await deleteColumn(currentBoard._id, columnId);
      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const handleAddTask = async (
    columnId: string,
    title: string,
    description: string,
    priority: "low" | "medium" | "high",
    tags: string[]
  ) => {
    if (!currentBoard) return;
    try {
      const updatedBoard = await addTask(
        currentBoard._id,
        columnId, {
        title: title,
        priority: priority,
        description: description,
        tags: tags,
      });
      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleAddComment = async (task: Task, comment: string): Promise<Task> => {
    try {
      const updatedTask = await addCommentToTask(currentBoard._id, task.columnId, task._id, comment);
      return updatedTask;
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const handleEditTask = async (task: Task) => {
    try {
      const updatedBoard = await updateTask(currentBoard._id, task);
      setCurrentBoard(updatedBoard);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const updatedBoard = await deleteTask(currentBoard._id, task.columnId, task._id);
      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleMoveTask = async (sourceColumnId: string, destinationColumnId: string, taskId: string) => {
    if (!currentBoard) return;
    try {
      const updatedBoard = await moveTask(currentBoard._id, taskId, sourceColumnId, destinationColumnId);
      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const handleReorderTask = async (columnId: string, newOrder: Task[]) => {
    try {
      const updatedColumn = await reorderTasks(currentBoard._id, columnId, newOrder);

      // update current board column to new column
      const updatedBoard = {
        ...currentBoard,
        columns: currentBoard.columns.map(col =>
          col._id === updatedColumn._id ? updatedColumn : col
        )
      };

      for (let index = 0; index < updatedBoard.columns.length; index++) {
        if (updatedBoard.columns[index]._id == updatedColumn._id) {
          console.log("Index is ", index);
          updatedBoard.columns[index] = updatedColumn;
        }
      }

      setCurrentBoard(updatedBoard);
    } catch (error) {
      console.error("Error reordering tasks:", error);
    }
  };

  if (!currentBoard) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "auto", sm: "100vh" }, // Auto height on mobile to allow scrolling, full height on desktop
        width: "100vw",
        overflow: { xs: "auto", sm: "hidden" }, // Scrollable on mobile, hidden overflow on desktop
      }}
    >
      <Toaster />

      {/* Top Bar */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          position: "relative", // Allow absolute positioning inside
        }}
      >
        {/* Left Controls */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <FormControl sx={{ minWidth: 150, width: { xs: "100%", sm: 200 } }}>
            <InputLabel>{t('board_title')}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currentBoard.title}
              label={t('board_title')}
              onChange={(e) => {
                setCurrentBoard(boards.find((board) => board.title === e.target.value));
              }}
            >
              {boards.map((board) => (
                <MenuItem key={board._id} value={board.title}>
                  {board.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button color="primary" variant="contained" onClick={() => setCreatingBoard(true)} fullWidth={true} sx={{ maxWidth: { sm: "auto" } }}>
            {t('create_board')}
          </Button>
          <Button color="secondary" variant="outlined" onClick={() => setSharingBoard(true)} fullWidth={true} sx={{ maxWidth: { sm: "auto" } }}>
            {t('share_board')}
          </Button>
          <Button color="secondary" variant="outlined" onClick={() => handleDeleteBoard(currentBoard)} fullWidth={true} sx={{ maxWidth: { sm: "auto" } }}>
            {t('delete_board')}
          </Button>
        </Stack>

        {/* User Profile positioned to top right on mobile */}
        <Box
          sx={{
            position: { xs: "absolute", sm: "static" },
            top: { xs: 8, sm: "auto" },
            right: { xs: 8, sm: "auto" },
            alignSelf: { xs: "flex-end", sm: "center" },
          }}
        >
          <UserProfile />
        </Box>
      </Box>

      {/* Main Board Component */}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <BoardComponent
          board={currentBoard}
          boards={boards}
          onSwitchBoard={(s) => { }}
          onAddColumn={handleAddColumn}
          onMoveColumn={handleMoveColumn}
          onRemoveColumn={handleRemoveColumn}
          onAddTask={handleAddTask}
          onAddComment={handleAddComment}
          onMoveTask={handleMoveTask}
          onReorderTask={handleReorderTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStartEdit={handleStartEdit}
          onStopEdit={handleStopEdit}
        />
      </Box>

      {/* Dialogs */}
      {creatingBoard && (
        <CreateBoardDialog
          isOpen={true}
          onDismiss={() => setCreatingBoard(false)}
          onCreateBoard={(title) => {
            handleCreateBoard(title);
            setCreatingBoard(false);
          }}
        />
      )}

      {sharingBoard && (
        <ShareBoardDialog
          isOpen={true}
          onDismiss={() => setSharingBoard(false)}
          onShareBoard={(email) => {
            handleShareBoard(email);
            setSharingBoard(false);
          }}
        />
      )}
    </Box>
  );
};

export default BoardPage;
