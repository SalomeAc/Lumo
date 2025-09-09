const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A title is required"],
      trim: true,
      maxlength: [100, "The title cannot have more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "The description cannot have more than 1000 characters"],
    },
    status: {
      type: String,
      enum: ["On going", "Unassigned", "Done"],
      default: "Unassigned",
    },
    dueDate: {
      type: Date,  // Almacena fecha y hora juntas
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);